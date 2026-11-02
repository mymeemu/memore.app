
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Camera,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Lock
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function IdentidadePage() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [userId, setUserId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function checkUser() {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.replace("/entrar");
        return;
      }

      setUserId(data.user.id);
      setChecking(false);
    }

    checkUser();
  }, [router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setSuccess(false);

    if (!file) {
      setMessage("Selecione uma selfie para continuar.");
      return;
    }

    if (!consent) {
      setMessage("É necessário confirmar seu consentimento.");
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setMessage("Utilize uma imagem JPG, PNG ou WEBP.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("Sua selfie deve ter no máximo 5 MB.");
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
        .from("identity-selfies")
        .upload(path, file, {
          contentType: file.type,
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { error: registerError } = await supabase.rpc(
        "memore_register_identity_selfie",
        {
          p_selfie_path: path,
          p_consent_version: "memore-id-v1"
        }
      );

      if (registerError) throw registerError;

      setSuccess(true);
      setMessage(
        "Selfie cadastrada com sucesso! Sua identidade está registrada."
      );
      setFile(null);

      const input = document.getElementById(
        "identity-selfie"
      ) as HTMLInputElement | null;

      if (input) input.value = "";
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível cadastrar sua selfie."
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
            <ShieldCheck size={29} />
          </div>

          <span style={styles.eyebrow}>MEMORE ID</span>
          <h1>Sua identidade, protegida.</h1>
          <p>
            Cadastre uma selfie para preparar sua identidade
            digital dentro do universo MEMORE.
          </p>
        </header>

        <form onSubmit={handleSubmit} style={styles.card}>
          <div style={styles.sectionTitle}>
            <Camera size={19} />
            Sua selfie
          </div>

          <label htmlFor="identity-selfie" style={styles.upload}>
            <Camera size={34} />
            <strong>
              {file ? file.name : "Escolher ou tirar uma selfie"}
            </strong>
            <span>
              Prefira um ambiente iluminado, olhando diretamente
              para a câmera e sem acessórios cobrindo o rosto.
            </span>

            <input
              id="identity-selfie"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              capture="user"
              onChange={(event) =>
                setFile(event.target.files?.[0] ?? null)
              }
              style={{ display: "none" }}
            />
          </label>

          <div style={styles.privacy}>
            <Lock size={19} />
            <div>
              <strong>Armazenamento privado</strong>
              <p>
                Sua imagem não será exibida no perfil público.
                O acesso será restrito à sua conta e aos processos
                autorizados do MEMORE.
              </p>
            </div>
          </div>

          <div style={styles.consentBox}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
              />
              <span>
                Confirmo que esta imagem é minha e autorizo o
                armazenamento da minha selfie para o cadastro
                do MEMORE ID. Entendo que uma futura comparação
                facial poderá envolver dados biométricos sensíveis
                e exigirá informações e consentimento específicos.
              </span>
            </label>
          </div>

          <div style={styles.notice}>
            <Sparkles size={17} />
            <span>
              Atenção: nesta etapa estamos apenas cadastrando
              sua selfie. O reconhecimento facial e a análise
              automática ainda não estão ativos.
            </span>
          </div>

          {message && (
            <div
              style={{
                ...styles.message,
                color: success ? "#16865f" : "#bd5366",
                background: success ? "#e9fbf3" : "#fff0f2"
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
              opacity: loading ? 0.65 : 1
            }}
          >
            <ShieldCheck size={18} />
            {loading ? "Cadastrando..." : "Cadastrar minha identidade"}
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
    fontFamily: "Nunito, Arial, sans-serif"
  },
  container: {
    width: "100%",
    maxWidth: 620,
    margin: "0 auto"
  },
  loading: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#f7f5fc",
    color: "#8257ff"
  },
  back: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    color: "#8257ff",
    textDecoration: "none",
    fontSize: 13,
    fontWeight: 800,
    marginBottom: 35
  },
  header: {
    textAlign: "center",
    marginBottom: 27
  },
  icon: {
    width: 58,
    height: 58,
    margin: "0 auto 13px",
    display: "grid",
    placeItems: "center",
    color: "#fff",
    background: "linear-gradient(135deg,#8257ff,#bd72f2)",
    borderRadius: 18
  },
  eyebrow: {
    color: "#a39bb5",
    fontSize: 10,
    fontWeight: 1000,
    letterSpacing: 1.5
  },
  card: {
    background: "#fff",
    border: "1px solid #eeeaf5",
    borderRadius: 22,
    padding: 27,
    display: "grid",
    gap: 17,
    boxShadow: "0 8px 30px #30234d08"
  },
  sectionTitle: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    color: "#625a72",
    fontSize: 14,
    fontWeight: 900
  },
  upload: {
    minHeight: 170,
    border: "2px dashed #d9c9fa",
    borderRadius: 15,
    background: "#faf7ff",
    color: "#8257ff",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    cursor: "pointer",
    padding: 20,
    textAlign: "center"
  },
  privacy: {
    display: "flex",
    gap: 12,
    padding: 15,
    borderRadius: 13,
    background: "#f4efff",
    color: "#7861ad",
    fontSize: 12
  },
  consentBox: {
    padding: 15,
    border: "1px solid #eeeaf5",
    borderRadius: 13,
    background: "#fcfbff"
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "flex-start",
    gap: 11,
    color: "#625a72",
    fontSize: 11,
    lineHeight: 1.7,
    cursor: "pointer"
  },
  notice: {
    display: "flex",
    alignItems: "flex-start",
    gap: 9,
    padding: 13,
    borderRadius: 12,
    background: "#fff7e7",
    color: "#98732c",
    fontSize: 11,
    lineHeight: 1.6
  },
  message: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    fontSize: 12,
    fontWeight: 800
  },
  button: {
    minHeight: 49,
    border: 0,
    borderRadius: 12,
    background: "linear-gradient(135deg,#8257ff,#a66af2)",
    color: "#fff",
    fontSize: 13,
    fontWeight: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    cursor: "pointer"
  }
};
