import { PATH_NODES } from "../data/lessons";
import { LessonNode } from "../components/learn/LessonNode";
import { resolveNodeStatus, useProgressStore } from "../store/progressStore";
import { Card } from "../components/ui/Card";

export function LearnPage() {
  const nodes = useProgressStore((s) => s.nodes);
  const xp = useProgressStore((s) => s.xp);
  const level = useProgressStore((s) => s.level);

  const units = [...new Set(PATH_NODES.map((n) => n.unit))];

  return (
    <main className="mx-auto max-w-lg px-4 pb-20 pt-6 md:max-w-xl">
      <Card className="mb-8">
        <h1 className="font-display text-2xl font-extrabold text-wt-ink">Öğrenme Frekansı</h1>
        <p className="mt-1 text-sm text-wt-muted">
          Seviye {level} · {xp} XP — bir sonraki seviyeye {level * 50 - xp} XP
        </p>
      </Card>

      <div className="relative flex flex-col gap-10">
        {units.map((unit) => (
          <section key={unit}>
            <div className="mb-6 flex items-center gap-3">
              <span className="rounded-2xl bg-wt-primary px-3 py-1 font-display text-sm font-bold text-white">
                Ünite {unit}
              </span>
              <div className="h-px flex-1 bg-emerald-200" />
            </div>
            <div className="flex flex-col items-center gap-8">
              {PATH_NODES.filter((n) => n.unit === unit).map((node) => {
                const status = resolveNodeStatus(node.id, nodes);
                const stars = nodes[node.id]?.stars ?? 0;
                return (
                  <LessonNode
                    key={node.id}
                    id={node.id}
                    title={node.title}
                    status={status}
                    stars={stars}
                    offsetX={node.offsetX}
                  />
                );
              })}
            </div>
          </section>
        ))}
        <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-full w-1 -translate-x-1/2 bg-linear-to-b from-wt-primary/20 via-emerald-200/40 to-transparent" />
      </div>
    </main>
  );
}
