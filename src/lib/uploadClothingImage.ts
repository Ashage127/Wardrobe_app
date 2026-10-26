import { decode } from "base64-arraybuffer";

import { supabase } from "./supabase";

export async function uploadClothingImage(
  base64: string,
  mimeType: string = "image/jpeg"
) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error("You must be signed in to upload images.");
  }

  const rawExtension =
    mimeType.split("/")[1] ?? "jpg";

  const extension =
    rawExtension === "jpeg"
      ? "jpg"
      : rawExtension;

  const fileName =
    `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${extension}`;

  const filePath =
    `${user.id}/${fileName}`;

  const { error: uploadError } =
    await supabase.storage
      .from("clothing-images")
      .upload(
        filePath,
        decode(base64),
        {
          contentType: mimeType,
          upsert: false,
        }
      );

  if (uploadError) {
    console.error(
      "Image upload failed:",
      uploadError
    );

    throw uploadError;
  }

  const { data } =
    supabase.storage
      .from("clothing-images")
      .getPublicUrl(filePath);

  return data.publicUrl;
}