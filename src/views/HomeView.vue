<template>
  <div class="home">
    <section class="hero">
      <span class="badge">✨ L'AI che trasforma i ricordi in storie</span>
      <h1>Storie uniche, <span class="highlight">nate dall'amore.</span></h1>
      <p>Racconta ciò che conta davvero. Noi lo trasformiamo in una storia indimenticabile per i tuoi bambini.</p>
      <RouterLink to="/crea" class="cta-button">Crea la tua prima storia →</RouterLink>
    </section>

    <section class="steps">
      <h2>Come nasce una storia Narrà</h2>
      <p class="steps-subtitle">In pochi semplici passi, creiamo insieme qualcosa di magico.</p>

      <div class="steps-grid">
        <div class="step">
          <span class="step-icon">📷</span>
          <h3>Condividi un ricordo</h3>
          <p>Carica una foto, un disegno o racconta un momento speciale.</p>
        </div>
        <div class="step">
          <span class="step-icon">✨</span>
          <h3>L'AI crea la storia</h3>
          <p>La nostra AI trasforma il ricordo in una storia unica.</p>
        </div>
        <div class="step">
          <span class="step-icon">📖</span>
          <h3>Leggi e emozionati</h3>
          <p>Scopri la storia illustrata, da leggere insieme ai bambini.</p>
        </div>
        <div class="step">
          <span class="step-icon">❤️</span>
          <h3>Conserva per sempre</h3>
          <p>Salva la storia nella tua libreria e rivivila quando vuoi.</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.hero {
  text-align: center;
  max-width: 600px;
  margin: 4rem auto;
  padding: 0 1rem;
}
.badge {
  display: inline-block;
  background: #f3effc;
  color: #6c4fd6;
  padding: 0.4rem 1rem;
  border-radius: 999px;
  font-size: 0.85rem;
  margin-bottom: 1.5rem;
}
h1 {
  font-size: 2.5rem;
  line-height: 1.2;
  margin-bottom: 1rem;
}
.highlight {
  color: #6c4fd6;
}
.hero p {
  color: #666;
  margin-bottom: 2rem;
}
.cta-button {
  display: inline-block;
  background: #6c4fd6;
  color: white;
  text-decoration: none;
  padding: 0.9rem 1.8rem;
  border-radius: 999px;
  font-weight: 600;
}
.steps {
  text-align: center;
  max-width: 900px;
  margin: 5rem auto;
  padding: 0 1rem;
}
.steps h2 {
  font-size: 1.6rem;
  margin-bottom: 0.5rem;
}
.steps-subtitle {
  color: #666;
  margin-bottom: 2.5rem;
}
.steps-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}
.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}
.step-icon {
  font-size: 1.8rem;
  background: #f3effc;
  border-radius: 50%;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.step h3 {
  font-size: 1rem;
  margin: 0;
}
.step p {
  font-size: 0.85rem;
  color: #666;
  margin: 0;
}
@media (max-width: 700px) {
  .steps-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>