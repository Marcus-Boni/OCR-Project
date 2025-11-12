import { nanoid } from "nanoid";
import { type NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, getSession } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type DocumentInsert = Database["public"]["Tables"]["documents"]["Insert"];
type DocumentRow = Database["public"]["Tables"]["documents"]["Row"];

/**
 * POST /api/upload
 * Uploads an image to Supabase Storage and returns the public URL
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, and WEBP are allowed." },
        { status: 400 }
      );
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File size must be less than 10MB" }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();

    const fileExt = file.name.split(".").pop();
    const fileName = `${session.user.id}/${nanoid()}.${fileExt}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { data, error } = await supabase.storage.from("documents").upload(fileName, buffer, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });

    if (error) {
      console.error("Supabase upload error:", error);
      return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("documents").getPublicUrl(data.path);

    const documentData: DocumentInsert = {
      user_id: session.user.id,
      image_url: publicUrl,
    };

    // biome-ignore lint/suspicious/noExplicitAny: <Supabase type inference issue>
    const result = await (supabase.from("documents") as any).insert(documentData).select().single();

    const { data: document, error: dbError } = result as {
      data: DocumentRow | null;
      error: Error | null;
    };

    if (dbError) {
      console.error("Database error:", dbError);
      await supabase.storage.from("documents").remove([data.path]);
      return NextResponse.json({ error: "Failed to create document record" }, { status: 500 });
    }

    if (!document) {
      return NextResponse.json({ error: "Failed to create document record" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        documentId: document.id,
        imageUrl: publicUrl,
      },
    });
  } catch (error) {
    console.error("Error in file upload:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
