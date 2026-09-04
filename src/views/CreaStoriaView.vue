<template>
  <div class="crea-storia">
    <img :src="fioreIcon" alt="" class="corner-decoration corner-bottom-left" />

    <div class="page-header">
      <h1>Trasformiamo il tuo giocattolo <span class="highlight">in una storia.</span></h1>
      <p class="subtitle">Carica una foto o un disegno, dai un nome al protagonista e personalizza la storia come vuoi tu.</p>
    </div>

    <div class="main-grid">
      <div class="left-col">
        <div class="upload-row">
          <label class="upload-box">
            <input type="file" accept="image/*" @change="handleFileChange" hidden />
            <svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M7 18a4 4 0 0 1-1-7.87A5 5 0 0 1 15.9 8H16a4 4 0 0 1 1 7.87" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 12v7M9 16l3-3 3 3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <strong>Trascina qui l'immagine</strong>
            <span>oppure clicca per sfogliare</span>
            <small>JPG, PNG, WEBP fino a 10MB</small>
          </label>

          <div class="polaroid">
            <span class="tape"></span>
            <img :src="imagePreview || fotoProva" alt="Anteprima personaggio" class="preview-img" />
            <img :src="iconaBacchetta" alt="" class="wand-decoration" />
          </div>
        </div>
        <p class="hint">💡 Consiglio: sfondo chiaro, immagine in primo piano</p>

        <div class="submit-row">
          <button class="submit-button" @click="creaStoria">Crea la mia storia</button>
          <p class="footer-hint">🔒 Il processo è gratuito, veloce e sicuro.</p>
        </div>
      </div>

      <div class="right-col">
        <div class="field-card">
          <div class="field-title">
            <span class="field-number">1</span>
            <div class="field-text">
              <label>Come si chiama il tuo personaggio?</label>
              <span class="field-hint">Scegli un nome che gli si addice.</span>
            </div>
          </div>
          <input type="text" v-model="characterName" placeholder="Es. Lillo, Mia, Zefiro..." />
        </div>

        <div class="field-card">
          <div class="field-title">
            <span class="field-number">2</span>
            <div class="field-text">
              <label>Che tipo di storia vuoi?</label>
              <span class="field-hint">Scegli l'avventura perfetta per lui.</span>
            </div>
          </div>
          <div class="option-grid">
            <button
              v-for="type in storyTypes"
              :key="type.id"
              class="option-card"
              :class="{ selected: storyType === type.id }"
              @click="storyType = type.id"
              type="button"
            >
              <span v-if="storyType === type.id" class="check-badge">✓</span>
              <img :src="type.icon" alt="" class="option-icon-img" />
              <strong>{{ type.label }}</strong>
              <small>{{ type.description }}</small>
            </button>
          </div>
        </div>

        <div class="field-card">
          <div class="field-title">
            <span class="field-number">3</span>
            <div class="field-text">
              <label>Che stile preferisci?</label>
              <span class="field-hint">Scegli l'illustrazione che più ti piace.</span>
            </div>
          </div>
          <div class="option-grid">
            <button
              v-for="style in styles"
              :key="style.id"
              class="option-card style-card"
              :class="{ selected: illustrationStyle === style.id }"
              @click="illustrationStyle = style.id"
              type="button"
            >
              <span v-if="illustrationStyle === style.id" class="check-badge">✓</span>
              <img :src="style.thumbnail" alt="" class="style-thumbnail" />
              <strong>{{ style.label }}</strong>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import fioreIcon from '../assets/fiore.png'
import fotoProva from '../assets/fotoprova.png'
import iconaBacchetta from '../assets/iconabacchetta.png'
import iconaAvventura from '../assets/iconaavventura.png'
import iconaFantasy from '../assets/iconafantasy.png'
import iconaMistero from '../assets/iconamistero.png'
import iconaCommedia from '../assets/iconacommedia.png'
import stileAcquarello from '../assets/stileacquarello.png'
import stileBaloon from '../assets/stilebaloon.png'
import stileMattoncini from '../assets/stilemattoncini.png'
import stileFeltro from '../assets/stilefeltro.png'

const router = useRouter()

const characterName = ref('')
const storyType = ref('avventura')
const illustrationStyle = ref('acquerello')
const imagePreview = ref(null)

const storyTypes = [
  { id: 'avventura', icon: iconaAvventura, label: 'Avventura', description: 'Parte per un viaggio ed esplora' },
  { id: 'magia', icon: iconaFantasy, label: 'Magia', description: 'Scopre poteri e mondi incantati' },
  { id: 'mistero', icon: iconaMistero, label: 'Mistero', description: 'Trova indizi e risolve enigmi' },
  { id: 'commedia', icon: iconaCommedia, label: 'Commedia', description: 'Vive situazioni buffe e imprevedibili' },
]

const styles = [
  { id: 'acquerello', thumbnail: stileAcquarello, label: 'Acquerello' },
  { id: 'gonfio', thumbnail: stileBaloon, label: 'Palloncino' },
  { id: 'mattoncini', thumbnail: stileMattoncini, label: 'Mattoncini' },
  { id: 'feltro', thumbnail: stileFeltro, label: 'Feltro' },
]

function handleFileChange(event) {
  const file = event.target.files[0]
  if (file) {
    imagePreview.value = URL.createObjectURL(file)
  }
}

function creaStoria() {
  router.push('/generazione')
}
</script>

<style scoped>
.crea-storia {
  position: relative;
  max-width: 1400px;
  margin: 2rem auto 3rem;
  padding: 0 3rem;
  overflow: hidden;
}
.page-header {
  margin-bottom: 1.8rem;
}
h1 {
  font-size: 1.9rem;
  margin: 0 0 0.3rem;
}
.highlight {
  color: #6c4fd6;
}
.subtitle {
  color: #666;
  font-size: 0.9rem;
  margin: 0;
  max-width: 600px;
}
.main-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: stretch;
}
.left-col {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}
.upload-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.2rem;
  align-items: stretch;
}
.upload-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  border: 2px dashed #c9b8f0;
  border-radius: 16px;
  background: #f6f3fd;
  padding: 0.8rem 0.6rem;
  text-align: center;
  cursor: pointer;
  color: #444;
}
.upload-icon {
  width: 26px;
  height: 26px;
  color: #6c4fd6;
}
.upload-box strong {
  font-size: 0.85rem;
}
.upload-box span {
  font-size: 0.78rem;
}
.upload-box small {
  color: #999;
  font-size: 0.68rem;
}
.hint {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: white;
  border: 1px solid #eee;
  border-radius: 999px;
  padding: 0.4rem 0.9rem;
  font-size: 0.75rem;
  color: #666;
}
.polaroid {
  position: relative;
  background: white;
  padding: 0.5rem 0.5rem 0.9rem;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  transform: rotate(3deg);
  display: flex;
  align-items: center;
}
.tape {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%) rotate(-4deg);
  width: 50px;
  height: 18px;
  background: #f3c6d6;
  opacity: 0.85;
}
.preview-img {
  display: block;
  width: 100%;
  border-radius: 4px;
  object-fit: cover;
  aspect-ratio: 4 / 5;
}
.wand-decoration {
  position: absolute;
  bottom: -10px;
  right: -10px;
  width: 32px;
  height: 32px;
  background: white;
  border-radius: 50%;
  padding: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.submit-row {
  margin-top: auto;
  padding-top: 1.5rem;
  text-align: center;
}
.submit-button {
  background: #6c4fd6;
  color: white;
  border: none;
  padding: 0.9rem 3rem;
  border-radius: 999px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
}
.footer-hint {
  font-size: 0.75rem;
  color: #999;
  margin: 0.6rem 0 0;
}
.right-col {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}
.field-card {
  background: white;
  border-radius: 16px;
  padding: 1.2rem 1.4rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
}
.field-title {
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  margin-bottom: 0.9rem;
}
.field-text {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}
.field-title label {
  font-weight: 600;
  font-size: 0.95rem;
}
.field-number {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #fbe4ea;
  color: #c9527a;
  font-size: 0.75rem;
  font-weight: 700;
  margin-top: 0.1rem;
}
.field-hint {
  font-size: 0.75rem;
  color: #888;
}
.field-card input[type='text'] {
  display: block;
  width: 100%;
  padding: 0.85rem 1.1rem;
  border: 1px solid #ddd;
  border-radius: 10px;
  font-size: 1rem;
}
.option-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.6rem;
}
.option-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.35rem;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 0.7rem 0.5rem;
  background: white;
  cursor: pointer;
  font-family: inherit;
}
.option-card.selected {
  border-color: #6c4fd6;
  background: #f6f3fd;
}
.check-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #6c4fd6;
  color: white;
  font-size: 0.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.option-icon-img {
  width: 3.8rem;   
  height: 3.8rem;  
  object-fit: contain;
}
.option-card strong {
  font-size: 0.78rem;
}
.option-card small {
  color: #888;
  font-size: 0.63rem;
  line-height: 1.2;
}
.style-thumbnail {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 0.25rem;
}
.corner-decoration {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100px;
  pointer-events: none;
  z-index: -1;
}
@media (max-width: 800px) {
  .main-grid {
    grid-template-columns: 1fr;
  }
  .upload-row {
    grid-template-columns: 1fr;
  }
  .option-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>