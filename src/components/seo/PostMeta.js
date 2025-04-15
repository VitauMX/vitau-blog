import React from 'react'
import { graphql, useStaticQuery } from 'gatsby'
import { Helmet } from 'react-helmet'

const PostMeta = ({ post }) => {
  const data = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          siteUrl
        }
      }
    }
  `)

  const {
    title,
    meta_title,
    meta_description,
    slug,
    excerpt,
    feature_image,
  } = post
  const { siteUrl } = data.site.siteMetadata

  const canonical = `${siteUrl}/${slug}`

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={meta_description || excerpt} />
      <link rel="canonical" href={canonical} />
      <meta property="og:site_name" content={meta_title || title} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={meta_title || title} />
      <meta property="og:description" content={meta_description || excerpt} />
      <meta property="og:url" content={canonical} />
      <meta name="twitter:title" content={meta_title || title} />
      <meta name="twitter:description" content={meta_description || excerpt} />
      <meta name="twitter:url" content={canonical} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:image" content={feature_image} />
      <meta property="og:image" content={feature_image} />
    </Helmet>
  )
}

export default PostMeta
