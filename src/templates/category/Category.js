import React from 'react'
import { graphql } from 'gatsby'

import Layout from '../../components/layout/Layout'
import PostPreview from '../../components/postPreview/PostPreview'
import CategoryMeta from '../../components/seo/CategoryMeta'

import './category.scss'

const Category = ({ data, pageContext }) => {
  const category = pageContext.sampleCategory || (data && data.ghostTag) || {};
  
  const apiPosts = data && data.allGhostPost ? data.allGhostPost.edges : [];
  const posts = pageContext.sampleCategoryPosts && pageContext.sampleCategoryPosts.length > 0
    ? pageContext.sampleCategoryPosts
    : apiPosts;

  return (
    <Layout isWrapped>
      <CategoryMeta category={category} />

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
      feature_image
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
