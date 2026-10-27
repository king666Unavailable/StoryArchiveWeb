import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import CityScene from './scenes/CityScene.vue'
import ArchiveScene from './scenes/ArchiveScene.vue'
import WorldQuestPage from './pages/WorldQuestPage.vue'
import QuestRecapPage from './pages/QuestRecapPage.vue'
import SideShadowPage from './pages/SideShadowPage.vue'
import InfiniteStoriesPage from './pages/InfiniteStoriesPage.vue'
import './styles/base.css'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'city', component: CityScene },
    { path: '/archive', name: 'archive', component: ArchiveScene },
    { path: '/world-quests', name: 'world-quests', component: WorldQuestPage },
    { path: '/world-quests/:topicId/:questId/recap', name: 'world-quest-recap', component: QuestRecapPage },
    { path: '/side-shadows', name: 'side-shadows', component: SideShadowPage },
    { path: '/infinite-stories', name: 'infinite-stories', component: InfiniteStoriesPage },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

createApp(App).use(router).mount('#app')
