import { NavLink, useSearchParams } from "react-router-dom";

const items = [
  { to: "/learn", label: "Learn", icon: "🏠" },
  { to: "/learn/reviews", label: "Review", icon: "📒" },
  { to: "/learn/profile", label: "Profile", icon: "👤" },
];

export function BottomNav() {
  const [params] = useSearchParams();
  const demo = params.get("demo") === "1";
  const path = params.get("path");

  function withQuery(to: string) {
    const q = new URLSearchParams();
    if (demo) q.set("demo", "1");
    if (path && to === "/learn") q.set("path", path);
    const s = q.toString();
    return s ? `${to}?${s}` : to;
  }

  return (
    <nav className="fixed bottom-0 inset-x-0 z-20 border-t-2 border-[#e5e5e5] bg-white pb-[env(safe-area-inset-bottom,0)]">
      <div className="mx-auto flex max-w-md justify-around px-2 py-1.5">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={withQuery(item.to)}
            end={item.to === "/learn"}
            className={({ isActive }) =>
              `flex min-w-[96px] flex-col items-center gap-0.5 rounded-2xl px-3 py-2 text-[11px] font-black uppercase tracking-wide ${
                isActive
                  ? "bg-[#d7ffb8]/70 text-[#58cc02]"
                  : "text-[#afafaf]"
              }`
            }
          >
            <span className="text-[22px] leading-none" aria-hidden>
              {item.icon}
            </span>
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
