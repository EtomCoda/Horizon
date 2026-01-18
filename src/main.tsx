import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { PostHogProvider } from './providers/PostHogProvider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PostHogProvider>
        <App />
    </PostHogProvider>
  </StrictMode>
);
