"use client";
import { useState } from "react";

export default function Chatbot() {
	const [input, setInput] = useState("");
	const [answer, setAnswer] = useState("");
	async function ask() {
		const res = await fetch("/api/chat", { method: "POST", body: JSON.stringify({ messages: [input] }) });
		const json = await res.json();
		setAnswer(json.text || "");
	}
	return (
		<div className="fixed bottom-4 right-4 w-80 border rounded-xl bg-white dark:bg-zinc-900 p-4 space-y-2 shadow-lg">
			<h4 className="font-medium">Assistant</h4>
			<textarea className="w-full border rounded p-2" rows={3} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask how to sell or buy..." />
			<button className="border rounded px-3 py-1" onClick={ask}>Ask</button>
			{answer && <div className="text-sm whitespace-pre-wrap border-t pt-2">{answer}</div>}
		</div>
	);
}


