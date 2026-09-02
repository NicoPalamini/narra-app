<script setup>
import { RouterLink, RouterView } from 'vue-router'
import logoUrl from './assets/logo.png'
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
  height: 40px;
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
</style>