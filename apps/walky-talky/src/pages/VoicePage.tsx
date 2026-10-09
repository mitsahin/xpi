import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { VoiceRecorder } from "../components/voice/VoiceRecorder";
import { Card } from "../components/ui/Card";
import { useProgressStore } from "../store/progressStore";

export function VoicePage() {
  const addXp = useProgressStore((s) => s.addXp);

  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <Link
        to="/learn"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-wt-primary"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Öğrenme yoluna dön
      </Link>
      <Card>
        <h1 className="font-display text-2xl font-extrabold text-wt-ink">Walky Talky Telsiz</h1>
        <p className="mt-2 text-wt-muted">
          Push-to-talk denemesi: basılı tut, dalgaları izle, bırakınca kayıt tamamlanmış sayılır.
        </p>
        <div className="mt-8">
          <VoiceRecorder
            onRecorded={() => {
              addXp(5);
            }}
          />
        </div>
      </Card>
    </main>
  );
}
