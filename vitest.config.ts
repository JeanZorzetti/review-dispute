import { defineConfig } from 'vitest/config'
import path from 'path'
import { config } from 'dotenv'

config({ path: path.resolve(__dirname, '.env') })

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    fileParallelism: false,
    testTimeout: 30000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
