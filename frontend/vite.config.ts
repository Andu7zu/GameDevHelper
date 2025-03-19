import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  const envObj: { [key: string]: string } = {}
  
  // Manually create the env object
  Object.keys(env).forEach(key => {
    envObj[key] = JSON.stringify(env[key])
  })
  
  return {
    plugins: [react()],
    server: {
      port: 3000,
    },
    define: {
      'process.env': envObj
    }
  }
})
