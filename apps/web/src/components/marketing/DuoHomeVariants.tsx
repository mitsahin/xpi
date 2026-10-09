import type { ReactElement } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { HomeMascot } from "./HomeMascot";

export type HomeVariant = 1 | 2 | 3 | 4 | 5;

const LANGS = [
  "İspanyolca",
  "Fransızca",
  "Almanca",
  "Japonca",
  "İtalyanca",
  "Korece",
];

export function useHomeVariant(): HomeVariant {
  const [params] = useSearchParams();
  const raw = Number(params.get("home"));
  if (raw >= 1 && raw <= 5) return raw as HomeVariant;
  return 1;
}

function HomeNav({ light = false }: { light?: boolean }) {
  return (
    <header className="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 md:px-8">
      <Link
        to="/"
        className={`text-2xl font-black tracking-tight ${
          light ? "text-white" : "text-[#58cc02]"
        }`}
        style={{ fontFamily: "var(--font-learn)" }}
      >
        x-pi
      </Link>
      <Link
        to="/auth"
        className={`rounded-2xl border-2 px-4 py-2 text-sm font-extrabold uppercase tracking-wide ${
          light
            ? "border-white/70 text-white hover:bg-white/10"
            : "border-[#e5e5e5] bg-white text-[#1cb0f6] hover:bg-[#f7f7f7]"
        }`}
      >
        Login
      </Link>
    </header>
  );
}

function LangChips({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <span className="w-full text-xs font-extrabold uppercase tracking-wide text-[#afafaf]">
        Öğrenmek istediğim dil…
      </span>
      {LANGS.map((l) => (
        <Link
          key={l}
          to="/auth"
          className="rounded-full border-2 border-[#e5e5e5] bg-white px-3.5 py-1.5 text-sm font-extrabold text-[#3c3c3c] transition hover:border-[#58cc02] hover:text-[#58cc02]"
        >
          {l}
        </Link>
      ))}
    </div>
  );
}

function PrimaryCta({ label = "Öğrenmeye başla" }: { label?: string }) {
  return (
    <Link
      to="/auth"
      className="inline-flex items-center justify-center rounded-2xl bg-[#58cc02] px-8 py-4 text-lg font-black uppercase tracking-wide text-white shadow-[0_4px_0_#46a302] transition hover:brightness-105 active:translate-y-1 active:shadow-[0_2px_0_#46a302]"
    >
      {label}
    </Link>
  );
}

function SecondaryCta() {
  return (
    <Link
      to="/auth"
      className="inline-flex items-center justify-center rounded-2xl border-2 border-[#e5e5e5] bg-white px-6 py-3.5 text-base font-extrabold text-[#1cb0f6] transition hover:bg-[#f7f7f7]"
    >
      Zaten hesabım var
    </Link>
  );
}

function VariantSwitcher({ current }: { current: HomeVariant }) {
  const [params, setParams] = useSearchParams();
  return (
    <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full border-2 border-[#e5e5e5] bg-white/95 px-2 py-1.5 shadow-lg backdrop-blur">
      <span className="px-2 text-[10px] font-black uppercase tracking-wide text-[#afafaf]">
        Home
      </span>
      {([1, 2, 3, 4, 5] as HomeVariant[]).map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => {
            const next = new URLSearchParams(params);
            next.set("home", String(n));
            setParams(next, { replace: true });
          }}
          className={`h-8 w-8 rounded-full text-sm font-black ${
            current === n
              ? "bg-[#58cc02] text-white"
              : "bg-[#f0f0f0] text-[#777] hover:bg-[#e5e5e5]"
          }`}
          aria-label={`Homepage variant ${n}`}
          aria-current={current === n ? "true" : undefined}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

/** 1 — Classic split: illustration left, copy+CTA right */
function Variant1() {
  return (
    <div className="duo-home min-h-[100svh] bg-white" data-home="1">
      <HomeNav />
      <div className="mx-auto grid min-h-[calc(100svh-5rem)] max-w-6xl items-center gap-8 px-5 pb-24 pt-4 md:grid-cols-2 md:gap-12 md:px-8">
        <div className="order-2 flex justify-center md:order-1">
          <HomeMascot size={300} className="duo-float" />
        </div>
        <div className="order-1 text-center md:order-2 md:text-left">
          <h1
            className="text-[clamp(2rem,5vw,3.25rem)] font-black leading-[1.1] tracking-tight text-[#3c3c3c]"
            style={{ fontFamily: "var(--font-learn)" }}
          >
            Ücretsiz, eğlenceli ve etkili dil öğrenmenin yolu!
          </h1>
          <p className="mt-4 text-lg font-bold text-[#777]">
            Kısa dersler, streak’ler ve XP ile her gün bir adım — x-pi ile.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 md:items-start">
            <PrimaryCta />
            <SecondaryCta />
          </div>
          <LangChips className="mt-10 justify-center md:justify-start" />
        </div>
      </div>
    </div>
  );
}

/** 2 — Centered: mascot above headline */
function Variant2() {
  return (
    <div className="duo-home min-h-[100svh] bg-[#f7f7f7]" data-home="2">
      <HomeNav />
      <div className="mx-auto flex max-w-xl flex-col items-center px-5 pb-28 pt-6 text-center md:px-8">
        <HomeMascot size={220} className="duo-float" />
        <h1
          className="mt-4 text-[clamp(1.85rem,5vw,2.75rem)] font-black leading-[1.15] text-[#3c3c3c]"
          style={{ fontFamily: "var(--font-learn)" }}
        >
          Dil öğrenmek eğlenceli olabilir — üstelik ücretsiz.
        </h1>
        <p className="mt-3 font-bold text-[#777]">
          Günlük hedefler, kalpler ve kısa derslerle momentumunu koru.
        </p>
        <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
          <PrimaryCta label="Başla" />
          <a
            href="#how"
            className="text-sm font-extrabold text-[#1cb0f6] underline-offset-2 hover:underline"
          >
            Nasıl çalışır?
          </a>
        </div>
        <LangChips className="mt-10 justify-center" />
      </div>
    </div>
  );
}

/** 3 — Pastel sky + floating lesson bubbles */
function Variant3() {
  const bubbles = [
    { t: "Hola!", x: "8%", y: "18%", c: "#ddf4ff" },
    { t: "+20 XP", x: "72%", y: "14%", c: "#d7ffb8" },
    { t: "Bonjour", x: "78%", y: "42%", c: "#f3e8ff" },
    { t: "★ ★ ★", x: "12%", y: "55%", c: "#fff4ce" },
    { t: "Konnichiwa", x: "68%", y: "68%", c: "#ffe0e0" },
  ];
  return (
    <div
      className="duo-home relative min-h-[100svh] overflow-hidden bg-[linear-gradient(180deg,#e8f4ff_0%,#f7fff0_45%,#ffffff_100%)]"
      data-home="3"
    >
      {bubbles.map((b) => (
        <div
          key={b.t}
          className="duo-bubble pointer-events-none absolute z-0 hidden rounded-full border-2 border-white px-4 py-2 text-sm font-black text-[#3c3c3c] shadow-sm sm:block"
          style={{ left: b.x, top: b.y, background: b.c }}
          aria-hidden
        >
          {b.t}
        </div>
      ))}
      <HomeNav />
      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-5 pb-28 pt-8 text-center">
        <HomeMascot size={240} className="duo-float" />
        <h1
          className="mt-2 text-[clamp(1.9rem,5vw,3rem)] font-black leading-[1.12] text-[#3c3c3c]"
          style={{ fontFamily: "var(--font-learn)" }}
        >
          Gökyüzünde kelimeler, cebinde progress.
        </h1>
        <p className="mt-3 max-w-md font-bold text-[#777]">
          Oyun gibi hissettiren mikro derslerle yeni bir dil öğren — tamamen ücretsiz başla.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <PrimaryCta />
          <SecondaryCta />
        </div>
      </div>
    </div>
  );
}

/** 4 — Bold green band + white content card */
function Variant4() {
  return (
    <div className="duo-home min-h-[100svh] bg-[#f0f0f0]" data-home="4">
      <div className="bg-[#58cc02] pb-24 pt-2 shadow-[0_6px_0_#46a302]">
        <HomeNav light />
        <div className="mx-auto max-w-3xl px-5 pb-6 pt-4 text-center text-white md:px-8">
          <h1
            className="text-[clamp(1.9rem,5vw,3rem)] font-black leading-[1.12]"
            style={{ fontFamily: "var(--font-learn)" }}
          >
            Dil öğrenmenin en eğlenceli yolu
          </h1>
          <p className="mt-3 text-lg font-bold text-white/90">
            x-pi ile ücretsiz başla — streak’ini yak, her gün bir ders bitir.
          </p>
        </div>
      </div>
      <div className="relative z-10 mx-auto -mt-16 max-w-lg px-5 pb-28">
        <div className="rounded-3xl border-2 border-[#e5e5e5] bg-white px-6 py-8 text-center shadow-[0_8px_0_#e5e5e5]">
          <HomeMascot size={180} />
          <div className="mt-4 flex flex-col gap-3">
            <PrimaryCta label="Başla" />
            <SecondaryCta />
          </div>
          <LangChips className="mt-8 justify-center" />
        </div>
      </div>
    </div>
  );
}

/** 5 — Minimal pro */
function Variant5() {
  return (
    <div className="duo-home min-h-[100svh] bg-white" data-home="5">
      <HomeNav />
      <div className="mx-auto flex min-h-[calc(100svh-5rem)] max-w-lg flex-col items-center justify-center px-6 pb-28 text-center">
        <HomeMascot size={200} />
        <h1
          className="mt-8 text-[clamp(1.75rem,4.5vw,2.5rem)] font-black leading-[1.15] tracking-tight text-[#1a1a1a]"
          style={{ fontFamily: "var(--font-learn)" }}
        >
          Ücretsiz dil öğren. Her gün biraz.
        </h1>
        <p className="mt-3 max-w-sm font-semibold text-[#777]">
          Sade arayüz, net hedefler, kalıcı alışkanlık.
        </p>
        <div className="mt-10">
          <PrimaryCta label="Öğrenmeye başla" />
        </div>
      </div>
    </div>
  );
}

const VARIANTS: Record<HomeVariant, () => ReactElement> = {
  1: Variant1,
  2: Variant2,
  3: Variant3,
  4: Variant4,
  5: Variant5,
};

export function DuoHomeHero() {
  const [params] = useSearchParams();
  const variant = useHomeVariant();
  const View = VARIANTS[variant];
  const hideSwitcher = params.get("shot") === "1";
  return (
    <>
      <View />
      {hideSwitcher ? null : <VariantSwitcher current={variant} />}
    </>
  );
}
