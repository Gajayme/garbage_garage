import { AboutUsPageBigScreen } from "./layouts/AboutUsPageBigScreen.js";
import { AboutUsPageSmallScreen } from "./layouts/AboutUsPageSmallScreen.js";
import { useHeightGreaterThanWidth } from "Components/hooks/useHeightGreaterThanWidth.js";

import "Styles/MainPages/AboutUsPage/AboutUsPage.scss";

export const AboutUsPage = () => {
	const tallNarrowViewport = useHeightGreaterThanWidth();
	return (
		<div className="about-us-page">
			{tallNarrowViewport ? <AboutUsPageSmallScreen /> : <AboutUsPageBigScreen />}
		</div>
	);
};
