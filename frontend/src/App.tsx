// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./modules/auth/pages/HomePage";
import AuthPage from "./modules/auth/pages/AuthPage";
import ProtectedRoute from "./routes/ProtectedRoute";

// Optional: A simple Dashboard component if you haven't created the file yet
const DashboardPlaceholder = () => (
  <div className="p-8">
    <h1 className="text-2xl font-bold">Welcome to your Trip Planner!</h1>
    <p className="text-gray-600">This is your private dashboard.</p>
  </div>
);

function App() {
  return (
    <Routes>
      {/* --- Public Routes --- */}
      <Route path="/" element={<HomePage />} />
      
      {/* Auth Routes */}
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route path="/login" element={<AuthPage mode="login" />} />

      {/* --- Protected Routes (User must be logged in) --- */}
      {/* The ProtectedRoute component will handle the redirection to /login */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPlaceholder />} />
        {/* You can add /profile or /my-trips here later */}
      </Route>

      {/* --- Catch All --- */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;