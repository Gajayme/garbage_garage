import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext.js";
import { login } from "Components/Navigation/paths.js";

export const AdminRouteGuard = ({ children }) => {
	const { isAdmin, hasChecked } = useAuth();
	// Пустой экран — только до первого ответа о сессии. Перепроверки идут фоном:
	// страница остаётся на месте и не теряет своё состояние (заполненную форму,
	// открытое окно, показанное уведомление). Если сессия и правда истекла,
	// isAdmin станет false и редирект случится следующим рендером.
	if (!hasChecked) return null;
	if (!isAdmin) return <Navigate to={`/${login}`} replace />;
	return children;
};
