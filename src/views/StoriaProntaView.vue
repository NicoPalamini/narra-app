<template>
  <div class="storia-pronta">
    <template v-if="!loading">
      <h1 v-if="!isFromArchive">✨ La tua storia è pronta! ✨</h1>
      <p class="subtitle" v-if="!isFromArchive">Ecco la storia speciale che abbiamo creato per {{ display.characterName }}.</p>

      <div class="book-stage">
        <span class="book-glow"></span>
        <span class="stage-sparkle ss-1">✦</span>
        <span class="stage-sparkle ss-2">✧</span>
        <span class="stage-sparkle ss-3">⋆</span>
        <span class="stage-sparkle ss-4">✩</span>
        <span class="stage-sparkle ss-5">✦</span>
        <span class="stage-sparkle ss-6">✧</span>

        <div class="book-frame" ref="bookFrameRef">
          <img :src="fiabaImg" alt="" class="book-bg" />
          <div class="book-content">
            <div class="left-page" :class="'font-' + display.illustrationStyle">
              <h2 class="story-title">{{ display.titolo }}</h2>
              <p class="story-text story-text-in-book" v-html="formattedTesto"></p>
            </div>
            <div class="right-page">
              <div class="postcard">
                <span class="tape tape-top"></span>
                <span class="tape tape-bottom"></span>
                <img v-if="display.illustrazioneBase64" :src="display.illustrazioneBase64" alt="" class="postcard-img" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="story-text-box">
        <p class="story-text" v-html="formattedTesto"></p>
      </div>

      <div class="actions">
        <button v-if="!isFromArchive" class="secondary-btn" @click="rigenera">↻ Rigenera la storia</button>
        <button class="secondary-btn" :disabled="salvando" @click="scaricaLibro">
          {{ salvando ? '⏳ Un attimo...' : '⬇ Salva il libro' }}
        </button>
        <button class="primary-btn" @click="vaiArchivio">Vai all'Archivio</button>
      </div>
      <p class="footer-hint">🔒 La tua storia è al sicuro e sempre disponibile per te.</p>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { doc, getDoc } from 'firebase/firestore'
import html2canvas from 'html2canvas'
import { db } from '../firebase'
import { storyDraft } from '../store'

import fiabaAcquerello from '../assets/fiaba-acquerello.png'
import fiabaGonfio from '../assets/fiaba-gonfio.png'
import fiabaMattoncini from '../assets/fiaba-mattoncini.png'
import fiabaFeltro from '../assets/fiaba-feltro.png'

const libriPerStile = {
  acquerello: fiabaAcquerello,
  gonfio: fiabaGonfio,
  mattoncini: fiabaMattoncini,
  feltro: fiabaFeltro,
}

const route = useRoute()
const router = useRouter()

const isFromArchive = ref(false)
const loading = ref(true)
const salvando = ref(false)
const bookFrameRef = ref(null)
const display = ref({
  characterName: '',
  illustrazioneBase64: null,
  titolo: '',
  testo: '',
  storyType: '',
  illustrationStyle: '',
})

const fiabaImg = computed(() => libriPerStile[display.value.illustrationStyle] || fiabaAcquerello)

const formattedTesto = computed(() => {
  let html = display.value.testo || ''
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  let onomCount = 0
  html = html.replace(/~~(.+?)~~|\b([A-ZÀ-Ù]{2,8})\b/g, (match, tildeWord, capsWord) => {
    const word = tildeWord !== undefined ? tildeWord : capsWord
    const variant = (onomCount % 4) + 1
    onomCount++
    return `<span class="onomatopea onom-${variant}">${word}</span>`
  })
  return html
})

onMounted(async () => {
  const id = route.params.id

  if (id) {
    isFromArchive.value = true
    const snap = await getDoc(doc(db, 'storie', id))
    if (snap.exists()) {
      const data = snap.data()
      display.value = {
        characterName: data.characterName,
        illustrazioneBase64: data.illustrazioneBase64,
        titolo: data.titolo,
        testo: data.testo,
        storyType: data.storyType,
        illustrationStyle: data.illustrationStyle,
      }
    }
  } else {
    display.value = {
      characterName: storyDraft.characterName,
      illustrazioneBase64: storyDraft.illustrazioneBase64,
      titolo: storyDraft.titolo,
      testo: storyDraft.testo,
      storyType: storyDraft.storyType,
      illustrationStyle: storyDraft.illustrationStyle,
    }
  }
  loading.value = false
})

function rigenera() {
  router.push('/generazione')
}
function vaiArchivio() {
  router.push('/archivio')
}

async function scaricaLibro() {
  if (!bookFrameRef.value || salvando.value) return
  salvando.value = true
  try {
    const canvas = await html2canvas(bookFrameRef.value, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
    })
    const nomeFile = (display.value.titolo || 'storia')
      .toLowerCase()
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-+|-+$/g, '')
    const link = document.createElement('a')
    link.href = canvas.toDataURL('image/png')
    link.download = `${nomeFile || 'la-mia-storia'}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (err) {
    console.error('Errore nel salvataggio del libro:', err)
    alert('Non siamo riusciti a salvare il libro. Riprova.')
  } finally {
    salvando.value = false
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Butterfly+Kids&family=Geist+Pixel&family=Rubik+Bubbles&family=Barrio&display=swap');

.storia-pronta {
  max-width: 1250px;
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

.book-stage {
  position: relative;
  margin: 2rem 0;
}

.book-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 92%;
  height: 100%;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle, rgba(198, 158, 240, 0.4) 0%, rgba(243, 198, 214, 0.25) 45%, rgba(245, 199, 110, 0) 75%);
  filter: blur(40px);
  animation: book-glow-pulse 6s ease-in-out infinite;
  z-index: 0;
  pointer-events: none;
}
@keyframes book-glow-pulse {
  0%, 100% { transform: translate(-50%, -50%) scale(0.95); opacity: 0.85; }
  50% { transform: translate(-50%, -50%) scale(1.06); opacity: 1; }
}

.stage-sparkle {
  position: absolute;
  z-index: 1;
  font-size: 1.2rem;
  opacity: 0;
  pointer-events: none;
  animation: sparkle-twinkle 3.4s ease-in-out infinite;
}
.ss-1 { top: -22px; left: 18%; color: #f5c76e; animation-delay: 0s; }
.ss-2 { top: 28%; right: -18px; font-size: 1rem; color: #c9527a; animation-delay: 0.6s; }
.ss-3 { bottom: -18px; left: 10%; font-size: 0.95rem; color: #6c4fd6; animation-delay: 1.2s; }
.ss-4 { bottom: 10%; right: -14px; font-size: 1.1rem; color: #3a9188; animation-delay: 1.8s; }
.ss-5 { top: 45%; left: -20px; font-size: 0.9rem; color: #f5c76e; animation-delay: 2.4s; }
.ss-6 { top: -14px; right: 22%; font-size: 1.05rem; color: #c9a6f0; animation-delay: 3s; }
@keyframes sparkle-twinkle {
  0%, 100% { opacity: 0; transform: scale(0.5) rotate(0deg); }
  50% { opacity: 1; transform: scale(1.2) rotate(18deg); }
}

.book-frame {
  position: relative;
  z-index: 2;
}
.book-bg {
  display: block;
  width: 100%;
  height: auto;
}
.book-content {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.left-page {
  padding: 39% 8% 18% 29%;
  display: flex;
  flex-direction: column;
  text-align: left;
  overflow: hidden;
  min-height: 0;
  box-sizing: border-box;
}
.story-title {
  font-weight: 800;
  line-height: 1.15;
  margin: 0 0 0.9rem;
  font-size: clamp(1rem, 4vw, 1.75rem);
  letter-spacing: 0.01em;
  flex-shrink: 0;
  overflow-wrap: break-word;
  text-align: center;
  text-wrap: balance;
  text-shadow: 1px 2px 3px rgba(0, 0, 0, 0.15);
}

.story-text-in-book {
  color: #4a3f33;
  line-height: 1.6;
  font-size: 0.63rem;
  font-weight: 400;
  margin: 0;
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overflow-wrap: break-word;
  padding-right: 6px;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
}
.story-text strong {
  font-weight: 700;
  color: #2f2718;
}
.story-text .onomatopea {
  display: inline-block;
  font-weight: 800;
  font-size: 1.15rem;
  line-height: 1;
  margin: 0 0.15em;
  vertical-align: -0.05em;
}
.onom-1 { color: #e0793c; transform: rotate(-4deg); }
.onom-2 { color: #6c4fd6; transform: rotate(3deg); }
.onom-3 { color: #c9527a; transform: rotate(-3deg); }
.onom-4 { color: #3a9188; transform: rotate(4deg); }

.font-acquerello .story-title {
  font-family: 'Butterfly Kids', cursive;
  font-weight: 400;
  color: #6c4fd6;
  font-size: clamp(1.3rem, 5.5vw, 2.4rem);
}
.font-gonfio .story-title {
  font-family: 'Rubik Bubbles', cursive;
  font-weight: 400;
  color: #3a9188;
  font-size: clamp(0.95rem, 3.8vw, 1.65rem);
}
.font-mattoncini .story-title {
  font-family: 'Geist Pixel', monospace;
  font-weight: 400;
  color: #b5563a;
  font-size: clamp(1rem, 4vw, 1.75rem);
  letter-spacing: 0.02em;
}
.font-feltro .story-title {
  font-family: 'Barrio', cursive;
  font-weight: 400;
  color: #c9527a;
  font-size: clamp(1.05rem, 4.2vw, 1.85rem);
}

.right-page {
  padding: 12% 22% 26% 10%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}
.postcard {
  position: relative;
  transform: rotate(-2deg);
  width: 78%;
  max-width: 330px;
  background: white;
  padding: 0.5rem;
  border-radius: 6px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  box-sizing: border-box;
}
.tape {
  position: absolute;
  left: 50%;
  width: 68px;
  height: 26px;
  background: #f3c6d6;
  opacity: 0.85;
  z-index: 2;
}
.tape-top {
  top: -13px;
  transform: translateX(-50%) rotate(-3deg);
}
.tape-bottom {
  bottom: -13px;
  transform: translateX(-50%) rotate(4deg);
}
.postcard-img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 3px;
}

.story-text-box {
  display: none;
  background: #fdfaf5;
  border-radius: 20px;
  padding: 1.6rem 1.6rem;
  max-width: 680px;
  margin: 0 auto 2rem;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
  text-align: left;
}
.story-text-box .story-text {
  font-size: 0.95rem;
  line-height: 1.75;
  color: #4a3f33;
  margin: 0;
  overflow-wrap: break-word;
}

.actions {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1rem;
}
.secondary-btn {
  padding: 0.7rem 1.5rem;
  border-radius: 999px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
}
.secondary-btn:disabled {
  opacity: 0.6;
  cursor: default;
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

@media (max-width: 1000px) {
  .left-page {
    padding: 24% 29% 30% 29%;
    justify-content: center;
    align-items: center;
    text-align: center;
  }
  .story-text-in-book {
    display: none;
  }
  .story-title {
    margin: 0;
  }
  .story-text-box {
    display: block;
  }
  .tape {
    width: 42px;
    height: 16px;
  }
  .tape-top {
    top: -8px;
  }
  .tape-bottom {
    bottom: -8px;
  }
}
</style>