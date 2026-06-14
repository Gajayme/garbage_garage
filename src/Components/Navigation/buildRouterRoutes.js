import { AdminRouteGuard } from "Components/Auth/AdminRouteGuard.js";

const toRouterChildPath = (path) => {
	if (path === "/") {
		return path;
	}
	return path.startsWith("/") ? path : `/${path}`;
};

const wrapElement = (Page, needAuth) => {
	const element = <Page />;
	return needAuth ? <AdminRouteGuard>{element}</AdminRouteGuard> : element;
};

/**
 * @param {Array<{ path: string, needAuth: boolean, page: React.ComponentType }>} routes
 */
export const buildRouterRoutes = (routes) =>
	routes.map(({ path, needAuth, page: Page }) => ({
		path: toRouterChildPath(path),
		element: wrapElement(Page, needAuth),
	}));
