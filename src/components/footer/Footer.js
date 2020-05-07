import React from 'react'
import { Link } from 'gatsby'

import SocialMedia from '../socialMedia/SocialMedia'
import './footer.scss'
import logo from '../../images/vitau-logo-white.svg'

const Footer = () => {
  const today = new Date()
  const year = today.getFullYear()

  return (
    <footer className="footer container">
      <div className="footer-info">
        <div className="footer-brand">
          <Link className="footer-logo" to="/">
            <img src={logo} alt="Vitau" />
          </Link>

          <p className="footer-direction">
            Av. de la Industria 300, Punto Central Local PB C-11, CP 66279, San
            Pedro Garza García, N.L.
          </p>
        </div>

        <div className="footer-contact">
          <SocialMedia isWhite />

          <span className="footer-subtitle">Llámanos</span>

          <a
            className="footer-tel"
            href="https://wa.me/525550180585?text=Estoy%20interesado,%20me%20podrían%20dar%20más%20información"
          >
            (55) 5018 0585
          </a>
        </div>
      </div>

      <div className="footer-legals">
        <p>© {year} Vitau. Todos los derechos reservados.</p>

        <a href="https://vitau.mx/terminos-y-condiciones" className="link">
          Términos y condiciones
        </a>

        <a href="https://vitau.mx/aviso-de-privacidad" className="link">
          Aviso de privacidad
        </a>
      </div>
    </footer>
  )
}

export default Footer
