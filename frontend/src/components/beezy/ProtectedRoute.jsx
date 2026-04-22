import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export const ProtectedRoute = ({ children }) => {
  const { admin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        data-testid="auth-loading"
        className="min-h-screen flex items-center justify-center bg-[#FAFAFA]"
      >
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-black/50">
          / Verifying…
        </p>
      </div>
    );
  }
  if (!admin) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }
  return children;
};

export default ProtectedRoute;
