import { BackgroundDecor } from "@/components/BackgroundDecor";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";

export default function HomePage() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#FFFDF7]">
      <BackgroundDecor />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-5xl flex-col items-center justify-center px-5 py-8 sm:px-8 sm:py-6">
        <Header />
        <Hero />
      </div>
    </main>
  );
}
