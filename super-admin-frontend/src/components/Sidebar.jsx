import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const links = [
  { to: "/", label: "Dashboard" },
  { to: "/colleges", label: "Colleges" },
  { to: "/clubs", label: "Clubs" },
  { to: "/verification", label: "Club Admin Verification" },
  { to: "/events", label: "Events" },
  { to: "/users", label: "Users" },
  { to: "/posts", label: "Posts" },
  { to: "/reports", label: "Reports" },
  { to: "/analytics", label: "Analytics" },
  { to: "/settings", label: "Settings" },
  { to: "/notifications", label: "Notifications" },
  { to: "/logs", label: "Logs & Security" },
];

const Sidebar = () => {
  const { logout } = useAuth();
  return (
    <aside className="w-64 h-screen bg-slate-900 border-r border-slate-800 flex flex-col">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-semibold">CollegeHub Super Admin</h1>
        <p className="text-xs text-slate-400 mt-1">Power center</p>
      </div>
      <nav className="flex-1 overflow-y-auto">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `block px-6 py-3 text-sm ${
                isActive
                  ? "bg-slate-800 text-white"
                  : "text-slate-300 hover:bg-slate-800"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
      <button
        className="m-4 px-4 py-2 rounded bg-red-500 text-white text-sm"
        onClick={logout}
      >
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;
