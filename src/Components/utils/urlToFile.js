/**
 * Скачать содержимое по URL и упаковать его в `File`.
 *
 * Используется в местах, где форма ожидает на вход `File` (для отправки
 * через multipart/form-data), а у нас на руках только URL — например,
 * картинки существующей вещи в edit-режиме или дефолтное изображение для
 * автозаполнения теста.
 *
 * Тип определяется по приоритету: явно переданный `mimeType` → `blob.type`
 * → дефолт `"image/jpeg"`. Это позволяет вызывать без `mimeType`, доверяя
 * заголовкам ответа, и одновременно даёт безопасный fallback, если сервер
 * не присылает `Content-Type`.
 *
 * @param {string} url      адрес ресурса.
 * @param {string} filename имя для создаваемого `File`.
 * @param {string} [mimeType] явный MIME (приоритетнее `blob.type`).
 * @returns {Promise<File>}
 * @throws  если ответ не `ok` (4xx/5xx) — чтобы не молча создать `File`
 *          из тела ошибки.
 */
export const urlToFile = async (url, filename, mimeType) => {
	// Кешу доверяем: адреса картинок — хеши содержимого, по одному адресу
	// всегда лежит одно и то же, а сервер отдаёт их с max-age на год.
	const res = await fetch(url, {
		mode: 'cors',
		credentials: 'omit',
	});

	if (!res.ok) {
		throw new Error(`Failed to fetch ${url}: ${res.status}`);
	}

	const blob = await res.blob();
	const type = mimeType || blob.type || 'image/jpeg';

	return new File([blob], filename, { type });
};
