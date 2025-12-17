import React, { useState, useMemo, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const displayName = useMemo(() => {
    if (user?.name) return user.name;
    const first = user?.firstName?.trim() || "";
    const last = user?.lastName?.trim() || "";
    return `${first} ${last}`.trim() || "Jeeven Rakshak";
  }, [user]);
  const displayRole = useMemo(() => {
    const roleLabel = user?.role?.replace("_", " ")?.trim();
    return roleLabel ? roleLabel.toUpperCase() : "STUDENT";
  }, [user]);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const isActive = useCallback(
    (path) => location.pathname.startsWith(path),
    [location.pathname]
  );

  const navLinks = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h18M3 6h18M3 14h18M3 18h18"
          />
        </svg>
      ),
      roles: ["student", "club_admin", "college_admin", "super_admin"],
    },
    {
      path: "/clubs",
      label: "Clubs",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V4m8 3V4M4 9h16v10a2 2 0 01-2 2H6a2 2 0 01-2-2V9z"
          />
        </svg>
      ),
      roles: ["student", "club_admin", "college_admin", "super_admin"],
    },
    {
      path: "/events",
      label: "Events",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12h5m-5 0l-5 5m5-5l-5-5m5 5H3"
          />
        </svg>
      ),
      roles: ["student", "club_admin", "college_admin", "super_admin"],
    },
    {
      path: "/search",
      label: "Explore",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 11.65z"
          />
        </svg>
      ),
      roles: ["student", "club_admin", "college_admin", "super_admin"],
    },
    {
      path: "/my-registrations",
      label: "My Events",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 20h6M9 4h6m-6 4h6m-6 4h6"
          />
        </svg>
      ),
      roles: ["student", "club_admin", "college_admin", "super_admin"],
    },
    {
      path: "/admin",
      label: "Admin",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      ),
      roles: ["college_admin", "super_admin"],
    },
  ];

  const filteredLinks = navLinks.filter(
    (link) => user && link.roles.includes(user.role)
  );

  const navLinksMarkup = useMemo(
    () => (
      <div className="hidden md:flex items-center gap-6">
        {filteredLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 font-semibold text-sm tracking-wide ${
              isActive(link.path)
                ? "bg-white text-indigo-900 shadow-lg"
                : "text-white/80 hover:text-white hover:bg-white/20"
            }`}
          >
            <span className="text-base text-current">{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        ))}
      </div>
    ),
    [filteredLinks, isActive]
  );

  return (
    <>
      <nav className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-950 shadow-2xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-6">
            <div className="flex-1 flex flex-col text-left">
              <Link
                to="/dashboard"
                className="flex items-center gap-3 text-white"
              >
                <div className="w-12 h-12 rounded-3xl bg-white/10 flex items-center justify-center backdrop-blur text-xl font-extrabold tracking-tight">
                  CH
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-2xl font-black tracking-tight">
                    CollegeHub
                  </span>
                  <span className="text-xs uppercase text-white/70">
                    Connected campus experience
                  </span>
                </div>
              </Link>
            </div>

            {navLinksMarkup}

            <div className="flex items-center gap-4">
              <div className="hidden lg:flex flex-col">
                <span className="text-white font-semibold text-sm">
                  {displayName}
                </span>
                <span className="text-white/70 text-xs uppercase tracking-wider">
                  {displayRole}
                </span>
              </div>
              <Link
                to="/profile"
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 text-white transition hover:bg-white/20"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5.121 17.804A8 8 0 0116 10h2a2 2 0 012 2v5a2 2 0 01-2 2H7a2 2 0 01-2-2v-1a1 1 0 01.121-.523z"
                  />
                </svg>
                <span className="text-sm font-semibold" aria-label="Profile">
                  Profile
                </span>
              </Link>
              <button
                onClick={() => setIsLogoutConfirmOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/30 text-white text-sm font-semibold hover:border-white hover:bg-white/20 transition"
              >
                <span>Logout</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7"
                  />
                </svg>
              </button>
            </div>
          </div>
          {filteredLinks.length > 0 && (
            <div className="md:hidden mt-4 flex gap-3 overflow-x-auto px-2">
              {filteredLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded-full font-semibold tracking-wide transition-colors whitespace-nowrap ${
                    isActive(link.path)
                      ? "bg-white text-indigo-900"
                      : "text-white/80 hover:text-white hover:bg-white/20"
                  }`}
                >
                  <span className="text-base text-current">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Logout confirmation overlay */}
      {isLogoutConfirmOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-md">
            <p className="text-sm uppercase text-indigo-500 font-semibold mb-2">
              Logout Confirmation
            </p>
            <h3 className="text-xl font-bold text-slate-900">
              Are you sure you want to leave CollegeHub?
            </h3>
            <p className="text-sm text-slate-500 mt-3">
              This will end your current session. You can always log back in
              later to continue exploring clubs, events, and campus connections.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsLogoutConfirmOpen(false)}
                className="px-4 py-2 rounded-full border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Stay connected
              </button>
              <button
                onClick={() => {
                  setIsLogoutConfirmOpen(false);
                  handleLogout();
                }}
                className="px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-blue-600 text-white text-sm font-semibold shadow-lg"
              >
                Yes, logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;
