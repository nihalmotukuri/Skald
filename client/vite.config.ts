import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from "path"
import tailwindcss from "@tailwindcss/vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    watch: {
      usePolling: true,
    },
    hmr: {
      overlay: false
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('/node_modules/')) return

          if (/\/node_modules\/(react|react-dom|scheduler)\//.test(id)) {
            return 'framework'
          }
          if (id.includes('/node_modules/@supabase/')) return 'supabase'
          if (id.includes('/node_modules/@radix-ui/')) return 'radix'
          if (/\/node_modules\/(framer-motion|motion)\//.test(id)) {
            return 'motion'
          }
          if (
            /\/node_modules\/(react-markdown|remark-|unified|micromark|mdast-|hast-|unist-|vfile|bail|ccount|character-entities|decode-named-character-reference|devlop|extend|is-plain-obj|longest-streak|property-information|space-separated-tokens|stringify-entities|trim-lines|trough|zwitch)/.test(id)
          ) {
            return 'markdown'
          }
          if (/\/node_modules\/(recharts|d3-)/.test(id)) return 'charts'
          if (/\/node_modules\/(date-fns|react-day-picker)\//.test(id)) {
            return 'calendar'
          }
        },
      },
    },
  },
})
