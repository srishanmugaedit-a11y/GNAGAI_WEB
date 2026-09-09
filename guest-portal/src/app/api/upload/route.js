import { NextResponse } from 'next/server';
import crypto from 'crypto';
export async function POST(req) {
    try {
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;
        if (!cloudName || !apiKey || !apiSecret) {
            return NextResponse.json({ error: 'Cloudinary environment variables are missing' }, { status: 400 });
        }
        const formData = await req.formData();
        const file = formData.get('file');
        const folder = formData.get('folder') || 'gangai_events';
        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }
        const timestamp = Math.round(Date.now() / 1000);
        const signatureString = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
        const signature = crypto
            .createHash('sha1')
            .update(signatureString)
            .digest('hex');
        const cloudinaryFormData = new FormData();
        cloudinaryFormData.append('file', file);
        cloudinaryFormData.append('api_key', apiKey);
        cloudinaryFormData.append('timestamp', timestamp.toString());
        cloudinaryFormData.append('signature', signature);
        cloudinaryFormData.append('folder', folder);
        const isVideo = file.type.startsWith('video');
        const resourceType = isVideo ? 'video' : 'image';
        const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
            method: 'POST',
            body: cloudinaryFormData,
        });
        const data = await cloudinaryRes.json();
        if (!cloudinaryRes.ok) {
            console.error('Cloudinary API error:', data);
            return NextResponse.json({ error: data.error?.message || 'Cloudinary upload failed' }, { status: 500 });
        }
        return NextResponse.json({
            secure_url: data.secure_url,
            public_id: data.public_id,
            width: data.width,
            height: data.height,
            bytes: data.bytes,
            format: data.format,
            resource_type: data.resource_type,
        });
    }
    catch (error) {
        console.error('Upload API route exception:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
