import { defineConfig } from 'vite'

// BASE_PATH is set by the Pages workflow to "/<repo-name>/"; locally it is "/".
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
})
