// Прокси dev-сервера CRA: подхватывается только `npm start`, в сборку не попадает.
//
// Страница на http://localhost:3000 и API на api.garbage-garage.com — разные
// сайты, и cookie сессии из ответа на cross-site fetch браузер не принимает
// (так ведёт себя cookie без `SameSite=None`). Поэтому в разработке запросы идут
// на свой origin под префиксом /api (`base_server_url` в Constants.js), а прокси
// пересылает их в API: для браузера cookie сессии принадлежит localhost.
const { createProxyMiddleware } = require("http-proxy-middleware");

// Тот же адрес, что прод-значение `base_server_url` в Constants.js. Импортировать
// его отсюда нельзя: этот файл выполняет Node как CommonJS, а Constants.js —
// ES-модуль бандла.
const API_ORIGIN = "https://api.garbage-garage.com";

module.exports = function (app) {
	app.use(
		createProxyMiddleware("/api/", {
			target: API_ORIGIN,
			// Host запроса — api.garbage-garage.com, а не localhost: по нему
			// Cloudflare выбирает сайт.
			changeOrigin: true,
			pathRewrite: { "^/api/": "/" },
			// Снимает атрибут Domain с Set-Cookie: cookie с Domain от API браузер
			// на localhost отбрасывает.
			cookieDomainRewrite: "",
		})
	);
};
