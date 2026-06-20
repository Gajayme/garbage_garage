import { AboutUsPageBigScreen } from "./layouts/AboutUsPageBigScreen.js";
import { AboutUsPageSmallScreen } from "./layouts/AboutUsPageSmallScreen.js";
import { useHeightGreaterThanWidth } from "Components/hooks/useHeightGreaterThanWidth.js";


export const AboutUsPage = () => {
	const tallNarrowViewport = useHeightGreaterThanWidth();
	return tallNarrowViewport ? <AboutUsPageSmallScreen /> : <AboutUsPageBigScreen />;
};
