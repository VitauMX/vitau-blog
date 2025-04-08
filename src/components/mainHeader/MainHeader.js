import React, { useState } from 'react'
import { Link, useStaticQuery, graphql } from 'gatsby'
import classNames from 'classnames'
import './mainHeader.scss'
import logo from '../../images/vitau-logo.svg'

const MainHeader = () => {
  const data = useStaticQuery(graphql`
    query {
      allGhostSettings {
        edges {
          node {
            navigation {
              label
              url
            }
          }
        }
      }
    }
  `)

  // Add fallback when Ghost data is not available
  const ghostSettings = data.allGhostSettings?.edges?.[0]?.node || {
    navigation: [
      { label: 'Inicio', url: '/' },
      { label: 'Categorías', url: '/categorias' }
    ]
  }

  const [isOpen, setIsOpen] = useState(false)

  const mainNavStyles = classNames('mainNav', {
    isOpen: isOpen === true,
  })

  return (
    <header className="mainHeader container">
      <Link to="/" className="mainHeader-logo">
        <img src={logo} alt="Vitau logo" />
      </Link>

      <nav className={mainNavStyles}>
        <div className="mainNav-content">
          {ghostSettings.navigation.map((navItem, i) => {
            if (navItem.url.match(/^\s?http(s?)/gi)) {
              return (
                <a
                  className="mainNav-link"
                  href={navItem.url}
                  key={i}
                  rel="noopener noreferrer"
                >
                  {navItem.label}
                </a>
              )
            } else {
              return (
                <Link
                  className="mainNav-link"
                  to={navItem.url}
                  key={i}
                  activeClassName="active"
                >
                  {navItem.label}
                </Link>
              )
            }
          })}

          <button
            className="toggleMobileNav toggleMobileNav--close"
            type="button"
            onClick={() => setIsOpen(false)}
          >
            <i className="fas fa-times" />
          </button>
        </div>
      </nav>

      <button
        className="toggleMobileNav"
        type="button"
        onClick={() => setIsOpen(true)}
      >
        <i className="fas fa-bars" />
      </button>
    </header>
  )
}

export default MainHeader
