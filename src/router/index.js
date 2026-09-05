import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CreaStoriaView from '../views/CreaStoriaView.vue'
import GenerazioneView from '../views/GenerazioneView.vue'
import StoriaProntaView from '../views/StoriaProntaView.vue'
import ArchivioView from '../views/ArchivioView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/crea', name: 'crea-storia', component: CreaStoriaView },
    { path: '/generazione', name: 'generazione', component: GenerazioneView },
    { path: '/storia/:id?', name: 'storia-pronta', component: StoriaProntaView },
    { path: '/archivio', name: 'archivio', component: ArchivioView },
  ],
})

export default router