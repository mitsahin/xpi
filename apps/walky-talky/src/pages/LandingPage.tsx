import { Link } from "react-router-dom";
import { Radio, Sparkles } from "lucide-react";
import { BeeHeroMascot } from "../components/brand/BeeHeroMascot";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

export function LandingPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 pt-8 md:px-6 md:pt-12">
      <div className="grid items-center gap-10 md:grid-cols-2 md:gap-12">
        <div className="order-2 md:order-1">
          <p className="mb-3 inline-flex items-center gap-2 rounded-2xl bg-wt-primary-soft px-3 py-1 text-sm font-semibold text-wt-primary-deep">
            <Sparkles className="h-4 w-4" aria-hidden />
            Oyunlaştırılmış dil pratiği
          </p>
          <h1 className="font-display text-4xl font-extrabold leading-tight text-wt-ink md:text-5xl">
            Dil Öğreniminde Yeni Frekans!
          </h1>
          <p className="mt-4 text-lg text-wt-muted md:text-xl">
            Walky Talky ile kelimeleri telsizden dinle, yıldız topla, serini koru. Tamamen
            tarayıcında — internetsiz bile çalışır.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/learn" className="inline-block">
              <Button fullWidth className="sm:w-auto">
                <Radio className="h-5 w-5" aria-hidden />
                Telsizi Aç ve Başla
              </Button>
            </Link>
            <Link to="/voice" className="inline-block">
              <Button variant="ghost" fullWidth className="sm:w-auto">
                Bas Konuş demosu
              </Button>
            </Link>
          </div>
        </div>
        <div className="order-1 md:order-2">
          <BeeHeroMascot />
        </div>
      </div>

      <div className="mt-16 grid gap-4 md:grid-cols-3">
        {[
          { title: "Frekans yolu", desc: "Kıvrımlı beceri ağacında ilerle." },
          { title: "Telsiz dinle", desc: "Her derste mock ses kartları." },
          { title: "Seri & XP", desc: "LocalStorage ile ilerlemen kayıtlı." },
        ].map((f) => (
          <Card key={f.title} padding="sm">
            <h2 className="font-display font-bold text-wt-ink">{f.title}</h2>
            <p className="mt-1 text-sm text-wt-muted">{f.desc}</p>
          </Card>
        ))}
      </div>
    </main>
  );
}
