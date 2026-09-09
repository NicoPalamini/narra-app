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
  brivido: {
    it: 'un\'avventura piena di brividi: fantasmi simpatici, mostriciattoli buffi, luoghi un po\' inquietanti ma mai davvero spaventosi, piccoli spaventi e un colpo di scena finale, raccontata sempre in modo adatto a bambini piccoli',
    en: 'a spooky but playful adventure with friendly ghosts, silly little monsters, eerie-but-fun places, a few small scares and a surprising twist — never truly frightening, always kid-appropriate',
  },
  commedia: { it: 'una situazione buffa e imprevedibile', en: 'a funny and silly lighthearted moment' },
}

const moodLabelsEn = {
  avventura: 'bright, energetic and adventurous',
  magia: 'dreamy, glowing and magical',
  brivido: 'spooky yet playful and fun, moody twilight atmosphere with a mischievous, lighthearted edge — never genuinely scary',
  commedia: 'cheerful, playful and colorful',
}

const styleDetails = {
  acquerello: {
    intro: "a whimsical children's storybook watercolor illustration",
    styleBlock: 'Traditional hand-painted watercolor throughout the ENTIRE image, painted on visible cold-press watercolor paper. Soft translucent washes with irregular, organic edges where pigment blooms and feathers into the wet paper; visible tiny paper fibers and subtle texture grain across every surface; delicate color bleeding where two wet washes touch and merge unpredictably; layered pastel tones built up in multiple thin transparent glazes rather than flat opaque color; occasional small unpainted white-paper highlights left deliberately; fine hand-painted linework done with a thin brush, slightly wobbly and imperfect, never a perfectly clean vector line. This applies not only to the subject but to every background element too: trees, sky, clouds, water, buildings and foliage must all be painted with the same visible watercolor washes, paper grain and soft bleeding edges, as if the entire scene is one continuous watercolor painting on a single physical sheet of paper.',
    negative: 'Avoid digital-looking gradients, hard vector shapes, glossy 3D rendering, airbrushed smoothness, or photorealism anywhere in the image, including the background. No crisp clean outlines, no flat uniform color fills, no photographic skies, no photorealistic foliage or architecture.',
  },
  gonfio: {
    intro: 'an elaborate balloon-twisting sculpture, photographed like a professional product photo',
    styleBlock: 'Every single visible part of the ENTIRE image physically constructed from inflated latex balloons, photographed under studio lighting. Rounded tubular balloon segments twisted and knotted together at every joint, visible pinch-twists and small knot nubs where balloons connect, smooth glossy latex surface with sharp specular highlights and soft reflections exactly like real inflated rubber, slight sheen variation across curved surfaces, visible subtle wrinkles near tight twists. Premium polished look comparable to a high-end parade float or balloon-art exhibition piece, not a cheap party decoration. This applies not only to the subject but to the entire background scene: trees are twisted balloon trunks and round balloon-cluster foliage, clouds are clusters of round white balloons, buildings and rock formations are built from oversized sausage-shaped balloon segments stacked and twisted together, water and ground are stylized balloon-art shapes in flat sculptural forms.',
    negative: 'Absolutely NOT a cheap bouncy-castle, inflatable pool-float, or amateur low-poly render look. Do not use fabric, felt, clay, plastic, paper, or toy bricks anywhere, including the background. No matte or dull surfaces — everything must have the glossy latex sheen of a real inflated balloon.',
  },
  feltro: {
    intro: 'a handmade felt plush character, photographed like a craft-fair product photo',
    styleBlock: 'Every part of the ENTIRE image physically handmade from wool felt fabric and soft stuffing. Fuzzy, slightly fibrous felt surface texture visible up close on every shape; visible hand-sewn blanket stitching in a contrasting thread color running along every seam and edge; soft rounded stuffed forms with gentle lumps and slight asymmetry typical of handcrafted plush toys, never perfectly symmetric or machine-smooth; small hand-embroidered details (eyes, patterns, small decorations) with visible individual thread stitches; slightly frayed or fuzzy fiber edges where felt pieces meet. This applies not only to the subject but to the entire background scene: trees, bushes and mountains are stitched felt shapes with the same fibrous texture and visible stitching, the sky and clouds are soft felt or quilted fabric panels, buildings and rocks are handmade felt props with stuffing bulges, arranged like a physical diorama scene built entirely from craft materials on a felt backdrop.',
    negative: 'Avoid plastic, glossy surfaces, smooth CGI rendering, watercolor washes, clay, inflated balloons, or interlocking toy bricks anywhere in the image, including the background. No perfectly smooth or machine-precise edges — everything should show the soft imperfection of handmade fabric craft.',
  },
  mattoncini: {
    intro: 'a detailed physical toy-brick sculpture, photographed like an official set product photo',
    styleBlock: 'Every part of the ENTIRE image physically built from small rectangular interlocking plastic toy bricks, with clearly visible round studs on top of every single brick, including curved and rounded forms approximated with stepped brick geometry. Individual brick units, seams and stud rows are crisply visible everywhere, creating a blocky, faceted, geometric look with no smooth curves. Realistic glossy injection-molded plastic material with subtle specular highlights and soft ambient occlusion in the gaps between bricks, photographed under clean studio-style lighting like an official product shot. This applies not only to the subject but to the entire background scene: trees, buildings, mountains, clouds and ground must all be visibly constructed from interlocking studded bricks of varying sizes, like a large physical toy-brick diorama set, with visible brick seams throughout the entire environment, not just the subject.',
    negative: 'Do not use fabric, felt, balloons, clay, watercolor, or knitted textures anywhere, including the background. The original photo\'s fuzzy or fabric texture must completely disappear and be replaced by hard plastic brick geometry. No smooth or curved organic surfaces — everything must read as blocky interlocking bricks with visible studs.',
  },
  realistico: {
    intro: 'a professional photorealistic photograph of a real, physical collectible figurine or toy',
    styleBlock: `Photorealistic professional product photography throughout the ENTIRE image, as if a real physical object was placed on a set and photographed with a high-end camera. IMPORTANT — subject handling: identify what the reference photo shows. If it already depicts a plush toy, doll, action figure, robot, or animal, photograph that same object with photorealistic material accuracy (real fabric weave, fur strands, painted plastic, metal sheen, glass eyes, as appropriate) exactly as it would look in a real high-end product photograph. If the reference photo instead shows a real person, do NOT render a photorealistic human — instead, reinterpret that person as a real, physical collectible figurine, vinyl toy, or poseable doll that captures their likeness (hairstyle, hair color, face shape, expression, clothing style, and color palette), photographed as an actual toy object sitting on a surface, with visible toy-making details like a slightly glossy vinyl or resin skin texture, subtle seam lines typical of a manufactured figurine, and a small round paint highlight in the eyes like a real collectible toy — the final image must always depict a physical toy object, never a real human face. Sharp realistic focus on the main subject, soft natural background blur (shallow depth of field), accurate real-world lighting with soft shadows and gentle highlights, fine physical texture detail up close. This applies to the entire background scene too: it must look like a real photographed environment or a realistic miniature diorama set, with natural materials, real-world lighting and photographic color grading.`,
    negative: 'Avoid any painterly, illustrated, cartoonish, or flat-shaded rendering anywhere in the image, including the background. No visible brushstrokes, no cel-shading, no plastic-brick or felt textures. Never render an actual photorealistic human face — if the reference is a person, it must become a physical toy/figurine version of them, not a realistic depiction of the real person.',
  },
  pixar3d: {
    intro: 'a polished 3D animated character in the style of a modern Pixar or Disney animated feature film',
    styleBlock: 'High-quality 3D computer animation rendering throughout the ENTIRE image, matching the production quality of a contemporary animated feature film. Soft, rounded, appealing character modeling with subtle subsurface-scattering skin/fur shading (light gently glowing through thin edges like ears or fur tips), smooth clean topology with no visible polygon edges, warm cinematic three-point lighting with soft rim light separating the subject from the background, gentle ambient occlusion in creases and folds, glossy catchlight highlights in the eyes. This applies not only to the subject but to the entire background scene: trees, buildings, sky and ground must all be rendered as soft, rounded, richly lit 3D environments with the same warm cinematic lighting and depth, using gentle depth-of-field blur on distant elements, exactly like a wide establishing shot from an animated film.',
    negative: 'Avoid flat 2D illustration, watercolor washes, hand-drawn line art, felt or brick textures, or true photorealism anywhere in the image, including the background. No sharp low-poly or geometric faceted surfaces — every shape should feel soft, rounded and warmly lit like a modern 3D animated film character.',
  },
  schizzo: {
    intro: "a playful, loose pencil and colored-pencil sketch, like a rough drawing in a child's notebook",
    styleBlock: 'Loose, energetic pencil and colored-pencil sketch rendering throughout the ENTIRE image, drawn on visible lightly-textured sketchbook paper. Sketchy, slightly wobbly hand-drawn outlines made of multiple overlapping pencil strokes rather than one clean line; visible light cross-hatching and shading built from short parallel pencil marks; uneven, slightly-outside-the-lines coloring typical of a child\'s drawing, with occasional visible white paper gaps where color wasn\'t fully filled in; soft graphite smudges in shadow areas; a charming unfinished, spontaneous, notebook-doodle quality. This applies not only to the subject but to the entire background scene: trees, buildings, sky and ground must all be drawn with the same loose sketchy pencil linework, light uneven coloring, and visible paper texture, as if the whole scene was doodled in one sitting in a sketchbook.',
    negative: 'Avoid smooth digital rendering, glossy 3D, photorealism, or heavily inked clean line art anywhere in the image, including the background. No perfectly straight lines, no flat uniform color fills, no polished finished-illustration look — the whole image should look like a charming rough pencil sketch in progress.',
  },
  doodle: {
    intro: 'a flat vector doodle cartoon illustration',
    styleBlock: 'Clean flat vector cartoon illustration throughout the ENTIRE image — this means the background is redrawn from scratch in the same flat vector style as the subject, not kept as a real photo. Thin, perfectly uniform outline weight around every shape with no line-width variation; soft rounded organic shapes with no sharp corners; flat, solid pastel colors with zero gradients and almost no shading (at most one small flat shadow shape under the subject); the subject is deliberately drawn in a silly, funny, exaggerated cartoon proportion (oversized head, tiny limbs, big expressive eyes, or similar playful distortion). This applies not only to the subject but to the entire background scene: trees, buildings, sky and ground must all be simplified into flat rounded pastel shapes with the same thin uniform outline, keeping the overall scene visually busy and full of small playful decorative details (little stars, hearts, swirls, dots) while every individual shape stays flat and simplified.',
    negative: 'Avoid photorealism, 3D rendering, painterly watercolor textures, heavy shading, gradients, or realistic proportions anywhere in the image, including the background. Keep every outline thin and uniform, every shape flat and pastel-colored, with almost no shadows or depth cues. The background is not optional: a photographic, textured, or realistic-looking background — even partially — is a failure of this style; every part of the environment must be flattened into the same simple vector shapes as the subject.',
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
  'a floating library among giant lily pads on a moonlit pond',
  'a cozy toy workshop filled with wooden gears and glowing lanterns',
  'a candy cane forest under a swirling twilight sky',
  'a starlit meadow dotted with glowing mushrooms and fireflies',
  'a cloud kingdom with staircases made of rainbows',
  'an underground crystal cave sparkling with colorful gems',
  'a tiny village hidden inside an enormous teacup',
  'a tiny moon village beneath an enormous starry sky',
  'a giant greenhouse filled with enormous tropical plants',
  'a magical paper world made of folded origami landscapes',
  'a giant aquarium tunnel surrounded by colorful sea creatures',
  'a room filled with giant oversized toys',
  'a village of fairies and magical woodland creatures',
  'an ancient art museum filled with grand paintings and statues',
  'flying through the sky on a magical creature amid falling confetti',
  'a costume festival in a medieval town square',
  'deep under the sea among colorful fish and coral reefs',
  'a themed water park with slides and pools',
  'a thrilling go-kart race on a colorful winding track filled with flags and cheering crowds',
  'a floating market on wooden boats along a misty river',
  'a giant birthday cake kingdom with candy decorations everywhere',
  'an old windmill village surrounded by golden wheat fields',
  'a cozy cabin buried in snow deep in a pine forest',
  'a colorful festival street lined with paper lanterns and flags',
  'a treetop rope bridge village connecting giant ancient trees',
  'a music box world with giant gears and spinning figurines',
  'a lighthouse on a rocky cliff overlooking a stormy sea',
  'an ice palace with frozen waterfalls and sparkling icicles',
  'a bustling toy train station with steam and colorful carriages',
  'jungle temple ruins covered in vines and glowing symbols',
  'a rooftop garden city above the clouds at sunset',
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
  'una biblioteca galleggiante tra grandi foglie di ninfea su uno stagno illuminato dalla luna',
  "un'accogliente officina di giocattoli piena di ingranaggi di legno e lanterne luminose",
  'una foresta di zucchero filato sotto un cielo crepuscolare vorticoso',
  'un prato stellato pieno di funghi luminosi e lucciole',
  'un regno di nuvole con scale fatte di arcobaleni',
  'una grotta di cristallo sotterranea scintillante di gemme colorate',
  "un minuscolo villaggio nascosto dentro una tazza da tè enorme",
  'un piccolo villaggio sulla luna sotto un cielo stellato immenso',
  'una serra gigante piena di enormi piante tropicali',
  'un mondo magico di carta fatto di paesaggi origami',
  'un tunnel acquario gigante circondato da creature marine colorate',
  'una stanza piena di giocattoli giganti',
  'un villaggio di fate e magiche creature del bosco',
  'un museo antico pieno di grandi dipinti e statue',
  'in volo nel cielo su una creatura magica, tra coriandoli che cadono',
  'una festa in costume in una piazza medievale',
  'in fondo al mare tra pesci colorati e coralli',
  'un parco acquatico a tema con scivoli e piscine',
  "un'entusiasmante gara di go-kart su una pista colorata e tortuosa, tra bandiere e folla festante",
  'un mercato galleggiante su barche di legno lungo un fiume nebbioso',
  'un regno a forma di torta di compleanno gigante pieno di decorazioni di caramelle',
  'un vecchio villaggio di mulini a vento circondato da campi di grano dorato',
  'una casetta accogliente sepolta nella neve, nel folto di una foresta di pini',
  'una strada in festa piena di lanterne di carta colorate e bandierine',
  'un villaggio di ponti sospesi tra le chiome di alberi giganti e antichi',
  'un mondo carillon con ingranaggi giganti e statuine che girano',
  'un faro su una scogliera rocciosa affacciato su un mare in tempesta',
  'un palazzo di ghiaccio con cascate ghiacciate e ghiaccioli scintillanti',
  'una stazione ferroviaria giocattolo piena di vapore e vagoni colorati',
  'rovine di un tempio nella giungla coperte di rampicanti e simboli luminosi',
  'un giardino pensile sopra le nuvole al tramonto',
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
  'spinning around with arms wide open, laughing',
  'tiptoeing carefully across stepping stones',
  'waving both arms high to say hello',
  'crouching low to peek inside a tiny door',
  'stretching upward on tiptoes reaching for a star',
  'sitting cross-legged, deep in thought',
  'standing proudly with hands on hips',
  'curling up comfortably while sleeping',
  'stumbling forward with arms stretched out',
  'hanging playfully upside down',
  'sitting with chin resting on both hands',
  'leaning forward curiously with hands behind its back',
  'leaping forward as if trying to catch something',
  'waving both arms enthusiastically',
  'spinning around with arms open and one leg lifted',
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
  'colorful stained-glass light projecting rainbow patterns everywhere',
  'dramatic stormy lighting illuminated by distant flashes of lightning',
  'dreamy pink and lavender twilight bathing everything in pastel light',
  'soft sunlight filtering through leaves creating dancing patches of light',
  'gentle golden-hour backlight creating a warm glowing silhouette',
  'cool cyan bioluminescent glow lighting up the whole scene',
  'bright cheerful daylight with crisp long shadows',
  'flickering warm candlelight casting dancing shadows',
  'soft overcast light with even, gentle shadows',
  'a dramatic spotlight beam cutting through soft haze',
]

const emotions = [
  'eyes wide with wonder and amazement',
  'giggling with pure delight',
  'a big warm joyful smile',
  'curious and thoughtful expression',
  'playful mischievous grin',
  'calm and dreamy, eyes half closed',
  'surprised, mouth open in awe',
  'proud and confident expression',
  'gentle loving expression',
  'excited, eyes sparkling with energy',
  'astonished with huge eyes and hands on cheeks',
  'dreamily gazing upward with a soft smile',
  'deeply focused with a serious determined look',
  'relieved and happy with a gentle smile',
  'suspiciously looking sideways',
  'embarrassed with flushed cheeks and a tiny smile',
  'brimming with courage and determination',
  'pouting dramatically with puffed cheeks',
  'joyfully laughing with mouth wide open',
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

async function generateStoryImage(characterName, genereEn, moodEn, styleKey, photoDataUrl, location, pose, emotion, lighting) {
  const style = styleDetails[styleKey] || styleDetails.acquerello

  const prompt = `Redraw the subject(s) from the reference photo as ${style.intro}.
The reference photo's subject could be a plush toy, an action figure, a robot, a doll, a person, or an animal — first identify what kind of subject it actually is, then keep that same nature in the redrawn version. Do not change what kind of subject it is (for example, never turn a person into an animal, or an animal into an object, or vice versa) — only its material and texture change according to the style below.
If the reference photo shows more than one character or subject, redraw ALL of them together in the same scene, preserving how many there are and each one's individual appearance and nature — never drop one of them and never depict only a single subject when the reference photo shows several.
Preserve the subject's overall silhouette, proportions, color palette and personality — but its surface material and texture must be entirely replaced by the new style described below; the original photo's real material must completely disappear unless that literally is the requested style.
Faithfully preserve exactly which features the subject does and does not have in the reference photo — for example, if it has no visible mouth, no visible eyebrows, or is missing a limb or other feature, keep it exactly that way; never invent or add a feature that is not present in the original photo.
Ignore the character's name (${characterName}) when deciding its appearance — rely only on the reference photo's shape and colors.

STYLE — this is a complete repaint of the ENTIRE image, subject and background alike; nothing in the final image may remain a real, unstyled photograph: ${style.styleBlock}

The subject is ${pose}, with ${emotion}, set in ${location}, experiencing ${genereEn}. Lighting: ${lighting}. Remember: the location itself (${location}) must be rebuilt entirely out of the style material described above, not shown as a real place — every element of the background must be redrawn in the same style as the subject, with no photographic or unstyled areas left anywhere in the frame.
${style.negative}
Depict only the character(s) actually present in the reference photo, optionally alongside animal or fantasy creatures — do not add extra unrelated human characters or children.
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
    const emotionIndex = Math.floor(Math.random() * emotions.length)
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
        emotions[emotionIndex],
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
  margin-bottom: 1rem;
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
  margin: 0 0 3rem;
}

.magic-stage {
  position: relative;
  width: 340px;
  height: 340px;
  margin: 0 auto 2rem;
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
  margin: 0 0 2.5rem;
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
  background: linear-gradient(90deg, #c9b8f0, #8a6ae8, #4a2f9e);
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
  margin-top: 0.6rem;
  font-size: 0.85rem;
  color: #666;
}
.progress-hint {
  margin-top: 2rem;
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