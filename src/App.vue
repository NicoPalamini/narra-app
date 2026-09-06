<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { ref, onMounted, onUnmounted } from 'vue'
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import { auth, googleProvider } from './firebase'
import logoUrl from './assets/logo.png'
import MagicBackground from './components/MagicBackground.vue'

const currentUser = ref(null)
const avatarFailed = ref(false)

function signIn() {
  signInWithPopup(auth, googleProvider).catch((err) => {
    console.error('Errore di accesso:', err)
  })
}

function logOut() {
  signOut(auth)
}

let lastX = 0
let lastY = 0

function createSparkle(x, y) {
  const sparkle = document.createElement('span')
  sparkle.className = 'cursor-sparkle'
  const size = 4 + Math.random() * 4
  const driftX = (Math.random() - 0.5) * 20
  sparkle.style.left = x + 'px'
  sparkle.style.top = y + 'px'
  sparkle.style.width = size + 'px'
  sparkle.style.height = size + 'px'
  sparkle.style.setProperty('--drift-x', driftX + 'px')
  document.body.appendChild(sparkle)
  setTimeout(() => sparkle.remove(), 700)
}

function handleMouseMove(e) {
  const dx = e.clientX - lastX
  const dy = e.clientY - lastY
  if (Math.sqrt(dx * dx + dy * dy) < 20) return
  lastX = e.clientX
  lastY = e.clientY
  createSparkle(e.clientX, e.clientY)
}

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
  onAuthStateChanged(auth, (user) => {
    currentUser.value = user
    avatarFailed.value = false
  })
})
onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
})
</script>

<template>
  <MagicBackground />

  <header class="app-header">
    <RouterLink to="/" class="logo">
      <img :src="logoUrl" alt="Narrà" class="logo-img" />
    </RouterLink>

    <div class="header-actions">
      <RouterLink to="/archivio" class="archivio-link">ARCHIVIO</RouterLink>

      <button v-if="!currentUser" class="google-btn" @click="signIn">Accedi con Google</button>

      <button v-else class="user-chip" @click="logOut" :title="'Clicca per uscire, ' + currentUser.displayName">
        <img
          v-if="currentUser.photoURL && !avatarFailed"
          :src="currentUser.photoURL"
          :alt="currentUser.displayName"
          class="user-avatar"
          @error="avatarFailed = true"
        />
        <span v-else class="user-avatar user-avatar-fallback">
          {{ currentUser.displayName.charAt(0) }}
        </span>
        <span class="user-name">{{ currentUser.displayName.split(' ')[0] }}</span>
      </button>
    </div>
  </header>

  <main>
    <RouterView />
  </main>
</template>

<style scoped>
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  border-bottom: 1px solid #eee;
}
.logo {
  display: flex;
  align-items: center;
}
.logo-img {
  height: 45px;
  width: auto;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}
.archivio-link {
  text-decoration: none;
  color: #333;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.05em;
}
.google-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 999px;
  background: white;
  cursor: pointer;
  font-size: 0.9rem;
}
.user-chip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.9rem 0.35rem 0.35rem;
  border: 1px solid #ddd;
  border-radius: 999px;
  background: white;
  cursor: pointer;
  font-size: 0.9rem;
  font-family: inherit;
}
.user-avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  object-fit: cover;
}
.user-avatar-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #6c4fd6;
  color: white;
  font-weight: 700;
  font-size: 0.8rem;
}
.user-name {
  font-weight: 600;
  color: #333;
}
</style>