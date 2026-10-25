import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

import './index.scss'
import "./Styles/Fonts.scss";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { staleTimes, retryExceptClientError } from "Constants.js";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: staleTimes.lists,
			// Политика повторов одна на все запросы, разбор — в Constants.js.
			// На мутации не распространяется: их TanStack Query не повторяет
			// по умолчанию, и это правильно.
			retry: retryExceptClientError,
		},
	},
});

ReactDOM.createRoot(document.getElementById('root')).render(
	<QueryClientProvider client={queryClient}>
		<App />
	</QueryClientProvider>
)
