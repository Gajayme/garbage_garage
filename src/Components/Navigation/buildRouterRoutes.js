import { AdminRouteGuard } from "Components/Auth/AdminRouteGuard.js";

const toRouterChildPath = (path) => {
	if (path === "/") {
		return path;
	}
	return path.startsWith("/") ? path : `/${path}`;
};

const wrapElement = (Page, needAuth, path) => {
	const element = <Page />;
	if (!needAuth) return element;
	// key по пути маршрута даёт каждой админской странице свой экземпляр гарда.
	// React Router рендерит элемент маршрута без key, и при переходе между
	// админскими страницами React видит на том же месте тот же тип —
	// переиспользует гард, не монтируя заново. Тогда перепроверка сессии
	// на маунте (см. useAuth) срабатывает только при входе с публичной страницы.
	return <AdminRouteGuard key={path}>{element}</AdminRouteGuard>;
};

/**
 * @param {Array<{ path: string, needAuth: boolean, page: React.ComponentType }>} routes
 */
export const buildRouterRoutes = (routes) =>
	routes.map(({ path, needAuth, page: Page }) => ({
		path: toRouterChildPath(path),
		element: wrapElement(Page, needAuth, path),
	}));
