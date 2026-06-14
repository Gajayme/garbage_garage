import { AdminLabel } from './AdminLabel.js';
import headerLogo from 'Assets/Images/header_logo.png';

/**
 * Компонент хедера базового окна страницы.
 *
 * @param {string} className - Имя класса для стилей.
 */
export const WindowHeader = ({ className }) => {
	return (
		<div className={className}>
			<div className="window-header__brand">
				<img
					className="window-header__logo"
					src={headerLogo}
					alt=""
					aria-hidden="true"
				/>
				<span className="window-header__title">garbage garage</span>
			</div>
			<AdminLabel />
		</div>
	);
};
