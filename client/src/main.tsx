import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
// import { Toaster } from 'react-hot-toast'; // Import here
import { GoogleOAuthProvider } from '@react-oauth/google';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
    <GoogleOAuthProvider clientId="1010558717936-lpdb4e10u39dvv3imr0cvah0vg6bh7gk.apps.googleusercontent.com">
    {/* <Toaster position="top-right" /> */}
    <App />
    </GoogleOAuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
