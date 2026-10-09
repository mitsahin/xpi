import { ArrowRight } from "lucide-react";
import { Mascot } from "@/components/Mascot";

const lift =
  "cursor-pointer transition duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(15,31,61,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFFDF7] active:translate-y-0";

export function Hero() {
  return (
    <section className="flex w-full flex-col items-center text-center">
      <Mascot />
      <h1 className="mt-1 font-extrabold leading-[1.02] tracking-[-0.04em] text-brand-navy text-[clamp(2.05rem,6vw,5.35rem)]">
        <span className="block">Dili oyun gibi</span>
        <span className="block">öğren</span>
      </h1>
      <p className="mt-4 max-w-[22rem] text-[15px] font-medium leading-relaxed text-[#7E8796] sm:mt-5 sm:max-w-[34rem] sm:text-lg">
        Oyunlaştırılmış dersler, eğlenceli alıştırmalar ve motivasyon
        ödülleriyle her gün biraz daha ilerle.
      </p>
      <div className="mt-6 flex w-full flex-col items-center gap-3 sm:mt-7 sm:w-auto sm:flex-row sm:gap-3.5">
        <button
          type="button"
          className={`${lift} inline-flex items-center justify-center gap-2 rounded-full bg-brand-yellow px-7 py-3.5 text-base font-bold text-brand-navy sm:px-8 sm:py-4 sm:text-lg`}
        >
          Öğrenmeye başla
          <ArrowRight className="h-[18px] w-[18px]" strokeWidth={2.5} aria-hidden />
        </button>
        <button
          type="button"
          className={`${lift} inline-flex items-center justify-center rounded-full border border-[#E0E4EC] bg-white px-7 py-3.5 text-base font-bold text-brand-navy sm:px-8 sm:py-4 sm:text-lg`}
        >
          Nasıl çalışır?
        </button>
      </div>
    </section>
  );
}
