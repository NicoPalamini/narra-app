<script setup>
import { RouterLink, RouterView } from 'vue-router'
import logoUrl from './assets/logo.png'

import { onMounted, onUnmounted } from 'vue'

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
})
onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
})
</script>

<template>
  <header class="app-header">
    <RouterLink to="/" class="logo">
      <img :src="logoUrl" alt="Narrà" class="logo-img" />
    </RouterLink>

    <div class="header-actions">
      <RouterLink to="/archivio" class="archivio-link">ARCHIVIO</RouterLink>
      <button class="google-btn">Accedi con Google</button>
    </div>
  </header>

  <main class="app-main">
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
  height: 50px;
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
.app-main {
  flex: 1;
  overflow: hidden;
}
</style>