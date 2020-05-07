import React from 'react'
import dayjs from 'dayjs'
import 'dayjs/locale/es'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import { Link } from 'gatsby'

import './postPreview.scss'

const PostPreview = ({ post }) => {
  dayjs.extend(localizedFormat)

  const publishedAt = dayjs(post.published_at).locale('es').format('LL', 'es')
  const minute = post.reading_time > 1 ? 'minutos' : 'minuto'

  const styles = { backgroundImage: 'url(' + post.feature_image + ')' }

  return (
    <Link className="postPreview" to={`/${post.slug}`}>
      <article className="postPreview-content" style={styles}>
        {post.primary_tag && (
          <div className="postPreview-category">{post.primary_tag.name}</div>
        )}

        <h4 className="postPreview-title">{post.title}</h4>

        <div className="postPreview-meta">
          {publishedAt} | {post.reading_time} {minute}
        </div>
      </article>
    </Link>
  )
}

export default PostPreview
