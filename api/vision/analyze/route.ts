
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type VisionResult = {
  verdict: "consistent" | "unclear" | "inconsistent";
  confidence: number;
  explanation: string;
  visible_evidence: string;
};

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { success: false, error: message },
    { status }
  );
}

function parseVisionResult(raw: string): VisionResult {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");

  const parsed = JSON.parse(cleaned);

  if (
    !parsed ||
    !["consistent", "unclear", "inconsistent"].includes(parsed.verdict) ||
    typeof parsed.confidence !== "number" ||
    !Number.isFinite(parsed.confidence) ||
    typeof parsed.explanation !== "string" ||
    typeof parsed.visible_evidence !== "string"
  ) {
    throw new Error("Formato de análise inválido.");
  }

  return {
    verdict: parsed.verdict,
    confidence: Math.max(0, Math.min(1, parsed.confidence)),
    explanation: parsed.explanation.slice(0, 1500),
    visible_evidence: parsed.visible_evidence.slice(0, 500),
  };
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return jsonError("A chave do Gemini não está configurada.", 503);
  }

  let body: { activityId?: unknown };

  try {
    body = await request.json();
  } catch {
    return jsonError("Requisição inválida.", 400);
  }

  const activityId = body?.activityId;

  if (
    typeof activityId !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(activityId)
  ) {
    return jsonError("Identificador de atividade inválido.", 400);
  }

  const supabase = createClient();

  const { data: authData, error: authError } =
    await supabase.auth.getUser();

  if (authError || !authData.user) {
    return jsonError("Você precisa entrar na sua conta.", 401);
  }

  // Busca somente uma atividade pertencente ao usuário autenticado.
  const { data: activity, error: activityError } = await supabase
    .from("activities_log")
    .select("id, user_id, activity_type, title, proof_url")
    .eq("id", activityId)
    .eq("user_id", authData.user.id)
    .maybeSingle();

  if (activityError || !activity) {
    return jsonError("Atividade não encontrada.", 404);
  }

  if (!activity.proof_url) {
    return jsonError("A atividade não possui imagem de evidência.", 400);
  }

  // Impede análises simultâneas ou repetidas.
  const { data: claimed, error: claimError } = await supabase.rpc(
    "memore_claim_vision_analysis",
    { p_activity_id: activity.id }
  );

  if (claimError) {
    return jsonError("Não foi possível iniciar a análise.", 500);
  }

  if (claimed !== true) {
    return jsonError(
      "Esta atividade já está sendo analisada ou não está disponível.",
      409
    );
  }

  // Baixa a imagem diretamente do Storage privado.
  const { data: imageFile, error: downloadError } =
    await supabase.storage
      .from("activity-proofs")
      .download(activity.proof_url);

  if (downloadError || !imageFile) {
    await supabase.rpc("memore_save_vision_analysis", {
      p_activity_id: activity.id,
      p_ai_model: "gemini-2.5-flash",
      p_ai_confidence: null,
      p_ai_feedback: "Não foi possível acessar a imagem.",
      p_ai_error: downloadError?.message ?? "Imagem indisponível.",
    });

    return jsonError("Não foi possível acessar a imagem.", 500);
  }

  const mimeType = imageFile.type;

  if (!["image/jpeg", "image/png", "image/webp"].includes(mimeType)) {
    await supabase.rpc("memore_save_vision_analysis", {
      p_activity_id: activity.id,
      p_ai_model: "gemini-2.5-flash",
      p_ai_confidence: null,
      p_ai_feedback: "Formato de imagem não suportado.",
      p_ai_error: "Formato inválido.",
    });

    return jsonError("Formato de imagem não suportado.", 415);
  }

  const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
  const imageBase64 = imageBuffer.toString("base64");

  const prompt = `
Você é o módulo de análise visual do aplicativo MEMORE.

Analise a imagem como evidência visual relacionada à atividade descrita.

Tipo da atividade: ${activity.activity_type}
Descrição informada pelo usuário: ${activity.title}

Responda SOMENTE com JSON válido, sem markdown, usando estas propriedades:
{
  "verdict": "consistent" | "unclear" | "inconsistent",
  "confidence": número entre 0 e 1,
  "explanation": "explicação curta em português",
  "visible_evidence": "descrição objetiva do que aparece na imagem"
}

Regras:
- consistent: imagem visualmente compatível com a atividade.
- unclear: imagem insuficiente, genérica ou ambígua.
- inconsistent: imagem claramente incompatível com a descrição.
- Avalie somente o conteúdo visual.
- Não invente detalhes.
- Uma foto não comprova duração, esforço, autoria, data ou conclusão da atividade.
- Não identifique, reconheça ou compare rostos.
- Não aprove nem rejeite definitivamente a atividade.
- Se houver pessoas, descreva apenas elementos relevantes da cena.
`;

  let vision: VisionResult;

  try {
    const geminiResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: imageBase64,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: "application/json",
          },
        }),
        cache: "no-store",
      }
    );

    if (!geminiResponse.ok) {
      const providerError = await geminiResponse.text();

      throw new Error(
        `Gemini HTTP ${geminiResponse.status}: ${providerError.slice(0, 700)}`
      );
    }

    const result = await geminiResponse.json();

    const rawText = result?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text ?? "")
      .join("");

    if (!rawText) {
      throw new Error("O Gemini não retornou conteúdo.");
    }

    vision = parseVisionResult(rawText);
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Falha desconhecida na análise.";

    await supabase.rpc("memore_save_vision_analysis", {
      p_activity_id: activity.id,
      p_ai_model: "gemini-2.5-flash",
      p_ai_confidence: null,
      p_ai_feedback: "A análise não foi concluída.",
      p_ai_error: errorMessage.slice(0, 1000),
    });

    return jsonError(
      "O MEMORE VISION não conseguiu concluir a análise. Tente novamente mais tarde.",
      502
    );
  }

  const feedback = JSON.stringify({
    verdict: vision.verdict,
    explanation: vision.explanation,
    visible_evidence: vision.visible_evidence,
  });

  const { error: saveError } = await supabase.rpc(
    "memore_save_vision_analysis",
    {
      p_activity_id: activity.id,
      p_ai_model: "gemini-2.5-flash",
      p_ai_confidence: vision.confidence,
      p_ai_feedback: feedback,
      p_ai_error: null,
    }
  );

  if (saveError) {
    return jsonError(
      "A análise foi feita, mas não foi possível salvar o resultado.",
      500
    );
  }

  return NextResponse.json({
    success: true,
    status: "preliminary_analysis",
    model: "gemini-2.5-flash",
    analysis: vision,
    message:
      "Análise visual preliminar concluída. Nenhuma aprovação, XP ou energia foi concedida.",
  });
}
