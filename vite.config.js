import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // strictPort: fail instead of silently switching ports, since the API's CORS allows this origin only
  server: { port: 5173, strictPort: true },
});
