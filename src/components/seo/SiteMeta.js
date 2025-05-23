import React from 'react'
import { useStaticQuery, graphql } from 'gatsby'
import { Helmet } from 'react-helmet'

const SiteMeta = () => {
  const data = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          siteUrl
        }
      }
      allGhostSettings {
        edges {
          node {
            title
            description
            lang
          }
        }
      }
    }
  `)

  const { title, description, lang } = data.allGhostSettings.edges[0].node
  const { siteUrl } = data.site.siteMetadata

  return (
    <Helmet>
      <html lang={lang} />
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={siteUrl} />
      <meta property="og:site_name" content={title} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={siteUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:url" content={siteUrl} />
      <link
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.11.2/css/all.min.css"
        rel="stylesheet"
      />
    </Helmet>
  )
}

export default SiteMeta
