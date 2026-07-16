import { IconLink } from "Components/MainPages/AboutUsPage/IconLink";
import { instagramLink, telegramLink, whatsappLink } from "Components/MainPages/AboutUsPage/Constants";

import instagramIcon from "Assets/Icons/SocialMedia/instagram.svg";
import telegramIcon from "Assets/Icons/SocialMedia/telegram.svg";
import whatsappIcon from "Assets/Icons/SocialMedia/whatsapp.svg";

export const IconLinks = ({ className }) => {
	return (
		<div className={className}>
			<IconLink
				icon={instagramIcon}
				text="instagram"
				href={instagramLink}
			/>

			<IconLink
				icon={telegramIcon}
				text="telegram"
				href={telegramLink}
			/>

			<IconLink
				icon={whatsappIcon}
				text="whatsapp"
				href={whatsappLink}
			/>
		</div>
	);
};
