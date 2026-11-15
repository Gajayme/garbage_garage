import { useAuth } from 'Components/Auth/useAuth.js';

/**
 * Надпись "admin" для хедера окна. Отображается только для авторизованного администратора.
 */
export const AdminLabel = () => {
	const { isAdmin } = useAuth();
	if (!isAdmin) return null;
	return <span className="window-header__admin">admin</span>;
};
