import { Link } from "react-router-dom";
import { Lock, Star, Radio } from "lucide-react";
import type { NodeStatus } from "../../store/progressStore";

type Props = {
  id: string;
  title: string;
  status: NodeStatus;
  stars?: number;
  offsetX: number;
};

export function LessonNode({ id, title, status, stars = 0, offsetX }: Props) {
  const base =
    "relative flex h-16 w-16 flex-col items-center justify-center rounded-full border-4 font-display text-xs font-bold transition-transform md:h-20 md:w-20";

  let styles = "border-gray-200 bg-gray-100 text-gray-400";
  let inner: React.ReactNode = <Lock className="h-6 w-6" aria-hidden />;

  if (status === "active") {
    styles = "border-wt-primary bg-wt-primary text-white wt-node-active cursor-pointer hover:scale-105";
    inner = <Radio className="h-7 w-7" aria-hidden />;
  } else if (status === "completed") {
    styles = "border-wt-primary-deep bg-wt-primary-soft text-wt-primary-deep cursor-pointer hover:scale-105";
    inner = (
      <div className="flex gap-0.5">
        {[0, 1, 2].map((i) => (
          <Star
            key={i}
            className={`h-3 w-3 md:h-4 md:w-4 ${i < stars ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
            aria-hidden
          />
        ))}
      </div>
    );
  }

  const content = (
    <div className="flex flex-col items-center gap-2" style={{ marginLeft: offsetX }}>
      <div className={`${base} ${styles}`}>{inner}</div>
      <span className="max-w-[5.5rem] text-center text-xs font-semibold text-wt-muted md:text-sm">
        {title}
      </span>
    </div>
  );

  if (status === "locked") {
    return <div className="opacity-70">{content}</div>;
  }

  return (
    <Link to={`/lesson/${id}`} className="block no-underline">
      {content}
    </Link>
  );
}
