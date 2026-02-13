// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})

// export default defineConfig({
//   plugins: [react()],
//   server: {
//     host: true,           // listen on all network interfaces (0.0.0.0)
//     port: 25173,          // optional: force exact port
//     strictPort: true,     // fail if port is taken
//   },
// })