<template>
  <div class="home">
    <section class="hero">
      <div class="hero-text">
        <span class="badge">✨ L'AI che trasforma i ricordi in storie</span>
        <h1>Storie uniche, <span class="highlight">nate dai ricordi</span></h1>
        <p>Racconta ciò che conta davvero. Noi lo trasformiamo in una storia indimenticabile per i tuoi bambini.</p>
        <RouterLink to="/crea" class="cta-button">
          Crea la tua prima storia
          <img :src="frecciaIcon" alt="" class="cta-arrow" />
        </RouterLink>
      </div>

      <div class="hero-image">
        <img :src="libroIllustrazione" alt="Libro illustrato con mongolfiera" class="hero-illustration" />
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
import frecciaIcon from '../assets/frecciabianca.svg'
</script>

<style scoped>
.home {
  max-width: 1300px;
  margin: 3rem auto 4rem;
  padding: 0 1.5rem;
}
.hero {
  display: grid;
  grid-template-columns: 0.9fr 1.1fr;
   align-items: flex-start;   /* era center */
  gap: 2rem;
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
  font-size: 2.5rem;   /* era 2.2rem */
  line-height: 1.2;
  margin: 0 0 0.8rem;
}
.highlight {
  color: #6c4fd6;
}
.hero-text p {
  color: #666;
  margin: 0 0 1.5rem;
  max-width: 420px;
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
.cta-arrow {
  height: 18px;
  width: auto;
}
.hero-image {
  display: flex;
  justify-content: center;
}
.hero-illustration {
  display: block;
  max-width: 100%;
  width: 1020px;
}
.steps h2 {
  text-align: center;
  font-size: 1.3rem;
  margin: 0 0 0.3rem;
}
.steps-subtitle {
  text-align: center;
  color: #666;
  margin: 0 0 1.5rem;   /* era 3rem */
  font-size: 0.9rem;
}
.steps-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.2rem;
}
.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.4rem;
}
.step-icon {
  height: 5.5rem;   /* era 3.5rem */
  width: 5.5rem;    /* era 3.5rem */
  object-fit: contain;
}
.step h3 {
  font-size: 0.95rem;
  margin: 0;
}
.step p {
  font-size: 0.8rem;
  color: #666;
  margin: 0;
}
@media (max-width: 800px) {
  .home {
    height: auto;
    overflow-y: auto;
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
  .steps-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>