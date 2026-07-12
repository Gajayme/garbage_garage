import { IconLinks } from '../IconLinks.js';

import "Styles/MainPages/AboutUsPage/AboutUsPageSmallScreen.scss";
import "Styles/ColoredText.scss";

import mascot_small from 'Assets/Images/about_us_mascot_small.png';

export const AboutUsPageSmallScreen = () => {
	return (
		<div className="about-us-page-small-screen">
			<p className="about-us-page-small-screen__text">Hi! We are trift shop located in Belgrade, Serbia. Please <span className="red-text">buy</span> something. We have <span className="red-text">charhartt</span>!</p>

			<img
				className="about-us-page-small-screen__mascot"
				src={mascot_small}
				alt="mascot_small"
			/>

			{/* Ссылки на соцсети */}
			<IconLinks className="about-us-page-small-screen__links"/>

		</div>
	);
};
