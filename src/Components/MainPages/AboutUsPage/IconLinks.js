import { IconLink } from "Components/MainPages/AboutUsPage/IconLink";

import instagramIcon from "Assets/Icons/SocialMedia/instagram.svg";
import telegramIcon from "Assets/Icons/SocialMedia/telegram.svg";
import whatsappIcon from "Assets/Icons/SocialMedia/whatsapp.svg";

export const IconLinks = ({ className }) => {
	return (
		<div className={className}>
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
	);
};
