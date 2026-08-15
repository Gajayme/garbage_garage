
import { IconLinks } from '../IconLinks.js';

import "Styles/MainPages/AboutUsPage/AboutUsPageBigScreen.scss";
import "Styles/TextWeight.scss";
import "Styles/ColoredText.scss";

import mascot_big from 'Assets/Images/about_us_mascot_big.png';

export const AboutUsPageBigScreen = () => {
	return (
		<div className="about-us-page-big-screen">

			<div className="about-us-page-big-screen__text-container">
				{/* Текст */}
				<p >
					Hi! We are thrift shop located in Belgrade, Serbia. Please <span className="bold-text pink-text">buy</span> something. We have <span className="bold-text pink-text">charhartt</span>!
				</p>

				<p>
					<span className="bold-text pink-text">follow us</span> on:
				</p>

				{/* Ссылки на соцсети */}
				<div className="about-us-page-big-screen__links-container">
					<IconLinks className="about-us-page-big-screen__links" />
				</div>

			</div>


			{/* Маскот */}
			<img
				className="about-us-page-big-screen__mascot"
				src={mascot_big}
				alt="mascot_big"
			/>

		</div >
	);
};
