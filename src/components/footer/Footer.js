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
            Gral. Pablo González Garza #620,
            Chepevera , Monterrey N.L. 64030
          </p>
        </div>

        <div className="footer-contact">
          <SocialMedia isWhite />

          <span className="footer-subtitle">Llámanos</span>

          <a
            className="footer-tel"
            href="https://wa.me/8001200399?text=Estoy%20interesado,%20me%20podrían%20dar%20más%20información"
          >
            (800) 120 0399
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
