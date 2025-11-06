import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const address = url.searchParams.get("address");
        if (!address) return new Response(JSON.stringify({ items: [] }), { headers: { "Content-Type": "application/json" } });
        const db = await getDb();
        const items = await db.collection("purchases").find({ address: address.toLowerCase() }).sort({ createdAt: -1 }).toArray();
        return new Response(JSON.stringify({ items }), { headers: { "Content-Type": "application/json" } });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e?.message || "db error" }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { address, cid, txHash } = body || {};
        if (!address || !cid || !txHash) return new Response(JSON.stringify({ error: "address/cid/txHash required" }), { status: 400, headers: { "Content-Type": "application/json" } });
        const db = await getDb();
        await db.collection("purchases").insertOne({ address: address.toLowerCase(), cid, txHash, createdAt: new Date() });
        return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e?.message || "db error" }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
}
