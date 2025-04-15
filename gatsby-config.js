const postcssPresetEnv = require('postcss-preset-env')

require('dotenv').config({
  path: `.env.${process.env.NODE_ENV}`,
})

module.exports = {
  siteMetadata: {
    title: `Vitau | Blog`,
    description: `Salud, nutrición, hábitos, cuidado personal y más maneras de ser la mejor versión de nosotros mismos.`,
    author: `Vitau Médical`,
    siteUrl: `https://blog.vitau.mx`,
  },
  plugins: [
    {
      resolve: 'gatsby-plugin-google-tagmanager',
      options: {
        id: 'GTM-N6RPTNB',
        includeInDevelopment: false,
        defaultDataLayer: { platform: 'gatsby' },
        enableWebVitalsTracking: true,
      },
    },
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        short_name: `Vitau Blog`,
        name: `Vitau Médical Blog`,
        description: `Salud, nutrición, hábitos, cuidado personal y más maneras de ser la mejor versión de nosotros mismos.`,
        start_url: `/`,
        background_color: `#022a3b`,
        theme_color: `#00aaff`,
        display: `minimal-ui`,
        icon: `src/images/favicon.png`,
      },
    },
    {
      resolve: 'gatsby-plugin-web-font-loader',
      options: {
        google: {
          families: ['Open Sans:300,400,400i,600,700,800&display=swap'],
        },
        custom: {
          families: ['Galano Grotesque Alt'],
        },
      },
    },
    {
      resolve: `gatsby-plugin-sass`,
      options: {
        postCssPlugins: [
          postcssPresetEnv({
            browsers: 'last 2 versions',
          }),
        ],
      },
    },
    `gatsby-plugin-sitemap`,
    {
      resolve: `gatsby-source-ghost`,
      options: {
        apiUrl: process.env.GHOST_API_URL,
        contentApiKey: process.env.GHOST_API_KEY,
      },
    },
    `gatsby-plugin-offline`,
  ],
}
