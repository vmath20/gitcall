"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoadingPage() {
  const [dots, setDots] = useState("");
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === "...") return "";
        return prev + ".";
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-neutral-100 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <div className="mb-8">
          <Image 
            src="/logo/TransparentLogo.png" 
            alt="GitCall" 
            width={120} 
            height={120} 
            unoptimized 
            className="mx-auto"
          />
        </div>

        {/* Loading Animation */}
        <div className="mb-8">
          <div className="relative">
            <div className="w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-neutral-200"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-gradient-to-r from-[#b16cea] to-[#ff5e69] animate-spin"></div>
            </div>
            <div 
              className="w-16 h-16 mx-auto rounded-full animate-spin"
              style={{
                background: 'conic-gradient(from 0deg, #b16cea, #ff5e69, #ff8a56, #ffa84b, #b16cea)',
                mask: 'radial-gradient(circle at center, transparent 50%, black 52%)',
                WebkitMask: 'radial-gradient(circle at center, transparent 50%, black 52%)'
              }}
            ></div>
          </div>
        </div>

        {/* Loading Text */}
        <h1 className="text-2xl md:text-3xl font-bold mb-4 text-black">
          Setting up your call{dots}
        </h1>
        
        <p className="text-lg text-neutral-600 mb-8">
          We're connecting you to your GitHub repository. This will just take a moment.
        </p>

        {/* Status Messages */}
        <div className="space-y-2 text-sm text-neutral-500">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Validating phone number</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            <span>Connecting to AI agent</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span>Preparing your repository data</span>
          </div>
        </div>

        {/* Continue Button */}
        <button 
          onClick={() => router.push('/dashboard')}
          className="mt-8 bg-gradient-to-r from-[#b16cea] to-[#ff5e69] text-white rounded-full px-8 py-3 text-lg font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105"
        >
          Continue to Dashboard
        </button>

        {/* Back Button */}
        <button 
          onClick={() => router.push('/')}
          className="mt-4 text-neutral-500 hover:text-black transition-colors underline text-sm"
        >
          Go back to home
        </button>
      </div>
    </div>
  );
} 