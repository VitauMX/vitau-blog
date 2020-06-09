const postcssPresetEnv = require('postcss-preset-env')

require('dotenv').config({
  path: `.env.${process.env.NODE_ENV}`,
})

module.exports = {
  siteMetadata: {
    title: `Vitau | Blog`,
    description: `Salud, nutrición, hábitos, cuidado personal y más maneras de ser la mejor versión de nosotros mismos.`,
    author: `Vitau Médical`,
    siteUrl: `http://beta-blog.vitau.mx`,
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
    {
      resolve: `gatsby-plugin-segment-js`,
      options: {
        // your segment write key for your production environment
        // when process.env.NODE_ENV === 'production'
        // required; non-empty string
        prodKey: `8MrHTGIAuRFEZxfpUeNOYEkr6cqjNUC1`,
  
        // if you have a development env for your segment account, paste that key here
        // when process.env.NODE_ENV === 'development'
        // optional; non-empty string
        devKey: `9ZtGoCvV1NtmKqL5TNsWTvuXyYaTLA3d`,
  
        // boolean (defaults to false) on whether you want
        // to include analytics.page() automatically
        // if false, see below on how to track pageviews manually
        trackPage: true,
        
        // If you need to proxy events through a custom endpoint,
        // add a `host` property (defaults to https://cdn.segment.io)
        // Segment docs:
        //   - https://segment.com/docs/connections/sources/custom-domains
        //   - https://segment.com/docs/connections/sources/catalog/libraries/website/javascript/#proxy
        host: `https://override-segment-endpoint`,
  
        // boolean (defaults to false); whether to delay load Segment
        // ADVANCED FEATURE: only use if you leverage client-side routing (ie, Gatsby <Link>)
        // This feature will force Segment to load _after_ either a page routing change
        // or user scroll, whichever comes first. This delay time is controlled by
        // `delayLoadTime` setting. This feature is used to help improve your website's
        // TTI (for SEO, UX, etc).  See links below for more info.
        // NOTE: But if you are using server-side routing and enable this feature,
        // Segment will never load (because although client-side routing does not do
        // a full page refresh, server-side routing does, thereby preventing Segment
        // from ever loading).
        // See here for more context:
        // GIF: https://github.com/benjaminhoffman/gatsby-plugin-segment-js/pull/19#issuecomment-559569483
        // TTI: https://github.com/GoogleChrome/lighthouse/blob/master/docs/scoring.md#performance
        // Problem/solution: https://marketingexamples.com/seo/performance
        delayLoad: true,
  
        // number (default to 1000); time to wait after scroll or route change
        // To be used when `delayLoad` is set to `true`
        delayLoadTime: 1000
      }
    }
  ],
}
