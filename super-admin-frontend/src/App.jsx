import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import CollegesPage from "./pages/CollegesPage.jsx";
import ClubsPage from "./pages/ClubsPage.jsx";
import VerificationPage from "./pages/VerificationPage.jsx";
import EventsPage from "./pages/EventsPage.jsx";
import UsersPage from "./pages/UsersPage.jsx";
import PostsPage from "./pages/PostsPage.jsx";
import ReportsPage from "./pages/ReportsPage.jsx";
import AnalyticsPage from "./pages/AnalyticsPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";

const Protected = ({ children }) => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        Validating secure session…
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route
      path="/"
      element={
        <Protected>
          <DashboardPage />
        </Protected>
      }
    />
    <Route
      path="/colleges"
      element={
        <Protected>
          <CollegesPage />
        </Protected>
      }
    />
    <Route
      path="/clubs"
      element={
        <Protected>
          <ClubsPage />
        </Protected>
      }
    />
    <Route
      path="/verification"
      element={
        <Protected>
          <VerificationPage />
        </Protected>
      }
    />
    <Route
      path="/events"
      element={
        <Protected>
          <EventsPage />
        </Protected>
      }
    />
    <Route
      path="/users"
      element={
        <Protected>
          <UsersPage />
        </Protected>
      }
    />
    <Route
      path="/posts"
      element={
        <Protected>
          <PostsPage />
        </Protected>
      }
    />
    <Route
      path="/reports"
      element={
        <Protected>
          <ReportsPage />
        </Protected>
      }
    />
    <Route
      path="/analytics"
      element={
        <Protected>
          <AnalyticsPage />
        </Protected>
      }
    />
    <Route
      path="/settings"
      element={
        <Protected>
          <SettingsPage />
        </Protected>
      }
    />
    <Route
      path="/notifications"
      element={
        <Protected>
          <NotificationsPage />
        </Protected>
      }
    />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

const App = () => (
  <AuthProvider>
    <AppRoutes />
  </AuthProvider>
);

export default App;
