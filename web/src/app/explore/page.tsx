"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { marketplaceAbi, MARKETPLACE_ADDRESS } from "@/lib/contracts";
import { Button, Input } from "@/components/ui";
// removed unused useAccount import
import { useEffect } from "react";

export default function ExplorePage() {
    const [cid, setCid] = useState("");
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    useEffect(() => {
        const search = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
        const q = search?.get("q");
        const c = search?.get("cid");
        if (q) setQuery(q);
        if (c) setCid(c);
        (async () => {
            try {
                const url = new URL(window.location.origin + "/api/products");
                if (q) url.searchParams.set("q", q);
                const res = await fetch(url);
                const json = await res.json();
                setResults(json.items || []);
            } catch {}
        })();
    }, []);
    const product = useReadContract(cid
        ? {
            abi: marketplaceAbi as any,
            address: MARKETPLACE_ADDRESS as `0x${string}`,
            functionName: "getProduct",
            args: [cid]
        }
        : (undefined as any)
    );
	const { writeContract, data: txHash, isPending } = useWriteContract();
	const { isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

	const price = (product?.data as any)?.[1] as bigint | undefined;

	async function onBuy() {
		if (!cid || !price) return;
		writeContract({
			abi: marketplaceAbi as any,
			address: MARKETPLACE_ADDRESS as `0x${string}`,
			functionName: "purchase",
			args: [cid],
			value: price
		});
	}

	async function onDownload() {
		if (!cid) return;
		const message = `download:${cid}`;
    const signature = await (window as any).ethereum?.request({ method: "personal_sign", params: [message, (window as any).ethereum.selectedAddress] });
		const res = await fetch(`/api/download/${cid}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ address: (window as any).ethereum.selectedAddress, signature }) });
		if (res.ok) {
			const blob = await res.blob();
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = cid;
			document.body.appendChild(a);
			a.click();
			a.remove();
			URL.revokeObjectURL(url);
		}
	}

    return (
        <div className="mx-auto max-w-5xl p-6 space-y-6">
            <div className="flex items-center gap-2">
                <Input placeholder="Search products" value={query} onChange={(e) => setQuery(e.target.value)} />
                <Button onClick={async () => {
                    const res = await fetch(`/api/products?q=${encodeURIComponent(query)}`);
                    const json = await res.json();
                    setResults(json.items || []);
                }}>Search</Button>
            </div>

            {cid && (
                <div className="max-w-xl space-y-2">
                    <h2 className="text-xl font-semibold">Product</h2>
                    <Input placeholder="Enter IPFS CID" value={cid} onChange={(e) => setCid(e.target.value)} />
                    {price !== undefined && <p>Price: {Number(price) / 1e18} MATIC</p>}
                    <div className="flex gap-2">
                        <Button onClick={onBuy} disabled={isPending || !price}>Buy</Button>
                        <Button variant="outline" onClick={onDownload}>Download</Button>
                    </div>
                    {txHash && <p>Tx: {txHash}</p>}
                    {isSuccess && <p>Purchased! You will have access.</p>}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {results.map((p) => (
                    <div key={p._id || p.cid} className="border rounded-lg p-4 space-y-1">
                        <div className="font-medium truncate">{p.name || p.cid}</div>
                        {p.description && <div className="text-sm text-muted-foreground line-clamp-2">{p.description}</div>}
                        <div className="text-xs text-muted-foreground">Category: {p.category}</div>
                        {p.priceWei && <div className="text-sm">Price: {Number(p.priceWei) / 1e18} MATIC</div>}
                        <div className="flex gap-2 pt-2">
                            <Button onClick={() => setCid(p.cid)}>View</Button>
                            <Button variant="outline" onClick={() => navigator.clipboard.writeText(p.cid)}>Copy CID</Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}


