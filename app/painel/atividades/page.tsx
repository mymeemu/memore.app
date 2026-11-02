
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Camera,
  Upload,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const ACTIVITY_TYPES = [
  { value: "mind", label: "🧠 Treino mental" },
  { value: "body", label: "💪 Atividade física" },
  { value: "wisdom", label: "✨ Aprendizado e sabedoria" },
  { value: "reading", label: "📚 Leitura" },
  { value: "other", label: "🌱 Outro hábito" },
];

export default function ActivitiesPage() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [userId, setUserId] = useState("");
  const [activityType, setActivityType] = useState("mind");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.replace("/entrar");
        return;
      }

      setUserId(data.user.id);
      setChecking(false);
    };

    checkUser();
  }, [router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setSuccess(false);

    if (!title.trim() || title.trim().length < 3) {
      setMessage("Descreva sua atividade com pelo menos 3 caracteres.");
      return;
    }

    if (!file) {
      setMessage("Selecione uma foto como evidência.");
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setMessage("Use uma imagem JPG, PNG ou WEBP.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("A imagem deve ter no máximo 5 MB.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const extension =
        file.type === "image/png"
          ? "png"
          : file.type === "image/webp"
            ? "webp"
            : "jpg";

      const path = `${userId}/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("activity-proofs")
        .upload(path, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { error: submitError } = await supabase.rpc(
        "memore_submit_activity",
        {
          p_activity_type: activityType,
          p_title: title.trim(),
          p_proof_path: path,
        }
      );

      if (submitError) throw submitError;

      // Localiza a atividade criada pelo caminho único da imagem.
      const { data: savedActivity, error: lookupError } = await supabase
        .from("activities_log")
        .select("id")
        .eq("user_id", userId)
        .eq("proof_url", path)
        .maybeSingle();

      if (lookupError || !savedActivity) {
        setSuccess(true);
        setMessage(
          "Atividade enviada! Ela continua pendente; não foi possível iniciar a análise automática."
        );
      } else {
        try {
          const analysisResponse = await fetch("/api/vision/analyze", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              activityId: savedActivity.id,
            }),
          });

          const analysisResult = await analysisResponse.json();

          if (!analysisResponse.ok || !analysisResult.success) {
            throw new Error(
              analysisResult.error || "Análise indisponível."
            );
          }

          const verdictLabels: Record<string, string> = {
            consistent: "Imagem visualmente compatível",
            unclear: "Evidência inconclusiva",
            inconsistent: "Imagem aparentemente incompatível",
          };

          const verdict =
            verdictLabels[analysisResult.analysis?.verdict] ??
            "Análise preliminar concluída";

          setSuccess(true);
          setMessage(
            `Atividade enviada! MEMORE VISION: ${verdict}. Ela continua aguardando aprovação.`
          );
        } catch {
          setSuccess(true);
          setMessage(
            "Atividade enviada! A análise automática não foi concluída; sua atividade continua pendente."
          );
        }
      }

      setTitle("");
      setFile(null);

      const input = document.getElementById(
        "activity-proof"
      ) as HTMLInputElement | null;

      if (input) input.value = "";
    } catch (error) {
      console.error("Erro ao enviar atividade:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível enviar sua atividade."
      );
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <main style={styles.loading}>
        Carregando seu universo...
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <Link href="/painel" style={styles.back}>
          <ArrowLeft size={17} />
          Voltar ao painel
        </Link>

        <header style={styles.header}>
          <div style={styles.icon}>
            <Sparkles size={25} />
          </div>

          <span style={styles.eyebrow}>
            SUA JORNADA DE EVOLUÇÃO
          </span>

          <h1>Registrar atividade</h1>

          <p>
            Cada pequeno hábito é um passo para evoluir você e seu companheiro.
          </p>
        </header>

        <form onSubmit={handleSubmit} style={styles.card}>
          <label style={styles.label} htmlFor="activity-type">
            Tipo de atividade
          </label>

          <select
            id="activity-type"
            value={activityType}
            onChange={(event) => setActivityType(event.target.value)}
            style={styles.input}
          >
            {ACTIVITY_TYPES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <label style={styles.label} htmlFor="activity-title">
            O que você fez?
          </label>

          <input
            id="activity-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ex.: Caminhei por 30 minutos"
            maxLength={100}
            required
            style={styles.input}
          />

          <label style={styles.label} htmlFor="activity-proof">
            Foto da atividade
          </label>

          <label htmlFor="activity-proof" style={styles.upload}>
            <Camera size={29} />
            <strong>
              {file ? file.name : "Escolher uma foto"}
            </strong>
            <span>JPG, PNG ou WEBP · Máximo 5 MB</span>

            <input
              id="activity-proof"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) =>
                setFile(event.target.files?.[0] ?? null)
              }
              style={{ display: "none" }}
            />
          </label>

          <div style={styles.notice}>
            <Sparkles size={17} />
            <span>
              O MEMORE VISION analisará visualmente sua evidência.
              A análise é preliminar: XP e energia só serão atualizados
              após uma aprovação posterior.
            </span>
          </div>

          {message && (
            <div
              style={{
                ...styles.message,
                color: success ? "#16865f" : "#bd5366",
                background: success ? "#e9fbf3" : "#fff0f2",
              }}
            >
              {success && <CheckCircle2 size={17} />}
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.65 : 1,
            }}
          >
            <Upload size={18} />
            {loading ? "Enviando e analisando..." : "Enviar atividade"}
          </button>
        </form>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    padding: "35px 18px",
    background: "#f7f5fc",
    color: "#29213f",
    fontFamily: "Nunito, Arial, sans-serif",
  },
  container: {
    width: "100%",
    maxWidth: "620px",
    margin: "0 auto",
  },
  loading: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#f7f5fc",
    color: "#8257ff",
    fontFamily: "Nunito, Arial, sans-serif",
  },
  back: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    color: "#8257ff",
    textDecoration: "none",
    fontSize: "13px",
    fontWeight: 800,
    marginBottom: "35px",
  },
  header: {
    textAlign: "center",
    marginBottom: "27px",
  },
  icon: {
    width: "54px",
    height: "54px",
    margin: "0 auto 13px",
    display: "grid",
    placeItems: "center",
    color: "#fff",
    background: "linear-gradient(135deg,#8257ff,#bd72f2)",
    borderRadius: "17px",
  },
  eyebrow: {
    color: "#a39bb5",
    fontSize: "10px",
    fontWeight: 1000,
    letterSpacing: "1.5px",
  },
  card: {
    background: "#fff",
    border: "1px solid #eeeaf5",
    borderRadius: "22px",
    padding: "27px",
    display: "grid",
    gap: "12px",
    boxShadow: "0 8px 30px #30234d08",
  },
  label: {
    fontSize: "12px",
    fontWeight: 900,
    color: "#625a72",
    marginTop: "8px",
  },
  input: {
    width: "100%",
    minHeight: "47px",
    padding: "0 13px",
    border: "1px solid #e9e4f1",
    borderRadius: "11px",
    background: "#fcfbff",
    color: "#29213f",
    fontSize: "13px",
    outlineColor: "#8257ff",
  },
  upload: {
    minHeight: "145px",
    border: "2px dashed #d9c9fa",
    borderRadius: "15px",
    background: "#faf7ff",
    color: "#8257ff",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: "9px",
    cursor: "pointer",
    padding: "18px",
    textAlign: "center",
  },
  notice: {
    display: "flex",
    alignItems: "flex-start",
    gap: "9px",
    padding: "13px",
    borderRadius: "12px",
    background: "#f4efff",
    color: "#7861ad",
    fontSize: "11px",
    lineHeight: 1.5,
    marginTop: "7px",
  },
  message: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px",
    borderRadius: "10px",
    fontSize: "12px",
    fontWeight: 800,
  },
  button: {
    minHeight: "49px",
    border: 0,
    borderRadius: "12px",
    background: "linear-gradient(135deg,#8257ff,#a66af2)",
    color: "#fff",
    fontSize: "13px",
    fontWeight: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "9px",
    cursor: "pointer",
    marginTop: "8px",
  },
};
