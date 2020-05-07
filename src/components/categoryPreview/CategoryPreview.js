import React from 'react'
import { Link } from 'gatsby'

import './categoryPreview.scss'

const CategoryPreview = ({ category }) => {
  const styles = { backgroundImage: 'url(' + category.feature_image + ')' }
  const article = category.count.posts > 1 ? 'artículos' : 'artículo'

  return (
    <Link to={`/${category.slug}`} className="categoryPreview" style={styles}>
      <h2 className="title">{category.name}</h2>
      <p className="text">
        {category.count.posts} {article}
      </p>
    </Link>
  )
}

export default CategoryPreview
