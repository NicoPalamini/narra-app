<template>
  <div class="generazione">
    <template v-if="!errorMsg">
      <div class="title-wrap">
        <span class="title-sparkle ts-a">✦</span>
        <span class="title-sparkle ts-b">✧</span>
        <span class="title-sparkle ts-c">⋆</span>
        <h1>Stiamo creando la tua storia...</h1>
      </div>
      <p class="subtitle">Trasformiamo il tuo personaggio in un'avventura unica.</p>

      <div class="book-loader-scene">
        <div class="mini-book">
          <div class="mini-page mini-page-left">
            <span class="mini-line"></span>
            <span class="mini-line"></span>
            <span class="mini-line"></span>
            <span class="mini-line"></span>
          </div>
          <div class="mini-spine"></div>
          <div class="mini-page mini-page-right">
            <span class="mini-flap" style="animation-delay: 0s"></span>
            <span class="mini-flap" style="animation-delay: 0.7s"></span>
            <span class="mini-flap" style="animation-delay: 1.4s"></span>
            <span class="mini-page-icon">🎨</span>
          </div>
        </div>
      </div>
      <p class="loader-caption">Sto scrivendo la storia e dipingendo l'illustrazione...</p>

      <div class="progress-wrap">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progress + '%' }"></div>
        </div>
        <span class="progress-label">{{ progress }}%</span>
      </div>
      <p class="progress-hint">💡 Di solito ci vogliono circa 30-60 secondi.</p>
    </template>

    <template v-else>
      <h1>😕 Qualcosa è andato storto</h1>
      <p class="subtitle">{{ errorMsg }}</p>
      <button class="retry-btn" @click="creaLaStoria">Riprova</button>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db, auth } from '../firebase'
import { storyDraft } from '../store'

const router = useRouter()
const progress = ref(0)
const errorMsg = ref('')
let progressInterval = null

const storyTypeLabels = {
  avventura: { it: "un'avventura di viaggio ed esplorazione", en: 'an adventurous journey of exploration' },
  magia: { it: 'una scoperta magica', en: 'a magical discovery' },
  mistero: { it: 'un mistero pieno di indizi da risolvere', en: 'a mystery full of clues to solve' },
  commedia: { it: 'una situazione buffa e imprevedibile', en: 'a funny and silly lighthearted moment' },
}

const moodLabelsEn = {
  avventura: 'bright, energetic and adventurous',
  magia: 'dreamy, glowing and magical',
  mistero: 'mysterious, moody twilight',
  commedia: 'cheerful, playful and colorful',
}

const styleDetails = {
  acquerello: {
    intro: "a whimsical children's storybook watercolor illustration",
    styleBlock: 'Traditional hand-painted watercolor throughout the ENTIRE image. Soft translucent washes, delicate pigment blooms, subtle color bleeding, visible paper grain, gentle irregular edges, layered pastel colors, fine hand-painted details. This applies not only to the subject but to every background element too: trees, sky, clouds, water, buildings, ground and foliage must all be painted with the same visible watercolor washes and paper texture, as if the whole scene is one continuous watercolor painting on a single sheet of paper.',
    negative: 'Avoid digital-looking gradients, hard vector shapes, glossy 3D rendering, or photorealism anywhere in the image, including the background. No photographic skies, no photorealistic foliage or architecture.',
  },
  gonfio: {
    intro: 'elaborate balloon art sculpture',
    styleBlock: 'Professional balloon sculpture photography throughout the ENTIRE image. Every visible part physically constructed from inflated latex balloons, rounded balloon segments, twisted balloon joints, knots. Smooth glossy latex surfaces, realistic specular highlights, premium polished look like a modern 3D animated film character. This applies not only to the subject but to the entire background scene: trees are twisted balloon sculptures, clouds are round balloon shapes, buildings and rock formations are built from oversized balloon segments, the ground and water are stylized balloon-art shapes. Nothing in the frame should look like real photography.',
    negative: 'Absolutely NOT a cheap bouncy-castle, pool-float, or amateur render look. Do not use fabric, felt, clay, plastic, paper, or toy bricks anywhere, including the background. The background must never look like a real photographed environment — it must be balloon sculpture too.',
  },
  feltro: {
    intro: 'a handmade felt plush character',
    styleBlock: 'Physically handmade from felt throughout the ENTIRE image, wool felt, soft fabric, embroidery thread. Fuzzy felt fibers, visible blanket stitching, hand-sewn seams, embroidered details, slightly imperfect handmade edges, soft stuffing. This applies not only to the subject but to the entire background scene: trees, bushes and mountains are made of stitched felt shapes with visible fabric texture, the sky and clouds are soft felt or fabric panels, buildings and rocks are handmade felt props, like a diorama built entirely from felt craft materials on a felt background.',
    negative: 'Avoid plastic, glossy surfaces, smooth CGI, watercolor, clay, balloons, and building bricks anywhere in the image, including the background. The background must never look like a real photographed environment — it must be felt craft too.',
  },
  mattoncini: {
    intro: 'a detailed physical toy-brick sculpture',
    styleBlock: 'Every part physically built from small rectangular interlocking plastic toy bricks throughout the ENTIRE image, with visible round studs on top of each brick. Individual brick units and seams clearly visible everywhere, blocky geometric faceted look. Realistic glossy plastic material, subtle reflections. This applies not only to the subject but to the entire background scene: trees, buildings, mountains, clouds and ground must all be built from visible interlocking toy bricks with studs, like a large physical toy-brick diorama set, not a real environment.',
    negative: 'Do not use fabric, felt, balloons, clay, watercolor, knitted textures anywhere, including the background. The original photo\'s fuzzy/fabric texture must completely disappear and be replaced by hard plastic brick geometry. The background must never look like a real photographed environment — it must be built from toy bricks too.',
  },
}

const locations = [
  'an enchanted forest with towering glowing trees',
  'a floating castle drifting among fluffy clouds',
  'a bustling night market strung with colorful lanterns',
  'a mysterious island surrounded by a sparkling turquoise sea',
  'a secret garden overflowing with oversized blooming flowers',
  'an underwater kingdom made of colorful coral reefs',
  'a cozy treehouse village nestled in misty mountains',
  'an ancient library where books float gently in the air',
]

const poses = [
  'mid-jump with arms raised high in excitement',
  'running forward joyfully with a big bright smile',
  'reaching up curiously toward something glowing above',
  'twirling around playfully with motion swirling behind it',
  'balancing triumphantly on top of a tall rock or giant mushroom',
  'floating gently through the air as if flying',
]

const lightings = [
  'warm golden sunset light casting long soft shadows',
  'a sparkling starry night sky full of tiny lights',
  'a soft misty sunrise glow',
  'vibrant bright midday sunlight',
  'a magical aurora shimmering across the night sky',
]

function startFakeProgress() {
  progressInterval = setInterval(() => {
    if (progress.value < 90) {
      progress.value += Math.max(1, Math.round((90 - progress.value) / 10))
    }
  }, 300)
}

function compressImage(dataUrl, maxSize = 900, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      let width = img.width
      let height = img.height
      if (width > height && width > maxSize) {
        height = Math.round((height * maxSize) / width)
        width = maxSize
      } else if (height > maxSize) {
        width = Math.round((width * maxSize) / height)
        height = maxSize
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = reject
    img.src = dataUrl
  })
}

function dataURLtoBlob(dataUrl) {
  const [header, base64Data] = dataUrl.split(',')
  const mimeMatch = header.match(/data:(.*?);base64/)
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg'
  const binary = atob(base64Data)
  const array = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i)
  }
  return new Blob([array], { type: mime })
}

async function generateStoryText(characterName, genereIt) {
  const prompt = `Scrivi una storia per bambini in italiano, di circa 140-180 parole. Il protagonista si chiama ${characterName}. Non dare per scontato di che tipo di personaggio si tratti: potrebbe essere un peluche, un giocattolo, un robot, una bambola, una persona o un animale. Scrivi la storia in modo che vada bene per qualunque di queste possibilità, senza specificare esplicitamente la natura del protagonista né presupporre che debba "prendere vita" da un oggetto inanimato — puoi semplicemente raccontare un'avventura magica e originale che gli capita. La storia riguarda ${genereIt}. Aggiungi un piccolo dettaglio a sorpresa per renderla originale.
Nel testo della storia, evidenzia le 3-5 parole o brevi espressioni più importanti (nomi di oggetti magici, emozioni chiave, il colpo di scena finale) racchiudendole tra doppi asterischi, ad esempio **bussola**. Usa i doppi asterischi solo per queste 3-5 parole chiave, non di più.
Rispondi SOLO con un oggetto JSON in questo formato esatto, senza markdown e senza altro testo: {"titolo": "...", "testo": "..."}`

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-5-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    }),
  })

  if (!res.ok) {
    const errBody = await res.text()
    throw new Error('Generazione testo fallita: ' + errBody)
  }
  const data = await res.json()
  return JSON.parse(data.choices[0].message.content)
}

async function generateStoryImage(characterName, genereEn, moodEn, styleKey, photoDataUrl) {
  const style = styleDetails[styleKey] || styleDetails.acquerello
  const location = locations[Math.floor(Math.random() * locations.length)]
  const pose = poses[Math.floor(Math.random() * poses.length)]
  const lighting = lightings[Math.floor(Math.random() * lightings.length)]

  const prompt = `Redraw the subject from the reference photo as ${style.intro}.
The reference photo's subject could be a plush toy, an action figure, a robot, a doll, a person, or an animal — first identify what kind of subject it actually is, then keep that same nature in the redrawn version. Do not change what kind of subject it is (for example, never turn a person into an animal, or an animal into an object, or vice versa) — only its material and texture change according to the style below.
Preserve the subject's overall silhouette, proportions, color palette and personality — but its surface material and texture must be entirely replaced by the new style described below; the original photo's real material must completely disappear unless that literally is the requested style.
Ignore the character's name (${characterName}) when deciding its appearance — rely only on the reference photo's shape and colors.

STYLE (applies to the subject AND the entire background scene — do not leave any part of the image photorealistic or unstyled): ${style.styleBlock}

The subject is ${pose}, set in ${location}, experiencing ${genereEn}. Lighting: ${lighting}. Remember: the location itself (${location}) must be rebuilt entirely out of the style material described above, not shown as a real place.
${style.negative}
Depict only the one subject from the reference photo, optionally alongside animal or fantasy creatures — do not add extra human characters or children who are not the subject itself.
No text, letters, numbers or words anywhere in the image.
Square, dynamic, eye-catching composition, like a beautiful postcard illustration with a full background scene rendered consistently in the same style as the subject. Overall atmosphere: ${moodEn}.`

  const formData = new FormData()
  formData.append('model', 'gpt-image-1.5')
  formData.append('prompt', prompt)
  formData.append('size', '1024x1024')
  formData.append('quality', 'high')
  formData.append('image', dataURLtoBlob(photoDataUrl), 'foto.jpg')

  const res = await fetch('https://api.openai.com/v1/images/edits', {
    method: 'POST',
    headers: { Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}` },
    body: formData,
  })

  if (!res.ok) {
    const errBody = await res.text()
    throw new Error('Generazione immagine fallita: ' + errBody)
  }
  const data = await res.json()
  return `data:image/png;base64,${data.data[0].b64_json}`
}

async function creaLaStoria() {
  errorMsg.value = ''
  progress.value = 0
  startFakeProgress()

  try {
    const nome = storyDraft.characterName || 'Il personaggio'
    const genere = storyTypeLabels[storyDraft.storyType] || storyTypeLabels.avventura
    const moodEn = moodLabelsEn[storyDraft.storyType] || moodLabelsEn.avventura

    const [testoGenerato, immagineGrezza] = await Promise.all([
      generateStoryText(nome, genere.it),
      generateStoryImage(nome, genere.en, moodEn, storyDraft.illustrationStyle, storyDraft.imageBase64),
    ])

    const immagineCompressa = await compressImage(immagineGrezza)

    const docRef = await addDoc(collection(db, 'storie'), {
      userId: auth.currentUser ? auth.currentUser.uid : null,
      characterName: storyDraft.characterName,
      storyType: storyDraft.storyType,
      illustrationStyle: storyDraft.illustrationStyle,
      illustrazioneBase64: immagineCompressa,
      titolo: testoGenerato.titolo,
      testo: testoGenerato.testo,
      createdAt: serverTimestamp(),
    })

    storyDraft.savedId = docRef.id
    storyDraft.titolo = testoGenerato.titolo
    storyDraft.testo = testoGenerato.testo
    storyDraft.illustrazioneBase64 = immagineCompressa

    clearInterval(progressInterval)
    progress.value = 100
    setTimeout(() => router.push('/storia'), 400)
  } catch (err) {
    clearInterval(progressInterval)
    console.error(err)
    errorMsg.value = 'Non siamo riusciti a generare la storia. Dettaglio: ' + err.message
  }
}

onMounted(() => {
  creaLaStoria()
})
onUnmounted(() => {
  if (progressInterval) clearInterval(progressInterval)
})
</script>

<style scoped>
.generazione {
  max-width: 560px;
  margin: 4rem auto;
  text-align: center;
  padding: 0 1.5rem;
}

.title-wrap {
  position: relative;
  display: inline-block;
  margin-bottom: 0.6rem;
}
h1 {
  font-size: 1.6rem;
  margin: 0;
}
.title-sparkle {
  position: absolute;
  color: #f5c76e;
  font-size: 1rem;
  opacity: 0;
  animation: twinkle 2.6s ease-in-out infinite;
}
.ts-a { top: -14px; left: 6%; animation-delay: 0s; }
.ts-b { top: -20px; left: 48%; font-size: 1.2rem; animation-delay: 0.8s; color: #f3c6d6; }
.ts-c { top: -10px; right: 4%; animation-delay: 1.6s; color: #b6a6ec; font-size: 0.85rem; }
@keyframes twinkle {
  0%, 100% { opacity: 0; transform: scale(0.5) rotate(0deg); }
  50% { opacity: 1; transform: scale(1.15) rotate(15deg); }
}

.subtitle {
  color: #666;
  margin: 0 0 2.5rem;
}

.book-loader-scene {
  position: relative;
  width: 320px;
  height: 210px;
  margin: 0 auto 1.5rem;
}

.mini-book {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  border-radius: 14px;
  filter: drop-shadow(0 18px 26px rgba(108, 79, 214, 0.25));
  animation: float-book 3.2s ease-in-out infinite;
}
@keyframes float-book {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.mini-page {
  flex: 1;
  background: #fdfaf5;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
}
.mini-page-left {
  border-radius: 14px 0 0 14px;
  box-shadow: inset -12px 0 16px -14px rgba(0, 0, 0, 0.3);
  padding: 28px 20px 28px 28px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 16px;
}
.mini-page-right {
  border-radius: 0 14px 14px 0;
  box-shadow: inset 12px 0 16px -14px rgba(0, 0, 0, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 700px;
}

.mini-spine {
  width: 10px;
  background: linear-gradient(to bottom, #8a6ae8, #6c4fd6);
  box-shadow: 0 0 10px rgba(108, 79, 214, 0.5);
  position: relative;
  z-index: 3;
}

.mini-line {
  display: block;
  height: 7px;
  border-radius: 4px;
  background: linear-gradient(to right, #d8cdb8, #e8dfc9);
  transform-origin: left;
  animation: write-line 3.2s ease-in-out infinite;
}
.mini-line:nth-child(1) { width: 88%; animation-delay: 0s; }
.mini-line:nth-child(2) { width: 60%; animation-delay: 0.35s; }
.mini-line:nth-child(3) { width: 72%; animation-delay: 0.7s; }
.mini-line:nth-child(4) { width: 45%; animation-delay: 1.05s; }
@keyframes write-line {
  0% { transform: scaleX(0); opacity: 0; }
  20% { transform: scaleX(1); opacity: 1; }
  75% { transform: scaleX(1); opacity: 1; }
  95%, 100% { transform: scaleX(0); opacity: 0; }
}

.mini-flap {
  position: absolute;
  inset: 0;
  background: linear-gradient(120deg, #fdfaf5 55%, #ece3fa 100%);
  border-left: 1px solid #e4dbf5;
  transform-origin: left center;
  backface-visibility: hidden;
  animation: flip-page 2.1s ease-in-out infinite;
}
.mini-flap:nth-child(1) { z-index: 3; }
.mini-flap:nth-child(2) { z-index: 2; }
.mini-flap:nth-child(3) { z-index: 1; }
@keyframes flip-page {
  0% { transform: rotateY(0deg); }
  50% { transform: rotateY(-165deg); }
  100% { transform: rotateY(-165deg); }
}
.mini-page-icon {
  position: relative;
  z-index: 4;
  font-size: 2.4rem;
  animation: pulse-icon 2.1s ease-in-out infinite;
}
@keyframes pulse-icon {
  0%, 100% { opacity: 0.55; transform: scale(0.9); }
  50% { opacity: 1; transform: scale(1.05); }
}

.loader-caption {
  font-size: 0.9rem;
  color: #7a6d5d;
  margin: 0 0 2rem;
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
  transition: width 0.3s ease;
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
.retry-btn {
  margin-top: 1.5rem;
  background: #6c4fd6;
  color: white;
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
}
</style>