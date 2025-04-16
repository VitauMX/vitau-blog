import React from 'react'
import { graphql, useStaticQuery } from 'gatsby'
import { Helmet } from 'react-helmet'

const CategoryMeta = ({ category }) => {
  const data = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          siteUrl
        }
      }
    }
  `)

  const { name, slug, description, feature_image } = category
  const { siteUrl } = data.site.siteMetadata
  const canonical = `${siteUrl}/${slug}`
  const title = `${name} | Vitau Blog`

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      {/* <meta property="og:site_name" content={title} /> */}
      <meta property="og:type" content="website" />
      {/* <meta property="og:title" content={title} /> */}
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      {/* <meta name="twitter:title" content={title} /> */}
      <meta name="twitter:description" content={description} />
      <meta name="twitter:url" content={canonical} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:image" content={feature_image} />
      <meta property="og:image" content={feature_image} />
    </Helmet>
  )
}

export default CategoryMeta
