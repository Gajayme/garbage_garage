import { NavButton } from "./NavButton";
import { routes } from "./routes.js";
import { AuthChecker } from "Components/Auth/AuthChecker.js";

import 'Styles/Navigation/NavButton.scss'
import 'Styles/Navigation/DefaultNavButtons.scss'


/**
 * Компонент стандартного слоя навигационных кнопок.
 *
 * @param {string} className - Имя класса для стилей.
 */
export const DefaultNavButtons = ({ className }) => {
	return (
		<div className={className}>
			{routes
				.filter((route) => route.label)
				.map((route) => {
					const button = (
						<NavButton
							key={route.path}
							className="nav-button"
							labelText={route.label}
							destination={route.path}
						/>
					);

					return route.needAuth ? (
						<AuthChecker key={route.path}>{button}</AuthChecker>
					) : (
						button
					);
				})}
		</div>
	);
};
