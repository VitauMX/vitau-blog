import React from 'react'
import { graphql } from 'gatsby'

import Layout from '../../components/layout/Layout'
import './post.scss'

const Post = ({ data, location }) => {
  const post = data.ghostPost

  return (
    <Layout>
      <h1 className="title title--displayBig">{post.title}</h1>
    </Layout>
  )
}

export default Post

export const postQuery = graphql`
  query($slug: String!) {
    ghostPost(slug: { eq: $slug }) {
      id
      title
      html
    }
  }
`
