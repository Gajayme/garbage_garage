import { DefaultButton } from "Components/Button.js";

/**
 * Колонка кнопок действий над вещью.
 *
 * @param {{ actions: Array<{ label: string, onClick: Function, disabled: boolean }> }} params
 */
export const ItemActionButtons = ({ actions }) => {
	return actions.map(({ label, onClick, disabled }) => (
		<DefaultButton
			key={label}
			className="database-item-button"
			type="button"
			labelText={label}
			disabled={disabled}
			onClick={onClick}
		/>
	));
};
