
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function EntrarPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setError("");

    try {
      const supabase = createClient();

      if (mode === "signup") {
        const cleanUsername = username.trim().toLowerCase();

        if (!/^[a-z0-9_]{3,20}$/.test(cleanUsername)) {
          throw new Error("Use de 3 a 20 caracteres: letras, números ou _.");
        }

        if (password.length < 8) {
          throw new Error("Sua senha precisa ter pelo menos 8 caracteres.");
        }

        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { username: cleanUsername },
            emailRedirectTo: window.location.origin + "/entrar"
          }
        });

        if (error) throw error;

        if (data.session) {
          router.push("/painel");
          router.refresh();
          return;
        }

        setMessage("Cadastro iniciado! Confira seu e-mail e confirme sua conta.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });

        if (error) throw error;

        router.push("/painel");
        router.refresh();
        return;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível concluir.");
    } finally {
      setBusy(false);
    }
  }

  async function handlePasswordReset() {
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Digite seu e-mail para receber o link de recuperação.");
      return;
    }

    setBusy(true);

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo: window.location.origin + "/entrar" }
      );

      if (error) throw error;

      setMessage("Se existir uma conta com esse e-mail, você receberá as instruções.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao solicitar recuperação.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      padding: "30px 20px",
      background: "linear-gradient(145deg,#f8f6ff,#f4efff 55%,#fff2f8)"
    }}>
      <Link href="/" style={{
        position: "absolute",
        top: 25,
        left: 25,
        color: "#817b91",
        fontWeight: 800,
        textDecoration: "none"
      }}>
        <ArrowLeft size={17} style={{ verticalAlign: "middle" }} /> Voltar
      </Link>

      <section style={{
        width: "100%",
        maxWidth: 440,
        padding: 32,
        borderRadius: 26,
        background: "white",
        boxShadow: "0 18px 60px #6840e81a"
      }}>
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 9,
          fontSize: 27,
          fontWeight: 1000,
          color: "#29213f"
        }}>
          <Sparkles color="#8257ff" size={25} /> MEMORE
        </div>

        <div style={{ textAlign: "center", margin: "28px 0 22px" }}>
          <small style={{ color: "#8257ff", fontWeight: 900 }}>
            SUA PRÓXIMA AVENTURA COMEÇA AQUI
          </small>
          <h1 style={{ color: "#29213f", fontSize: 30, margin: "10px 0" }}>
            {mode === "signup" ? "Crie seu universo." : "Que bom ter você de volta!"}
          </h1>
          <p style={{ color: "#817b91", fontSize: 14 }}>
            {mode === "signup"
              ? "Crie sua conta e comece a evoluir ao lado do seu pet."
              : "Entre e continue sua evolução."}
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          background: "#f3effb",
          borderRadius: 13,
          padding: 5,
          gap: 5
        }}>
          {(["signup", "login"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setMode(item);
                setError("");
                setMessage("");
              }}
              style={{
                padding: 12,
                border: 0,
                borderRadius: 10,
                background: mode === item ? "white" : "transparent",
                color: mode === item ? "#7047df" : "#817b91",
                fontWeight: 900,
                cursor: "pointer"
              }}
            >
              {item === "signup" ? "Criar conta" : "Entrar"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{
          display: "grid",
          gap: 15,
          marginTop: 22
        }}>
          {mode === "signup" && (
            <label style={{ color: "#39304f", fontWeight: 800, fontSize: 13 }}>
              Nome de jogador
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ex: luna_estrela"
                minLength={3}
                maxLength={20}
                required
                style={inputStyle}
              />
            </label>
          )}

          <label style={{ color: "#39304f", fontWeight: 800, fontSize: 13 }}>
            E-mail
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
              required
              style={inputStyle}
            />
          </label>

          <label style={{ color: "#39304f", fontWeight: 800, fontSize: 13 }}>
            Senha
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo de 8 caracteres"
                minLength={8}
                required
                style={{ ...inputStyle, paddingRight: 48 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: 8,
                  top: 9,
                  border: 0,
                  background: "transparent",
                  color: "#817b91",
                  cursor: "pointer"
                }}
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </label>

          {mode === "login" && (
            <button
              type="button"
              onClick={handlePasswordReset}
              disabled={busy}
              style={linkStyle}
            >
              Esqueci minha senha
            </button>
          )}

          {error && <p style={alertError}>{error}</p>}
          {message && <p style={alertSuccess}>{message}</p>}

          <button
            type="submit"
            disabled={busy}
            style={{
              padding: 15,
              border: 0,
              borderRadius: 13,
              color: "white",
              background: "#8257ff",
              boxShadow: "0 5px 0 #6840e8",
              fontWeight: 900,
              cursor: busy ? "wait" : "pointer"
            }}
          >
            {busy ? "Aguarde..." : mode === "signup" ? "Criar minha conta" : "Entrar no MEMORE"}
          </button>
        </form>

        <p style={{
          marginTop: 22,
          textAlign: "center",
          color: "#a09aaf",
          fontSize: 10,
          lineHeight: 1.6
        }}>
          Cultive bons hábitos. Evolua no seu ritmo.
        </p>
      </section>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  display: "block",
  boxSizing: "border-box",
  width: "100%",
  marginTop: 8,
  padding: 14,
  border: "2px solid #eeeaf5",
  borderRadius: 12,
  outline: "none",
  color: "#29213f",
  background: "white",
  fontSize: 14
};

const linkStyle: React.CSSProperties = {
  justifySelf: "end",
  border: 0,
  padding: 0,
  background: "transparent",
  color: "#7047df",
  fontSize: 12,
  fontWeight: 900,
  cursor: "pointer"
};

const alertError: React.CSSProperties = {
  padding: 12,
  borderRadius: 10,
  color: "#a52b56",
  background: "#fff0f4",
  fontSize: 12
};

const alertSuccess: React.CSSProperties = {
  padding: 12,
  borderRadius: 10,
  color: "#237b5b",
  background: "#eafff5",
  fontSize: 12
};
