import { nanoid } from "nanoid";
import { type NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, getSession } from "@/lib/supabase/server";

/**
 * POST /api/upload
 * Uploads an image to Supabase Storage and returns the public URL
 */
export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get form data
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, and WEBP are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File size must be less than 10MB" }, { status: 400 });
    }

    // Get Supabase client
    const supabase = await createServerSupabaseClient();

    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${session.user.id}/${nanoid()}.${fileExt}`;

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage.from("documents").upload(fileName, buffer, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });

    if (error) {
      console.error("Supabase upload error:", error);
      return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("documents").getPublicUrl(data.path);

    // Create document record
    const { data: document, error: dbError } = await supabase
      .from("documents")
      .insert({
        user_id: session.user.id,
        image_url: publicUrl,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      // Try to cleanup uploaded file
      await supabase.storage.from("documents").remove([data.path]);
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
