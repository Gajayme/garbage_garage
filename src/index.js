import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

import './index.scss'
import "./Styles/Fonts.scss";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { staleTimes } from "Constants.js";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: staleTimes.lists,
		},
	},
});

ReactDOM.createRoot(document.getElementById('root')).render(
	<QueryClientProvider client={queryClient}>
		<App />
	</QueryClientProvider>
)
