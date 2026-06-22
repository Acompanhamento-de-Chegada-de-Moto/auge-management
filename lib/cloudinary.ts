import cloudinary from "cloudinary";

const cloudinaryV2 = cloudinary.v2;

cloudinaryV2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadLogo(
  fileBuffer: Buffer,
  fileName: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinaryV2.uploader.upload_stream(
      {
        folder: "auge/logos",
        public_id: `logo-${Date.now()}`,
        overwrite: true,
        resource_type: "image",
        transformation: [{ width: 200, crop: "scale" }],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result!.secure_url);
      },
    );

    uploadStream.end(fileBuffer);
  });
}

export async function uploadAvatar(
  fileBuffer: Buffer,
  fileName: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinaryV2.uploader.upload_stream(
      {
        folder: "auge/avatars",
        public_id: fileName.replace(/\.[^/.]+$/, ""),
        overwrite: true,
        resource_type: "image",
        transformation: [
          { width: 200, height: 200, crop: "fill", gravity: "face" },
        ],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result!.secure_url);
      },
    );

    uploadStream.end(fileBuffer);
  });
}
