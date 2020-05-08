import React from 'react'
import dayjs from 'dayjs'
import 'dayjs/locale/es'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import { graphql, Link } from 'gatsby'

import Layout from '../../components/layout/Layout'
import './post.scss'

const Post = ({ data, location }) => {
  dayjs.extend(localizedFormat)

  const post = data.ghostPost
  const publishedAt = dayjs(post.published_at).locale('es').format('LL', 'es')
  const minute = post.reading_time > 1 ? 'minutos' : 'minuto'

  return (
    <Layout>
      <article className="post container">
        <Link to={post.primary_tag.slug} className="post-category">
          {post.primary_tag.name}
        </Link>

        <h1 className="title title--displayBig">{post.title}</h1>

        <p className="post-meta">
          {publishedAt} | {post.reading_time} {minute}
        </p>

        {post.feature_image && (
          <figure className="post-featureImage">
            <img src={post.feature_image} alt={post.title} />
          </figure>
        )}

        <section
          className="post-content load-external-scripts"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />
      </article>
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
      feature_image
      published_at
      reading_time
      primary_tag {
        name
        slug
      }
    }
  }
`
