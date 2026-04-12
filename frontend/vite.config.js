import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
const frontendRoot = fileURLToPath(new URL('.', import.meta.url));
export default defineConfig(({ mode }) => {
    loadEnv(mode, frontendRoot, '');
    return {
        root: frontendRoot,
        plugins: [react(), tailwindcss()],
        resolve: {
            alias: {
                '@': path.resolve(frontendRoot, '.'),
            },
        },
    };
});
