import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import { LanguageProvider } from './i18n/LanguageContext'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <HashRouter>
            <LanguageProvider>
                <App />
            </LanguageProvider>
        </HashRouter>
    </StrictMode>,
)
