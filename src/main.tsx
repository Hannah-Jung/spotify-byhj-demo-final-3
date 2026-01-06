import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from "react-router";
import theme from './theme'
import {CssBaseline, ThemeProvider} from '@mui/material'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient()
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline/>
        <QueryClientProvider client = {queryClient}>
          <App />
        </QueryClientProvider>
      </ThemeProvider>      
    </BrowserRouter>    
  </StrictMode>,
)
