import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const isActive = (path) => location.pathname.startsWith(path);

  const navLinks = [
    {
      path: "/dashboard",
      label: "Dashboard",
      roles: ["student", "club_admin", "college_admin", "super_admin"],
    },
    {
      path: "/clubs",
      label: "Clubs",
      roles: ["student", "club_admin", "college_admin", "super_admin"],
    },
    {
      path: "/events",
      label: "Events",
      roles: ["student", "club_admin", "college_admin", "super_admin"],
    },
    {
      path: "/search",
      label: "Explore",
      roles: ["student", "club_admin", "college_admin", "super_admin"],
    },
    {
      path: "/my-registrations",
      label: "My Events",
      roles: ["student", "club_admin", "college_admin", "super_admin"],
    },
    { path: "/admin", label: "Admin", roles: ["college_admin", "super_admin"] },
  ];

  const filteredLinks = navLinks.filter(
    (link) => user && link.roles.includes(user.role)
  );

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">CH</span>
            </div>
            <span className="hidden md:block text-xl font-bold text-gray-900">
              CollegeHub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {filteredLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`transition-colors font-medium ${
                  isActive(link.path)
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side Menu */}
          <div className="flex items-center gap-4">
            {/* Create Buttons */}
            {user &&
              ["club_admin", "college_admin", "super_admin"].includes(
                user.role
              ) && (
                <div className="hidden lg:flex gap-2">
                  <Link
                    to="/clubs/create"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium text-sm"
                  >
                    + Club
                  </Link>
                  <Link
                    to="/events/create"
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium text-sm"
                  >
                    + Event
                  </Link>
                </div>
              )}

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {user?.firstName?.[0]?.toUpperCase()}
                  </span>
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-700">
                  {user?.firstName}
                </span>
                <svg
                  className={`w-4 h-4 text-gray-600 transition ${isMenuOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50">
                  <div className="p-4 border-b border-gray-200">
                    <p className="font-semibold text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{user?.email}</p>
                    <p className="text-xs mt-2">
                      <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {user?.role?.replace("_", " ").toUpperCase()}
                      </span>
                    </p>
                  </div>

                  <div className="py-2">
                    <Link
                      to="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                    >
                      👤 Profile
                    </Link>
                    {user &&
                      ["club_admin", "college_admin", "super_admin"].includes(
                        user.role
                      ) && (
                        <Link
                          to="/admin"
                          onClick={() => setIsMenuOpen(false)}
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                        >
                          ⚙️ Admin
                        </Link>
                      )}
                  </div>

                  <div className="border-t border-gray-200 py-2">
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition font-medium"
                    >
                      🚪 Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 space-y-2 pb-4">
            {filteredLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-4 py-2 rounded-lg transition ${
                  isActive(link.path)
                    ? "bg-blue-100 text-blue-600 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {user &&
              ["club_admin", "college_admin", "super_admin"].includes(
                user.role
              ) && (
                <>
                  <Link
                    to="/clubs/create"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    + Create Club
                  </Link>
                  <Link
                    to="/events/create"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                  >
                    + Create Event
                  </Link>
                </>
              )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
