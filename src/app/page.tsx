"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef } from "react";

// Slow, fluid bubble-like ease curve
const bubbleEase = [0.16, 1, 0.3, 1] as const; // Very smooth, slow deceleration

// Fade up component for sections - slow bubble rise
function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{
        duration: 1.4,
        ease: bubbleEase,
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}

// Line reveal for feature items - gentle drift in
function LineReveal({ children, index }: { children: React.ReactNode; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{
        duration: 1.2,
        ease: bubbleEase,
        delay: index * 0.25,
      }}
    >
      {children}
    </motion.div>
  );
}

export default function LandingPage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 100]);

  return (
    <>
      {/* Fonts */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Outfit:wght@300;400;500;600&display=swap');
      `}</style>

      <div className="relative min-h-screen bg-[#050d18]">
        {/* Animated liquid gradient background */}
        <div className="fixed inset-0 z-0 overflow-hidden">
          {/* Base gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0d1a2d] via-[#0a1525] to-[#050d18]" />

          {/* Liquid morphing blobs - slow upward drift */}
          <div className="absolute inset-0">
            {/* Large deep blob - bottom left, rises slowly */}
            <motion.div
              className="absolute w-[900px] h-[900px] rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(30, 80, 130, 0.4) 0%, transparent 60%)",
                filter: "blur(100px)",
                left: "-15%",
                bottom: "-10%",
              }}
              animate={{
                y: [0, -200, 0],
                x: [0, 50, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Medium blob - center right, rises and morphs */}
            <motion.div
              className="absolute w-[700px] h-[700px] rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(20, 60, 110, 0.35) 0%, transparent 60%)",
                filter: "blur(80px)",
                right: "0%",
                top: "40%",
              }}
              animate={{
                y: [0, -250, 0],
                x: [0, -60, 0],
                scale: [1, 1.25, 1],
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 3,
              }}
            />

            {/* Accent blob - rises from bottom center */}
            <motion.div
              className="absolute w-[600px] h-[600px] rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(40, 90, 150, 0.3) 0%, transparent 60%)",
                filter: "blur(70px)",
                left: "30%",
                bottom: "-15%",
              }}
              animate={{
                y: [0, -300, 0],
                scale: [1, 1.15, 1],
              }}
              transition={{
                duration: 30,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 8,
              }}
            />

            {/* Upper highlight blob */}
            <motion.div
              className="absolute w-[500px] h-[500px] rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(35, 85, 140, 0.25) 0%, transparent 60%)",
                filter: "blur(60px)",
                right: "20%",
                top: "5%",
              }}
              animate={{
                y: [0, -100, 0],
                x: [-40, 40, -40],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 18,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 5,
              }}
            />
          </div>

          {/* Noise texture overlay for organic feel */}
          <div
            className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Vignette overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,13,24,0.6)_100%)]" />
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Navigation */}
          <motion.nav
            className="fixed top-0 left-0 right-0 z-50 bg-[#0a1525]/80 backdrop-blur-md border-b border-white/5"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.2, ease: bubbleEase, delay: 0.3 }}
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 sm:py-6">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="flex items-center gap-3"
                >
                  <motion.span
                    className="text-xl sm:text-2xl text-white tracking-wide cursor-pointer"
                    style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 500 }}
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    Deep Outbound
                  </motion.span>
                </button>

                <div className="flex items-center gap-4 sm:gap-10">
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.0, ease: bubbleEase, delay: 0.6 }}
                    className="hidden sm:block"
                  >
                    <Link
                      href="/login"
                      className="text-slate-300 hover:text-white transition-colors text-base sm:text-lg"
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      Sign In
                    </Link>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.0, ease: bubbleEase, delay: 0.75 }}
                  >
                    <Link
                      href="/signup"
                      className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-lg bg-white/10 hover:bg-white/15 border border-white/20 rounded-full text-white transition-all whitespace-nowrap"
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      Get Started
                    </Link>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.nav>

          {/* Hero Section */}
          <section ref={heroRef} className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 pt-20 overflow-hidden">
            <motion.div
              className="max-w-6xl mx-auto text-center"
              style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
            >
              {/* Tagline */}
              <motion.p
                className="text-slate-400 text-sm sm:text-lg md:text-xl tracking-[0.2em] sm:tracking-[0.3em] uppercase mb-6 sm:mb-10"
                style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 400 }}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.4, ease: bubbleEase, delay: 0.8 }}
              >
                Domain Sales Automation
              </motion.p>

              {/* Main headline */}
              <h1
                className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl text-white leading-[1.1] sm:leading-[1.05] mb-6 sm:mb-10"
                style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400 }}
              >
                <span className="block">
                  <motion.span
                    className="block"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.6, ease: bubbleEase, delay: 1.0 }}
                  >
                    Outreach with
                  </motion.span>
                </span>
                <span className="block">
                  <motion.span
                    className="block text-slate-400"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.6, ease: bubbleEase, delay: 1.2 }}
                  >
                    deep intelligence
                  </motion.span>
                </span>
              </h1>

              {/* Subhead */}
              <motion.p
                className="text-base sm:text-xl md:text-2xl lg:text-3xl text-slate-300 max-w-3xl mx-auto mb-8 sm:mb-14 leading-relaxed px-2"
                style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 300 }}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.4, ease: bubbleEase, delay: 1.5 }}
              >
                AI finds your buyers, crafts personalized messages,
                and delivers them automatically.
              </motion.p>

              {/* CTA */}
              <motion.div
                className="flex flex-col sm:flex-row gap-5 justify-center items-center"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.4, ease: bubbleEase, delay: 1.8 }}
              >
                <Link href="/signup">
                  <motion.span
                    className="group inline-flex items-center gap-3 px-8 sm:px-10 py-4 sm:py-5 bg-white text-[#0a1525] rounded-full text-lg sm:text-xl cursor-pointer"
                    style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 500 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    Start Free
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.span>
                </Link>
              </motion.div>
            </motion.div>

          </section>

          {/* Section 1: Strategic Buyer Discovery */}
          <section className="min-h-screen py-16 sm:py-32 px-4 sm:px-6">
            <div className="max-w-7xl mx-auto w-full">
              {/* Section Header - Always First */}
              <div className="max-w-4xl mb-12 sm:mb-20">
                <FadeUp>
                  <span
                    className="text-slate-500 text-base sm:text-lg tracking-[0.2em] sm:tracking-[0.3em] uppercase mb-4 sm:mb-6 block"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    01
                  </span>
                </FadeUp>
                <FadeUp delay={0.1}>
                  <h2
                    className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl text-white leading-[1.15] sm:leading-[1.1] mb-6 sm:mb-8"
                    style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400 }}
                  >
                    Strategic buyer discovery
                  </h2>
                </FadeUp>
                <FadeUp delay={0.2}>
                  <p
                    className="text-slate-300 text-base sm:text-xl md:text-2xl leading-relaxed"
                    style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 300 }}
                  >
                    Four intelligent strategies to find the perfect buyers for your domains.
                    Choose your approach based on the domain and your target market.
                  </p>
                </FadeUp>
              </div>

              {/* Strategy Cards Grid */}
              <FadeUp delay={0.25}>
                <h3
                  className="text-xl sm:text-2xl text-slate-400 mb-6 sm:mb-8"
                  style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 400 }}
                >
                  Lead-Finding Strategies
                </h3>
              </FadeUp>
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                {[
                  {
                    name: "Domain Upgrade",
                    description: "Find companies using inferior domains like getexample.com, example.io, or example-app.com who could benefit from the premium .com",
                  },
                  {
                    name: "SEO/PPC Bidders",
                    description: "Target companies paying for Google Ads on your domain keywords. They're already investing to acquire this traffic.",
                  },
                  {
                    name: "Emerging Startups",
                    description: "Search ProductHunt, Crunchbase, and startup directories for early-stage companies who haven't secured premium domains.",
                  },
                  {
                    name: "Market Leaders",
                    description: "Target established companies in the industry based on domain keywords for product naming or brand expansion.",
                  },
                ].map((strategy, index) => (
                  <FadeUp key={strategy.name} delay={0.35 + index * 0.1}>
                    <div className="group h-full p-5 sm:p-8 rounded-xl sm:rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all duration-500">
                      <h3
                        className="text-xl sm:text-2xl md:text-3xl text-white mb-3 sm:mb-4"
                        style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 500 }}
                      >
                        {strategy.name}
                      </h3>
                      <p
                        className="text-slate-400 text-sm sm:text-lg leading-relaxed"
                        style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 300 }}
                      >
                        {strategy.description}
                      </p>
                    </div>
                  </FadeUp>
                ))}
              </div>
            </div>
          </section>

          {/* Section 2: Generate Content */}
          <section className="min-h-screen py-16 sm:py-32 px-4 sm:px-6">
            <div className="max-w-7xl mx-auto w-full">
              {/* Section Header - Always First */}
              <div className="max-w-4xl mb-12 sm:mb-20">
                <FadeUp>
                  <span
                    className="text-slate-500 text-base sm:text-lg tracking-[0.2em] sm:tracking-[0.3em] uppercase mb-4 sm:mb-6 block"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    02
                  </span>
                </FadeUp>
                <FadeUp delay={0.1}>
                  <h2
                    className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl text-white leading-[1.15] sm:leading-[1.1] mb-6 sm:mb-8"
                    style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400 }}
                  >
                    Generate content
                  </h2>
                </FadeUp>
                <FadeUp delay={0.2}>
                  <p
                    className="text-slate-300 text-base sm:text-xl md:text-2xl leading-relaxed"
                    style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 300 }}
                  >
                    Every email and voicemail script is written specifically for each prospect.
                    Claude AI researches the company and crafts personalized, compelling messages.
                  </p>
                </FadeUp>
              </div>

              {/* Content Grid */}
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
                {/* Left: Features */}
                <FadeUp delay={0.3}>
                  <div className="space-y-4 sm:space-y-6">
                    {[
                      { title: "Personalized subject lines", desc: "AI-crafted subjects that get opened based on company research" },
                      { title: "Company-specific messaging", desc: "Value propositions tailored to each prospect's business" },
                      { title: "Voice synthesis", desc: "AI-generated voicemail scripts with natural voice cloning" },
                      { title: "Multi-step sequences", desc: "Automated drip campaigns that nurture interest over time" },
                    ].map((feature, index) => (
                      <div key={index} className="flex items-start gap-3 sm:gap-4">
                        <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-slate-400 mt-2 sm:mt-2.5 shrink-0" />
                        <div>
                          <div
                            className="text-white text-base sm:text-xl mb-1"
                            style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 500 }}
                          >
                            {feature.title}
                          </div>
                          <div
                            className="text-slate-400 text-sm sm:text-lg"
                            style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 300 }}
                          >
                            {feature.desc}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </FadeUp>

                {/* Right: Email preview mock */}
                <FadeUp delay={0.4}>
                  <div className="relative">
                    <div className="p-5 sm:p-8 rounded-xl sm:rounded-2xl border border-white/10 bg-white/[0.02]">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                          <div className="w-10 h-10 rounded-full bg-white/10" />
                          <div>
                            <div className="h-4 w-32 bg-white/20 rounded" />
                            <div className="h-3 w-48 bg-white/10 rounded mt-2" />
                          </div>
                        </div>
                        <div className="space-y-3 pt-2">
                          <div className="h-4 w-full bg-white/10 rounded" />
                          <div className="h-4 w-5/6 bg-white/10 rounded" />
                          <div className="h-4 w-4/5 bg-white/10 rounded" />
                          <div className="h-4 w-full bg-white/10 rounded mt-6" />
                          <div className="h-4 w-3/4 bg-white/10 rounded" />
                        </div>
                      </div>
                      {/* AI indicator */}
                      <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" />
                        <span
                          className="text-slate-400 text-sm"
                          style={{ fontFamily: "'Outfit', sans-serif" }}
                        >
                          Generated by Claude AI
                        </span>
                      </div>
                    </div>
                  </div>
                </FadeUp>
              </div>
            </div>
          </section>

          {/* Section 3: Scheduled Campaigns */}
          <section className="min-h-screen py-16 sm:py-32 px-4 sm:px-6">
            <div className="max-w-7xl mx-auto w-full">
              {/* Section Header - Always First */}
              <div className="max-w-4xl mb-12 sm:mb-20">
                <FadeUp>
                  <span
                    className="text-slate-500 text-base sm:text-lg tracking-[0.2em] sm:tracking-[0.3em] uppercase mb-4 sm:mb-6 block"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    03
                  </span>
                </FadeUp>
                <FadeUp delay={0.1}>
                  <h2
                    className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl text-white leading-[1.15] sm:leading-[1.1] mb-6 sm:mb-8"
                    style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400 }}
                  >
                    Scheduled drip campaigns
                  </h2>
                </FadeUp>
                <FadeUp delay={0.2}>
                  <p
                    className="text-slate-300 text-base sm:text-xl md:text-2xl leading-relaxed"
                    style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 300 }}
                  >
                    Multi-step email sequences and ringless voicemail drops delivered
                    on your schedule. Set it once, and let the automation work for you.
                  </p>
                </FadeUp>
              </div>

              {/* Content Grid */}
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
                {/* Left: Channel cards */}
                <FadeUp delay={0.3}>
                  <div className="grid grid-cols-2 gap-3 sm:gap-6">
                    {[
                      { label: "Email", desc: "Via Resend", detail: "Automated sequences with open/click tracking" },
                      { label: "Voicemail", desc: "Via Slybroadcast", detail: "Ringless drops that go straight to inbox" },
                      { label: "Voice Clone", desc: "Via ElevenLabs", detail: "Natural AI voice synthesis from your samples" },
                      { label: "Scheduling", desc: "Multi-step drips", detail: "Timed sequences across days or weeks" },
                    ].map((item, index) => (
                      <div key={index} className="p-4 sm:p-6 rounded-lg sm:rounded-xl border border-white/10 bg-white/[0.02]">
                        <div
                          className="text-white text-base sm:text-xl mb-1"
                          style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 500 }}
                        >
                          {item.label}
                        </div>
                        <div
                          className="text-slate-500 text-xs sm:text-sm mb-2 sm:mb-3"
                          style={{ fontFamily: "'Outfit', sans-serif" }}
                        >
                          {item.desc}
                        </div>
                        <div
                          className="text-slate-400 text-xs sm:text-sm leading-relaxed"
                          style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 300 }}
                        >
                          {item.detail}
                        </div>
                      </div>
                    ))}
                  </div>
                </FadeUp>

                {/* Right: Timeline visual */}
                <FadeUp delay={0.4}>
                  <div className="relative">
                    {/* Timeline line - centered */}
                    <div className="absolute left-[5px] top-0 bottom-0 w-px bg-gradient-to-b from-white/20 via-white/10 to-transparent" />

                    <div className="space-y-10">
                      {[
                        { day: "Day 1", action: "Initial email sent", status: "completed" },
                        { day: "Day 3", action: "Follow-up email", status: "completed" },
                        { day: "Day 5", action: "Voicemail drop", status: "active" },
                        { day: "Day 8", action: "Final follow-up", status: "pending" },
                      ].map((step, index) => (
                        <div key={index} className="relative flex items-start gap-4 sm:gap-6">
                          {/* Timeline dot - centered on line */}
                          <div className={`relative z-10 w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full border-2 shrink-0 mt-1 ${
                            step.status === 'completed' ? 'bg-slate-400 border-slate-400' :
                            step.status === 'active' ? 'bg-white border-white animate-pulse' :
                            'bg-transparent border-white/30'
                          }`} />
                          <div>
                            <div
                              className="text-slate-500 text-xs sm:text-sm mb-1"
                              style={{ fontFamily: "'Outfit', sans-serif" }}
                            >
                              {step.day}
                            </div>
                            <div
                              className={`text-base sm:text-xl ${step.status === 'pending' ? 'text-slate-500' : 'text-white'}`}
                              style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 400 }}
                            >
                              {step.action}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </FadeUp>
              </div>
            </div>
          </section>

          {/* Section 4: Advanced Analytics */}
          <section className="min-h-screen py-16 sm:py-32 px-4 sm:px-6">
            <div className="max-w-7xl mx-auto w-full">
              {/* Section Header - Always First */}
              <div className="max-w-4xl mb-12 sm:mb-20">
                <FadeUp>
                  <span
                    className="text-slate-500 text-base sm:text-lg tracking-[0.2em] sm:tracking-[0.3em] uppercase mb-4 sm:mb-6 block"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    04
                  </span>
                </FadeUp>
                <FadeUp delay={0.1}>
                  <h2
                    className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl text-white leading-[1.15] sm:leading-[1.1] mb-6 sm:mb-8"
                    style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400 }}
                  >
                    Advanced analytics
                  </h2>
                </FadeUp>
                <FadeUp delay={0.2}>
                  <p
                    className="text-slate-300 text-base sm:text-xl md:text-2xl leading-relaxed"
                    style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 300 }}
                  >
                    Measure performance, engagement, and lead quality. Prioritize the prospects
                    showing real interest and set up escalation rules to surface hot leads.
                  </p>
                </FadeUp>
              </div>

              {/* Content Grid */}
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
                {/* Left: Stats visual */}
                <FadeUp delay={0.3}>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {[
                      { metric: "78%", label: "Open rate" },
                      { metric: "34%", label: "Click rate" },
                      { metric: "12%", label: "Reply rate" },
                      { metric: "8%", label: "Conversion" },
                    ].map((stat, index) => (
                      <div
                        key={index}
                        className="p-5 sm:p-8 rounded-xl sm:rounded-2xl border border-white/10 bg-white/[0.02] text-center"
                      >
                        <div
                          className="text-3xl sm:text-5xl md:text-6xl text-white mb-2 sm:mb-3"
                          style={{ fontFamily: "'Instrument Serif', serif" }}
                        >
                          {stat.metric}
                        </div>
                        <div
                          className="text-slate-400 text-sm sm:text-base"
                          style={{ fontFamily: "'Outfit', sans-serif" }}
                        >
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </FadeUp>

                {/* Right: Features list */}
                <FadeUp delay={0.4}>
                  <div className="space-y-4 sm:space-y-6">
                    {[
                      { title: "Real-time tracking", desc: "See opens and clicks as they happen with webhook-powered updates" },
                      { title: "Lead scoring", desc: "Automatic scoring based on engagement signals and behavior patterns" },
                      { title: "Escalation rules", desc: "Set triggers to surface high-intent prospects for immediate follow-up" },
                      { title: "Activity timeline", desc: "Complete history of every interaction for each contact" },
                    ].map((feature, index) => (
                      <div key={index} className="flex items-start gap-3 sm:gap-4">
                        <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-slate-400 mt-2 sm:mt-2.5 shrink-0" />
                        <div>
                          <div
                            className="text-white text-base sm:text-xl mb-1"
                            style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 500 }}
                          >
                            {feature.title}
                          </div>
                          <div
                            className="text-slate-400 text-sm sm:text-lg"
                            style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 300 }}
                          >
                            {feature.desc}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </FadeUp>
              </div>
            </div>
          </section>

          {/* Tech section */}
          <section className="py-20 sm:py-40 px-4 sm:px-6">
            <div className="max-w-5xl mx-auto text-center">
              <FadeUp>
                <h2
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white mb-6 sm:mb-8"
                  style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400 }}
                >
                  Powered by
                </h2>
              </FadeUp>
              <FadeUp delay={0.15}>
                <p
                  className="text-slate-300 text-base sm:text-xl md:text-2xl max-w-2xl mx-auto mb-12 sm:mb-20 px-2"
                  style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 300 }}
                >
                  Built on leading AI and communication platforms
                  to deliver exceptional results.
                </p>
              </FadeUp>

              <div className="flex flex-wrap justify-center gap-x-8 sm:gap-x-16 gap-y-4 sm:gap-y-8">
                {["Claude AI", "ElevenLabs", "Resend", "Slybroadcast"].map((tech, i) => (
                  <FadeUp key={tech} delay={0.3 + i * 0.1}>
                    <span
                      className="text-base sm:text-xl text-slate-400 tracking-wide hover:text-slate-200 transition-colors cursor-default"
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      {tech}
                    </span>
                  </FadeUp>
                ))}
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="py-20 sm:py-40 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <FadeUp>
                <h2
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-white mb-6 sm:mb-8"
                  style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400 }}
                >
                  Ready to start?
                </h2>
              </FadeUp>
              <FadeUp delay={0.15}>
                <p
                  className="text-base sm:text-xl md:text-2xl text-slate-300 mb-10 sm:mb-14 px-2"
                  style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 300 }}
                >
                  Your domains deserve to find the right buyers.
                </p>
              </FadeUp>
              <FadeUp delay={0.3}>
                <Link href="/signup">
                  <motion.span
                    className="group inline-flex items-center gap-3 sm:gap-4 px-8 sm:px-10 py-4 sm:py-5 bg-white text-[#0a1525] rounded-full text-lg sm:text-xl cursor-pointer"
                    style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 500 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    Get Started Free
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.span>
                </Link>
              </FadeUp>
            </div>
          </section>

          {/* Footer */}
          <footer className="py-10 sm:py-16 px-4 sm:px-6">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6 sm:gap-8">
              <span
                className="text-white/80 text-lg sm:text-xl"
                style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 500 }}
              >
                Deep Outbound
              </span>
              <div
                className="flex gap-6 sm:gap-10 text-slate-400 text-base sm:text-lg"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
                <Link href="/signup" className="hover:text-white transition-colors">Sign Up</Link>
              </div>
              <p
                className="text-slate-500 text-sm sm:text-lg"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                © {new Date().getFullYear()} Deep Outbound
              </p>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
