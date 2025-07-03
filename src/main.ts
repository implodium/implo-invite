import { createApp } from 'vue'
import App from './App.vue'
import ui from '@nuxt/ui/vue-plugin'
import './style.css'
import LoginView from './components/views/LoginView.vue'
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import RedirectView from './components/views/RedirectView.vue'
import PocketBase from 'pocketbase'
import Party2025 from './components/views/party/Party2025.vue'

const pb = new PocketBase(import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8090')

const routes: Readonly<RouteRecordRaw[]> = [
	{ path: '/', redirect: '/party/2025' },
	{ path: '/login', component: LoginView },
	{ path: '/redirect', component: RedirectView },
	{ path: '/party/2025', component: Party2025 },
	{ path: '/:pathMatch(.*)*', redirect: "/party/2025" }
]

const router = createRouter({
	history: createWebHistory(),
	routes: routes
})

router.beforeEach((to, _) => {
	if (!pb.authStore.isValid && to.path !== '/login' && to.path !== '/redirect') {
		localStorage.setItem('target', to.path)
		return { path: '/login' }
	}
})

createApp(App)
	.use(router)
	.use(ui)
	.provide('pb', pb)
	.mount('#app')
