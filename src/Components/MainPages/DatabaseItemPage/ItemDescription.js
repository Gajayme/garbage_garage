import "Styles/MainPages/DatabaseItemPage/ItemDescription.scss";


export const ItemDescription = ({data, delimiter = ": " }) => {
	if (!data) return null;

	const { title, restData } = data;

	return (
		<div className="database-item-page-description">
			{/* Заголовок (имя вещи) */}
			<p>{title}</p>

			{/* Остальная информация */}
			{restData.map(({ key, label, value }) => (
				<p key={key} className="database-item-page-description-field">
					<span className="database-item-page-description-label">
						{label}{delimiter}
					</span>
					<span>
						{value}
					</span>
				</p>
			))}
		</div>
	);
};
