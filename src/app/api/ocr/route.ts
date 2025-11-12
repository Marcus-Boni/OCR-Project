import { GoogleGenerativeAI } from "@google/generative-ai";
import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/supabase/server";
import { ocrRequestSchema } from "@/lib/validations";

/**
 * POST /api/ocr
 * Extracts text from an image URL using Google Gemini Vision
 */
export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate request body
    const body = await req.json();
    const validation = ocrRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { imageUrl } = validation.data;

    // Initialize Gemini AI with Vision capabilities
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not configured");
      return NextResponse.json({ error: "OCR service not configured" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Use Gemini 2.5 Flash - Best for multimodal OCR (fast and accurate)
    // Released June 2025, supports 1M input tokens and vision
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.4, // Lower temperature for more consistent OCR results
        topP: 0.95,
        topK: 40,
      },
    });

    // Fetch image from URL
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      return NextResponse.json({ error: "Failed to fetch image" }, { status: 400 });
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString("base64");
    const mimeType = imageResponse.headers.get("content-type") || "image/jpeg";

    // Create vision prompt
    const prompt = `Extract all text from this image. 
If the text is handwritten, do your best to read it accurately.
Return only the extracted text, without any additional comments or formatting.`;

    // Generate content with image
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: mimeType,
        },
      },
    ]);

    const response = result.response;
    const extractedText = response.text();

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json({ error: "No text found in image" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: {
        text: extractedText.trim(),
      },
    });
  } catch (error) {
    console.error("Error in OCR processing:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
