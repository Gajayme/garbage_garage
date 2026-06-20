import { TextBubble } from '../TextBubble.js';
import { IconLink } from '../IconLink.js';

import "Styles/MainPages/AboutUsPage/AboutUsPageSmallScreen.scss";


import text_bubble from 'Assets/Images/text-bubble.png';
import trash_bin from 'Assets/Images/trash_bin.png';
import instagramIcon from 'Assets/Icons/instagram.svg';
import telegramIcon from 'Assets/Icons/telegram.svg';
import whatsappIcon from 'Assets/Icons/whatsapp.svg';



export const AboutUsPageSmallScreen = () => {
	return (
		<div className="about-us-page-small-screen">

			{/* Бабл с текстром и картинка с маскотом */}
			<div className="mascot-container">
				<TextBubble
					image={text_bubble}
					text="hi! we are garbage garage trift shop. please buy something. we have charhartt"
				/>
				<img className="mascot-image" src={trash_bin} alt="Trash Bin" />
			</div>

			{/* Ссылки на соцсети */}
			<div className="icon-links-container">
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
