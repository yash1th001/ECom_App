import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [activeTab, setActiveTab] = useState<"features" | "instructions">("instructions");

  return (
    <div className="min-h-screen bg-[#111111] text-[#fcfbf8] font-sans antialiased overflow-x-hidden">
      {/* Background radial highlight */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-[#b38f4f]/10 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 py-8 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        
        {/* Left Side: Product Intro & Metadata */}
        <div className="lg:col-span-7 flex flex-col justify-center space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border border-[#b38f4f]/30 bg-[#b38f4f]/5 text-xs text-[#d4af37] tracking-widest font-semibold uppercase">
              ✨ AURUM · PREMIUM GOLD VAULT
            </div>
            <h1 className="text-4xl md:text-6xl font-serif tracking-tight leading-tight text-white">
              Invest in purity, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#b38f4f]">
                backed by live rates.
              </span>
            </h1>
            <p className="text-lg text-gray-400 font-light max-w-xl">
              Aurum is an invite-only secure gold and jewelry trading application. Every price is live-calculated against spot gold rates, secured via escrow, and verified with hallmark credentials.
            </p>
          </div>

          {/* Feature Tabs */}
          <div className="bg-[#181818] p-6 rounded-2xl border border-white/5 space-y-6">
            <div className="flex border-b border-white/5 pb-3 gap-6">
              <button
                onClick={() => setActiveTab("instructions")}
                className={`pb-2 text-sm font-medium tracking-wide uppercase border-b-2 transition-all ${
                  activeTab === "instructions"
                    ? "border-[#d4af37] text-white"
                    : "border-transparent text-gray-500 hover:text-gray-300"
                }`}
              >
                🔐 Test Instructions
              </button>
              <button
                onClick={() => setActiveTab("features")}
                className={`pb-2 text-sm font-medium tracking-wide uppercase border-b-2 transition-all ${
                  activeTab === "features"
                    ? "border-[#d4af37] text-white"
                    : "border-transparent text-gray-500 hover:text-gray-300"
                }`}
              >
                💎 Key Features
              </button>
            </div>

            {activeTab === "instructions" && (
              <div className="space-y-4 text-sm text-gray-300">
                <div className="p-4 bg-[#1f1f1f] rounded-xl border border-white/5 flex flex-col space-y-2">
                  <span className="text-[#d4af37] font-semibold uppercase tracking-wider text-xs">Step 1: Get Access</span>
                  <p>Register as a new user. The system requires an invite code. Use seed referral code:</p>
                  <code className="px-2.5 py-1 bg-black rounded border border-[#b38f4f]/30 font-mono text-[#d4af37] self-start text-sm mt-1 select-all font-bold">
                    AURUM-2026
                  </code>
                </div>

                <div className="p-4 bg-[#1f1f1f] rounded-xl border border-white/5 flex flex-col space-y-2">
                  <span className="text-[#d4af37] font-semibold uppercase tracking-wider text-xs">Step 2: Sign In Verification</span>
                  <p>Request an OTP to log in via phone/email. The system is mocked to verify instantly using:</p>
                  <code className="px-2.5 py-1 bg-black rounded border border-[#b38f4f]/30 font-mono text-[#d4af37] self-start text-sm mt-1 select-all font-bold">
                    123456
                  </code>
                </div>

                <div className="p-4 bg-[#1f1f1f] rounded-xl border border-white/5 flex flex-col space-y-2">
                  <span className="text-[#d4af37] font-semibold uppercase tracking-wider text-xs">Step 3: High-Value Checkout</span>
                  <p>Add products to your cart. Place an order above the ₹2,00,000 threshold to trigger the regulations check, upload mock PAN/Gov ID photos, and pay using Stripe/Razorpay payment simulations.</p>
                </div>
              </div>
            )}

            {activeTab === "features" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
                <div className="flex space-x-3">
                  <span className="text-[#d4af37] text-lg">⚖️</span>
                  <div>
                    <h4 className="font-semibold text-white">Live Gold Rate engine</h4>
                    <p className="text-gray-400 text-xs">Fetches XAU and open.er-api.com currency rates to calculate 22K/24K gold rates in real time.</p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <span className="text-[#d4af37] text-lg">⏳</span>
                  <div>
                    <h4 className="font-semibold text-white">10-Minute Cart Price Lock</h4>
                    <p className="text-gray-400 text-xs">Prices are locked when added to cart, featuring countdown timers and dynamic re-quotes.</p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <span className="text-[#d4af37] text-lg">💳</span>
                  <div>
                    <h4 className="font-semibold text-white">Payments Simulator</h4>
                    <p className="text-gray-400 text-xs">Fully functional Stripe/Razorpay simulation handling transaction receipts.</p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <span className="text-[#d4af37] text-lg">📋</span>
                  <div>
                    <h4 className="font-semibold text-white">KYC & Escrow</h4>
                    <p className="text-gray-400 text-xs">Regulations check with government document picker and automated workflow verification.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-3 text-xs text-gray-500">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span>Expo Mobile App server running locally on <a href="http://localhost:8081" target="_blank" rel="noreferrer" className="text-[#d4af37] underline">http://localhost:8081</a></span>
          </div>
        </div>

        {/* Right Side: Smartphone Device Mockup Iframe */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative w-[375px] h-[760px] bg-[#1a1a1a] rounded-[52px] border-[10px] border-[#2b2b2b] shadow-2xl overflow-hidden ring-4 ring-[#b38f4f]/20">
            {/* Speaker bar & camera notch */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-6 bg-[#2b2b2b] rounded-b-2xl z-30 flex items-center justify-center space-x-2">
              <div className="w-12 h-1 bg-black rounded" />
              <div className="w-2.5 h-2.5 rounded-full bg-black" />
            </div>

            {/* Mobile App Web frame */}
            <iframe 
              src="http://localhost:8081" 
              title="Aurum Mobile Preview"
              className="w-full h-full border-none z-20 relative bg-[#fcfbf8]"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </div>

      </div>
    </div>
  );
}

