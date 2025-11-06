import { NextRequest } from "next/server";
import lighthouse from "@lighthouse-web3/sdk";
import crypto from "crypto";
import { getDb } from "@/lib/db";

// Server-side upload: supports optional AES-256-GCM encryption before uploading to IPFS.
export async function POST(req: NextRequest) {
    try {
        const apiKey = process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY || process.env.LIGHTHOUSE_API_KEY;
        if (!apiKey) {
            return new Response(JSON.stringify({ error: "Lighthouse API key not configured" }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;
        const encrypt = String(formData.get("encrypt") || "false") === "true";

        if (!file) {
            return new Response(JSON.stringify({ error: "No file provided" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        let uploadBuffer = buffer;
        let meta: any = { encrypted: false };

        if (encrypt) {
            // AES-256-GCM
            const key = crypto.randomBytes(32); // symmetric key
            const iv = crypto.randomBytes(12);
            const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
            const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
            const tag = cipher.getAuthTag();
            // We'll upload the encrypted payload (encrypted + tag appended)
            uploadBuffer = Buffer.concat([encrypted, tag]);

            meta = {
                encrypted: true,
                // store metadata (key/iv/tag) in DB for later decryption.
                // IMPORTANT: In production, encrypt this key with a server master key.
                key: key.toString("base64"),
                iv: iv.toString("base64"),
                tag: tag.toString("base64")
            };
        }

        const response = await lighthouse.uploadBuffer(uploadBuffer, apiKey);
        const cid = (response as any)?.data?.Hash;

        if (!cid) {
            return new Response(JSON.stringify({ error: "Upload failed: no CID returned" }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }

        // persist encryption metadata if present
        try {
            if (meta.encrypted) {
                const db = await getDb();
                await db.collection("encrypted_files").updateOne({ cid }, { $set: { cid, ...meta, createdAt: new Date() } }, { upsert: true });
            }
        } catch (e) {
            console.warn("Failed saving encryption metadata:", e);
        }

        return new Response(JSON.stringify({ cid, encrypted: !!meta.encrypted }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (e: any) {
        console.error("Upload error:", e);
        return new Response(JSON.stringify({ error: e?.message || "Upload failed" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
