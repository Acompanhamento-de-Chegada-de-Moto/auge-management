import { NextResponse } from "next/server";

import { requireAdmin } from "@/app/data/admin/require-admin";
import { uploadAvatar } from "@/lib/cloudinary";

export async function POST(req: Request) {
  try {
    await requireAdmin();

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado" },
        { status: 400 },
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Apenas imagens são permitidas" },
        { status: 400 },
      );
    }

    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: "A imagem deve ter no máximo 2MB" },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const url = await uploadAvatar(buffer, file.name);

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Erro ao fazer upload:", error);

    return NextResponse.json(
      { error: "Erro interno ao fazer upload" },
      { status: 500 },
    );
  }
}
