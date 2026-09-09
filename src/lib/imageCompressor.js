/**
 * Client-Side Image Compression for Guest Uploads
 * Runs in the mobile browser before sending photos to Supabase Storage.
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
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx)
                    return reject(new Error('Canvas context unavailable'));
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, width, height);
                // Thumbnail
                const thumbCanvas = document.createElement('canvas');
                const thumbMax = 320;
                let thumbW = width;
                let thumbH = height;
                if (thumbW > thumbH) {
                    if (thumbW > thumbMax) {
                        thumbH = Math.round((thumbH * thumbMax) / thumbW);
                        thumbW = thumbMax;
                    }
                }
                else {
                    if (thumbH > thumbMax) {
                        thumbW = Math.round((thumbW * thumbMax) / thumbH);
                        thumbH = thumbMax;
                    }
                }
                thumbCanvas.width = thumbW;
                thumbCanvas.height = thumbH;
                const thumbCtx = thumbCanvas.getContext('2d');
                if (thumbCtx) {
                    thumbCtx.drawImage(img, 0, 0, thumbW, thumbH);
                }
                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                const thumbDataUrl = thumbCanvas.toDataURL('image/jpeg', 0.7);
                canvas.toBlob((blob) => {
                    if (!blob)
                        return reject(new Error('Blob creation failed'));
                    thumbCanvas.toBlob((thumbBlob) => {
                        const finalThumbBlob = thumbBlob || blob;
                        const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '') + '.jpg', { type: 'image/jpeg', lastModified: Date.now() });
                        resolve({
                            compressedBlob: blob,
                            compressedFile,
                            thumbnailBlob: finalThumbBlob,
                            originalSize: file.size,
                            compressedSize: blob.size,
                            width,
                            height,
                            dataUrl,
                            thumbnailDataUrl: thumbDataUrl,
                        });
                    }, 'image/jpeg', 0.7);
                }, 'image/jpeg', quality);
            };
            img.onerror = (e) => reject(e);
        };
        reader.onerror = (e) => reject(e);
    });
}
