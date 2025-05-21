import path from "path"
import react from "@vitejs/plugin-react"
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
  },
  build: {
    sourcemap: false, // Set to true for debugging, false for production
    rollupOptions: {
      output: {
        manualChunks: {
          // Framework and main libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],

          // UI libraries and components
          'ui-lib': ['@/components/ui/sonner', '@/components/theme-provider'],

          // Firebase chunks - split by functionality
          'firebase-core': ['firebase/app'],
          'firebase-auth': ['firebase/auth'],
          'firebase-analytics': ['firebase/analytics'],
          'firebase-firestore': ['firebase/firestore'],
          'firebase-storage': ['firebase/storage'],

          // Other large dependencies
          'posthog': ['posthog-js'],
          'framer': ['framer-motion'],
          'dropzone': ['react-dropzone'],
          'lottie': ['lottie-web/build/player/lottie_light'],

          // Group common components
          'layout-components': [
            './src/components/Navbar',
            './src/components/Footer'
          ],

          // Group page chunks logically
          'main-pages': [
            './src/pages/Home',
            './src/pages/About',
            './src/pages/Faq'
          ],
          'policy-pages': [
            './src/pages/PrivacyPolicy',
            './src/pages/Tos'
          ],
          'room-pages': [
            './src/pages/CreateRoom',
            './src/pages/JoinRoom',
            './src/pages/WaitingRoom'
          ],
          // Room.jsx is likely large - keep it separate
          'room': ['./src/pages/Room']
        }
      }
    },
  }
})
