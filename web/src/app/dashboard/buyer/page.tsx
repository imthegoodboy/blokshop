"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui";

type Purchase = {
  cid: string;
  name: string;
  category: string;
  price: string;
};

const dummyPurchases: Purchase[] = [
  { cid: "QmDemoCID1", name: "Demo Book PDF", category: "Books", price: "0.05" },
  { cid: "QmDemoCID2", name: "Website Clone Code", category: "Code", price: "0.10" }
];

export default function BuyerDashboard() {
  const { address, isConnected } = useAccount();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);

  useEffect(() => {
    if (!isConnected || !address) return;
    (async () => {
      try {
        const pRes = await fetch(`/api/purchases?address=${encodeURIComponent(address)}`);
        const pJson = await pRes.json();
        setPurchases((pJson.items || []).map((it: any) => ({ cid: it.cid, name: it.name || it.cid, category: it.category || "", price: it.price || "" })));
      } catch (e) {}

      try {
        const fRes = await fetch(`/api/favorites?address=${encodeURIComponent(address)}`);
        const fJson = await fRes.json();
        setFavorites(fJson.items || []);
      } catch (e) {}
    })();
  }, [address, isConnected]);

  return (
    <section className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold text-pink-600 mb-6">Buyer Dashboard</h1>

      <h2 className="text-lg font-semibold mb-3">Purchase History</h2>
      <div className="space-y-4 mb-6">
        {purchases.length === 0 ? (
          <div className="text-muted-foreground">No purchases yet.</div>
        ) : (
          purchases.map((p) => (
            <div key={p.cid} className="border rounded-lg p-4 flex justify-between items-center">
              <div>
                <div className="font-semibold">{p.name}</div>
                <div className="text-xs text-muted-foreground">{p.category} · {p.price} MATIC</div>
              </div>
              <Button className="bg-pink-600 text-white">Download</Button>
            </div>
          ))
        )}
      </div>

      <h2 className="text-lg font-semibold mb-3">Favorites</h2>
      <div className="space-y-4">
        {favorites.length === 0 ? (
          <div className="text-muted-foreground">No favorites yet.</div>
        ) : (
          favorites.map((f: any) => (
            <div key={f.cid} className="border rounded-lg p-4 flex justify-between items-center">
              <div>
                <div className="font-semibold">{f.cid}</div>
                <div className="text-xs text-muted-foreground">Saved: {new Date(f.createdAt).toLocaleString()}</div>
              </div>
              <a href={`/product/${f.cid}`} className="inline-block bg-pink-600 text-white px-3 py-1 rounded">Open</a>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
