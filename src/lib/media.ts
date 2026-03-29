import { supabase } from "./supabase";

type CompressOptions = {
  maxWidth: number;
  maxHeight: number;
  quality: number;
};

const loadImageBitmap = async (file: File) => {
  try {
    return await createImageBitmap(file);
  } catch {
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.decoding = "async";
      img.src = url;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image"));
      });
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");
      ctx.drawImage(img, 0, 0);
      return await createImageBitmap(canvas);
    } finally {
      URL.revokeObjectURL(url);
    }
  }
};

export async function compressImageToJpeg(
  file: File,
  options: CompressOptions,
): Promise<Blob> {
  const bmp = await loadImageBitmap(file);
  const { maxWidth, maxHeight, quality } = options;

  const scale = Math.min(1, maxWidth / bmp.width, maxHeight / bmp.height);
  const outW = Math.max(1, Math.round(bmp.width * scale));
  const outH = Math.max(1, Math.round(bmp.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(bmp, 0, 0, outW, outH);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (!b) reject(new Error("Failed to encode image"));
        else resolve(b);
      },
      "image/jpeg",
      quality,
    );
  });

  return blob;
}

export async function uploadPublicMedia(params: {
  userId: string;
  folder: "profile" | "dish";
  file: File;
  maxWidth: number;
  maxHeight: number;
  quality: number;
}): Promise<string> {
  const blob = await compressImageToJpeg(params.file, {
    maxWidth: params.maxWidth,
    maxHeight: params.maxHeight,
    quality: params.quality,
  });

  const ext = "jpg";
  const name = `${crypto.randomUUID()}.${ext}`;
  const path = `${params.userId}/${params.folder}/${name}`;

  const { error: uploadError } = await supabase.storage
    .from("public-media")
    .upload(path, blob, {
      cacheControl: "31536000",
      contentType: "image/jpeg",
      upsert: false,
    });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("public-media").getPublicUrl(path);
  const url = data.publicUrl;
  if (!url) throw new Error("Failed to get public URL");
  return url;
}

