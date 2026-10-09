import { Link, useSearchParams } from "react-router-dom";
import { DuoHomeHero, useHomeVariant } from "./DuoHomeVariants";
import { MarketingHero } from "./MarketingHero";

/**
 * Marketing `/` — Duolingo-inspired homepage variants via `?home=1..5`.
 * Default preview: variant 1. Pass `?home=legacy` to show the prior MarketingHero.
 */
export function LandingPage() {
  const [params] = useSearchParams();
  const legacy = params.get("home") === "legacy";
  const variant = useHomeVariant();

  if (legacy) {
    return (
      <div className="min-h-full bg-[#f4f7f4] text-[var(--xpi-ink)]">
        <MarketingHero />
        <HowSection />
        <FooterCta />
      </div>
    );
  }

  return (
    <div
      className="min-h-full bg-white text-[#3c3c3c]"
      style={{ fontFamily: "var(--font-learn)" }}
      data-home-variant={variant}
    >
      <DuoHomeHero />
      <HowSection soft />
      <FooterCta />
    </div>
  );
}

function HowSection({ soft }: { soft?: boolean }) {
  return (
    <section
      id="how"
      className={`mx-auto max-w-6xl px-6 py-16 ${soft ? "bg-[#f7f7f7]" : "py-[var(--space-section)]"}`}
    >
      <h2
        className="text-3xl font-black tracking-tight text-[#3c3c3c] md:text-4xl"
        style={{ fontFamily: "var(--font-learn)" }}
      >
        x-pi nasıl çalışır?
      </h2>
      <p className="mt-3 max-w-xl font-bold text-[#777]">
        Kısa dersler, net ilerleme, ihtiyaç duyduğunda tekrarlar.
      </p>
      <ol className="mt-10 grid gap-6 md:grid-cols-3">
        {[
          {
            n: "01",
            t: "Kısa dersler",
            d: "Birkaç dakikalık alıştırmalarla kelime ve kalıp çalış.",
          },
          {
            n: "02",
            t: "Streak & günlük hedef",
            d: "Her gün biraz — alışkanlığın peşini bırakmasın.",
          },
          {
            n: "03",
            t: "Akıllı tekrarlar",
            d: "Unutmaya yakın öğeleri zamanında geri getirir.",
          },
        ].map((item) => (
          <li
            key={item.n}
            className="rounded-2xl border-2 border-[#e5e5e5] bg-white p-5"
          >
            <div className="text-sm font-black text-[#58cc02]">{item.n}</div>
            <h3 className="mt-2 text-xl font-black">{item.t}</h3>
            <p className="mt-2 font-bold text-[#777]">{item.d}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function FooterCta() {
  return (
    <section className="border-t-2 border-[#e5e5e5] bg-white px-6 py-14">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div>
          <p
            className="text-3xl font-black tracking-tight text-[#3c3c3c]"
            style={{ fontFamily: "var(--font-learn)" }}
          >
            Hazır olduğunda başla.
          </p>
          <p className="mt-2 font-bold text-[#777]">
            Öğren path’ine atla — sadece pratik.
          </p>
        </div>
        <Link
          to="/auth"
          className="inline-flex rounded-2xl bg-[#58cc02] px-7 py-3.5 text-base font-black uppercase text-white shadow-[0_4px_0_#46a302]"
        >
          Öğrenmeye başla
        </Link>
      </div>
    </section>
  );
}
