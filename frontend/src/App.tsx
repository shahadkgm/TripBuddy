import { Routes, Route } from "react-router-dom";
import HomePage from "./modules/auth/pages/HomePage"; // Adjust path based on where you saved it
import AuthPage from "./modules/auth/pages/AuthPage";

function App() {
  return (
    <Routes>
      {/* 1. Root Route: Now shows the actual Home Page instead of redirecting */}
      <Route path="/" element={<HomePage />} />
      
      {/* 2. Auth Routes */}
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route path="/login" element={<AuthPage mode="login" />} />
      
      {/* 3. Fallback Route: Matches any URL that doesn't exist */}
      <Route path="*" element={
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-4xl font-bold">404</h1>
          <p>Oops! This travel destination doesn't exist.</p>
        </div>
      } />
    </Routes>
  );
}

export default App;