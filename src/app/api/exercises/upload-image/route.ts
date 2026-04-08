import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file)
    return NextResponse.json({ error: "Aucun fichier" }, { status: 400 });

  const ALLOWED_TYPES = new Set([
    "image/gif",
    "image/png",
    "image/jpeg",
    "image/webp",
  ]);
  const MAX_SIZE = 5 * 1024 * 1024; // 5 Mo

  if (!ALLOWED_TYPES.has(file.type))
    return NextResponse.json(
      { error: "Type de fichier non autorisé" },
      { status: 400 },
    );
  if (file.size > MAX_SIZE)
    return NextResponse.json(
      { error: "Fichier trop volumineux (max 5 Mo)" },
      { status: 400 },
    );

  // Nom unique : userId/timestamp.ext
  const ALLOWED_EXTS = new Set(["gif", "png", "jpg", "jpeg", "webp"]);
  const rawExt = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const ext = ALLOWED_EXTS.has(rawExt) ? rawExt : "jpg";
  const path = `${user.id}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("exercise-images")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  const {
    data: { publicUrl },
  } = supabase.storage.from("exercise-images").getPublicUrl(path);

  return NextResponse.json({ url: publicUrl });
}
