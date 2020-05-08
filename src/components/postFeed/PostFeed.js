import React from 'react'
import PostPreview from '../postPreview/PostPreview'
import './postFeed.scss'

const PostFeed = ({ posts }) => {
  return (
    <section className="postFeed container">
      <h3 className="title title--big">Artículos más recientes</h3>

      <div className="postFeed-content">
        {posts.map(({ node }) => (
          <PostPreview post={node} key={node.id} />
        ))}
      </div>
    </section>
  )
}

export default PostFeed
