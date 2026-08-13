export const root = "/";
export const upload = "Upload";
export const database = "Database";
export const catalog = "Catalog";
export const settings = "Settings";
export const login = "Login";
export const aboutUs = "AboutUs";

// Маршрут редактирования вещи: зеркалит `/${upload}/edit/:itemId` из routes.js.
// Форма пути и экранирование живут рядом с сегментами, а не в компонентах.
export const uploadEdit = (itemId) =>
	`/${upload}/edit/${encodeURIComponent(itemId)}`;
