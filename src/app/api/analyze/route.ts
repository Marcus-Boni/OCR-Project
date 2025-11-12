import { GoogleGenerativeAI } from "@google/generative-ai";
import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/supabase/server";
import { aiAnalysisRequestSchema } from "@/lib/validations";

/**
 * POST /api/analyze
 * Analyzes extracted text using Google Gemini AI
 * Classifies content into tasks and notes
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = aiAnalysisRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { text, documentId } = validation.data;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not configured");
      return NextResponse.json({ error: "AI service not configured" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-pro",
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        responseMimeType: "application/json", 
      },
    });

    const prompt = `Você é um assistente inteligente para análise de anotações manuscritas. 
Analise o seguinte texto extraído de uma imagem e classifique o conteúdo em:

1. **Tarefas (Tasks)**: Itens acionáveis que precisam ser feitos
2. **Notas (Notes)**: Informações, ideias ou observações gerais

Para cada tarefa identificada, extraia:
- Título (curto e descritivo)
- Descrição (opcional, mais detalhes)
- Prioridade (low, medium, high) - baseado em palavras-chave ou contexto
- Data de vencimento (se mencionada)

Para cada nota, extraia:
- Título (curto e descritivo)
- Conteúdo (o texto completo da nota)

Retorne a análise no seguinte formato JSON:
{
  "tasks": [
    {
      "title": "Título da tarefa",
      "description": "Descrição detalhada",
      "priority": "medium",
      "dueDate": "2024-01-15T10:00:00Z"
    }
  ],
  "notes": [
    {
      "title": "Título da nota",
      "content": "Conteúdo completo da nota"
    }
  ],
  "summary": "Breve resumo do conteúdo analisado"
}

Texto para análise:
${text}

IMPORTANTE: Retorne APENAS o JSON, sem texto adicional antes ou depois.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const aiText = response.text();

    const cleanedText = aiText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    let analysisData: string;
    try {
      analysisData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.error("AI Response was:", aiText);
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: analysisData,
      documentId,
    });
  } catch (error) {
    console.error("Error in AI analysis:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
