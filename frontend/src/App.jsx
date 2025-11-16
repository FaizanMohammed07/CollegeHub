import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { UserProvider } from "./context/UserContext";
import { ClubProvider } from "./context/ClubContext";
import { EventProvider } from "./context/EventContext";
import {
  ProtectedRoute,
  PublicRoute,
  ErrorBoundary,
} from "./components/Layouts";
import { LayoutWrapper } from "./components/LayoutWrapper";

// Auth Pages
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

// Main Pages
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";

// Club Pages
import ClubsListPage from "./pages/ClubsListPage";
import ClubDetailPage from "./pages/ClubDetailPage";
import CreateClubPage from "./pages/CreateClubPage";

// Event Pages
import EventsListPage from "./pages/EventsListPage";
import EventDetailPage from "./pages/EventDetailPage";
import CreateEventPage from "./pages/CreateEventPage";
import MyRegistrationsPage from "./pages/MyRegistrationsPage";
import SearchEventsPage from "./pages/SearchEventsPage";
import SearchPage from "./pages/SearchPage";

// Admin Pages
import AdminDashboardPage from "./pages/AdminDashboardPage";

import "./styles/globals.css";

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <UserProvider>
            <ClubProvider>
              <EventProvider>
                <Routes>
                  {/* Public Routes */}
                  <Route
                    path="/login"
                    element={
                      <PublicRoute>
                        <LoginPage />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="/signup"
                    element={
                      <PublicRoute>
                        <SignupPage />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="/forgot-password"
                    element={
                      <PublicRoute>
                        <ForgotPasswordPage />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="/reset-password"
                    element={
                      <PublicRoute>
                        <ResetPasswordPage />
                      </PublicRoute>
                    }
                  />

                  {/* Protected Routes - User */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <LayoutWrapper>
                          <DashboardPage />
                        </LayoutWrapper>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <LayoutWrapper>
                          <ProfilePage />
                        </LayoutWrapper>
                      </ProtectedRoute>
                    }
                  />

                  {/* Protected Routes - Clubs */}
                  <Route
                    path="/clubs"
                    element={
                      <ProtectedRoute>
                        <LayoutWrapper>
                          <ClubsListPage />
                        </LayoutWrapper>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/clubs/:id"
                    element={
                      <ProtectedRoute>
                        <LayoutWrapper>
                          <ClubDetailPage />
                        </LayoutWrapper>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/clubs/create"
                    element={
                      <ProtectedRoute
                        requiredRoles={[
                          "club_admin",
                          "college_admin",
                          "super_admin",
                        ]}
                      >
                        <LayoutWrapper>
                          <CreateClubPage />
                        </LayoutWrapper>
                      </ProtectedRoute>
                    }
                  />

                  {/* Protected Routes - Events */}
                  <Route
                    path="/events"
                    element={
                      <ProtectedRoute>
                        <LayoutWrapper>
                          <EventsListPage />
                        </LayoutWrapper>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/events/search"
                    element={
                      <ProtectedRoute>
                        <LayoutWrapper>
                          <SearchEventsPage />
                        </LayoutWrapper>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/search"
                    element={
                      <ProtectedRoute>
                        <LayoutWrapper>
                          <SearchPage />
                        </LayoutWrapper>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/events/:id"
                    element={
                      <ProtectedRoute>
                        <LayoutWrapper>
                          <EventDetailPage />
                        </LayoutWrapper>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/events/create"
                    element={
                      <ProtectedRoute
                        requiredRoles={[
                          "club_admin",
                          "college_admin",
                          "super_admin",
                        ]}
                      >
                        <LayoutWrapper>
                          <CreateEventPage />
                        </LayoutWrapper>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/my-registrations"
                    element={
                      <ProtectedRoute>
                        <LayoutWrapper>
                          <MyRegistrationsPage />
                        </LayoutWrapper>
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin Routes */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute
                        requiredRoles={["college_admin", "super_admin"]}
                      >
                        <LayoutWrapper>
                          <AdminDashboardPage />
                        </LayoutWrapper>
                      </ProtectedRoute>
                    }
                  />

                  {/* Redirect root to dashboard */}
                  <Route
                    path="/"
                    element={<Navigate to="/dashboard" replace />}
                  />

                  {/* 404 */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>

                <Toaster position="top-right" />
              </EventProvider>
            </ClubProvider>
          </UserProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

const NotFoundPage = () => (
  <div className="flex items-center justify-center h-screen bg-gray-50">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">Page not found</p>
      <a
        href="/dashboard"
        className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        Go back home
      </a>
    </div>
  </div>
);

export default App;
