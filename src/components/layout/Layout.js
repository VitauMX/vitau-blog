import React from 'react'
import classNames from 'classnames'

// Styles
import 'normalize.css'
import '../../styles/styles.scss'
import './layout.scss'

import SiteMeta from '../seo/SiteMeta'
import MainHeader from '../mainHeader/MainHeader'
import Footer from '../footer/Footer'

const Layout = ({ children, isWrapped }) => {
  const styles = classNames('main', {
    container: isWrapped === true,
  })

  return (
    <>
      <SiteMeta />

      <MainHeader />

      <main className={styles}>{children}</main>

      <Footer />
    </>
  )
}

export default Layout
