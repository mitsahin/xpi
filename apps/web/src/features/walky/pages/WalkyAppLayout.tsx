import { Outlet } from "react-router-dom";
import { WalkyNavbar } from "../components/WalkyNavbar";

export function WalkyAppLayout() {
  return (
    <div
      className="min-h-full bg-[linear-gradient(180deg,#e9faf0_0%,#f7fcf9_40%,#fff8ef_100%)] text-[#143528]"
      style={{ fontFamily: "var(--font-walky-body)" }}
    >
      <WalkyNavbar compact />
      <Outlet />
    </div>
  );
}
