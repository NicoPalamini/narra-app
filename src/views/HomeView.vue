<template>
  <div class="home">
    <section class="hero">
      <div class="hero-text">
        <span class="badge">✨ L'AI che trasforma i ricordi in storie</span>
        <h1>Il suo giocattolo preferito<br /><span class="highlight">diventa il protagonista.</span></h1>
        <p>Carica una foto del suo peluche, bambola o giocattolo del cuore: in pochi secondi diventa il personaggio di una breve storia illustrata, pronta da leggere insieme prima della nanna.</p>
        <RouterLink to="/crea" class="cta-button">
          Crea la tua prima storia
          <svg class="cta-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </RouterLink>
      </div>

      <div class="hero-image">
        <div class="hero-magic">
          <span class="hero-glow"></span>
          <span class="hero-sparkle hs-1">✦</span>
          <span class="hero-sparkle hs-2">✧</span>
          <span class="hero-sparkle hs-3">⋆</span>
          <span class="hero-sparkle hs-4">✩</span>
          <span class="hero-sparkle hs-5">✦</span>
          <span class="hero-sparkle hs-6">✧</span>
          <img :src="libroIllustrazione" alt="Libro illustrato con mongolfiera" class="hero-illustration" />
        </div>
      </div>
    </section>

    <section class="steps">
      <h2>Come nasce una storia Narrà</h2>
      <p class="steps-subtitle">In pochi semplici passi, creiamo insieme qualcosa di magico.</p>

      <div class="steps-grid">
        <div class="step">
          <img :src="iconaFoto" alt="" class="step-icon" />
          <h3>Condividi un ricordo</h3>
          <p>Carica una foto, un disegno o racconta un momento speciale.</p>
        </div>
        <div class="step">
          <img :src="iconaBacchetta" alt="" class="step-icon" />
          <h3>L'AI crea la storia</h3>
          <p>La nostra AI trasforma il ricordo in una storia unica.</p>
        </div>
        <div class="step">
          <img :src="iconaLibro" alt="" class="step-icon" />
          <h3>Leggi e emozionati</h3>
          <p>Scopri la storia illustrata, da leggere insieme ai bambini.</p>
        </div>
        <div class="step">
          <img :src="iconaArchivio" alt="" class="step-icon" />
          <h3>Conserva per sempre</h3>
          <p>Salva la storia nella tua libreria e rivivila quando vuoi.</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import libroIllustrazione from '../assets/librohome.png'
import iconaFoto from '../assets/iconafoto.png'
import iconaBacchetta from '../assets/iconabacchetta.png'
import iconaLibro from '../assets/iconalibro.png'
import iconaArchivio from '../assets/iconaarchivio.png'
</script>

<style scoped>
.home {
  max-width: 1300px;
  margin: 0 auto;
  padding: 1.2rem 2rem 1.2rem;
  height: calc(100vh - 72px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 2.2rem;
  box-sizing: border-box;
}
.hero {
  display: grid;
  grid-template-columns: 1fr 1.1fr;
  align-items: center;
  gap: 1rem;
  margin-top: 2.5rem;
}
.hero-text {
  text-align: left;
}
.badge {
  display: inline-block;
  background: #f3effc;
  color: #6c4fd6;
  padding: 0.4rem 1rem;
  border-radius: 999px;
  font-size: 0.8rem;
  margin-bottom: 1rem;
}
h1 {
  font-size: 2.35rem;
  line-height: 1.2;
  margin: 0 0 0.9rem;
}
.highlight {
  color: #6c4fd6;
}
.hero-text p {
  color: #666;
  margin: 0 0 1.4rem;
  max-width: 440px;
  font-size: 0.95rem;
}
.cta-button {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  background: #6c4fd6;
  color: white;
  text-decoration: none;
  padding: 0.8rem 1.6rem;
  border-radius: 999px;
  font-weight: 600;
}

/* Freccia disegnata a mano invece dell'SVG esterno, con tratto
   spesso (stroke-width 3) e colore ereditato dal testo del pulsante */
.cta-arrow {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}
.hero-image {
  display: flex;
  justify-content: center;
}

.hero-magic {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
}

.hero-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 85%;
  height: 85%;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle, rgba(198, 158, 240, 0.35) 0%, rgba(243, 198, 214, 0.22) 45%, rgba(245, 199, 110, 0) 75%);
  filter: blur(30px);
  animation: hero-glow-pulse 6s ease-in-out infinite;
  z-index: 0;
}
@keyframes hero-glow-pulse {
  0%, 100% { transform: translate(-50%, -50%) scale(0.95); opacity: 0.85; }
  50% { transform: translate(-50%, -50%) scale(1.05); opacity: 1; }
}

.hero-sparkle {
  position: absolute;
  z-index: 1;
  opacity: 0;
  pointer-events: none;
  animation: hero-sparkle-twinkle 3.4s ease-in-out infinite;
}
.hs-1 { top: 2%; left: 4%; font-size: 1.4rem; color: #f5c76e; animation-delay: 0s; }
.hs-2 { top: 8%; right: 4%; font-size: 1.1rem; color: #c9527a; animation-delay: 0.7s; }
.hs-3 { bottom: 14%; left: 0%; font-size: 1.6rem; color: #6c4fd6; animation-delay: 1.4s; }
.hs-4 { bottom: 6%; right: 2%; font-size: 1.2rem; color: #3a9188; animation-delay: 2.1s; }
.hs-5 { top: 45%; left: -2%; font-size: 1rem; color: #f5c76e; animation-delay: 2.8s; }
.hs-6 { top: 40%; right: -1%; font-size: 1.3rem; color: #c9a6f0; animation-delay: 1.9s; }
@keyframes hero-sparkle-twinkle {
  0%, 100% { opacity: 0; transform: scale(0.5) rotate(0deg); }
  50% { opacity: 1; transform: scale(1.2) rotate(20deg); }
}

.hero-illustration {
  position: relative;
  z-index: 2;
  display: block;
  width: 100%;
  max-width: 100%;
  height: auto;
  max-height: 48vh;
  object-fit: contain;
  margin: 0 auto;
  animation: hero-float 5s ease-in-out infinite;
}
@keyframes hero-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.steps h2 {
  text-align: center;
  font-size: 1.2rem;
  margin: 0 0 0.3rem;
}
.steps-subtitle {
  text-align: center;
  color: #666;
  margin: 0 0 2rem;
  font-size: 0.88rem;
}
.steps-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.4rem;
}
.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.35rem;
}
.step-icon {
  height: 4rem;
  width: 4rem;
  object-fit: contain;
}
.step h3 {
  font-size: 0.9rem;
  margin: 0;
}
.step p {
  font-size: 0.78rem;
  color: #666;
  margin: 0;
}
@media (max-width: 800px) {
  .home {
    height: auto;
    overflow-y: auto;
    justify-content: flex-start;
    padding: 1.5rem;
  }
  .hero {
    grid-template-columns: 1fr;
    text-align: center;
  }
  .hero-text {
    text-align: center;
  }
  .hero-text p {
    margin-left: auto;
    margin-right: auto;
  }
  .hero-illustration {
    max-height: none;
  }
  .steps-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>