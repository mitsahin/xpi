import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Lock, Mic, Star } from "lucide-react";
import { SKILLS } from "../data";
import { skillStatus, useWalkyStore } from "../store";

const OFFSET: Record<SkillNodeOffset, string> = {
  left: "mr-auto ml-[8%] md:ml-[18%]",
  center: "mx-auto",
  right: "ml-auto mr-[8%] md:mr-[18%]",
};

type SkillNodeOffset = "left" | "center" | "right";

export function SkillTree() {
  const { completedSkillIds } = useWalkyStore();

  return (
    <div className="relative mx-auto max-w-lg px-4 pb-24 pt-6 md:px-6">
      <div className="mb-8 text-center">
        <h1 className="font-[family-name:var(--font-walky)] text-3xl font-extrabold text-[#143528]">
          Öğrenme Yolu
        </h1>
        <p className="mt-1 text-sm font-semibold text-[#5a7a68]">
          Kilidi aç, yıldız topla, frekansta kal
        </p>
      </div>

      {/* Winding path backdrop */}
      <svg
        className="pointer-events-none absolute left-1/2 top-28 hidden h-[calc(100%-8rem)] w-24 -translate-x-1/2 text-[#b8e0c8] sm:block"
        viewBox="0 0 40 600"
        fill="none"
        aria-hidden
        preserveAspectRatio="none"
      >
        <path
          d="M20 0 C 5 80, 35 120, 20 200 S 5 320, 20 400 S 35 520, 20 600"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="14 12"
          opacity="0.7"
        />
      </svg>

      <ol className="relative flex flex-col gap-10">
        {SKILLS.map((skill, i) => {
          const status = skillStatus(skill.id, completedSkillIds);
          const isVoice = skill.id === "radio";
          const href =
            status === "locked"
              ? undefined
              : isVoice
                ? "/app/voice"
                : `/app/lesson/${skill.id}`;

          const node = (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`relative w-[min(100%,280px)] ${OFFSET[skill.offset]}`}
            >
              <div
                className={[
                  "flex items-center gap-3 rounded-[24px] border-2 px-4 py-3.5 shadow-[0_5px_0_rgba(20,53,40,0.08)] transition-transform",
                  status === "completed" &&
                    "border-[#2BB673] bg-[#E8FFF2] hover:scale-105",
                  status === "active" &&
                    "walky-node-active border-[#FFB020] bg-white hover:scale-105",
                  status === "locked" &&
                    "cursor-not-allowed border-[#d8e0db] bg-[#f0f3f1] opacity-80",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <div
                  className={[
                    "flex size-14 shrink-0 items-center justify-center rounded-[18px]",
                    status === "completed" && "bg-[#2BB673] text-white",
                    status === "active" && "bg-[#FFF4E5] text-[#FF6B2C]",
                    status === "locked" && "bg-[#dde5e0] text-[#7a8f82]",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {status === "completed" && <Check className="size-7" strokeWidth={3} />}
                  {status === "active" &&
                    (isVoice ? (
                      <Mic className="size-7" />
                    ) : (
                      <Star className="size-7 fill-[#FFB020] text-[#FFB020]" />
                    ))}
                  {status === "locked" && <Lock className="size-6" />}
                </div>
                <div className="min-w-0 text-left">
                  <p className="truncate text-lg font-extrabold text-[#143528]">
                    {skill.title}
                  </p>
                  <p className="truncate text-sm font-semibold text-[#5a7a68]">
                    {skill.subtitle}
                  </p>
                  {status === "completed" && (
                    <div className="mt-1 flex gap-0.5 text-[#FFB020]" aria-label="3 yıldız">
                      <Star className="size-3.5 fill-current" />
                      <Star className="size-3.5 fill-current" />
                      <Star className="size-3.5 fill-current" />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );

          return (
            <li key={skill.id}>
              {href ? (
                <Link to={href} className="block outline-none focus-visible:ring-2 focus-visible:ring-[#2BB673] rounded-[24px]">
                  {node}
                </Link>
              ) : (
                node
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
