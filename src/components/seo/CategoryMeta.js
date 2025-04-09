import React from 'react'
import { graphql, useStaticQuery } from 'gatsby'
import { Helmet } from 'react-helmet'

const CategoryMeta = ({ category }) => {
  // Always call useStaticQuery unconditionally at the top level
  const data = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          siteUrl
        }
      }
    }
  `)

  // Handle case when category is undefined
  if (!category) return null;
  
  // Default values for missing data
  const name = category.name || 'Categoría';
  const slug = category.slug || '';
  const description = category.description || `Artículos de ${name} en el blog de Vitau`;
  const feature_image = category.feature_image;
  
  const siteUrl = data.site?.siteMetadata?.siteUrl || '';
  const canonical = `${siteUrl}/${slug}`;
  const title = `${name} | Vitau Blog`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      <meta property="og:type" content="website" />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:url" content={canonical} />
      <meta name="twitter:card" content="summary_large_image" />
      {feature_image && <meta name="twitter:image" content={feature_image} />}
      {feature_image && <meta property="og:image" content={feature_image} />}
    </Helmet>
  )
}

export default CategoryMeta
