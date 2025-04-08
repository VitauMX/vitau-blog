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

  // Add fallback values when Ghost data is not available
  const ghostSettings = data.allGhostSettings?.edges?.[0]?.node || {
    title: 'Vitau Blog',
    description: 'Blog de Vitau sobre salud y bienestar',
    lang: 'es'
  }
  
  const { title, description, lang } = ghostSettings
  const url = data.site?.siteMetadata?.siteUrl || ''

  return (
    <Helmet>
      <html lang={lang} />
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:site_name" content={title} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:url" content={url} />
      <link
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.11.2/css/all.min.css"
        rel="stylesheet"
      />
    </Helmet>
  )
}

export default SiteMeta
