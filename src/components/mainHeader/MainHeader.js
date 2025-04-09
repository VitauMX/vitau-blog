import React, { useState } from 'react'
import { Link, useStaticQuery, graphql } from 'gatsby'
import classNames from 'classnames'
import './mainHeader.scss'
import logo from '../../images/vitau-logo.svg'

const MainHeader = () => {
  // Always call useStaticQuery unconditionally at the top level
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

  // Ensure we have local paths for internal navigation regardless of Ghost CMS settings
  const localNavigation = [
    { label: 'Inicio', url: '/' },
    { label: 'Categorías', url: '/categorias' },
    { label: 'Farmacia', url: 'https://vitau.mx/?resultado=' }
  ];

  // Either use the local navigation or process/clean the Ghost navigation
  const ghostNavigation = data.allGhostSettings?.edges?.[0]?.node?.navigation || localNavigation;
  
  // Process navigation to ensure Categorías always points to the internal page
  // and Farmacia points to the correct external URL
  const processedNavigation = ghostNavigation.map(item => {
    // Ensure Categorías always points to the internal page
    if (item.label === 'Categorías') {
      return { ...item, url: '/categorias' };
    }
    // Ensure Farmacia always points to the correct URL
    if (item.label === 'Farmacia') {
      return { ...item, url: 'https://vitau.mx/?resultado=' };
    }
    return item;
  });

  const ghostSettings = {
    navigation: processedNavigation
  };

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
            if (navItem.label === 'Farmacia') {
              return (
                <a
                  className="mainNav-link"
                  href={navItem.url}
                  key={i}
                  target="_blank"
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
            aria-label="Cerrar menú"
          >
            <i className="fas fa-times" />
          </button>
        </div>
      </nav>

      <button
        className="toggleMobileNav"
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Abrir menú"
      >
        <i className="fas fa-bars" />
      </button>
    </header>
  )
}

export default MainHeader
