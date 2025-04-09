import React from 'react'
import { Link } from 'gatsby'

import './categoryPreview.scss'

const CategoryPreview = ({ category }) => {
  if (!category) return null;
  
  const styles = category.feature_image ? { backgroundImage: `url(${category.feature_image})` } : {}
  const postCount = category.count?.posts || 0
  const article = postCount > 1 ? 'artículos' : 'artículo'

  return (
    <Link to={`/${category.slug}`} className="categoryPreview" style={styles}>
      <h2 className="title">{category.name}</h2>
      <p className="text">
        {postCount} {article}
      </p>
    </Link>
  )
}

export default CategoryPreview
