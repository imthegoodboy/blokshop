"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { Button, Card, Badge } from "@/components/ui";
import { MARKETPLACE_ADDRESS, marketplaceAbi } from "@/lib/contracts";
import ProductCard from "@/components/ProductCard";
import { useEffect } from "react";

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const cid = params?.cid as string;
  const { address, isConnected } = useAccount();
  const [metadata, setMetadata] = useState<any>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!cid) return;
    (async () => {
      try {
        const res = await fetch(`/api/products?cid=${cid}`);
        const json = await res.json();
        if (json.items && json.items.length > 0) {
          setMetadata(json.items[0]);
        }
      } catch {}
    })();
  }, [cid]);

  const productData = useReadContract({
    address: MARKETPLACE_ADDRESS as `0x${string}`,
    abi: marketplaceAbi as any,
    functionName: "getProduct",
    args: [cid]
  });

  const hasAccess = useReadContract({
    address: MARKETPLACE_ADDRESS as `0x${string}`,
    abi: marketplaceAbi as any,
    functionName: "hasBuyerAccess",
    args: [address as `0x${string}`, cid],
    query: { enabled: !!address && !!cid }
  });

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const [recommended, setRecommended] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const cat = metadata?.category || undefined;
        if (!cat) return;
        const res = await fetch(`/api/products?category=${encodeURIComponent(cat)}`);
        const json = await res.json();
        const items = (json.items || []).filter((i: any) => i.cid !== cid).slice(0, 6);
        setRecommended(items);
      } catch (e) {
        // ignore
      }
    })();
  }, [metadata, cid]);

  const seller = (productData?.data as any)?.[0] as string | undefined;
  const priceWei = (productData?.data as any)?.[1] as bigint | undefined;
  const exists = (productData?.data as any)?.[2] as boolean | undefined;
  const alreadyOwned = hasAccess?.data as boolean;

  async function handleBuy() {
    if (!cid || !priceWei || !isConnected) return;
    writeContract({
      address: MARKETPLACE_ADDRESS as `0x${string}`,
      abi: marketplaceAbi as any,
      functionName: "purchase",
      args: [cid],
      value: priceWei
    });
  }

  async function handleDownload() {
    if (!cid || !address) return;
    setDownloading(true);
    try {
      const message = `download:${cid}`;
      const signature = await (window as any).ethereum?.request({
        method: "personal_sign",
        params: [message, address]
      });
      
      const res = await fetch(`/api/download/${cid}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, signature })
      });
      
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = metadata?.name || cid;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } else {
        alert("Download failed. Please try again.");
      }
    } catch (e) {
      console.error(e);
      alert("Download failed");
    } finally {
      setDownloading(false);
    }
  }

  if (!cid) return <div className="max-w-7xl mx-auto px-6 py-12">Invalid product</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <div className="aspect-square bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl flex items-center justify-center text-9xl mb-6">
            📄
          </div>
          <Card>
            <h3 className="font-bold mb-3">Product Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-muted)' }}>File CID:</span>
                <span className="font-mono text-xs">{cid.slice(0, 10)}...{cid.slice(-8)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-muted)' }}>Network:</span>
                <span>Polygon Amoy</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-muted)' }}>Size:</span>
                <span>{metadata?.size ? Math.ceil(metadata.size / 1024) + " KB" : "Unknown"}</span>
              </div>
            </div>
          </Card>

          {recommended.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">You may also like</h3>
              <div className="grid grid-cols-2 gap-4">
                {recommended.map((p) => (
                  <ProductCard key={p.cid} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="mb-6">
            {metadata?.category && <Badge className="mb-3">{metadata.category}</Badge>}
            <h1 className="text-4xl font-bold mb-4">
              {metadata?.name || "Loading..."}
            </h1>
            <p className="text-lg mb-6" style={{ color: 'var(--text-muted)' }}>
              {metadata?.description || "No description available"}
            </p>
          </div>

          <Card className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold">Price</span>
              <span className="text-3xl font-bold">
                {priceWei ? `${(Number(priceWei) / 1e18).toFixed(3)} MATIC` : "..."}
              </span>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <span style={{ color: 'var(--text-muted)' }}>Seller:</span>
              <span className="font-mono text-sm">
                {seller ? `${seller.slice(0, 6)}...${seller.slice(-4)}` : "..."}
              </span>
            </div>
          </Card>

          {!isConnected ? (
            <Button className="w-full" onClick={() => alert("Please connect your wallet first")}>
              Connect Wallet to Buy
            </Button>
          ) : alreadyOwned ? (
            <div>
              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 mb-4 text-center">
                <p className="text-green-700 font-semibold">✅ You own this product</p>
              </div>
              <Button 
                className="w-full" 
                onClick={handleDownload}
                disabled={downloading}
              >
                {downloading ? "Downloading..." : "⬇️ Download Now"}
              </Button>
              <p className="text-sm text-center mt-3" style={{ color: 'var(--text-muted)' }}>
                You can download this product once
              </p>
            </div>
          ) : (
            <div>
              <Button 
                className="w-full" 
                onClick={handleBuy}
                disabled={isPending || !exists}
              >
                {isPending ? "Processing..." : isSuccess ? "Purchase Complete!" : "🛒 Buy Now"}
              </Button>
              {isSuccess && (
                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 mt-4 text-center">
                  <p className="text-green-700 font-semibold">
                    Purchase successful! You can now download the product.
                  </p>
                  <Button className="mt-3" onClick={handleDownload}>
                    Download Now
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
