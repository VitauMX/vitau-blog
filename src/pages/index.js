import React from 'react'
import { useStaticQuery, graphql } from 'gatsby'

import Layout from '../components/layout/Layout'
import Hero from '../components/hero/Hero'
import PostFeed from '../components/postFeed/PostFeed'

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
            published_at
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
    </Layout>
  )
}

export default IndexPage
