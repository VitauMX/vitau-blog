const postcssPresetEnv = require('postcss-preset-env')

require('dotenv').config({
  path: `.env.${process.env.NODE_ENV}`,
})

module.exports = {
  siteMetadata: {
    title: `Vitau | Blog`,
    description: `Salud, nutrición, hábitos, cuidado personal y más maneras de ser la mejor versión de nosotros mismos.`,
    author: `Vitau Médical`,
    url: `http://beta-blog.vitau.mx`,
  },
  plugins: [
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
        icon: `src/images/favicon.png`, // This path is relative to the root of the site.
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
    {
      resolve: `gatsby-source-ghost`,
      options: {
        apiUrl: process.env.GHOST_API_URL,
        contentApiKey: process.env.GHOST_API_KEY,
      },
    },
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    // `gatsby-plugin-offline`,
  ],
}
