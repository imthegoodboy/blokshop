export default function JudgesReviews() {
    return (
        <section className="bg-white p-6 rounded-lg shadow-sm space-y-4">
            <h2 className="text-xl font-semibold">Judge Reviews</h2>
            <div className="space-y-3">
                <article className="border-l-4 border-yellow-400 pl-4">
                    <p className="font-medium">chillerwhale — 2025-10-27 15:39</p>
                    <p className="text-sm text-muted-foreground">The transition to mainnet and addition of gasless transactions and AI-driven recommendations position this as one of the most complete and technically mature submissions.</p>
                </article>

                <article className="border-l-4 border-yellow-400 pl-4">
                    <p className="font-medium">0xNXTLVL — 2025-10-25 23:13</p>
                    <p className="text-sm text-muted-foreground">Digital creators need such platforms.</p>
                </article>

                <article className="border-l-4 border-yellow-400 pl-4">
                    <p className="font-medium">Extra Feedback</p>
                    <p className="text-sm text-muted-foreground">Keep working on it — it needs protection (encrypt files, then sell unique per-buyer decryption keys) so that not just anyone can grab files for free from IPFS. Consider gasless flows for UX and AI-driven recommendations for discovery. Contact: t.me/swader for ideas.</p>
                </article>
            </div>

            <div className="pt-3 border-t border-gray-100">
                <h3 className="font-semibold">Planned improvements</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    <li>Prepare contracts + deployment scripts for mainnet (audit checklist & gas estimates)</li>
                    <li>Prototype gasless transactions (meta-transactions / relayer + Biconomy or OpenGSN)</li>
                    <li>Design IPFS encryption flow with per-buyer key distribution (encrypt before upload, sell symmetric key or use public-key per-buyer)</li>
                    <li>Integrate an AI recommendations service (server-side model or third-party API) for product discovery</li>
                </ul>
            </div>
        </section>
    );
}
