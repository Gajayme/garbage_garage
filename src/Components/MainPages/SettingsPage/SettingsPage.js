import * as GlobalConstants from "Constants.js";
import { useInputParams } from "Components/hooks/useInputParams.js";
import { SettingsDictionarySection } from "Components/MainPages/SettingsPage/SettingsDictionarySection.js";
import { compareSizeItems } from "Components/utils/sizes.js";

import "Styles/CenteredText.scss";
import "Styles/MainPages/SettingsPage/SettingsPageContent.scss";

// Тело size/upload и size/update: название — ключ, значение — id типов.
const buildSizeBody = (title, typeIds) => ({ [title]: typeIds });

// Ответ size/all содержит типы каждого размера: переименование или удаление
// типа меняет и его.
const TYPE_RELATED_QUERY_KEYS = [GlobalConstants.sizesQueryKey];

export const SettingsPage = () => {
	const { brands, types, sizes, buyers, locations, isLoading } = useInputParams();

	if (isLoading) {
		return <p className="centered-text">Loading...</p>;
	}

	// Размер привязан к типам, и без хотя бы одного типа его не сохранить:
	// размер без типов не попадёт ни в один дропдаун формы загрузки.
	const sizeTypesLink = {
		options: types,
		itemField: "types",
		label: "Types",
		required: true,
	};

	return (
		<div className="settings-params">
			<SettingsDictionarySection
				title="Brands"
				items={brands}
				uploadApiPath={GlobalConstants.brandUploadApi}
				updateApiPath={GlobalConstants.brandUpdateApi}
				deleteApiPath={GlobalConstants.brandDeleteApi}
				queryKey={GlobalConstants.brandsQueryKey}
				placeholder="Add brand"
			/>
			<SettingsDictionarySection
				title="Types"
				items={types}
				uploadApiPath={GlobalConstants.typeUploadApi}
				updateApiPath={GlobalConstants.typeUpdateApi}
				deleteApiPath={GlobalConstants.typeDeleteApi}
				queryKey={GlobalConstants.typesQueryKey}
				placeholder="Add type"
				relatedQueryKeys={TYPE_RELATED_QUERY_KEYS}
			/>
			<SettingsDictionarySection
				title="Sizes"
				items={sizes}
				uploadApiPath={GlobalConstants.sizeUploadApi}
				updateApiPath={GlobalConstants.sizeUpdateApi}
				deleteApiPath={GlobalConstants.sizeDeleteApi}
				queryKey={GlobalConstants.sizesQueryKey}
				placeholder="Add size"
				link={sizeTypesLink}
				buildBody={buildSizeBody}
				compareItems={compareSizeItems}
			/>
			<SettingsDictionarySection
				title="Buyers"
				items={buyers}
				uploadApiPath={GlobalConstants.buyerUploadApi}
				updateApiPath={GlobalConstants.buyerUpdateApi}
				deleteApiPath={GlobalConstants.buyerDeleteApi}
				queryKey={GlobalConstants.buyersQueryKey}
				placeholder="Add buyer"
			/>
			<SettingsDictionarySection
				title="Locations"
				items={locations}
				uploadApiPath={GlobalConstants.locationUploadApi}
				updateApiPath={GlobalConstants.locationUpdateApi}
				deleteApiPath={GlobalConstants.locationDeleteApi}
				queryKey={GlobalConstants.locationsQueryKey}
				placeholder="Add location"
			/>
		</div>
	);
};
