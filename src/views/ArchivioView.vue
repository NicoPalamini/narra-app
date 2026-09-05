<template>
  <div class="archivio">
    <div class="page-header">
      <h1>La tua bacheca <span class="highlight">di ricordi.</span></h1>
      <p class="subtitle">Tutte le storie che hai creato, appuntate qui per te.</p>
    </div>

    <div class="corkboard">
      <img :src="bachecaImg" alt="" class="corkboard-bg" />

      <div class="corkboard-content">
        <p v-if="loading" class="empty-msg">Caricamento...</p>
        <p v-else-if="!isLoggedIn" class="empty-msg">Accedi con Google per vedere le tue storie.</p>
        <p v-else-if="visibleStories.length === 0" class="empty-msg">
          Non hai ancora creato nessuna storia. <RouterLink to="/crea">Creane una ora →</RouterLink>
        </p>

        <div v-else class="stories-grid">
          <button
            v-for="(story, index) in visibleStories"
            :key="story.id"
            class="story-card"
            @click="selectedStory = story"
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
        <button class="close-btn" @click="selectedStory = null">✕</button>
        <img v-if="selectedStory.illustrazioneBase64" :src="selectedStory.illustrazioneBase64" alt="" class="preview-photo" />
        <h2>{{ selectedStory.titolo }}</h2>
        <p class="preview-date">{{ formatDate(selectedStory.createdAt) }}</p>
        <p class="preview-excerpt">{{ selectedStory.testo }}</p>
        <button class="read-btn" @click="leggiStoria(selectedStory.id)">Leggi la storia →</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { db, auth } from '../firebase'
import bachecaImg from '../assets/bacheca.png'

const router = useRouter()

const allStories = ref([])
const visibleStories = ref([])
const loading = ref(true)
const isLoggedIn = ref(false)
const selectedStory = ref(null)

let unsubscribeSnapshot = null
let unsubscribeAuth = null
let rotationInterval = null

const tapeColors = ['#f3c6d6', '#c9e4de', '#fbe4a0', '#d6c9f3']

function tapeStyle(index) {
  const color = tapeColors[index % tapeColors.length]
  const rotation = (index % 2 === 0 ? -1 : 1) * (4 + (index % 3) * 2)
  return { background: color, transform: `translateX(-50%) rotate(${rotation}deg)` }
}

function formatDate(timestamp) {
  if (!timestamp || !timestamp.toDate) return ''
  return timestamp.toDate().toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
}

function pickVisibleStories() {
  if (allStories.value.length <= 10) {
    visibleStories.value = allStories.value
  } else {
    const shuffled = [...allStories.value].sort(() => Math.random() - 0.5)
    visibleStories.value = shuffled.slice(0, 10)
  }
}

function startListening(uid) {
  const q = query(collection(db, 'storie'), where('userId', '==', uid), orderBy('createdAt', 'desc'))
  unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
    allStories.value = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
    pickVisibleStories()
    loading.value = false
  })
}

onMounted(() => {
  unsubscribeAuth = onAuthStateChanged(auth, (user) => {
    if (unsubscribeSnapshot) unsubscribeSnapshot()
    if (user) {
      isLoggedIn.value = true
      startListening(user.uid)
    } else {
      isLoggedIn.value = false
      allStories.value = []
      visibleStories.value = []
      loading.value = false
    }
  })

  rotationInterval = setInterval(() => {
    pickVisibleStories()
  }, 20000)
})

onUnmounted(() => {
  if (unsubscribeSnapshot) unsubscribeSnapshot()
  if (unsubscribeAuth) unsubscribeAuth()
  if (rotationInterval) clearInterval(rotationInterval)
})

function leggiStoria(id) {
  selectedStory.value = null
  router.push(`/storia/${id}`)
}
</script>

<style scoped>
.archivio {
  max-width: 1300px;
  margin: 2rem auto 4rem;
  padding: 0 1.5rem;
}
.page-header {
  margin-bottom: 1.5rem;
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
  grid-template-columns: repeat(5, 1fr);
  gap: 1.5rem;
}
.story-card {
  position: relative;
  background: white;
  border: none;
  border-radius: 6px;
  padding: 0.6rem 0.6rem 0.9rem;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  transition: transform 0.15s ease;
}
.story-card:hover {
  transform: translateY(-4px) scale(1.02);
}
.tape {
  position: absolute;
  top: -8px;
  left: 50%;
  width: 40px;
  height: 16px;
  opacity: 0.85;
}
.story-photo {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 3px;
  display: block;
  margin-bottom: 0.5rem;
}
.story-title {
  font-size: 0.78rem;
  font-weight: 600;
  margin: 0;
  color: #333;
}
.story-date {
  font-size: 0.68rem;
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
  padding: 1.5rem;
}
.preview-card {
  position: relative;
  background: white;
  border-radius: 20px;
  padding: 2rem;
  max-width: 480px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  text-align: center;
}
.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  border: none;
  background: #f3f3f3;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 0.9rem;
}
.preview-photo {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 1rem;
}
.preview-card h2 {
  color: #6c4fd6;
  font-size: 1.3rem;
  margin: 0 0 0.2rem;
}
.preview-date {
  color: #999;
  font-size: 0.8rem;
  margin: 0 0 1rem;
}
.preview-excerpt {
  color: #444;
  font-size: 0.88rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}
.read-btn {
  background: #6c4fd6;
  color: white;
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
}
@media (max-width: 1000px) {
  .stories-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 600px) {
  .stories-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>