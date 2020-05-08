import React from 'react'
import { useStaticQuery, graphql } from 'gatsby'

import Layout from '../../components/layout/Layout'
import PostPreview from '../../components/postPreview/PostPreview'

import './category.scss'

const Category = ({ data, location }) => {
  const category = data.ghostTag
  const posts = data.allGhostPost.edges

  return (
    <Layout isWrapped>
      <h1 className="title title--display">{category.name}</h1>

      <h2 className="subtitle">{category.description}</h2>

      <div className="category-content">
        {posts.map(({ node }) => (
          <PostPreview post={node} key={node.id} />
        ))}
      </div>
    </Layout>
  )
}

export default Category

export const postQuery = graphql`
  query($slug: String!) {
    ghostTag(slug: { eq: $slug }) {
      name
      slug
      description
      count {
        posts
      }
    }
    allGhostPost(
      sort: { order: DESC, fields: published_at }
      filter: { primary_tag: { slug: { eq: $slug } } }
    ) {
      edges {
        node {
          id
          title
          primary_tag {
            name
          }
          slug
          feature_image
          reading_time
          published_at
        }
      }
    }
  }
`
