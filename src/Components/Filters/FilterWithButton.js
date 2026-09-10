
import { ToggleIconButton } from "Components/ToggleIconButton.js";


// компонет, объединяющий кнопку и фильтр, который активируется этой кнопкой
export const FilterWithButton = ({filter, labelText, className, buttonClassName, iconClassName, iconInactive, iconActive, onClick, isActive}) => {
	return (
		<div className={className}>
			<ToggleIconButton
				labelText={labelText}
				className={buttonClassName}
				iconClassName={iconClassName}
				iconInactive={iconInactive}
				iconActive={iconActive}
				onClick={onClick}
				isActive={isActive}
				disclosure
			/>
			{isActive && filter}
		</div>
	)
};
