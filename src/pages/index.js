import React from 'react'
import { useStaticQuery, graphql } from 'gatsby'

import Layout from '../components/layout/Layout'
import Hero from '../components/hero/Hero'
import PostFeed from '../components/postFeed/PostFeed'
// import SEO from '../components/seo'

const IndexPage = () => {
  const data = useStaticQuery(graphql`
    query {
      allGhostPost(sort: { order: DESC, fields: published_at }) {
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
            created_at
          }
        }
      }
    }
  `)

  const posts = data.allGhostPost.edges

  return (
    <Layout>
      <Hero />

      <PostFeed posts={posts} />

      {/* <Pagination pageContext={pageContext} /> */}
    </Layout>
  )
}

export default IndexPage
