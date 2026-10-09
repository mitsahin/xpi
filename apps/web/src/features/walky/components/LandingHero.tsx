import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Radio } from "lucide-react";
import { WalkyBeeLogo } from "../brand/WalkyBeeLogo";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,#b8f0d0_0%,transparent_55%),radial-gradient(ellipse_50%_40%_at_90%_20%,#ffe8b8_0%,transparent_50%),linear-gradient(180deg,#e9faf0_0%,#f7fcf9_45%,#fff8ef_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(20,80,50,0.12) 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative mx-auto flex min-h-[calc(100dvh-4.5rem)] max-w-5xl flex-col items-center justify-center px-4 pb-16 pt-8 text-center md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="walky-bee-float"
        >
          <WalkyBeeLogo size={200} animated className="mx-auto md:hidden" />
          <WalkyBeeLogo size={260} animated className="mx-auto hidden md:block" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.5 }}
          className="mt-6 max-w-2xl font-[family-name:var(--font-walky)] text-4xl font-extrabold leading-[1.1] tracking-tight text-[#143528] sm:text-5xl md:text-6xl"
        >
          Dil Öğreniminde Yeni Frekans!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.45 }}
          className="mt-4 max-w-lg text-base font-semibold text-[#4d6b5a] sm:text-lg"
        >
          Walky Talky ile kısa dersler, sesli pratik ve streak enerjisi — telsizi aç, frekansa gir.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32, duration: 0.4 }}
          className="mt-8 flex flex-col items-center gap-3 sm:flex-row"
        >
          <Link
            to="/app"
            className="inline-flex items-center gap-2 rounded-[22px] bg-[#2BB673] px-7 py-3.5 text-base font-extrabold text-white shadow-[0_5px_0_#0F8A4B] transition-transform hover:scale-105 active:translate-y-0.5 active:shadow-[0_3px_0_#0F8A4B]"
          >
            <Radio className="size-5" aria-hidden />
            Telsizi Aç ve Başla
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
