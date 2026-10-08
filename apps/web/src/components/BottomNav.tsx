import { NavLink } from "react-router-dom";

const items = [
  { to: "/learn", label: "Learn", icon: "◎" },
  { to: "/learn/reviews", label: "Review", icon: "↻" },
  { to: "/learn/profile", label: "Profile", icon: "●" },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-20 border-t border-[#e5e5e5] bg-white">
      <div className="mx-auto flex max-w-lg justify-around py-2">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/learn"}
            className={({ isActive }) =>
              `flex min-w-[88px] flex-col items-center gap-0.5 rounded-xl px-4 py-2 text-sm font-extrabold uppercase tracking-wide ${
                isActive ? "text-[var(--xpi-green)]" : "text-[#afafaf]"
              }`
            }
          >
            <span className="text-xl leading-none">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
