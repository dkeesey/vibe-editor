import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import mdx from '@astrojs/mdx'
import tailwind from '@astrojs/tailwind'
import node from '@astrojs/node'

export default defineConfig({
  integrations: [
    react(),
    mdx(),
    tailwind(),
  ],
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
})
