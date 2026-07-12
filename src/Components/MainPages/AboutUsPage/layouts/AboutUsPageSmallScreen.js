import { IconLink } from '../IconLink.js';

import "Styles/MainPages/AboutUsPage/AboutUsPageSmallScreen.scss";
import "Styles/ColoredText.scss";

import mascot_small from 'Assets/Images/about_us_mascot_small.png';
import instagramIcon from 'Assets/Icons/SocialMedia/instagram.svg';
import telegramIcon from 'Assets/Icons/SocialMedia/telegram.svg';
import whatsappIcon from 'Assets/Icons/SocialMedia/whatsapp.svg';

export const AboutUsPageSmallScreen = () => {
	return (
		<div className="about-us-page-small-screen">
			<p className="about-us-page-small-screen__text">Hi! We are trift shop located in Belgrade, Serbia. Please <span className="red-text">buy</span> something. We have <span className="red-text">charhartt</span>!</p>

			<img
				className="about-us-page-small-screen__mascot"
				src={mascot_small}
				alt="mascot_small" />

			{/* Ссылки на соцсети */}
			<div className="about-us-page-small-screen__links">
				<IconLink
					icon={instagramIcon}
					text="instagram"
					href="https://www.instagram.com/garbage_garage_shop/"
				/>
				<IconLink
					icon={telegramIcon}
					text="telegram"
					href="https://www.instagram.com/garbage_garage_shop/"
				/>
				<IconLink
					icon={whatsappIcon}
					text="whatsapp"
					href="https://www.instagram.com/garbage_garage_shop/"
				/>
			</div>
		</div>
	);
};
