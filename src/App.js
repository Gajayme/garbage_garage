import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import { AuthProvider } from 'Components/Auth/AuthContext.js';
import { routes } from 'Components/Navigation/routes.js';
import { buildRouterRoutes } from 'Components/Navigation/buildRouterRoutes.js';

import {OuterWindow} from "Components/Window/OuterWindow";
import {WindowHeader} from "Components/Window/WindowHeader";
import {ButtonLayer} from "Components/Window/ButtonLayer";
import {InnerWindow} from "Components/Window/InnerWindow";
import {DefaultNavButtons} from "Components/Navigation/DefaultNavButtons";

import 'Styles/NoOverscroll.scss';

const Layout = () => {
	return (
		<div>
			<OuterWindow className="outer-window"
			header={<WindowHeader className="window-header" />}
			buttonLayer={<ButtonLayer className="button-layer">
				<DefaultNavButtons className="default-nav-buttons" />
			</ButtonLayer>}
			innerWindow={<InnerWindow className="inner-window no-overscroll">
				<Outlet />
			</InnerWindow>}
			/>
		</div>
	)
}

const router = createBrowserRouter([
	{
		element: <Layout />,
		children: buildRouterRoutes(routes),
	},
]);

const App = () => {
	return (
		<AuthProvider>
			<RouterProvider router={router} />
		</AuthProvider>
	);
};

export default App;
