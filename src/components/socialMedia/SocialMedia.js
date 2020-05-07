import React from 'react'
import classNames from 'classnames'
import './socialMedia.scss'

const SocialMedia = (props) => {
  const { isWhite } = props

  const styles = classNames('socialMedia', {
    'socialMedia--isWhite': isWhite === true,
  })

  return (
    <div className={styles}>
      <a
        className="socialMedia-icon"
        target="_blank"
        rel="noopener noreferrer"
        href="https://facebook.com/vitau.mx"
      >
        <i className="fab fa-facebook-square" />
      </a>

      <a
        className="socialMedia-icon"
        target="_blank"
        rel="noopener noreferrer"
        href="https://instagram.com/vitau.mx"
      >
        <i className="fab fa-instagram"></i>
      </a>
    </div>
  )
}

export default SocialMedia
