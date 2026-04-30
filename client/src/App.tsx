// src/App.tsx
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes/AppRoutes';
import { SocketProvider } from './context/SocketProvider';

function App() {
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' || e.key === 'token') {
        window.location.reload();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <>
      <Toaster position="top-right" />
      <SocketProvider>
        <AppRoutes />
      </SocketProvider>
    </>
  );
}

export default App;
