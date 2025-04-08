import React from 'react'
import dayjs from 'dayjs'
import 'dayjs/locale/es'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import { Link } from 'gatsby'

import './postPreview.scss'

const PostPreview = ({ post }) => {
  // Handle cases where post data might be incomplete
  if (!post) return null;
  
  dayjs.extend(localizedFormat)

  const publishedAt = post.published_at ? dayjs(post.published_at).locale('es').format('LL', 'es') : ''
  const readingTime = post.reading_time || 0
  const minute = readingTime > 1 ? 'minutos' : 'minuto'

  const styles = post.feature_image ? { backgroundImage: `url(${post.feature_image})` } : {}

  return (
    <Link className="postPreview" to={`/${post.slug}`}>
      <article className="postPreview-content" style={styles}>
        {post.primary_tag && (
          <div className="postPreview-category">{post.primary_tag.name}</div>
        )}

        <h4 className="postPreview-title">{post.title || 'Sin título'}</h4>

        <div className="postPreview-meta">
          {publishedAt} | {readingTime} {minute}
        </div>
      </article>
    </Link>
  )
}

export default PostPreview
