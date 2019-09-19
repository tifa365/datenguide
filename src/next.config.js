const path = require('path')
const withFonts = require('next-fonts')
const withCSS = require('@zeit/next-css')
const withMDX = require('@zeit/next-mdx')({
  extension: /\.mdx?$/
})

module.exports = withCSS(
  withMDX(
    withFonts({
      pageExtensions: ['js', 'jsx', 'mdx', 'md'],
      webpack(config, options) {
        config.module.rules.push({
          test: /\.mdx?$/,
          use: [path.join(__dirname, './lib/frontmatter-loader')]
        })

        // svg loader
        config.module.rules.push({
          test: /\.svg$/,
          use: ['@svgr/webpack']
        })

        return config
      }
    })
  )
)
