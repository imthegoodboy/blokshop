# BlockShopy (Polygon Amoy testnet)

A decentralized marketplace for digital goods (images, PDFs, files). Sellers upload to IPFS and list on-chain; buyers pay in MATIC. Platform automatically takes a 20% fee and sends 80% to the seller.

## Stack
- Next.js (App Router, Tailwind)
- wagmi + RainbowKit (wallet connect)
- Hardhat + Solidity (Polygon Amoy)
- IPFS via Web3.Storage
- Gemini chatbot helper

## 1) Prerequisites
- Node 18+
- A Polygon Amoy testnet wallet with test MATIC
- API keys:
  - Web3.Storage token (free)
  - WalletConnect Cloud Project ID (free)
  - Gemini API key (free)
  - Optional: Polygonscan API key (for contract verification)

## 2) Contracts setup
```bash
cd contracts
# create .env with the following keys
# AMOY_RPC_URL=https://rpc-amoy.polygon.technology
# PRIVATE_KEY=0xYOUR_PRIVATE_KEY
# POLYGONSCAN_API_KEY=your_polygonscan_key
# FEE_RECIPIENT=0xYourFeeRecipientAddress  # receives the 20% fee
# PLATFORM_FEE_BPS=2000                    # 20%

npm run build
npm run deploy:amoy
```
Deployment output prints the `Marketplace` address. Copy it.

## 3) Web setup
```bash
cd ../web


npm run dev
```
Open http://localhost:3000.

## 4) App usage
- Sell: upload a file to IPFS, set price, then list on-chain.
- Explore: paste a product CID, view price, and purchase in MATIC.
- Dashboard: enter your CID to view listing details.
- Chatbot: bottom-right helper for guidance.

## Notes
- Fees: 20% to `FEE_RECIPIENT`, 80% to seller. Adjustable via contract function `setPlatformParams` (only current `feeRecipient` can change).
- Storage: Files stored on IPFS via Web3.Storage. CID is referenced in the contract.
- Access: Contract records purchase; your backend/UI should gate downloads by checking `hasBuyerAccess(buyer, cid)`.
- Network: Polygon Amoy only (testnet).

## Verify contract (optional)
```bash
npx hardhat verify --network amoy <DEPLOYED_ADDRESS> 2000 0xYourFeeRecipientAddress
```

## Troubleshooting
- If wallet connect fails, check `NEXT_PUBLIC_WALLETCONNECT_ID`.
- If uploads fail, verify `WEB3_STORAGE_TOKEN` and that the selected file is small enough for the free tier.
- Ensure `NEXT_PUBLIC_MARKETPLACE_ADDRESS` matches the deployed address.

## Recent changes (added by contributor)

These updates were added to surface judge feedback and start implementing higher-priority features recommended by reviewers.

- UI: Added a "Judge Reviews" section on the About page to display reviewer comments and recommended improvements.
  - File: `web/src/components/JudgesReviews.tsx`
- UI: Added a small "Roadmap & Feature Status" panel to show planned features and current status.
  - File: `web/src/components/FeatureRoadmap.tsx`
- Docs: App internal working notes updated with reviewer comments and an action plan (IPFS encryption, gasless flows, AI recommendations, mainnet readiness).
  - File: `working.md`

Features & next steps planned

- IPFS encryption & per-buyer decryption keys (recommended first priority): protect uploaded assets by encrypting before upload and delivering per-purchase keys to buyers.
- Gasless transactions (meta-transaction relayer) to improve UX for buyers.
- AI-driven recommendations for product discovery (heuristic MVP, then embedding-based recommendations).
- Mainnet readiness: contract audits, gas profiling, verified deployment scripts.

If you'd like me to continue, I can implement the IPFS encryption + per-buyer key flow next and add API routes + UI for upload/download and purchase-based key delivery.
