import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { verifyMessage } from "viem";

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const address = url.searchParams.get("address");
        if (!address) return new Response(JSON.stringify({ items: [] }), { headers: { "Content-Type": "application/json" } });
        const db = await getDb();
        const items = await db.collection("favorites").find({ address: address.toLowerCase() }).sort({ createdAt: -1 }).toArray();
        return new Response(JSON.stringify({ items }), { headers: { "Content-Type": "application/json" } });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e?.message || "db error" }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { address, cid, signature } = body || {};
        if (!address || !cid || !signature) return new Response(JSON.stringify({ error: "address/cid/signature required" }), { status: 400, headers: { "Content-Type": "application/json" } });

        // Verify signature: message = favorite:{cid}
        const message = `favorite:${cid}`;
        const ok = await verifyMessage({ address, message, signature }).catch(() => false);
        if (!ok) return new Response(JSON.stringify({ error: "bad signature" }), { status: 401, headers: { "Content-Type": "application/json" } });

        const db = await getDb();
        await db.collection("favorites").updateOne({ address: address.toLowerCase(), cid }, { $set: { address: address.toLowerCase(), cid, signature, createdAt: new Date() } }, { upsert: true });
        return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e?.message || "db error" }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
}
