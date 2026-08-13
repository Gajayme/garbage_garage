
// Названия полей для формы загрузки вещей (такие же, как в API)
export const files = "files"
export const item_name = "itemName"
export const item_model = "model"
export const buyer_part = "buyersPart"
export const bought_for = "boughtFor"
export const price = "price"
export const sold_for = "soldFor"
export const item_size = "size"
export const buyer = "buyerId"
export const location = "locationId"
export const brand = "brandId"
export const type = "typeId"
export const status = "status"
export const description = "description"

// Валюта, в которой отображаются цены
export const currency = "rsd"

export const base_server_url = "https://api.garbage-garage.com/"

// Идентификатор обязан остаться одним сегментом пути: без экранирования "a/b"
// разваливается на два сегмента, а пробелы и "%" ломают адрес. Кодируем здесь,
// в месте сборки пути, — вызывающей стороне об этом помнить не нужно.
// Точку encodeURIComponent не трогает, поэтому id вида ".." так не обезвредить:
// URL-нормализация схлопнет сегмент и запрос уйдёт на родительский путь. Это
// забота валидации id (isValidPostId) перед вызовом, а не кодирования.
const segment = (value) => encodeURIComponent(String(value))

// Для эндпоинтов, у которых путь приходит параметром и заранее неизвестен
// (справочники на странице настроек).
export const withId = (apiPath, id) => `${apiPath}/${segment(id)}`

// API для загрузки вещи на сервер
export const post_upload = "post/upload"

// API для редактирования вещи
export const postUpdate = (postID) => `post/update/${segment(postID)}`

// API для получения всех вещей
export const post_all = "post/all"
export const post_all_private = "post/all/private"

// API для удаления вещи
export const postDelete = (postID) => `post/delete/${segment(postID)}`

// API для получения детальной информации о вещи
export const postDetail = (postID) => `post/detail/${segment(postID)}`
export const postDetailPrivate = (postID) =>
	`post/detail/private/${segment(postID)}`


// API для аутентификации
export const user_login = "user/login"

// API для получения информации о текущем пользователе
export const user_me = "user/me"

// API для получения input данных
export const brandApi = "brand/all"
export const typeApi = "type/all"
export const buyerApi = "buyer/all"
export const locationApi = "location/all"
export const statusApi = "status/all"

// API для добавления новых input данных
export const brandUploadApi = "brand/upload"
export const typeUploadApi = "type/upload"
export const buyerUploadApi = "buyer/upload"
export const locationUploadApi = "location/upload"

// API для обновления input данных
export const brandUpdateApi = "brand/update"
export const typeUpdateApi = "type/update"
export const buyerUpdateApi = "buyer/update"
export const locationUpdateApi = "location/update"

// API для удаления input данных
export const brandDeleteApi = "brand/delete"
export const typeDeleteApi = "type/delete"
export const buyerDeleteApi = "buyer/delete"
export const locationDeleteApi = "location/delete"

// API для получения ссылки на WhatsApp по вещи: /post/{id}/whatsapp-link
export const postWhatsappLink = (postID) =>
	`post/${segment(postID)}/whatsapp-link`

// API для отправки вещи в соцсети: /post/{id}/send-instagram, /post/{id}/send-telegram
export const postSendInstagram = (postID) =>
	`post/${segment(postID)}/send-instagram`
export const postSendTelegram = (postID) =>
	`post/${segment(postID)}/send-telegram`

// query namespaces
export const whatsappLinkQueryKey = "whatsappLink" // whatsapp link for item page
export const itemDetailsQueryKey = "itemDetails" // item details for catalog page
export const itemDetailsPrivateQueryKey = "itemDetailsPrivate" // item details for database page
export const itemsQueryKey = "items" // items for catalog page
export const itemsPrivateQueryKey = "itemsPrivate" // items for database page
export const brandsQueryKey = "uploadBrand" // all brands
export const typesQueryKey = "uploadTypes" // all types
export const buyersQueryKey = "uploadBuyers" // all buyers
export const locationsQueryKey = "uploadLocations" // all locations
export const statusesQueryKey = "uploadStatus" // all statuses

export const http_methods = {
	GET: 'GET',
	POST: 'POST',
	PUT: 'PUT',
	DELETE: 'DELETE',
};
