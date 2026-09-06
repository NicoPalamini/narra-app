<template>
  <div class="storia-pronta">
    <template v-if="!loading">
      <h1 v-if="!isFromArchive">✨ La tua storia è pronta! ✨</h1>
      <p class="subtitle" v-if="!isFromArchive">Ecco la storia speciale che abbiamo creato per {{ display.characterName }}.</p>

      <div class="book-stage">
        <span class="stage-blob blob-a"></span>
        <span class="stage-blob blob-b"></span>
        <span class="stage-blob blob-c"></span>
        <span class="stage-sparkle ss-1">✦</span>
        <span class="stage-sparkle ss-2">✧</span>
        <span class="stage-sparkle ss-3">⋆</span>

        <div class="book-frame" ref="bookFrameRef">
          <img :src="fiabaImg" alt="" class="book-bg" />
          <div class="book-content">
            <div class="left-page" :class="'font-' + display.storyType">
              <h2 class="story-title">{{ display.titolo }}</h2>
              <p class="story-text" v-html="formattedTesto"></p>
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

// Converte **parola** in grassetto vero. Per le onomatopee, prima cerca
// ~~parola~~ (il modo corretto che chiediamo all'AI); come rete di
// sicurezza, se l'AI si dimentica i tildi, cerca anche parole scritte
// per intero in MAIUSCOLO (es. "PLIN", "TAC") e le stilizza comunque.
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

.stage-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(45px);
  opacity: 0.5;
  z-index: 0;
  pointer-events: none;
  animation: blob-float 8s ease-in-out infinite;
}
.blob-a { width: 280px; height: 280px; background: #c9a6f0; top: -70px; left: -50px; animation-delay: 0s; }
.blob-b { width: 240px; height: 240px; background: #f3c6d6; bottom: -60px; right: -40px; animation-delay: 2.5s; }
.blob-c { width: 190px; height: 190px; background: #f5c76e; top: 45%; right: -70px; animation-delay: 5s; }
@keyframes blob-float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(14px, -14px) scale(1.08); }
}

.stage-sparkle {
  position: absolute;
  z-index: 1;
  color: #f5c76e;
  font-size: 1.2rem;
  opacity: 0;
  pointer-events: none;
  animation: sparkle-twinkle 3.2s ease-in-out infinite;
}
.ss-1 { top: -20px; left: 20%; animation-delay: 0s; color: #f5c76e; }
.ss-2 { top: 30%; right: -14px; font-size: 1rem; animation-delay: 1.1s; color: #c9527a; }
.ss-3 { bottom: -16px; left: 12%; font-size: 0.9rem; animation-delay: 2.2s; color: #6c4fd6; }
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
  font-size: 1.75rem;
  letter-spacing: 0.01em;
  flex-shrink: 0;
  overflow-wrap: break-word;
}
.story-text {
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
.font-avventura .story-title {
  font-family: 'Kalam', cursive;
  font-weight: 700;
  color: #b5563a;
  font-size: 1.9rem;
}
.font-magia .story-title {
  font-family: 'Dancing Script', cursive;
  font-weight: 700;
  color: #6c4fd6;
  font-size: 2.5rem;
}
.font-mistero .story-title {
  font-family: 'Special Elite', monospace;
  color: #3a3a5c;
  font-size: 1.6rem;
  letter-spacing: 0.03em;
}
.font-commedia .story-title {
  font-family: 'Baloo 2', cursive;
  font-weight: 800;
  color: #e0793c;
  font-size: 1.95rem;
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
</style>