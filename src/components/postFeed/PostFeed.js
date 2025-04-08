import React from 'react'
import PostPreview from '../postPreview/PostPreview'
import './postFeed.scss'
import { samplePosts } from '../../data/samplePosts.js'

const PostFeed = ({ posts }) => {
  const displayPosts = posts.length > 0 ? posts : samplePosts.map(post => ({ node: post }));
  
  return (
    <section className="postFeed container">
      <h3 className="title title--big">Artículos más recientes</h3>

      <div className="postFeed-content">
        {displayPosts.map(({ node }) => (
          <PostPreview post={node} key={node.id} />
        ))}
      </div>
    </section>
  )
}

export default PostFeed
