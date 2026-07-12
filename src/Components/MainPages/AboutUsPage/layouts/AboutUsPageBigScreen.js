import { IconLink } from '../IconLink.js';

import "Styles/MainPages/AboutUsPage/AboutUsPageBigScreen.scss";
import "Styles/ColoredText.scss";

import mascot_big from 'Assets/Images/about_us_mascot_big.png';
import instagramIcon from 'Assets/Icons/SocialMedia/instagram.svg';
import telegramIcon from 'Assets/Icons/SocialMedia/telegram.svg';
import whatsappIcon from 'Assets/Icons/SocialMedia/whatsapp.svg';

export const AboutUsPageBigScreen = () => {
	return (
		<div className="about-us-page-big-screen">
			<div className="about-us-page-big-screen__text-container">

				<p>
					Hi! We are trift shop located in Belgrade, Serbia. Please <span className="red-text">buy</span> something. We have <span className="red-text">charhartt</span>!
				</p>

				<p>
					<span className="red-text">follow us</span> on:
				</p>

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

				<p>
					or contact via:
				</p>
				<IconLink
					icon={whatsappIcon}
					text="whatsapp"
					href="https://www.instagram.com/garbage_garage_shop/"
				/>

			</div>
			<img
				className="about-us-page-big-screen__mascot"
				src={mascot_big}
				alt="mascot_big"
			/>

		</div>
	);
};
