import { createPublicClient, http, verifyMessage } from "viem";
import { polygonAmoy } from "viem/chains";
import { marketplaceAbi, MARKETPLACE_ADDRESS } from "@/lib/contracts";
import { getDb } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: Request, { params }: any): Promise<Response> {
	const { cid } = params as { cid?: string } || {};
	if (!cid) return new Response("Missing cid", { status: 400 });
	const { address, signature } = await req.json().catch(() => ({}));
	if (!address || !signature) return new Response("Missing address/signature", { status: 400 });

	const message = `download:${cid}`;
	const okSig = await verifyMessage({ address, message, signature }).catch(() => false);
	if (!okSig) return new Response("Bad signature", { status: 401 });

	const client = createPublicClient({ chain: polygonAmoy, transport: http() });
	const hasAccess = await client.readContract({
		abi: marketplaceAbi as any,
		address: MARKETPLACE_ADDRESS as `0x${string}`,
		functionName: "hasBuyerAccess",
		account: address as `0x${string}`,
		args: [cid]
	}).catch(() => false) as boolean;

	if (!hasAccess) return new Response("No access", { status: 403 });

	// Check if the file is encrypted and stored metadata exists
	try {
		const db = await getDb();
		const meta = await db.collection("encrypted_files").findOne({ cid });
		const gatewayUrl = `https://gateway.lighthouse.storage/ipfs/${cid}`;
		const resp = await fetch(gatewayUrl);
		if (!resp.ok) return new Response("Fetch failed", { status: 502 });

		const fileName = resp.headers.get("content-disposition")?.match(/filename="([^\"]+)"/)?.[1] || `${cid}`;
		const contentType = resp.headers.get("content-type") || "application/octet-stream";

		if (!meta || !meta.encrypted) {
			// Not encrypted; stream directly
			if (!resp.body) return new Response("No body", { status: 502 });
			return new Response(resp.body, {
				headers: {
					"Content-Type": contentType,
					"Content-Disposition": `attachment; filename="${fileName}"`
				}
			});
		}

		// Encrypted: fetch full body and decrypt
		const arrayBuffer = await resp.arrayBuffer();
		const encryptedBuffer = Buffer.from(arrayBuffer);
		// Split encrypted content and tag. We appended tag at the end during upload.
		const tag = Buffer.from(meta.tag, "base64");
		const iv = Buffer.from(meta.iv, "base64");
		let key = Buffer.from(meta.key, "base64");

		// If server master key present, decrypt stored key first (not implemented: assumes key stored raw)
		// Decrypt: encrypted payload = encrypted || tag
		const enc = encryptedBuffer.slice(0, encryptedBuffer.length - tag.length);
		const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
		decipher.setAuthTag(tag);
		const decrypted = Buffer.concat([decipher.update(enc), decipher.final()]);

		return new Response(decrypted, {
			headers: {
				"Content-Type": contentType,
				"Content-Disposition": `attachment; filename="${fileName}"`
			}
		});
	} catch (e: any) {
		console.error("Download error:", e);
		return new Response(JSON.stringify({ error: e?.message || "Download failed" }), { status: 500, headers: { "Content-Type": "application/json" } });
	}
}


