
import { redirect } from "next/navigation";
import { Sparkles, Heart, Zap, Trophy, Brain } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import SairButton from "./sair-button";

export default async function PainelPage() {
  const supabase = createClient();

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/entrar");
  }

  const [
    { data: profile },
    { data: pet },
    { data: ranking }
  ] = await Promise.all([
    supabase
      .from("users")
      .select("username, energy")
      .eq("id", user.id)
      .maybeSingle(),

    supabase
      .from("pets")
      .select("name, level, xp, evolution_path")
      .eq("user_id", user.id)
      .maybeSingle(),

    supabase
      .from("rankings")
      .select("total_xp, weekly_xp")
      .eq("user_id", user.id)
      .maybeSingle()
  ]);

  const username = profile?.username ?? "Jogador";
  const energy = profile?.energy ?? 30;
  const level = pet?.level ?? 1;
  const xp = pet?.xp ?? 0;
  const totalXp = ranking?.total_xp ?? 0;

  return (
    <main style={{
      minHeight: "100vh",
      padding: "35px 20px",
      background: "#f8f6ff",
      color: "#29213f"
    }}>
      <div style={{
        maxWidth: 1050,
        margin: "0 auto"
      }}>
        <header style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 15,
          marginBottom: 35
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 25,
            fontWeight: 1000
          }}>
            <Sparkles color="#8257ff" size={27} />
            MEMORE
          </div>

          <SairButton />
        </header>

        <section style={{
          padding: 30,
          borderRadius: 25,
          background: "linear-gradient(120deg,#8257ff,#a66bff)",
          color: "white",
          boxShadow: "0 8px 0 #6840e8"
        }}>
          <small style={{ fontWeight: 900, opacity: 0.8 }}>
            SEU UNIVERSO ESTÁ CRESCENDO
          </small>

          <h1 style={{
            fontSize: 32,
            margin: "10px 0",
            fontWeight: 1000
          }}>
            Olá, {username}!
          </h1>

          <p style={{ margin: 0, opacity: 0.9 }}>
            Cada pequeno hábito é um passo na sua evolução.
          </p>
        </section>

        <section style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))",
          gap: 16,
          marginTop: 25
        }}>
          <StatCard
            icon={<Zap color="#e5ad00" />}
            label="Energia disponível"
            value={`${energy}/30`}
            color="#fff5ce"
          />

          <StatCard
            icon={<Trophy color="#8257ff" />}
            label="Experiência total"
            value={`${totalXp} XP`}
            color="#eee7ff"
          />

          <StatCard
            icon={<Brain color="#ff58a6" />}
            label="Nível do mascote"
            value={`Nível ${level}`}
            color="#ffe7f1"
          />
        </section>

        <section style={{
          marginTop: 25,
          padding: 28,
          borderRadius: 24,
          background: "white",
          boxShadow: "0 5px 25px #29213f0a"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "#8257ff",
            fontWeight: 1000
          }}>
            <Heart size={20} />
            SEU COMPANHEIRO
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "minmax(120px,180px) 1fr",
            alignItems: "center",
            gap: 25,
            marginTop: 20
          }}>
            <div style={{
              display: "grid",
              placeItems: "center",
              minHeight: 160,
              borderRadius: 22,
              background: "linear-gradient(145deg,#f1eaff,#ffe8f2)",
              fontSize: 85
            }}>
              🐣
            </div>

            <div>
              <h2 style={{
                margin: "0 0 8px",
                fontSize: 25,
                fontWeight: 1000
              }}>
                {pet?.name ?? "Memore"}
              </h2>

              <p style={{ color: "#817b91", margin: "0 0 15px" }}>
                Seu companheiro está esperando suas próximas conquistas!
              </p>

              <strong style={{ color: "#8257ff" }}>
                Nível {level}
              </strong>

              <div style={{
                height: 12,
                borderRadius: 20,
                marginTop: 10,
                background: "#eeeaf5",
                overflow: "hidden"
              }}>
                <div style={{
                  height: "100%",
                  width: `${Math.min(100, xp % 100)}%`,
                  borderRadius: 20,
                  background: "#8257ff"
                }} />
              </div>

              <small style={{ color: "#817b91" }}>
                {xp} XP acumulados
              </small>
            </div>
          </div>
        </section>

        <footer style={{
          textAlign: "center",
          marginTop: 35,
          color: "#a09aaf",
          fontSize: 12
        }}>
          MEMORE — Cultive seus hábitos. Evolua seu pet.
        </footer>
      </div>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
  color
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <article style={{
      padding: 22,
      borderRadius: 20,
      background: "white",
      boxShadow: "0 5px 20px #29213f08"
    }}>
      <div style={{
        width: 42,
        height: 42,
        display: "grid",
        placeItems: "center",
        borderRadius: 13,
        background: color
      }}>
        {icon}
      </div>

      <p style={{
        margin: "15px 0 5px",
        color: "#817b91",
        fontSize: 13,
        fontWeight: 800
      }}>
        {label}
      </p>

      <strong style={{ fontSize: 23 }}>
        {value}
      </strong>
    </article>
  );
}
