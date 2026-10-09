import { WalkyNavbar } from "../components/WalkyNavbar";
import { LandingHero } from "../components/LandingHero";

export function WalkyLandingPage() {
  return (
    <div
      className="min-h-full text-[#143528]"
      style={{ fontFamily: "var(--font-walky-body)" }}
      data-home-variant="walky-talky"
      data-home-default="walky-talky"
    >
      <WalkyNavbar />
      <LandingHero />
      <section className="border-t border-[#d8ebe0] bg-white/80 px-6 py-14">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-[family-name:var(--font-walky)] text-3xl font-extrabold text-[#143528]">
            Frekans nasıl çalışır?
          </h2>
          <p className="mt-2 max-w-xl font-semibold text-[#5a7a68]">
            Kısa dersler, anında geri bildirim, sesli pratik — hepsi LocalStorage’da senin cihazında.
          </p>
          <ol className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              {
                n: "01",
                t: "Yolu aç",
                d: "Kilitli düğümleri tamamladıkça yeni frekanslar açılır.",
              },
              {
                n: "02",
                t: "Telsizden dinle",
                d: "Çeviri sorularında sesi dinle, seçeneği işaretle, kontrol et.",
              },
              {
                n: "03",
                t: "Bas konuş",
                d: "Sesli not ile pratik yap; streak ve XP birikir.",
              },
            ].map((item) => (
              <li
                key={item.n}
                className="rounded-[24px] border-2 border-[#d8ebe0] bg-[#f7fcf9] p-5"
              >
                <div className="text-sm font-black text-[#2BB673]">{item.n}</div>
                <h3 className="mt-2 text-xl font-extrabold text-[#143528]">{item.t}</h3>
                <p className="mt-2 font-semibold text-[#5a7a68]">{item.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
