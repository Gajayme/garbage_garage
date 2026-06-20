import "Styles/MainPages/AboutUsPage/TextBubble.scss";

export const TextBubble = ({ text, image, alt = "Text bubble", className = "" }) => (
	<div className={`text-bubble-container ${className}`.trim()}>
		<img src={image} alt={alt} className="text-bubble-image" />
		<p className="text-bubble-content">{text}</p>
	</div>
);
