import React from 'react'

import './hero.scss'

const Hero = () => {
  return (
    <section className="hero container">
      <div className="hero-bg">
        <div className="square square-yellow"></div>
        <div className="square square-blue"></div>
      </div>

      <h1 className="title title--display">
        Tu salud <br /> es nuestra prioridad
      </h1>

      <h2 className="subtitle">
        Salud, nutrición, hábitos, cuidado personal y más maneras de ser la
        mejor versión de nosotros mismos.
      </h2>
    </section>
  )
}

export default Hero
