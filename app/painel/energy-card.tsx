
"use client";

import { useCallback, useEffect, useState } from "react";
import { Zap, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type EnergyResult = {
  success: boolean;
  energy: number;
  energy_max: number;
  cooldown_ends_at: string | null;
  seconds_remaining: number;
  message: string;
};

function formatTime(total: number) {
  const safe = Math.max(0, total);
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;

  return [hours, minutes, seconds]
    .map((v) => String(v).padStart(2, "0"))
    .join(":");
}

export default function EnergyCard({
  initialEnergy
}: {
  initialEnergy: number;
}) {
  const [energy, setEnergy] = useState(initialEnergy);
  const [seconds, setSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      const supabase = createClient();

      const { data, error: rpcError } = await supabase.rpc(
        "memore_get_energy_status"
      );

      if (rpcError) throw rpcError;

      const result = (
        Array.isArray(data) ? data[0] : data
      ) as EnergyResult | null;

      if (!result) {
        throw new Error("Não foi possível consultar a energia.");
      }

      setEnergy(result.energy);
      setSeconds(result.seconds_remaining ?? 0);
      setError("");
    } catch {
      setError("Não foi possível atualizar a energia.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    const sync = window.setInterval(refresh, 30000);

    return () => window.clearInterval(sync);
  }, [refresh]);

  useEffect(() => {
    if (energy > 0 || seconds <= 0) return;

    const timer = window.setInterval(() => {
      setSeconds((current) => {
        if (current <= 1) {
          refresh();
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [energy, seconds <= 0, refresh]);

  const percent = Math.max(0, Math.min(100, (energy / 30) * 100));

  return (
    <article className="stat-card">
      <div className="stat-top">
        <div className="stat-icon yellow">
          <Zap size={21} />
        </div>
      </div>

      <div className="stat-label">ENERGIA</div>

      <div className="stat-value">{energy}/30</div>

      <div className="stat-detail">
        {energy > 0 ? (
          "Disponível para suas atividades"
        ) : (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5
            }}
          >
            <Clock size={12} />
            Recupera em {formatTime(seconds)}
          </span>
        )}
      </div>

      <div className="stat-line">
        <div
          style={{
            width: `${percent}%`,
            background: "#f2c34c"
          }}
        />
      </div>

      {error && (
        <div style={{ marginTop: 7, color: "#b7791f", fontSize: 10 }}>
          {error}
        </div>
      )}

      {loading && (
        <div style={{ marginTop: 5, color: "#aaa3b5", fontSize: 9 }}>
          Sincronizando...
        </div>
      )}
    </article>
  );
}
