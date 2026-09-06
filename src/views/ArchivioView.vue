<template>
  <div class="archivio">
    <div class="page-header">
      <h1>La bacheca <span class="highlight">delle storie.</span></h1>
      <p class="subtitle">Tutte le storie create dalla community.</p>
    </div>

    <div class="corkboard">
      <img :src="bachecaImg" alt="" class="corkboard-bg" />

      <div class="corkboard-content">
        <p v-if="loading" class="empty-msg">Caricamento...</p>
        <p v-else-if="visibleStories.length === 0" class="empty-msg">
          Ancora nessuna storia qui. <RouterLink to="/crea">Creane una tu per primo →</RouterLink>
        </p>

        <div v-else class="stories-grid">
          <button
            v-for="(story, index) in visibleStories"
            :key="story.id"
            class="story-card"
            :style="cardStyle(index)"
            @click="openPreview(story)"
          >
            <span class="tape" :style="tapeStyle(index)"></span>
            <img v-if="story.illustrazioneBase64" :src="story.illustrazioneBase64" alt="" class="story-photo" />
            <p class="story-title">{{ story.titolo }}</p>
            <p class="story-date">{{ formatDate(story.createdAt) }}</p>
          </button>
        </div>
      </div>
    </div>

    <div v-if="selectedStory" class="overlay" @click.self="selectedStory = null">
      <div class="preview-card">
        <div class="notebook-rings">
          <span v-for="n in 7" :key="n" class="ring"></span>
        </div>
        <button class="close-btn" @click="selectedStory = null">✕</button>

        <div class="preview-scroll">
          <div class="photo-wrap">
            <span class="preview-tape" :style="previewTapeStyle"></span>
            <img v-if="selectedStory.illustrazioneBase64" :src="selectedStory.illustrazioneBase64" alt="" class="preview-photo" />
          </div>

          <h2>{{ selectedStory.titolo }}</h2>
          <p class="preview-date">{{ formatDate(selectedStory.createdAt) }}</p>
          <p class="preview-excerpt">{{ shortExcerpt(selectedStory.testo) }}</p>

          <button class="read-btn" @click="leggiStoria(selectedStory.id)">Leggi la storia →</button>
          <button
            v-if="currentUserId && selectedStory.userId === currentUserId"
            class="delete-btn"
            @click="eliminaStoria(selectedStory.id)"
          >
            🗑 Non mi piace, elimina
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { db, auth } from '../firebase'
import bachecaImg from '../assets/bacheca.png'

const router = useRouter()

const allStories = ref([])
const visibleStories = ref([])
const loading = ref(true)
const currentUserId = ref(null)
const selectedStory = ref(null)
const previewTapeStyle = ref({})
const isMobile = ref(window.innerWidth <= 600)

let unsubscribeSnapshot = null
let unsubscribeAuth = null
let rotationInterval = null

const tapeColors = ['#f3c6d6', '#c9e4de', '#fbe4a0', '#d6c9f3']

function tapeStyle(index) {
  const color = tapeColors[index % tapeColors.length]
  const rotation = (index % 2 === 0 ? -1 : 1) * (4 + (index % 3) * 2)
  return { background: color, transform: `translateX(-50%) rotate(${rotation}deg)` }
}

const cardRotations = [-6, 4, -8, 3, -3, 7, -5, 2, -7, 5, -4, 6]
const cardOffsetsY = [-5, 6, -3, 8, -6, 3, -7, 5, -4, 7, -2, 4]

function cardStyle(index) {
  const rot = cardRotations[index % cardRotations.length]
  const dy = cardOffsetsY[index % cardOffsetsY.length]
  return {
    transform: `rotate(${rot}deg) translateY(${dy}px)`,
    zIndex: (index % 5) + 1,
  }
}

function randomTapeStyle() {
  const color = tapeColors[Math.floor(Math.random() * tapeColors.length)]
  const rotation = (Math.random() > 0.5 ? 1 : -1) * (4 + Math.random() * 8)
  return { background: color, transform: `translateX(-50%) rotate(${rotation}deg)` }
}

function openPreview(story) {
  selectedStory.value = story
  previewTapeStyle.value = randomTapeStyle()
}

function formatDate(timestamp) {
  if (!timestamp || !timestamp.toDate) return ''
  return timestamp.toDate().toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
}

function shortExcerpt(testo) {
  if (!testo) return ''
  const pulito = testo.replace(/\*\*(.+?)\*\*/g, '$1').replace(/~~(.+?)~~/g, '$1')
  const match = pulito.match(/^.*?[.!?](?=\s|$)/)
  if (match) return match[0].trim()
  const maxLen = 90
  if (pulito.length <= maxLen) return pulito
  const tagliato = pulito.slice(0, maxLen)
  const ultimoSpazio = tagliato.lastIndexOf(' ')
  return tagliato.slice(0, ultimoSpazio > 0 ? ultimoSpazio : maxLen) + '…'
}

// Su mobile mostriamo 4 storie (2+2), su desktop 12 (due file da 6)
function pickVisibleStories() {
  const limit = isMobile.value ? 4 : 12
  if (allStories.value.length <= limit) {
    visibleStories.value = allStories.value
  } else {
    const shuffled = [...allStories.value].sort(() => Math.random() - 0.5)
    visibleStories.value = shuffled.slice(0, limit)
  }
}

// Riavvia il timer di rotazione con la durata giusta per la modalità attuale
// (5s su mobile, 10s su desktop)
function startRotation() {
  if (rotationInterval) clearInterval(rotationInterval)
  const intervalMs = isMobile.value ? 5000 : 10000
  rotationInterval = setInterval(() => {
    pickVisibleStories()
  }, intervalMs)
}

function handleResize() {
  const wasMobile = isMobile.value
  isMobile.value = window.innerWidth <= 600
  if (isMobile.value !== wasMobile) {
    pickVisibleStories()
    startRotation()
  }
}

function startListening() {
  const q = query(collection(db, 'storie'), orderBy('createdAt', 'desc'))
  unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
    allStories.value = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
    pickVisibleStories()
    loading.value = false
  })
}

onMounted(() => {
  unsubscribeAuth = onAuthStateChanged(auth, (user) => {
    currentUserId.value = user ? user.uid : null
  })

  startListening()
  startRotation()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (unsubscribeSnapshot) unsubscribeSnapshot()
  if (unsubscribeAuth) unsubscribeAuth()
  if (rotationInterval) clearInterval(rotationInterval)
  window.removeEventListener('resize', handleResize)
})

function leggiStoria(id) {
  selectedStory.value = null
  router.push(`/storia/${id}`)
}

async function eliminaStoria(id) {
  const conferma = window.confirm('Vuoi eliminare per sempre questa storia? Non si può annullare.')
  if (!conferma) return
  try {
    await deleteDoc(doc(db, 'storie', id))
    selectedStory.value = null
  } catch (err) {
    console.error('Errore durante l\'eliminazione:', err)
    alert('Non siamo riusciti a eliminare la storia. Riprova.')
  }
}
</script>

<style scoped>
.archivio {
  max-width: 1450px;
  margin: 2rem auto 4rem;
  padding: 0 1.5rem;
}
.page-header {
  margin-bottom: 1.5rem;
  text-align: center;
}
h1 {
  font-size: 1.8rem;
  margin: 0 0 0.3rem;
}
.highlight {
  color: #6c4fd6;
}
.subtitle {
  color: #666;
  margin: 0;
}
.corkboard {
  position: relative;
}
.corkboard-bg {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 20px;
}
.corkboard-content {
  position: absolute;
  inset: 0;
  padding: 3rem;
  overflow-y: auto;
}
.empty-msg {
  text-align: center;
  color: white;
  font-size: 0.95rem;
  padding: 3rem 0;
}
.empty-msg a {
  color: white;
  font-weight: 700;
  text-decoration: underline;
}
.stories-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 28px 14px;
  padding: 16px 8px;
}
.story-card {
  position: relative;
  background: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 0.5rem 0.7rem;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.22);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.story-card:hover {
  transform: rotate(0deg) translateY(0) scale(1.08) !important;
  z-index: 60 !important;
  box-shadow: 0 12px 26px rgba(0, 0, 0, 0.3);
}
.tape {
  position: absolute;
  top: -8px;
  left: 50%;
  width: 36px;
  height: 14px;
  opacity: 0.85;
}
.story-photo {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 3px;
  display: block;
  margin-bottom: 0.4rem;
}
.story-title {
  font-size: 0.72rem;
  font-weight: 600;
  margin: 0;
  color: #333;
}
.story-date {
  font-size: 0.63rem;
  color: #999;
  margin: 0.2rem 0 0;
}
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2.5rem 1.5rem 1.5rem;
}

.preview-card {
  position: relative;
  background: #fdfaf5;
  border-radius: 6px 22px 22px 22px;
  max-width: 440px;
  width: 100%;
  max-height: 85vh;
  transform: rotate(-1deg);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
}

.preview-scroll {
  overflow-y: auto;
  padding: 2.2rem 2rem 1.8rem;
  text-align: center;
  border-radius: inherit;
}

.notebook-rings {
  position: absolute;
  bottom: 100%;
  margin-bottom: -13px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-evenly;
  padding: 0 1.6rem;
  pointer-events: none;
  z-index: 3;
}
.ring {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: linear-gradient(135deg, #b8a0ec, #8a6ae8);
  border: 4px solid #fdfaf5;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.4);
}
.close-btn {
  position: absolute;
  top: 0.8rem;
  right: 0.8rem;
  border: none;
  background: #f3f3f3;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 0.9rem;
  z-index: 4;
}
.photo-wrap {
  position: relative;
  width: 68%;
  margin: 0 auto 1rem;
}
.preview-tape {
  position: absolute;
  top: -10px;
  width: 46px;
  height: 18px;
  opacity: 0.9;
  z-index: 2;
}
.preview-photo {
  display: block;
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 10px;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.18);
}
.preview-card h2 {
  color: #6c4fd6;
  font-size: 1.25rem;
  margin: 0 0 0.2rem;
}
.preview-date {
  color: #999;
  font-size: 0.8rem;
  margin: 0 0 0.9rem;
}
.preview-excerpt {
  color: #444;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 1.3rem;
}
.read-btn {
  background: #6c4fd6;
  color: white;
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
  display: block;
  width: 100%;
}
.delete-btn {
  margin-top: 0.7rem;
  background: none;
  border: none;
  color: #b5563a;
  font-size: 0.8rem;
  cursor: pointer;
  text-decoration: underline;
}
@media (max-width: 1000px) {
  .stories-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Mobile: niente immagine della bacheca, sfondo neutro al suo posto,
   griglia 2x2 e testo scuro (prima era bianco, pensato per stare
   sopra l'immagine scura del sughero) */
@media (max-width: 600px) {
  .corkboard-bg {
    display: none;
  }
  .corkboard {
    background: #f3ecfd;
    border-radius: 20px;
    border: 1px solid #e4d9f7;
  }
  .corkboard-content {
    position: static;
    padding: 1.2rem;
  }
  .empty-msg {
    color: #666;
  }
  .empty-msg a {
    color: #6c4fd6;
  }
  .stories-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px 12px;
    padding: 4px;
  }
}
</style>