import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import {
  apiError,
  assertSameOrigin,
  authorizeApiRequest,
} from "@/lib/api/auth";
import { uploadAvatar } from "@/lib/cloudinary";

export async function POST(req: Request) {
  const originError = assertSameOrigin(req);
  if (originError) return originError;

  const authorization = await authorizeApiRequest(req, ["ADMIN"], {
    scope: "avatar-upload",
    maxRequests: 10,
    windowSeconds: 60,
  });
  if (authorization.response) return authorization.response;

  const declaredLength = Number(req.headers.get("content-length"));
  if (declaredLength > 3 * 1024 * 1024) {
    return apiError("A requisição excede o limite permitido.", 413);
  }

  try {
    const formData = await req.formData();
    const entry = formData.get("file");
    const file = entry instanceof File ? entry : null;

    if (!file) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado" },
        { status: 400 },
      );
    }

    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      return NextResponse.json(
        { error: "Envie uma imagem PNG, JPEG ou WebP." },
        { status: 400 },
      );
    }

    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: "A imagem deve ter no máximo 2MB" },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const isPng = buffer
      .subarray(0, 8)
      .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    const isJpeg =
      buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    const isWebp =
      buffer.toString("ascii", 0, 4) === "RIFF" &&
      buffer.toString("ascii", 8, 12) === "WEBP";
    if (!isPng && !isJpeg && !isWebp) {
      return apiError("O conteúdo do arquivo não é uma imagem suportada.", 400);
    }

    const url = await uploadAvatar(buffer, randomUUID());

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Falha no upload do avatar:", error);

    return NextResponse.json(
      { error: "Erro interno ao fazer upload" },
      { status: 500 },
    );
  }
}
