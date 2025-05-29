import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import HomeView from './components/views/HomeView.vue'
import LoginView from './components/views/LoginView.vue'
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import RedirectView from './components/views/RedirectView.vue'
import PocketBase from 'pocketbase'

const pb = new PocketBase('http://localhost:8090')

const routes: Readonly<RouteRecordRaw[]> = [
	{ path: '/', component: HomeView },
	{ path: '/login', component: LoginView },
	{ path: '/redirect', component: RedirectView }
]

const router = createRouter({
	history: createWebHistory(),
	routes: routes
})

router.beforeEach((to, _) => {
	if (!pb.authStore.isValid && to.path !== '/login' && to.path !== '/redirect') {
		return { path: '/login' }
	}
})

createApp(App)
	.use(router)
	.provide('pb', pb)
	.mount('#app')
