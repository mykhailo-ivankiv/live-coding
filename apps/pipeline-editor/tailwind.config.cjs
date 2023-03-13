/** @type {import('tailwindcss').Config} */
const path = require('path')
const config = require('@live/tailwind-config')

config.content.push(
    path.join(path.dirname(require.resolve('@live/components-vue')), '*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'),
)

module.exports = config
