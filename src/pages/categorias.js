import React from 'react'
import { useStaticQuery, graphql } from 'gatsby'

import Layout from '../components/layout/Layout'
import Hero from '../components/hero/Hero'
import CategoryPreview from '../components/categoryPreview/CategoryPreview'
import './categorias.scss'

const Categories = () => {
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

  const categories = data.allGhostTag.edges

  return (
    <Layout>
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
