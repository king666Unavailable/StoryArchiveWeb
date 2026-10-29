import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import CityScene from './scenes/CityScene.vue'
import ArchiveScene from './scenes/ArchiveScene.vue'
import LeisureScene from './scenes/LeisureScene.vue'
import WorldQuestPage from './pages/WorldQuestPage.vue'
import QuestRecapPage from './pages/QuestRecapPage.vue'
import SideShadowPage from './pages/SideShadowPage.vue'
import SideShadowDetailPage from './pages/SideShadowDetailPage.vue'
import InfiniteStoriesPage from './pages/InfiniteStoriesPage.vue'
import '@fontsource-variable/noto-serif-sc/wght.css'
import './styles/base.css'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'city', component: CityScene },
    { path: '/archive', name: 'archive', component: ArchiveScene },
    { path: '/leisure', name: 'leisure', component: LeisureScene },
    { path: '/world-quests', name: 'world-quests', component: WorldQuestPage },
    { path: '/world-quests/:topicId/:questId/recap', name: 'world-quest-recap', component: QuestRecapPage },
    { path: '/side-shadows', name: 'side-shadows', component: SideShadowPage },
    { path: '/side-shadows/:worldId/:characterId/:shadowId', name: 'side-shadow-detail', component: SideShadowDetailPage },
    { path: '/side-shadows/:worldId/:characterId/:shadowId/recap/:storyType', name: 'side-shadow-recap', component: QuestRecapPage },
    { path: '/infinite-stories', name: 'infinite-stories', component: InfiniteStoriesPage },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

createApp(App).use(router).mount('#app')
