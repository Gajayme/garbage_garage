import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext.js";
import { login } from "Components/Navigation/paths.js";

export const AdminRouteGuard = ({ children }) => {
	const { isAdmin, isLoading } = useAuth();
	if (isLoading) return null;
	if (!isAdmin) return <Navigate to={`/${login}`} replace />;
	return children;
};
