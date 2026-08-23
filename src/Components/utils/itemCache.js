import * as Constants from "Constants.js";

/**
 * Обновление кеша react-query после действий над вещью.
 *
 * Держит в одном месте знание о том, в каких пространствах ключей лежат данные
 * вещи: иначе каждое новое действие (удаление, редактирование) перечисляет
 * ключи заново и рано или поздно про один из них забывает.
 *
 * Публикация в соцсети сюда не ходит намеренно: бэкенд факт публикации в вещь
 * не отдаёт, в деталях и списках такого поля нет, инвалидировать нечего.
 * Появится поле — публикация обязана звать invalidateItem + invalidateItemLists,
 * иначе внутри staleTimes.details вещь будет выглядеть неопубликованной
 * и админ опубликует её второй раз.
 */

// Записи с данными одной вещи. Ключ каждой — [namespace, itemId].
const itemNamespaces = [
	Constants.itemDetailsPrivateQueryKey,
	Constants.itemDetailsQueryKey,
	Constants.whatsappLinkQueryKey,
];

// Списки, в которых вещь участвует как элемент. Ключи списка каталога содержат
// ещё и состояние фильтров, поэтому инвалидируем по префиксу — под него попадут
// все варианты фильтров сразу.
const listNamespaces = [Constants.itemsQueryKey, Constants.itemsPrivateQueryKey];

/**
 * Состав списков изменился: помечаем их устаревшими.
 *
 * @param {import("@tanstack/react-query").QueryClient} queryClient
 */
export const invalidateItemLists = (queryClient) =>
	Promise.all(
		listNamespaces.map((namespace) =>
			queryClient.invalidateQueries({ queryKey: [namespace] })
		)
	);

/**
 * Вещь изменилась: её карточки и whatsapp-ссылку надо перезапросить. Без этого
 * они держат старую версию до истечения `staleTimes.details`, потому что
 * обновлять их больше некому.
 *
 * @param {import("@tanstack/react-query").QueryClient} queryClient
 * @param {string} itemId
 */
export const invalidateItem = (queryClient, itemId) =>
	Promise.all(
		itemNamespaces.map((namespace) =>
			queryClient.invalidateQueries({ queryKey: [namespace, itemId] })
		)
	);

/**
 * Вещи больше нет: выбрасываем её записи из кеша, иначе кнопка «назад» или
 * прямая ссылка покажут удалённую вещь как живую.
 *
 * Вызывать только после ухода со страницы вещи: у смонтированной страницы
 * запрос деталей активен, и на опустевший кеш хук сходит за удалённым id.
 *
 * @param {import("@tanstack/react-query").QueryClient} queryClient
 * @param {string} itemId
 */
export const removeItem = (queryClient, itemId) =>
	itemNamespaces.forEach((namespace) =>
		queryClient.removeQueries({ queryKey: [namespace, itemId] })
	);
