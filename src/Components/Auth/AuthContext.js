import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as Constants from 'Constants.js';

const AuthContext = createContext(null);

const checkSession = async () => {
	const response = await fetch(Constants.base_server_url + Constants.user_me, {
		method: Constants.http_methods.GET,
		credentials: 'include',
	});
	if (!response.ok) return { isAdmin: false };
	const data = await response.json().catch(() => ({}));
	const isAdmin = data?.status === true && data?.data != null;
	return { isAdmin };
};

export const AuthProvider = ({ children }) => {
	const [isAdmin, setIsAdmin] = useState(false);
	// Отличает «мы ещё ни разу не спрашивали сервер, кто это» от «перепроверяем
	// уже известное». Первое требует придержать рендер, второе — нет.
	const [hasChecked, setHasChecked] = useState(false);

	const checkAuth = useCallback(async () => {
		try {
			const { isAdmin: ok } = await checkSession();
			setIsAdmin(ok);
		} finally {
			// В finally, а не после запроса: если сеть отвалилась, приложение
			// должно уйти на логин, а не остаться с пустым экраном навсегда.
			setHasChecked(true);
		}
	}, []);

	useEffect(() => {
		checkAuth();
	}, [checkAuth]);

	const value = { isAdmin, hasChecked, checkAuth };

	return (
		<AuthContext.Provider value={value}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error('useAuth must be used within AuthProvider');
	return ctx;
};
