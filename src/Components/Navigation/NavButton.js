import { NavLink } from "react-router-dom";

import "Styles/Navigation/NavButton.scss";

export const NavButton = ({ labelText, destination }) => {
	return (
		<NavLink
			to={destination}
			className={({ isActive }) => isActive ? "nav-button nav-button--selected" : "nav-button"} end >

			{labelText}
		</NavLink>
	);
};
