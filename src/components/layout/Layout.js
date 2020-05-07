import React from 'react'
import { Helmet } from 'react-helmet'

// Styles
import 'normalize.css'
import '../../styles/styles.scss'
import './layout.scss'

import MainHeader from '../mainHeader/MainHeader'
import Footer from '../footer/Footer'

const Layout = ({ children }) => {
  return (
    <>
      <Helmet>
        <html lang="es" />
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.11.2/css/all.min.css"
          rel="stylesheet"
        />
      </Helmet>

      <MainHeader />

      <main className="main">{children}</main>

      <Footer />
    </>
  )
}

export default Layout
