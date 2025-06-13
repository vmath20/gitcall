"use client";
import Image from "next/image";
import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { AnimatedBeamDemo } from "@/components/ui/animated-beam-demo";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";

const words = ["Learn", "Plan", "Shop", "Write"];

const countries = [
  { code: "+1", name: "United States", flag: "🇺🇸" },
  { code: "+91", name: "India", flag: "🇮🇳" },
  { code: "+81", name: "Japan", flag: "🇯🇵" },
  { code: "+49", name: "Germany", flag: "🇩🇪" },
];

function GradientWord({ word, animate }: { word: string; animate: boolean }) {
  return (
    <span
      className={`inline-block font-bold relative bg-gradient-to-r from-[#b16cea] via-[#ff5e69] via-40% via-[#ff8a56] via-70% to-[#ffa84b] bg-clip-text text-transparent transition-all duration-700 ease-in-out ${animate ? "animate-gradient" : ""}`}
      style={{
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        backgroundImage:
          "linear-gradient(90deg, #b16cea 0%, #ff5e69 40%, #ff8a56 70%, #ffa84b 100%)",
      }}
    >
      {word}
    </span>
  );
}

export default function Home() {
  const [animate, setAnimate] = useState(true);
  const twitterRef = useRef<HTMLDivElement>(null);
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [callBtnActive, setCallBtnActive] = useState(false);
  // Dropdown state for each phone input
  const [dropdownOpenHero, setDropdownOpenHero] = useState(false);
  const [dropdownOpenModal, setDropdownOpenModal] = useState(false);
  const [dropdownOpenFooter, setDropdownOpenFooter] = useState(false);
  const dropdownRefHero = useRef<HTMLDivElement>(null);
  const dropdownRefModal = useRef<HTMLDivElement>(null);
  const dropdownRefFooter = useRef<HTMLDivElement>(null);
  const [showNavbar, setShowNavbar] = useState(true);
  const heroRef = useRef<HTMLDivElement>(null);
  const [showModal, setShowModal] = useState(false);
  
  // Phone number states
  const [phoneNumberHero, setPhoneNumberHero] = useState("");
  const [phoneNumberModal, setPhoneNumberModal] = useState("");
  const [phoneNumberFooter, setPhoneNumberFooter] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  
  const router = useRouter();

  // Phone number validation function
  const validatePhoneNumber = (phone: string) => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Check if it's a valid length (7-15 digits is generally acceptable for international numbers)
    if (cleaned.length < 7 || cleaned.length > 15) {
      return false;
    }
    
    // Basic pattern check - should start with a digit
    return /^\d+$/.test(cleaned);
  };

  // Handle phone submission
  const handlePhoneSubmit = (phoneNumber: string, source: string) => {
    setErrorMessage("");
    
    if (!phoneNumber.trim()) {
      setErrorMessage("Please enter a phone number");
      return;
    }
    
    if (!validatePhoneNumber(phoneNumber)) {
      setErrorMessage("Please enter a valid phone number");
      return;
    }
    
    // Redirect to loading page
    router.push('/loading');
  };

  useEffect(() => {
    setAnimate(false);
    setTimeout(() => setAnimate(true), 100);
  }, []);

  // Twitter follow button hydration fix
  useEffect(() => {
    if (twitterRef.current) {
      twitterRef.current.innerHTML = '';
      const anchor = document.createElement('a');
      anchor.setAttribute('href', 'https://twitter.com/theadistar');
      anchor.setAttribute('class', 'twitter-follow-button');
      anchor.setAttribute('data-size', 'large');
      anchor.setAttribute('data-show-screen-name', 'false');
      anchor.setAttribute('target', '_blank');
      anchor.setAttribute('rel', 'noopener noreferrer');
      anchor.textContent = 'Follow on X';
      twitterRef.current.appendChild(anchor);
      if (window && (window as any).twttr && (window as any).twttr.widgets) {
        (window as any).twttr.widgets.load();
      }
    }
  }, []);

  useEffect(() => {
    // Add Twitter follow button to footer for @koyalhq
    const twitterFooter = document.getElementById('twitter-follow-btn-footer');
    if (twitterFooter && twitterFooter.childNodes.length === 0) {
      const anchor = document.createElement('a');
      anchor.setAttribute('href', 'https://twitter.com/koyalhq');
      anchor.setAttribute('class', 'twitter-follow-button');
      anchor.setAttribute('data-size', 'large');
      anchor.setAttribute('data-show-screen-name', 'false');
      anchor.setAttribute('target', '_blank');
      anchor.setAttribute('rel', 'noopener noreferrer');
      anchor.textContent = 'Follow on X';
      twitterFooter.appendChild(anchor);
      if (window && (window as any).twttr && (window as any).twttr.widgets) {
        (window as any).twttr.widgets.load();
      }
    }

  }, []);

  // Close dropdown on outside click for each input
  useEffect(() => {
    if (!dropdownOpenHero) return;
    function handleClick(event: MouseEvent) {
      if (dropdownRefHero.current && !dropdownRefHero.current.contains(event.target as Node)) {
        setDropdownOpenHero(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpenHero]);
  useEffect(() => {
    if (!dropdownOpenModal) return;
    function handleClick(event: MouseEvent) {
      if (dropdownRefModal.current && !dropdownRefModal.current.contains(event.target as Node)) {
        setDropdownOpenModal(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpenModal]);
  useEffect(() => {
    if (!dropdownOpenFooter) return;
    function handleClick(event: MouseEvent) {
      if (dropdownRefFooter.current && !dropdownRefFooter.current.contains(event.target as Node)) {
        setDropdownOpenFooter(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpenFooter]);



  // Modal for phone input
  function PhoneModal() {
    return createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full relative" onClick={e => e.stopPropagation()}>
          <button className="absolute top-3 right-3 text-2xl text-gray-400 hover:text-black" onClick={() => setShowModal(false)}>&times;</button>
          <div className="mb-6 text-center text-xl font-semibold">Talk to your repo now</div>
          <div className="flex items-center w-full bg-white rounded-xl shadow-lg px-2 py-2 border border-neutral-200 gap-2">
            <div className="relative mr-2" ref={dropdownRefModal}>
              <button
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-black text-black text-base font-medium focus:outline-none min-w-[90px]"
                type="button"
                tabIndex={0}
                onClick={() => setDropdownOpenModal((open) => !open)}
              >
                <span>{selectedCountry.flag}</span>
                <span className="ml-1">{selectedCountry.code}</span>
                <svg className="ml-1" width="16" height="16" fill="none" viewBox="0 0 16 16"><path d="M4 6l4 4 4-4" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              {dropdownOpenModal && (
                <div className="absolute left-0 mt-2 w-48 bg-white border border-black rounded shadow-lg z-10">
                  {countries.map((country) => (
                    <div
                      key={country.code}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => { setSelectedCountry(country); setDropdownOpenModal(false); }}
                    >
                      <span>{country.flag}</span>
                      <span>{country.name}</span>
                      <span className="ml-auto">{country.code}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <input
              className="flex-1 bg-transparent outline-none text-base placeholder:text-neutral-500 px-2 h-10"
              placeholder="Enter phone number"
              type="tel"
              value={phoneNumberModal}
              onChange={(e) => setPhoneNumberModal(e.target.value)}
              style={{ minHeight: '2.25rem' }}
            />
            <button
              className={`ml-2 rounded-full p-2 w-12 h-12 flex items-center justify-center border-2 transition-all duration-200 animate-pulse-gradient`}
              style={{
                border: '2px solid transparent',
                backgroundImage: 'linear-gradient(#fff, #fff), linear-gradient(90deg, #b16cea 0%, #ff5e69 40%, #ff8a56 70%, #ffa84b 100%)',
                backgroundOrigin: 'border-box',
                backgroundClip: 'padding-box, border-box',
              }}
              onClick={() => handlePhoneSubmit(phoneNumberModal, 'modal')}
              onMouseDown={() => setCallBtnActive(true)}
              onMouseUp={() => setCallBtnActive(false)}
              onMouseLeave={() => setCallBtnActive(false)}
            >
              <Image src="/logo/icon1.svg" alt="Enter" width={48} height={48} unoptimized className={callBtnActive ? 'invert' : ''} />
            </button>
          </div>
          {errorMessage && (
            <div className="mt-4 text-red-500 text-sm text-center">
              {errorMessage}
            </div>
          )}
        </div>
      </div>,
      document.body
    );
  }

  return (
    <>
      <div id="about" ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center" style={{ background: '#fbfbf5' }}>
        {/* Centered content (Hero) */}
        <div className="flex flex-col items-center justify-center flex-1 w-full px-4">
          {/* Logo */}
          <div className="mb-6 mt-16">
            <div className="flex items-center justify-center">
              <Image src="/logo/TransparentLogo.svg" alt="Logo" width={540} height={120} priority unoptimized />
            </div>
          </div>
          {/* Headline */}
          <h1
            className="text-5xl md:text-6xl font-semibold text-center mb-12 tracking-tight leading-tight text-black"
            style={{ fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif' }}
          >
            Code changes? We'll call you.{' '}
            <GradientWord word="Literally." animate={animate} />
          </h1>
          {/* Watch the trailer button */}
          <button className="bg-black text-white rounded-lg px-8 py-3 text-lg font-medium mb-16 hover:bg-[#ff3131] transition">
            Watch the trailer
          </button>
          {/* Phone input with country dropdown */}
          <div className="w-full max-w-xl flex flex-col items-center mb-24">
            <div className="flex items-center w-full bg-white rounded-xl shadow-lg px-2 py-2 border border-neutral-200 gap-2">
              {/* Country dropdown */}
              <div className="relative mr-2" ref={dropdownRefHero}>
                <button
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-black text-black text-base font-medium focus:outline-none min-w-[90px]"
                  type="button"
                  tabIndex={0}
                  onClick={() => setDropdownOpenHero((open) => !open)}
                >
                  <span>{selectedCountry.flag}</span>
                  <span className="ml-1">{selectedCountry.code}</span>
                  <svg className="ml-1" width="16" height="16" fill="none" viewBox="0 0 16 16"><path d="M4 6l4 4 4-4" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                {dropdownOpenHero && (
                  <div className="absolute left-0 mt-2 w-48 bg-white border border-black rounded shadow-lg z-10">
                    {countries.map((country) => (
                      <div
                        key={country.code}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => { setSelectedCountry(country); setDropdownOpenHero(false); }}
                      >
                        <span>{country.flag}</span>
                        <span>{country.name}</span>
                        <span className="ml-auto">{country.code}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Phone input */}
              <input
                className="flex-1 bg-transparent outline-none text-base placeholder:text-neutral-500 px-2 h-10"
                placeholder="Enter phone number"
                type="tel"
                value={phoneNumberHero}
                onChange={(e) => setPhoneNumberHero(e.target.value)}
                style={{ minHeight: '2.25rem' }}
              />
              {/* Enter button with icon */}
              <button
                className={`ml-2 rounded-full p-2 w-12 h-12 flex items-center justify-center border-2 transition-all duration-200 animate-pulse-gradient`}
                style={{
                  border: '2px solid transparent',
                  backgroundImage: 'linear-gradient(#fff, #fff), linear-gradient(90deg, #b16cea 0%, #ff5e69 40%, #ff8a56 70%, #ffa84b 100%)',
                  backgroundOrigin: 'border-box',
                  backgroundClip: 'padding-box, border-box',
                }}
                onClick={() => handlePhoneSubmit(phoneNumberHero, 'hero')}
                onMouseDown={() => setCallBtnActive(true)}
                onMouseUp={() => setCallBtnActive(false)}
                onMouseLeave={() => setCallBtnActive(false)}
              >
                <Image src="/logo/icon1.svg" alt="Enter" width={48} height={48} unoptimized className={callBtnActive ? 'invert' : ''} />
              </button>
            </div>
            {errorMessage && (
              <div className="mt-4 text-red-500 text-sm text-center">
                {errorMessage}
              </div>
            )}
          </div>
        </div>
        {/* Pause icon bottom right */}
        <div className="absolute bottom-6 right-8 opacity-60">
          <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow border border-neutral-200">
            <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><rect x="4" y="4" width="2" height="8" rx="1" fill="#888"/><rect x="10" y="4" width="2" height="8" rx="1" fill="#888"/></svg>
          </div>
        </div>
      </div>
      <section id="onboard" className="w-full flex flex-col items-center justify-center py-24 px-4 bg-gradient-to-br from-slate-50 via-gray-50 to-neutral-100 border-t border-neutral-200">
        <div className="max-w-4xl w-full flex flex-col items-center text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-black">How it works</h2>
          <p className="text-lg text-neutral-600 max-w-2xl">Get started in three simple steps. Connect your repo, let our AI monitor pull requests, and receive voice summaries instantly.</p>
        </div>
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-start bg-white rounded-3xl shadow p-8 border border-neutral-200 min-h-[340px]">
            <div className="text-3xl mb-4">
              <svg width="32" height="32" fill="none" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" stroke="#111" strokeWidth="2.5"/><path d="M10 16a6 6 0 1 1 12 0 6 6 0 0 1-12 0Z" stroke="#111" strokeWidth="2.5"/><circle cx="16" cy="16" r="2.5" fill="#111"/></svg>
            </div>
            <div className="font-extrabold text-2xl mb-2 text-black">Connect GitHub</div>
            <div className="flex flex-row gap-2 mb-3">
              <span className="px-3 py-1 rounded-full bg-gray-100 text-xs font-semibold border border-gray-200">Webhook setup</span>
            </div>
            <div className="text-neutral-700 text-base">Securely log in with GitHub and select the repositories you'd like our system to watch. We handle all webhook configurations—no coding needed.</div>
          </div>
          <div className="flex flex-col items-start bg-white rounded-3xl shadow p-8 border border-neutral-200 min-h-[340px]">
            <div className="text-3xl mb-4">
              <svg width="32" height="32" fill="none" viewBox="0 0 32 32"><path d="M10 16c0-3.314 2.686-6 6-6s6 2.686 6 6-2.686 6-6 6-6-2.686-6-6Z" stroke="#111" strokeWidth="2.5"/><path d="M16 10V6M16 26v-4M10 16H6M26 16h-4M11.757 11.757l-2.828-2.829M20.243 20.243l2.828 2.829M20.243 11.757l2.828-2.829M11.757 20.243l-2.828 2.829" stroke="#111" strokeWidth="2.5" strokeLinecap="round"/></svg>
            </div>
            <div className="font-extrabold text-2xl mb-2 text-black">PR-Monitoring by AI</div>
            <div className="flex flex-row gap-2 mb-3">
              <span className="px-3 py-1 rounded-full bg-gray-100 text-xs font-semibold border border-gray-200">AI-powered</span>
              <span className="px-3 py-1 rounded-full bg-gray-100 text-xs font-semibold border border-gray-200">Real-time</span>
            </div>
            <div className="text-neutral-700 text-base">Whenever a new PR is opened, we analyze the code diff using powerful language models. You'll get a clear, concise summary of what changed and why.</div>
          </div>
          <div className="flex flex-col items-start bg-white rounded-3xl shadow p-8 border border-neutral-200 min-h-[340px]">
            <div className="text-3xl mb-4">
              <svg width="32" height="32" fill="none" viewBox="0 0 32 32"><path d="M8.5 6.5c.5-1 1.5-1.5 2.5-1.5h10c1 0 2 .5 2.5 1.5l2 4c.5 1 .5 2.5-.5 3.5l-3 3c-.5.5-1.5.5-2 0l-2-2c-.5-.5-.5-1.5 0-2l1-1c.5-.5.5-1.5 0-2l-2-2c-.5-.5-1.5-.5-2 0l-1 1c-.5.5-.5 1.5 0 2l2 2c.5.5.5 1.5 0 2l-3 3c-1 .5-2.5.5-3.5-.5l-4-2c-1-.5-1.5-1.5-1.5-2.5v-10c0-1 .5-2 1.5-2.5z" stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div className="font-extrabold text-2xl mb-2 text-black">Voice Summary from Agent</div>
            <div className="flex flex-row gap-2 mb-3">
              <span className="px-3 py-1 rounded-full bg-gray-100 text-xs font-semibold border border-gray-200">Cloud</span>
              <span className="px-3 py-1 rounded-full bg-gray-100 text-xs font-semibold border border-gray-200">Voice call</span>
            </div>
            <div className="text-neutral-700 text-base">Get a phone call from our AI agent. It reads you the PR summary, highlights key changes, and lets you take actions like commenting, approving, or merging—all from your phone.</div>
          </div>
        </div>
      </section>
      {/* PR Review Section */}
      <section id="features" className="w-full flex flex-col items-center justify-center py-24 px-4 bg-[#fbfbf5] border-t border-neutral-200">
        <div className="max-w-3xl w-full flex flex-col items-center text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-black">Your GitHub just got a voice.</h2>
          <p className="text-lg md:text-xl text-neutral-700 mb-2">
            Use our AI Code Review Agent to automate your workflow with just your voice.
          </p>
        </div>
        <div className="max-w-5xl w-full flex flex-col md:flex-row items-center gap-16 mt-20">
          <div className="flex-1 flex flex-col items-start">
            <button className="relative rounded-full bg-neutral-100 px-5 py-2 text-base font-semibold text-black mb-2 animate-pulse-gradient" style={{
              boxShadow: '0 1px 2px 0 rgba(16,30,54,0.04)',
              border: '2px solid transparent',
              backgroundImage: 'linear-gradient(#fbfbf5, #fbfbf5), linear-gradient(90deg, #b16cea 0%, #ff5e69 40%, #ff8a56 70%, #ffa84b 100%)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
            }}>Voice AI Agents</button>
            <div className="text-3xl md:text-4xl font-bold mb-2" style={{color:'#ff3131'}}>Real-time Voice Alerts</div>
            <div className="text-base md:text-lg text-neutral-700 mb-4">
              Get notified instantly via phone call when someone opens a pull request on a repo you're watching.
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            {/* Placeholder for PR review image */}
            <div className="w-[480px] h-[240px] bg-neutral-100 border border-neutral-300 rounded-lg flex items-center justify-center">
              <span className="text-neutral-400">[ PR review image ]</span>
            </div>
          </div>
        </div>
      </section>

      {/* Orange Section: Quick fix suggestions */}
      <section className="w-full flex flex-col items-center justify-center py-24 px-4 bg-[#fbfbf5] border-t border-neutral-200">
        <div className="max-w-5xl w-full flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 flex items-center justify-center order-2 md:order-1">
            {/* Placeholder for quick fix image */}
            <div className="w-[480px] h-[240px] bg-neutral-100 border border-neutral-300 rounded-lg flex items-center justify-center">
              <span className="text-neutral-400">[ Quick fix image ]</span>
            </div>
          </div>
          <div className="flex-1 flex flex-col items-start order-1 md:order-2">
            <button className="relative rounded-full bg-neutral-100 px-5 py-2 text-base font-semibold text-black mb-2 animate-pulse-gradient" style={{
              boxShadow: '0 1px 2px 0 rgba(16,30,54,0.04)',
              border: '2px solid transparent',
              backgroundImage: 'linear-gradient(#fbfbf5, #fbfbf5), linear-gradient(90deg, #b16cea 0%, #ff5e69 40%, #ff8a56 70%, #ffa84b 100%)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
            }}>PR summaries</button>
            <div className="text-3xl md:text-4xl font-bold mb-2" style={{color:'#ff3131'}}>AI Code Summaries</div>
            <div className="text-base md:text-lg text-neutral-700 mb-4">
              No more reading through diffs. Our agent summarizes code changes using LLMs so you get the TL;DR, fast.
            </div>
          </div>
        </div>
      </section>
      {/* Pink Section: PR Summaries */}
      <section className="w-full flex flex-col items-center justify-center py-24 px-4 bg-[#fbfbf5] border-t border-neutral-200">
        <div className="max-w-5xl w-full flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 flex flex-col items-start">
            <button className="relative rounded-full bg-neutral-100 px-5 py-2 text-base font-semibold text-black mb-2 animate-pulse-gradient" style={{
              boxShadow: '0 1px 2px 0 rgba(16,30,54,0.04)',
              border: '2px solid transparent',
              backgroundImage: 'linear-gradient(#fbfbf5, #fbfbf5), linear-gradient(90deg, #b16cea 0%, #ff5e69 40%, #ff8a56 70%, #ffa84b 100%)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
            }}>AI Code Review</button>
            <div className="text-3xl md:text-4xl font-bold mb-2" style={{color:'#ff3131'}}>Hands-Free Code Reviews</div>
            <div className="text-base md:text-lg text-neutral-700 mb-4">
              Driving, cooking, or just off-screen? Get voice briefings on code changes, ask follow-up questions, and automatically resolve merge conflicts.
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            {/* Placeholder for PR summary image */}
            <div className="w-[540px] h-[260px] bg-neutral-100 border border-neutral-300 rounded-lg flex items-center justify-center">
              <span className="text-neutral-400">[ PR summary image ]</span>
            </div>
          </div>
        </div>
      </section>
      {/* Integrations Section */}
      <section id="integrations" className="w-full flex flex-col items-center justify-center py-24 px-4 bg-gradient-to-br from-amber-50 via-orange-50 to-stone-100 border-t border-neutral-200">
        <div className="max-w-4xl w-full flex flex-col items-center text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-black">Integrations</h2>
          <p className="text-lg text-neutral-600 max-w-2xl mb-8">Connect with your favorite tools and platforms. More integrations coming soon!</p>

          {/* AnimatedBeam Demo showing AI-powered integrations */}
          <div className="w-full max-w-4xl">
            <AnimatedBeamDemo />
          </div>
        </div>
      </section>
      {/* Dark Section: Ready to Build Momentum */}
      <section className="w-full flex flex-col items-center justify-center py-32 px-4 bg-[#fbfbf5] border-t border-neutral-200">
        <div className="max-w-3xl w-full flex flex-col items-center text-center">
          <h2 className="text-5xl md:text-6xl font-extrabold mb-6 text-black" style={{ fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif' }}>
            Ready to have GitHub <span className="inline-block font-bold relative bg-gradient-to-r from-[#b16cea] via-[#ff5e69] via-40% via-[#ff8a56] via-70% to-[#ffa84b] bg-clip-text text-transparent" style={{
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              backgroundImage:
                "linear-gradient(90deg, #b16cea 0%, #ff5e69 40%, #ff8a56 70%, #ffa84b 100%)",
            }}>talk</span> to you?
          </h2>
          <p className="text-2xl md:text-3xl text-neutral-700 mb-10">AI voice calls for every code change.</p>
          <div className="w-full flex flex-col items-center">
            <div className="flex items-center w-full max-w-xl bg-white rounded-xl shadow-lg px-2 py-2 border border-neutral-200 gap-2">
              {/* Country dropdown */}
              <div className="relative mr-2" ref={dropdownRefFooter}>
                <button
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-black text-black text-base font-medium focus:outline-none min-w-[90px]"
                  type="button"
                  tabIndex={0}
                  onClick={() => setDropdownOpenFooter((open) => !open)}
                >
                  <span>{selectedCountry.flag}</span>
                  <span className="ml-1">{selectedCountry.code}</span>
                  <svg className="ml-1" width="16" height="16" fill="none" viewBox="0 0 16 16"><path d="M4 6l4 4 4-4" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                {dropdownOpenFooter && (
                  <div className="absolute left-0 mt-2 w-48 bg-white border border-black rounded shadow-lg z-10">
                    {countries.map((country) => (
                      <div
                        key={country.code}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => { setSelectedCountry(country); setDropdownOpenFooter(false); }}
                      >
                        <span>{country.flag}</span>
                        <span>{country.name}</span>
                        <span className="ml-auto">{country.code}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Phone input */}
              <input
                className="flex-1 bg-transparent outline-none text-base placeholder:text-neutral-500 px-2 h-10"
                placeholder="Enter phone number"
                type="tel"
                value={phoneNumberFooter}
                onChange={(e) => setPhoneNumberFooter(e.target.value)}
                style={{ minHeight: '2.25rem' }}
              />
              {/* Enter button with icon */}
              <button
                className={`ml-2 rounded-full p-2 w-12 h-12 flex items-center justify-center border-2 transition-all duration-200 animate-pulse-gradient`}
                style={{
                  border: '2px solid transparent',
                  backgroundImage: 'linear-gradient(#fff, #fff), linear-gradient(90deg, #b16cea 0%, #ff5e69 40%, #ff8a56 70%, #ffa84b 100%)',
                  backgroundOrigin: 'border-box',
                  backgroundClip: 'padding-box, border-box',
                }}
                onClick={() => handlePhoneSubmit(phoneNumberFooter, 'footer')}
                onMouseDown={() => setCallBtnActive(true)}
                onMouseUp={() => setCallBtnActive(false)}
                onMouseLeave={() => setCallBtnActive(false)}
              >
                <Image src="/logo/icon1.svg" alt="Enter" width={48} height={48} unoptimized className={callBtnActive ? 'invert' : ''} />
              </button>
            </div>
            {errorMessage && (
              <div className="mt-4 text-red-500 text-sm text-center">
                {errorMessage}
              </div>
            )}
          </div>
        </div>
      </section>
      {/* Footer at the very bottom */}
      <footer className="w-full flex flex-col md:flex-row items-center justify-between gap-4 py-8 border-t border-neutral-200 bg-[#fbfbf5] text-neutral-600 text-sm px-6">
        <div className="flex items-center gap-4 mb-2 md:mb-0">
          <Image src="/logo/TransparentLogo.svg" alt="Logo" width={120} height={120} unoptimized />
        </div>
        
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="text-sm text-neutral-500">
            © 2025 Koyal Labs, LLC. All rights reserved.
          </div>
          <div className="flex flex-row items-center gap-4">
            <a href="/privacy-policy" className="hover:underline">Privacy Policy</a>
            <a href="/terms-of-service" className="hover:underline">Terms of Service</a>
          </div>
        </div>
        
        <div className="flex flex-row items-center gap-2">
          <div ref={twitterRef}></div>
          <div id="twitter-follow-btn-footer"></div>
        </div>
      </footer>
      {/* Sticky Navbar with animation and glassy look */}
      <div className={`fixed top-4 left-0 w-full flex justify-center z-50 pointer-events-none transition-all duration-500 ${showNavbar ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'}`}
        style={{ transitionProperty: 'opacity, transform' }}>
        <nav className="flex items-center justify-between w-[90vw] max-w-4xl bg-white/70 backdrop-blur-md rounded-full px-4 py-1.5 shadow-lg pointer-events-auto border border-neutral-200">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-3 focus:outline-none">
            <Image src="/logo/TransparentLogo.svg" alt="Logo" width={180} height={72} unoptimized />
          </button>
          <div className="flex items-center gap-6 ml-4">
            <a className="text-gray-600 text-base font-medium hover:text-black transition" href="#about">About</a>
            <a className="text-gray-600 text-base font-medium hover:text-black transition" href="#onboard">Onboard</a>
            <a className="text-gray-600 text-base font-medium hover:text-black transition" href="#features">Features</a>
            <a className="text-gray-600 text-base font-medium hover:text-black transition" href="#integrations">Integrations</a>
          </div>
          <button onClick={() => setShowModal(true)} className="bg-black text-white rounded-full px-6 py-2 text-base font-medium flex items-center gap-2 hover:bg-neutral-800 transition">
            Talk to GitHub
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M5 12h14m0 0l-5-5m5 5l-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </nav>
    </div>
      {showModal && <PhoneModal />}
    </>
  );
}
