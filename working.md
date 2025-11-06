# Overview

BlockShopy is a decentralized marketplace for digital goods built on Polygon Amoy testnet. Sellers upload files to IPFS (via Lighthouse) and list products on-chain through a smart contract. Buyers purchase using MATIC cryptocurrency, with the platform automatically collecting a 20% fee and transferring 80% to the seller. The application combines blockchain technology with traditional web infrastructure for metadata storage and file management.

# Recent Changes (October 2025)

## Replit Environment Configuration
- Migrated from Vercel to Replit, configured Next.js to run on port 5000 with 0.0.0.0 host
- Downgraded Next.js from v15.5.4 to v14.2.18 for Replit compatibility (v15 caused bus errors)
- Added webpack fallbacks for MetaMask and WalletConnect optional peer dependencies

## Complete UI Redesign
- Implemented deep yellow (#F59E0B) and white color scheme throughout the application
- Created custom component library with Button, Input, Card components using CVA
- Redesigned navbar with centered search, left-aligned logo, and right-aligned wallet buttons
- Rebuilt home page with banner section and responsive product grid
- Updated product detail page with seller info and purchase flow
- Redesigned seller dashboard with upload form and product management

## Security Improvements
- **Critical Fix**: Moved Lighthouse API uploads to server-side route (/api/upload) to prevent API key exposure
- Implemented secure file upload proxy via Next.js API route
- Seller dashboard now uses fetch to communicate with secure upload endpoint

## Known Development Warnings
- Minor React hydration warnings during development (non-blocking, app fully functional)
- Related to Next.js App Router SSR behavior with Web3 wallet components
- Does not affect production functionality or user experience

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: Next.js 14.2.18 with App Router (downgraded from v15 for Replit compatibility)
  - Runs on port 5000 with 0.0.0.0 host binding for Replit environment
  - Webpack configured with fallbacks for optional peer dependencies
- **Styling**: Tailwind CSS v4 with custom design system (deep yellow #F59E0B primary theme)
- **State Management**: Zustand for client-side state
- **Web3 Integration**: wagmi v2 + viem for Ethereum interactions, injected wallet connector for wallet connections
  - Wallet components use dynamic imports with ssr: false to prevent hydration issues
- **UI Components**: Custom component library built with class-variance-authority and tailwind-merge utilities
  - Components: Button (primary/secondary/outline variants), Input, Card

## Backend Architecture
- **Smart Contracts**: Solidity 0.8.24 contracts deployed via Hardhat to Polygon Amoy testnet
  - `Marketplace.sol`: Core contract handling product listings, purchases, and fee distribution
  - Platform fee: 2000 basis points (20%) configured at deployment
  - Fee recipient address set during deployment
- **API Routes**: Next.js API routes for server-side operations
  - `/api/products`: Product metadata CRUD operations
  - `/api/auth/*`: User authentication (JWT-based)
  - `/api/upload`: Secure file upload proxy to Lighthouse (prevents API key exposure)
  - `/api/download`: Signature-verified file downloads
- **Data Flow**: 
  - File storage on IPFS via Lighthouse SDK
  - On-chain product registry and access control
  - Off-chain metadata in MongoDB for search/discovery

## Database & Storage
- **Database**: MongoDB for product metadata and user accounts
  - Collections: `products` (CID, name, description, category, price, owner), `users` (email, passwordHash)
  - No schema validation - flexible document structure
- **File Storage**: IPFS via Lighthouse Web3.Storage
  - Files uploaded as buffers to Lighthouse
  - CID used as unique identifier across system
  - Gateway URL pattern: `https://gateway.lighthouse.storage/ipfs/{cid}`

## Authentication & Authorization
- **Wallet-Based**: Primary authentication via Web3 wallet signatures
  - Signature verification for secure downloads using viem's `verifyMessage`
  - Message format: `download:{cid}` for download authorization
- **Traditional Auth**: JWT-based email/password authentication for optional web2 features
  - bcrypt for password hashing
  - HTTP-only cookies for token storage
  - 7-day token expiration
- **Access Control**: Smart contract enforces purchase-based access
  - `hasBuyerAccess` function checks on-chain purchase records
  - Seller-only operations verified by contract

## External Dependencies

### Blockchain Infrastructure
- **Polygon Amoy Testnet**: Layer 2 test network for smart contract deployment
  - RPC URL: `https://rpc-amoy.polygon.technology`
  - Requires test MATIC for transactions
- **WalletConnect Cloud**: Wallet connection infrastructure (optional but recommended)
  - Project ID required for production use
- **Polygonscan API**: Contract verification service (optional)

### File Storage & IPFS
- **Lighthouse (Web3.Storage)**: Decentralized file storage
  - SDK: `@lighthouse-web3/sdk` v0.4.3
  - API key required for uploads
  - Buffer-based upload mechanism

### AI Integration
- **Google Gemini API**: Chatbot assistance for marketplace help
  - Model: gemini-1.5-flash
  - Text-only content generation
  - Pass-through proxy via API route
 

### Development Tools
- **Hardhat**: Smart contract development framework
  - TypeScript configuration
  - Ethers.js v6 for contract interactions
  - Contract compilation and deployment scripts
- **TypeChain**: Type-safe contract bindings generation
  - Auto-generated TypeScript interfaces from ABIs

### Security Libraries
- **bcryptjs**: Password hashing (10 rounds)
- **jsonwebtoken**: JWT token generation and verification
- **viem**: Message signature verification for Web3 auth