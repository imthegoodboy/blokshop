import React from "react";

export default function FeatureRoadmap() {
    return (
        <section className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold">Roadmap & Feature Status</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground list-disc list-inside">
                <li><strong>IPFS encryption</strong> — planned (prototype in progress)</li>
                <li><strong>Per-buyer key delivery</strong> — planned</li>
                <li><strong>Gasless transactions</strong> — research & prototype</li>
                <li><strong>AI recommendations</strong> — heuristic MVP available, advanced model planned</li>
                <li><strong>Mainnet deployment</strong> — checklist: audit, gas profiling, verification</li>
            </ul>
        </section>
    );
}
