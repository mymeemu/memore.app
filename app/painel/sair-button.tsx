
"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SairButton() {
  const router = useRouter();

  async function sair() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/entrar");
    router.refresh();
  }

  return (
    <button
      onClick={sair}
      style={{
        padding: "11px 18px",
        border: "0",
        borderRadius: 12,
        background: "#eee7ff",
        color: "#7047df",
        fontWeight: 900,
        cursor: "pointer"
      }}
    >
      Sair da conta
    </button>
  );
}
