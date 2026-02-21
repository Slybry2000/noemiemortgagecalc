import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Handle theme query parameter
const params = new URLSearchParams(window.location.search);
const theme = params.get('theme');
if (theme === 'dark') {
  document.documentElement.classList.add('dark');
} else if (theme === 'light') {
  document.documentElement.classList.remove('dark');
} else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.documentElement.classList.add('dark');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
