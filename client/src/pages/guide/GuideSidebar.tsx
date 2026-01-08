import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarCheck,
  Wallet,
  User,
  Star
} from "lucide-react";

const menu = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/guide-dashboard" },
  { name: "Bookings", icon: CalendarCheck, path: "/guide/bookings" },
  { name: "Earnings", icon: Wallet, path: "/guide/earnings" },
  { name: "Profile Edit", icon: User, path: "/guide/profile" },
  { name: "Reviews", icon: Star, path: "/guide/reviews" }
];

export const GuideSidebar = () => {
  return (
    <aside className="w-64 min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white fixed left-0 top-0">
      {/* Brand */}
      <div className="px-6 py-6 border-b border-white/10">
        <h1 className="text-xl font-bold">trippbuddy</h1>
        <p className="text-xs text-slate-400 mt-1">Travel Guide</p>
      </div>

      {/* Menu */}
      <nav className="px-4 py-6 space-y-2">
        {menu.map(({ name, icon: Icon, path }) => (
          <NavLink
            key={name}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition
              ${
                isActive
                  ? "bg-indigo-600 text-white"
                  : "text-slate-300 hover:bg-slate-700"
              }`
            }
          >
            <Icon size={18} />
            {name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
