import { useAuth } from "./useAuth.js";

export const AuthChecker = ({ children }) => {
	const { isAdmin } = useAuth();
	return isAdmin ? children : null;
};
