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

      <div class="magic-stage">
        <div class="aura"></div>

        <span class="sparkle sp-1">✦</span>
        <span class="sparkle sp-2">✧</span>
        <span class="sparkle sp-3">⋆</span>
        <span class="sparkle sp-4">✩</span>
        <span class="sparkle sp-5">✦</span>
        <span class="sparkle sp-6">✧</span>

        <div class="wand-orbit">
          <span class="wand">🪄</span>
          <span class="wand-trail wt-1"></span>
          <span class="wand-trail wt-2"></span>
          <span class="wand-trail wt-3"></span>
        </div>

        <div class="puzzle-wrap">
          <p class="puzzle-title">Ricomponi una storia della community</p>
          <div class="puzzle-grid">
            <button
              v-for="(cell, idx) in puzzleCells"
              :key="idx"
              type="button"
              class="puzzle-cell"
              :class="cellClasses(idx)"
              :style="pieceStyle(cell)"
              :draggable="cell !== null"
              @click="tryMove(idx)"
              @dragstart="onDragStart(idx, $event)"
              @dragover.prevent
              @drop="onDrop(idx, $event)"
            >
              <span v-if="cell !== null && !puzzleImg" class="puzzle-icon">{{ fallbackIcons[cell] }}</span>
            </button>
          </div>
          <p v-if="puzzleSolved" class="puzzle-win">🎉 Risolto! Nuova immagine in arrivo...</p>
          <p v-else class="puzzle-hint">Sposta i pezzi ↔ (clic o trascina)</p>
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
import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs } from 'firebase/firestore'
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
  'a candy-colored carnival with a giant spinning ferris wheel',
  'a snowy mountain peak glittering under swirling northern lights',
  'a whimsical bakery town with houses shaped like cakes and cookies',
  'a hidden valley filled with giant mushrooms and glowing fireflies',
  'a pirate ship sailing across a sea of fluffy clouds',
  'a desert oasis with tall palm trees and a sparkling blue lagoon',
]

const locationsIt = [
  'una foresta incantata con alberi altissimi e luminosi',
  'un castello che vola tra le nuvole soffici',
  'un mercato notturno pieno di lanterne colorate',
  "un'isola misteriosa circondata da un mare turchese e scintillante",
  'un giardino segreto pieno di fiori giganti e coloratissimi',
  "un regno sott'acqua fatto di coralli colorati",
  'un villaggio di casette sugli alberi, tra montagne avvolte dalla nebbia',
  "una biblioteca antichissima dove i libri volano piano nell'aria",
  'un luna park coloratissimo con una grande ruota panoramica',
  "una cima innevata che scintilla sotto un'aurora boreale danzante",
  'un paesino fatto di pasticceria, con casette a forma di torte e biscotti',
  'una valle nascosta piena di funghi giganti e lucciole luminose',
  'una nave pirata che naviga in un mare di nuvole soffici',
  "un'oasi nel deserto con alte palme e una laguna azzurra scintillante",
]

const poses = [
  'mid-jump with arms raised high in excitement',
  'running forward joyfully with a big bright smile',
  'reaching up curiously toward something glowing above',
  'twirling around playfully with motion swirling behind it',
  'balancing triumphantly on top of a tall rock or giant mushroom',
  'floating gently through the air as if flying',
  'striking a heroic pose with a cape fluttering in the wind',
  'peeking out curiously from behind a giant flower or rock',
  'hugging a small friendly creature close with joy',
  'sliding down a rainbow or a giant slide with glee',
]

const lightings = [
  'warm golden sunset light casting long soft shadows',
  'a sparkling starry night sky full of tiny lights',
  'a soft misty sunrise glow',
  'vibrant bright midday sunlight',
  'a magical aurora shimmering across the night sky',
  'cool blue moonlight filtering gently through leaves',
  'a rosy pink dawn light with soft drifting mist',
  'festive multicolored fairy lights glowing everywhere',
]

// ---- Puzzle scorrevole 3x3 (8 pezzi + 1 vuoto) ----
const puzzleImg = ref(null)
const fallbackIcons = ['🌸', '⭐', '🎨', '🍄', '🌙', '💫', '🦋', '🍀']
const fallbackClasses = ['fc-1', 'fc-2', 'fc-3', 'fc-4', 'fc-5', 'fc-6', 'fc-7', 'fc-8']
const quadrantPositions = [
  '0% 0%', '50% 0%', '100% 0%',
  '0% 50%', '50% 50%', '100% 50%',
  '0% 100%', '50% 100%',
]
const solvedPuzzle = [0, 1, 2, 3, 4, 5, 6, 7, null]
const adjacency = {
  0: [1, 3], 1: [0, 2, 4], 2: [1, 5],
  3: [0, 4, 6], 4: [1, 3, 5, 7], 5: [2, 4, 8],
  6: [3, 7], 7: [4, 6, 8], 8: [5, 7],
}

const puzzleCells = ref([...solvedPuzzle])
const puzzleSolved = ref(false)
let puzzleResetTimeout = null
let dragSourceIndex = null

function isSolved(cells) {
  return cells.every((c, i) => c === solvedPuzzle[i])
}

function shufflePuzzle() {
  let cells = [...solvedPuzzle]
  let emptyIndex = 8
  for (let i = 0; i < 80; i++) {
    const neighbors = adjacency[emptyIndex]
    const swapWith = neighbors[Math.floor(Math.random() * neighbors.length)]
    ;[cells[emptyIndex], cells[swapWith]] = [cells[swapWith], cells[emptyIndex]]
    emptyIndex = swapWith
  }
  if (isSolved(cells)) {
    shufflePuzzle()
    return
  }
  puzzleCells.value = cells
  puzzleSolved.value = false
}

function isAdjacentToEmpty(idx) {
  const emptyIndex = puzzleCells.value.indexOf(null)
  return adjacency[idx].includes(emptyIndex)
}

function tryMove(idx) {
  if (puzzleSolved.value || puzzleCells.value[idx] === null) return
  const emptyIndex = puzzleCells.value.indexOf(null)
  if (!adjacency[idx].includes(emptyIndex)) return

  const cells = [...puzzleCells.value]
  ;[cells[idx], cells[emptyIndex]] = [cells[emptyIndex], cells[idx]]
  puzzleCells.value = cells

  if (isSolved(cells)) {
    puzzleSolved.value = true
    puzzleResetTimeout = setTimeout(() => {
      advancePuzzle()
    }, 2000)
  }
}

// Drag & drop: si trascina un pezzo e lo si rilascia sullo spazio
// vuoto. Riusa tryMove, che già controlla che il pezzo trascinato
// sia adiacente allo spazio vuoto — stessa regola del click.
function onDragStart(idx, e) {
  dragSourceIndex = idx
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(idx))
  }
}

function onDrop(idx, e) {
  e.preventDefault()
  const sourceIdx = dragSourceIndex !== null
    ? dragSourceIndex
    : parseInt(e.dataTransfer.getData('text/plain'), 10)
  dragSourceIndex = null
  if (sourceIdx === null || Number.isNaN(sourceIdx)) return
  // Si può rilasciare solo sullo spazio vuoto
  if (puzzleCells.value[idx] !== null) return
  tryMove(sourceIdx)
}

function cellClasses(idx) {
  const cell = puzzleCells.value[idx]
  const classes = []
  if (cell === null) {
    classes.push('empty')
  } else if (puzzleImg.value) {
    classes.push('has-image')
  } else {
    classes.push(fallbackClasses[cell])
  }
  if (cell !== null && isAdjacentToEmpty(idx)) {
    classes.push('movable')
  }
  return classes
}

function pieceStyle(cell) {
  if (!puzzleImg.value || cell === null) return {}
  return {
    backgroundImage: `url(${puzzleImg.value})`,
    backgroundSize: '300% 300%',
    backgroundPosition: quadrantPositions[cell],
  }
}

async function fetchPuzzleImage() {
  try {
    const q = query(collection(db, 'storie'), orderBy('createdAt', 'desc'), limit(30))
    const snap = await getDocs(q)
    const candidates = snap.docs.map((d) => d.data()).filter((d) => d.illustrazioneBase64)
    if (candidates.length === 0) return
    const pick = candidates[Math.floor(Math.random() * candidates.length)]
    puzzleImg.value = pick.illustrazioneBase64
  } catch (err) {
    console.error("Errore nel recupero di un'illustrazione per il puzzle:", err)
  }
}

async function advancePuzzle() {
  await fetchPuzzleImage()
  shufflePuzzle()
}

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

async function generateStoryText(characterName, genereIt, locationIt) {
  const prompt = `Scrivi una storia breve per bambini piccoli (4-6 anni) in italiano, di circa 120-160 parole.
Usa frasi corte e semplici, parole facili, quotidiane, dirette. Evita parole astratte, complicate o troppo lunghe: deve poter essere letta ad alta voce e capita subito da un bambino piccolo, come un libro illustrato per l'infanzia.

Il protagonista si chiama ${characterName}. Non dare per scontato di che tipo di personaggio si tratti: potrebbe essere un peluche, un giocattolo, un robot, una bambola, una persona o un animale. Scrivi la storia in modo che vada bene per qualunque di queste possibilità, senza specificare esplicitamente la natura del protagonista né presupporre che debba "prendere vita" da un oggetto inanimato.

La storia riguarda ${genereIt} e si svolge in ${locationIt} — ambienta chiaramente la scena in questo luogo fin dall'inizio, perché ci sarà anche un'illustrazione di questa stessa ambientazione ed è importante che corrispondano. Aggiungi un piccolo dettaglio a sorpresa per renderla originale.

Nel testo, evidenzia le 3-5 parole o brevi espressioni più importanti (nomi di oggetti magici, emozioni chiave, il colpo di scena finale) racchiudendole tra doppi asterischi, ad esempio **bussola**. Usa i doppi asterischi solo per queste 3-5 parole chiave.

Aggiungi anche 2-4 onomatopee semplici e giocose (parole di suono tipiche delle storie per bambini, come PUF, SPLASH, TAC, BOOM, ZAC, PLIN). REGOLA IMPORTANTE: ogni onomatopea deve SEMPRE essere racchiusa tra due tildi, senza eccezioni — mai scrivere l'onomatopea da sola. Esempio corretto: "La pallina cade e fa ~~PLIN~~ sul pavimento." Esempio SBAGLIATO da evitare: "La pallina cade e fa PLIN sul pavimento" (senza tildi).

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

async function generateStoryImage(characterName, genereEn, moodEn, styleKey, photoDataUrl, location, pose, lighting) {
  const style = styleDetails[styleKey] || styleDetails.acquerello

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

    const locIndex = Math.floor(Math.random() * locations.length)
    const poseIndex = Math.floor(Math.random() * poses.length)
    const lightingIndex = Math.floor(Math.random() * lightings.length)

    const [testoGenerato, immagineGrezza] = await Promise.all([
      generateStoryText(nome, genere.it, locationsIt[locIndex]),
      generateStoryImage(
        nome,
        genere.en,
        moodEn,
        storyDraft.illustrationStyle,
        storyDraft.imageBase64,
        locations[locIndex],
        poses[poseIndex],
        lightings[lightingIndex]
      ),
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
  shufflePuzzle()
  fetchPuzzleImage()
})
onUnmounted(() => {
  if (progressInterval) clearInterval(progressInterval)
  if (puzzleResetTimeout) clearTimeout(puzzleResetTimeout)
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

.magic-stage {
  position: relative;
  width: 340px;
  height: 340px;
  margin: 0 auto 1.5rem;
  perspective: 1100px;
}

.aura {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 300px;
  height: 300px;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle, rgba(198, 158, 240, 0.55) 0%, rgba(243, 198, 214, 0.35) 45%, rgba(245, 199, 110, 0) 75%);
  filter: blur(6px);
  animation: aura-pulse 3.6s ease-in-out infinite;
  z-index: 0;
}
@keyframes aura-pulse {
  0%, 100% { transform: translate(-50%, -50%) scale(0.92); opacity: 0.6; }
  50% { transform: translate(-50%, -50%) scale(1.08); opacity: 0.95; }
}

.sparkle {
  position: absolute;
  font-size: 1.1rem;
  opacity: 0;
  z-index: 1;
  animation: twinkle-float 2.8s ease-in-out infinite;
}
.sp-1 { top: 2%; left: 6%; color: #f5c76e; animation-delay: 0s; }
.sp-2 { top: 8%; right: 4%; color: #c9527a; font-size: 0.9rem; animation-delay: 0.5s; }
.sp-3 { bottom: 10%; left: 0%; color: #6c4fd6; font-size: 1.3rem; animation-delay: 1s; }
.sp-4 { bottom: 2%; right: 8%; color: #3a9188; font-size: 0.85rem; animation-delay: 1.5s; }
.sp-5 { top: 46%; left: -4%; color: #e0793c; font-size: 0.8rem; animation-delay: 2s; }
.sp-6 { top: 42%; right: -4%; color: #f5c76e; font-size: 1rem; animation-delay: 2.5s; }
@keyframes twinkle-float {
  0%, 100% { opacity: 0; transform: translateY(6px) scale(0.6) rotate(0deg); }
  50% { opacity: 1; transform: translateY(-4px) scale(1.2) rotate(20deg); }
}

.wand-orbit {
  position: absolute;
  top: -6px;
  left: 50%;
  width: 1px;
  height: 1px;
  z-index: 3;
  animation: wand-arc 3.4s ease-in-out infinite;
}
@keyframes wand-arc {
  0%, 100% { transform: translateX(-130px) translateY(0) rotate(-18deg); }
  50% { transform: translateX(130px) translateY(-10px) rotate(18deg); }
}
.wand {
  position: absolute;
  font-size: 1.6rem;
  transform: translate(-50%, -50%);
  filter: drop-shadow(0 4px 6px rgba(108, 79, 214, 0.3));
}
.wand-trail {
  position: absolute;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #f5c76e;
  transform: translate(-50%, -50%);
  animation: trail-fade 1s ease-out infinite;
}
.wt-1 { top: 10px; left: -16px; animation-delay: 0s; background: #f5c76e; }
.wt-2 { top: 16px; left: -30px; animation-delay: 0.15s; background: #c9527a; }
.wt-3 { top: 20px; left: -44px; animation-delay: 0.3s; background: #6c4fd6; }
@keyframes trail-fade {
  0% { opacity: 0.9; transform: translate(-50%, -50%) scale(1); }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(0.2); }
}

.puzzle-wrap {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 100%;
  height: 100%;
  justify-content: center;
}
.puzzle-title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: #6c4fd6;
  text-align: center;
  line-height: 1.25;
  max-width: 260px;
}
.puzzle-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 6px;
  width: 260px;
  height: 260px;
  filter: drop-shadow(0 14px 20px rgba(108, 79, 214, 0.25));
}
.puzzle-cell {
  border: none;
  border-radius: 8px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  cursor: pointer;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16);
  transition: transform 0.12s ease;
  background-repeat: no-repeat;
}
.puzzle-cell.empty {
  background: rgba(0, 0, 0, 0.05);
  box-shadow: none;
  cursor: default;
}
.puzzle-cell.movable {
  cursor: grab;
}
.puzzle-cell.movable:active {
  cursor: grabbing;
}
.puzzle-cell.movable:hover {
  transform: scale(1.06);
}
.puzzle-cell.fc-1 { background-color: #fbe4ea; background-image: linear-gradient(135deg, #fbe4ea, #f3c6d6); }
.puzzle-cell.fc-2 { background-color: #e8f4f0; background-image: linear-gradient(135deg, #e8f4f0, #bfe3d6); }
.puzzle-cell.fc-3 { background-color: #ece3fa; background-image: linear-gradient(135deg, #ece3fa, #cbb8ef); }
.puzzle-cell.fc-4 { background-color: #fff3d9; background-image: linear-gradient(135deg, #fff3d9, #f5d98a); }
.puzzle-cell.fc-5 { background-color: #e3eefc; background-image: linear-gradient(135deg, #e3eefc, #b8d4f0); }
.puzzle-cell.fc-6 { background-color: #fdeaea; background-image: linear-gradient(135deg, #fdeaea, #f0b8b8); }
.puzzle-cell.fc-7 { background-color: #eaf7ea; background-image: linear-gradient(135deg, #eaf7ea, #b8e0b8); }
.puzzle-cell.fc-8 { background-color: #f7e8f7; background-image: linear-gradient(135deg, #f7e8f7, #e0b8e0); }
.puzzle-win {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 700;
  color: #6c4fd6;
}
.puzzle-hint {
  margin: 0;
  font-size: 0.75rem;
  color: #9a8f7d;
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
  position: relative;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #6c4fd6, #c9527a, #f5c76e);
  background-size: 200% 100%;
  transition: width 0.3s ease;
  position: relative;
  overflow: hidden;
}
.progress-fill::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(110deg, transparent 30%, rgba(255, 255, 255, 0.55) 50%, transparent 70%);
  background-size: 250% 100%;
  animation: shimmer 1.6s linear infinite;
}
@keyframes shimmer {
  0% { background-position: 120% 0; }
  100% { background-position: -20% 0; }
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