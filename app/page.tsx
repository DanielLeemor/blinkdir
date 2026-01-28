
import Header from "./components/Header";
import Footer from "./components/Footer";
import Link from "next/link";
import Directory from "./components/Directory";
import { Suspense } from "react";

export default function Home() {
  return (
    <>
      <Header />

      <main className="min-h-screen flex flex-col items-center">
        {/* Hero Section */}
        <section className="hero w-full pt-20 pb-12 flex flex-col items-center justify-center text-center">
          <div className="container w-full px-4 flex flex-col items-center">
            <div className="max-w-3xl w-full mx-auto space-y-6">
              <h1>
                <span className="hero-title-main block">Discover the Best</span>
                <span className="hero-title-main block gradient-text">Solana Actions</span>
              </h1>
              <p className="hero-subtitle-main mx-auto">
                Explore, search, and submit the most useful Blinks in the ecosystem.
                Find everything from NFT mints to DeFi swaps in one place.
              </p>


            </div>
          </div>
        </section>

        {/* Directory Section with Client Logic */}
        <div className="w-full max-w-[1400px] px-4">
          <Suspense fallback={<div className="text-center py-20">Loading directory...</div>}>
            <Directory />
          </Suspense>
        </div>

      </main >

      <Footer />
    </>
  );
}
