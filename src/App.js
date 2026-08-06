import { useRef } from 'react';
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import { AuthProvider } from 'Components/Auth/AuthContext.js';
import { routes } from 'Components/Navigation/routes.js';
import { buildRouterRoutes } from 'Components/Navigation/buildRouterRoutes.js';

import {OuterWindow} from "Components/Window/OuterWindow";
import {WindowHeader} from "Components/Window/WindowHeader";
import {ButtonLayer} from "Components/Window/ButtonLayer";
import {InnerWindow} from "Components/Window/InnerWindow";
import {ScrollContainerContext} from "Components/Window/ScrollContainerContext.js";
import {DefaultNavButtons} from "Components/Navigation/DefaultNavButtons";

import 'Styles/NoOverscroll.scss';

const Layout = () => {
	const scrollContainerRef = useRef(null);
	return (
		<ScrollContainerContext.Provider value={scrollContainerRef}>
			<div>
				<OuterWindow className="outer-window"
				header={<WindowHeader className="window-header" />}
				buttonLayer={<ButtonLayer className="button-layer">
					<DefaultNavButtons className="default-nav-buttons" />
				</ButtonLayer>}
				innerWindow={<InnerWindow ref={scrollContainerRef} className="inner-window no-overscroll">
					<Outlet />
				</InnerWindow>}
				/>
			</div>
		</ScrollContainerContext.Provider>
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
