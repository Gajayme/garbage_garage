import { UploadPage } from "Components/MainPages/UploadPage/UploadPage.js";
import { DatabasePage } from "Components/MainPages/DatabasePage/DatabasePage.js";
import { CatalogPage } from "Components/MainPages/CatalogPage/CatalogPage.js";
import { LoginPage } from "Components/MainPages/LoginPage/LoginPage.js";
import { CatalogItemPage } from "Components/MainPages/CatalogItemPage/CatalogItemPage.js";
import { DatabaseItemPage } from "Components/MainPages/DatabaseItemPage/DatabaseItemPage.js";
import { SettingsPage } from "Components/MainPages/SettingsPage/SettingsPage.js";
import { AboutUsPage } from "Components/MainPages/AboutUsPage/AboutUsPage.js";

import * as paths from "./paths.js";

/**
 * Добавление новой страницы: один объект + импорт компонента в этом файле.
 *
 * @type {Array<{
 *   path: string,
 *   label?: string,
 *   needAuth: boolean,
 *   page: React.ComponentType,
 * }>}
 */
export const routes = [
	{
		path: paths.root,
		label: "shop",
		needAuth: false,
		page: CatalogPage,
	},
	{
		path: `/${paths.upload}`,
		label: "upload",
		needAuth: true,
		page: UploadPage,
	},
	{
		path: `/${paths.upload}/edit/:itemId`,
		needAuth: true,
		page: UploadPage,
	},
	{
		path: `/${paths.database}`,
		label: "database",
		needAuth: true,
		page: DatabasePage,
	},
	{
		path: `/${paths.settings}`,
		label: "settings",
		needAuth: true,
		page: SettingsPage,
	},
	{
		path: `/${paths.aboutUs}`,
		label: "about us",
		needAuth: false,
		page: AboutUsPage,
	},
	{
		path: `/${paths.login}`,
		label: "log in",
		needAuth: false,
		page: LoginPage,
	},
	{
		path: `/${paths.catalog}/:itemId`,
		needAuth: false,
		page: CatalogItemPage,
	},
	{
		path: `/${paths.database}/:itemId`,
		needAuth: true,
		page: DatabaseItemPage,
	},
];
