/**
 * Client-Side Image Compression using HTML5 Canvas
 * Compresses images before uploading to Supabase Storage / CDN
 * to eliminate mobile bandwidth bottlenecks and ensure ultra-fast uploads.
 */
export async function compressImage(file, maxDimension = 2048, quality = 0.85) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result;
            img.onload = () => {
                let width = img.width;
                let height = img.height;
                // Calculate scaled dimensions for high-res optimized photo
                if (width > height) {
                    if (width > maxDimension) {
                        height = Math.round((height * maxDimension) / width);
                        width = maxDimension;
                    }
                }
                else {
                    if (height > maxDimension) {
                        width = Math.round((width * maxDimension) / height);
                        height = maxDimension;
                    }
                }
                // 1. High-Res Canvas
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    return reject(new Error('Canvas 2D context not available'));
                }
                // High quality smoothing
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, width, height);
                // 2. Thumbnail Canvas (300px width)
                const thumbMax = 320;
                let thumbWidth = width;
                let thumbHeight = height;
                if (thumbWidth > thumbHeight) {
                    if (thumbWidth > thumbMax) {
                        thumbHeight = Math.round((thumbHeight * thumbMax) / thumbWidth);
                        thumbWidth = thumbMax;
                    }
                }
                else {
                    if (thumbHeight > thumbMax) {
                        thumbWidth = Math.round((thumbWidth * thumbMax) / thumbHeight);
                        thumbHeight = thumbMax;
                    }
                }
                const thumbCanvas = document.createElement('canvas');
                thumbCanvas.width = thumbWidth;
                thumbCanvas.height = thumbHeight;
                const thumbCtx = thumbCanvas.getContext('2d');
                if (thumbCtx) {
                    thumbCtx.imageSmoothingEnabled = true;
                    thumbCtx.imageSmoothingQuality = 'medium';
                    thumbCtx.drawImage(img, 0, 0, thumbWidth, thumbHeight);
                }
                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                const thumbDataUrl = thumbCanvas.toDataURL('image/jpeg', 0.7);
                canvas.toBlob((blob) => {
                    if (!blob) {
                        return reject(new Error('Failed to create compressed blob'));
                    }
                    thumbCanvas.toBlob((thumbBlob) => {
                        const finalThumbBlob = thumbBlob || blob;
                        const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        });
                        resolve({
                            compressedBlob: blob,
                            compressedFile,
                            thumbnailBlob: finalThumbBlob,
                            originalSize: file.size,
                            compressedSize: blob.size,
                            thumbnailSize: finalThumbBlob.size,
                            width,
                            height,
                            dataUrl,
                            thumbnailDataUrl: thumbDataUrl,
                        });
                    }, 'image/jpeg', 0.7);
                }, 'image/jpeg', quality);
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
}
export function formatBytes(bytes, decimals = 2) {
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
