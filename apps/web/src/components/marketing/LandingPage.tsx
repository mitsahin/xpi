import { Link, useSearchParams } from "react-router-dom";
import { useAppStore } from "../../store";
import { BeeHomeHero } from "./BeeHomeHero";
import { DuoHomeHero, useHomeVariant } from "./DuoHomeVariants";
import { MarketingHero } from "./MarketingHero";

/**
 * Marketing `/` — **always defaults to H2 centered bee** (`BeeHomeHero`).
 *
 * - No cinematic / R3F / “Preview themes” on this branch of `main`.
 * - `?theme=*` (old cinematic PR) is ignored — still H2.
 * - Optional alts only via explicit `?home=1..5`.
 * - Prior atmospheric hero only via `?home=legacy` (not cinematic A/B/C).
 */
export function LandingPage() {
  const [params] = useSearchParams();
  const home = params.get("home");
  // Explicit opt-in only — never treat missing/unknown/theme params as cinematic.
  const legacy = home === "legacy";
  const altVariant = home === "1" || home === "2" || home === "3" || home === "4" || home === "5";
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

  if (altVariant) {
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

  return (
    <div
      className="min-h-full bg-[#fffcf5] text-[#1b2a4a]"
      style={{ fontFamily: "var(--font-learn)" }}
      data-home-variant="h2"
      data-home-default="bee-h2"
    >
      <BeeHomeHero />
      <HowSection soft />
      <FooterCta />
    </div>
  );
}

function HowSection({ soft }: { soft?: boolean }) {
  return (
    <section
      id="how"
      className={`mx-auto max-w-6xl px-6 py-16 ${soft ? "bg-[#f7f7f7]" : ""}`}
    >
      <h2
        className="text-3xl font-black tracking-tight text-[#1b2a4a] md:text-4xl"
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
  const token = useAppStore((s) => s.token);
  return (
    <section className="border-t-2 border-[#e5e5e5] bg-white px-6 py-14">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div>
          <p
            className="text-3xl font-black tracking-tight text-[#1b2a4a]"
            style={{ fontFamily: "var(--font-learn)" }}
          >
            Hazır olduğunda başla.
          </p>
          <p className="mt-2 font-bold text-[#777]">
            Öğren path’ine atla — sadece pratik.
          </p>
        </div>
        <Link
          to={token ? "/learn" : "/auth"}
          className="inline-flex rounded-full bg-[#ffc800] px-7 py-3.5 text-base font-black text-[#1b2a4a] shadow-[0_4px_0_#e6b400]"
        >
          Öğrenmeye başla →
        </Link>
      </div>
    </section>
  );
}
