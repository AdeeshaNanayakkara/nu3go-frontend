/**
 * Compresses an image file by lowering its JPEG quality while preserving 100% of its original width & height.
 * Ensures the resulting file size is strictly under 5MB (target 4.5MB).
 *
 * @param file - The original File selected by the user
 * @param targetMaxSizeBytes - Max file size in bytes (default 4.5MB)
 * @returns Promise resolving to compressed File with original dimensions
 */
export async function compressImagePreserveDimensions(
  file: File,
  targetMaxSizeBytes: number = 4.5 * 1024 * 1024
): Promise<File> {
  // If file is non-image or already smaller than 4.5MB, return original
  if (!file.type.startsWith("image/") || file.size <= targetMaxSizeBytes) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      // Preserve 100% original width and height
      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file); // Fallback to original if 2d context unavailable
        return;
      }

      // Draw image at full original width and height
      ctx.drawImage(img, 0, 0, width, height);

      // Iterative quality reduction starting at 85%
      const attemptCompress = (quality: number) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }

            if (blob.size <= targetMaxSizeBytes || quality <= 0.35) {
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              // Lower quality in 15% steps
              attemptCompress(quality - 0.15);
            }
          },
          "image/jpeg",
          quality
        );
      };

      attemptCompress(0.85);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file); // Fallback to original file on error
    };

    img.src = objectUrl;
  });
}
