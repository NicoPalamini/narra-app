<template>
  <div class="generazione">
    <h1>✨ Stiamo creando la tua storia... ✨</h1>
    <p class="subtitle">Trasformiamo il tuo personaggio in un'avventura unica.</p>

    <div class="progress-wrap">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progress + '%' }"></div>
      </div>
      <span class="progress-label">{{ progress }}%</span>
    </div>
    <p class="progress-hint">💡 La nostra AI sta scrivendo e illustrando la tua storia.</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db, auth } from '../firebase'
import { storyDraft } from '../store'

const router = useRouter()
const progress = ref(0)

const storyTypeLabels = {
  avventura: 'Avventura',
  magia: 'Magia',
  mistero: 'Mistero',
  commedia: 'Commedia',
}

onMounted(() => {
  const interval = setInterval(() => {
    progress.value += 5
    if (progress.value >= 100) {
      progress.value = 100
      clearInterval(interval)
      salvaStoria()
    }
  }, 100)
})

async function salvaStoria() {
  const nome = storyDraft.characterName || 'Il personaggio'
  const genere = storyTypeLabels[storyDraft.storyType] || storyDraft.storyType
  const titolo = `${nome} e l'avventura di ${genere}`
  const testo = `Un giorno, ${nome} si ritrovò al centro di una grande avventura di ${genere.toLowerCase()}. Con coraggio e curiosità, esplorò un mondo pieno di sorprese e scoprì che le storie più belle nascono dai momenti più semplici. (Testo di prova: qui arriverà il racconto vero generato dall'AI.)`

  const docRef = await addDoc(collection(db, 'storie'), {
    userId: auth.currentUser ? auth.currentUser.uid : null,
    characterName: storyDraft.characterName,
    storyType: storyDraft.storyType,
    illustrationStyle: storyDraft.illustrationStyle,
    imageBase64: storyDraft.imageBase64,
    titolo,
    testo,
    createdAt: serverTimestamp(),
  })

  storyDraft.savedId = docRef.id
  storyDraft.titolo = titolo
  storyDraft.testo = testo

  router.push('/storia')
}
</script>

<style scoped>
.generazione {
  max-width: 500px;
  margin: 5rem auto;
  text-align: center;
  padding: 0 1.5rem;
}
h1 {
  font-size: 1.6rem;
}
.subtitle {
  color: #666;
  margin-bottom: 2.5rem;
}
.progress-bar {
  height: 10px;
  background: #eee;
  border-radius: 999px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: #6c4fd6;
  transition: width 0.1s linear;
}
.progress-label {
  display: block;
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: #666;
}
.progress-hint {
  margin-top: 1.5rem;
  font-size: 0.85rem;
  color: #888;
}
</style>