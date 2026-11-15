import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth.js";
import { login } from "Components/Navigation/paths.js";

export const AdminRouteGuard = ({ children }) => {
	// Гард монтируется заново на каждой админской странице (key в
	// buildRouterRoutes), и этот вызов useAuth перепроверяет сессию на входе.
	// Брать isAdmin откуда-то ещё
	// (пропсом, из стора) нельзя: страница со свежим кешем откроется
	// на истёкшей сессии, не сделав ни одного запроса.
	const { isAdmin, hasChecked } = useAuth();
	// Пустой экран — только до первого ответа о сессии. Перепроверки идут фоном:
	// страница остаётся на месте и не теряет своё состояние (заполненную форму,
	// открытое окно, показанное уведомление). Если сессия и правда истекла,
	// isAdmin станет false и редирект случится следующим рендером.
	if (!hasChecked) return null;
	if (!isAdmin) return <Navigate to={`/${login}`} replace />;
	return children;
};
