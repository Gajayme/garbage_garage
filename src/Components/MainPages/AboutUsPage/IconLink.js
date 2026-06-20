import "Styles/MainPages/AboutUsPage/IconLink.scss";

export const IconLink = ({ icon, text, href, alt = "", className = "" }) => (
	<a
		href={href}
		target="_blank"
		rel="noopener noreferrer"
		className={`icon-link ${className}`.trim()}>
		<img src={icon} alt={alt} className="icon-link__icon" />
		<span className="icon-link__text">{text}</span>
	</a>
);
