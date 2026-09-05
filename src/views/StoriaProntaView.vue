<template>
  <div class="storia-pronta">
    <h1>✨ La tua storia è pronta! ✨</h1>
    <p class="subtitle">Ecco la storia speciale che abbiamo creato per {{ storyDraft.characterName }}.</p>

    <div class="book-spread">
      <div class="book-page image-page">
        <img v-if="storyDraft.imageBase64" :src="storyDraft.imageBase64" alt="" />
      </div>
      <div class="book-page text-page">
        <h2>{{ storyDraft.titolo }}</h2>
        <p>{{ storyDraft.testo }}</p>
      </div>
    </div>

    <div class="actions">
      <button class="secondary-btn" @click="rigenera">↻ Rigenera la storia</button>
      <button class="primary-btn" @click="vaiArchivio">Vai all'Archivio</button>
    </div>
    <p class="footer-hint">🔒 La tua storia è al sicuro e sempre disponibile per te.</p>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { storyDraft } from '../store'

const router = useRouter()

function rigenera() {
  router.push('/generazione')
}
function vaiArchivio() {
  router.push('/archivio')
}
</script>

<style scoped>
.storia-pronta {
  max-width: 900px;
  margin: 3rem auto;
  text-align: center;
  padding: 0 1.5rem;
}
h1 {
  font-size: 1.8rem;
  margin-bottom: 0.3rem;
}
.subtitle {
  color: #666;
  margin-bottom: 2rem;
}
.book-spread {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  text-align: left;
  margin-bottom: 2rem;
}
.book-page {
  background: white;
  border-radius: 16px;
  padding: 1.2rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  min-height: 280px;
}
.image-page {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  overflow: hidden;
}
.image-page img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.text-page h2 {
  color: #6c4fd6;
  font-size: 1.2rem;
}
.text-page p {
  color: #444;
  line-height: 1.6;
  font-size: 0.9rem;
}
.actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}
.secondary-btn {
  padding: 0.7rem 1.5rem;
  border-radius: 999px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
}
.primary-btn {
  padding: 0.7rem 1.5rem;
  border-radius: 999px;
  border: none;
  background: #6c4fd6;
  color: white;
  cursor: pointer;
  font-weight: 600;
}
.footer-hint {
  margin-top: 1rem;
  font-size: 0.8rem;
  color: #999;
}
@media (max-width: 700px) {
  .book-spread {
    grid-template-columns: 1fr;
  }
}
</style>