import { resolve } from 'path'

export const trailingSlash = true
export const reactStrictMode = false
export const experimental = {
  esmExternals: false,
  jsconfigPaths: true // enables it for both jsconfig.json and tsconfig.json
}
export function webpack(config) {
  config.resolve.alias = {
    ...config.resolve.alias,
    apexcharts: resolve(__dirname, './node_modules/apexcharts-clevision')
  }

  return config
}
