import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
	const { messages } = await req.json();
	const apiKey = process.env.GEMINI_API_KEY;
	if (!apiKey) {
		return new Response(JSON.stringify({ error: "GEMINI_API_KEY missing" }), { status: 500 });
	}
	// Minimal pass-through to Gemini (text-only)
	const resp = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			contents: [
				{ role: "user", parts: [{ text: String(messages?.join("\n")) || "Help me use the marketplace" }] }
			]
		})
	});
	const json = await resp.json();
	const text = json.candidates?.[0]?.content?.parts?.[0]?.text || "";
	return new Response(JSON.stringify({ text }), { headers: { "Content-Type": "application/json" } });
}


