import React from 'react'
import { useStaticQuery, graphql } from 'gatsby'

import Layout from '../components/layout/Layout'
import Hero from '../components/hero/Hero'
import CategoryPreview from '../components/categoryPreview/CategoryPreview'
import './categorias.scss'
import { Helmet } from 'react-helmet'
import { sampleCategories } from '../data/samplePosts.js'

const Categories = () => {
  // Always call useStaticQuery unconditionally at the top level
  const data = useStaticQuery(graphql`
    query {
      allGhostTag(sort: { order: ASC, fields: name }) {
        edges {
          node {
            id
            name
            slug
            feature_image
            count {
              posts
            }
          }
        }
      }
    }
  `)

  // Safely access API data with fallback to empty array
  const apiCategories = data.allGhostTag?.edges || []
  
  // Use sample categories if no categories are available from the API
  const categories = apiCategories.length > 0 ? apiCategories : sampleCategories.map(cat => ({ node: cat }))

  return (
    <Layout>
      <Helmet>
        <title>Categorías | Vitau Blog</title>
      </Helmet>

      <Hero />

      <section className="categories container">
        <h1 className="title title--big">Categorías</h1>

        <div className="categories-content">
          {categories.map(({ node }) => (
            <CategoryPreview category={node} key={node.id} />
          ))}
        </div>
      </section>
    </Layout>
  )
}

export default Categories
