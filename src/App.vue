<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import BottomDock from './components/BottomDock.vue'
import type { Hotspot } from './content/navigation'
import { loadReaderNamePromptEnabled, loadReaderProfile, saveReaderNamePromptEnabled, saveReaderProfile } from './content/readerProfile'

const route = useRoute()
const router = useRouter()
const onCity = computed(() => route.name === 'city')
const onArchive = computed(() => route.name === 'archive')
const onLeisure = computed(() => route.name === 'leisure')
const isWorldQuestPage = computed(() => route.name === 'world-quests' || route.name === 'world-quest-recap')
const isSideShadowPage = computed(() => route.name === 'side-shadows' || route.name === 'side-shadow-detail')
const isInfiniteStoriesPage = computed(() => route.name === 'infinite-stories')
const isImmersivePage = computed(() => isWorldQuestPage.value || isSideShadowPage.value || isInfiniteStoriesPage.value)
const activeHotspot = ref<Hotspot | null>(null)
const isPortraitPhone = ref(false)
const savedReaderProfile = ref(loadReaderProfile())
const readerNamePromptEnabled = ref(loadReaderNamePromptEnabled())
const draftLastname = ref('')
const draftFirstName = ref('')
const draftGameName = ref('')

function syncOrientation() {
  isPortraitPhone.value = window.matchMedia('(max-width: 820px) and (orientation: portrait)').matches
}

const sceneRoutes = ['/', '/archive', '/leisure']

function switchScene(direction: -1 | 1) {
  activeHotspot.value = null
  const currentIndex = sceneRoutes.indexOf(route.path)
  const nextIndex = (currentIndex + direction + sceneRoutes.length) % sceneRoutes.length
  router.push(sceneRoutes[nextIndex])
}

function handleHotspot(item: Hotspot) {
  if (item.id === 'world-quests') {
    activeHotspot.value = null
    router.push('/world-quests')
    return
  }
  if (item.id === 'side-story') {
    activeHotspot.value = null
    router.push('/side-shadows')
    return
  }
  if (item.id === 'infinite') {
    activeHotspot.value = null
    router.push('/infinite-stories')
    return
  }
  if (item.id === 'profile') {
    savedReaderProfile.value = loadReaderProfile()
    readerNamePromptEnabled.value = loadReaderNamePromptEnabled()
    draftLastname.value = savedReaderProfile.value.userLastname
    draftFirstName.value = savedReaderProfile.value.userFirstName
    draftGameName.value = savedReaderProfile.value.gameName
  }
  activeHotspot.value = item
}

function closeHotspot() {
  activeHotspot.value = null
}

function confirmReaderProfile() {
  savedReaderProfile.value = saveReaderProfile({
    userLastname: draftLastname.value,
    userFirstName: draftFirstName.value,
    gameName: draftGameName.value,
  })
  closeHotspot()
}

function updateReaderNamePromptPreference() {
  saveReaderNamePromptEnabled(readerNamePromptEnabled.value)
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') activeHotspot.value = null
  if (!isImmersivePage.value && !activeHotspot.value && event.key === 'ArrowLeft') switchScene(-1)
  if (!isImmersivePage.value && !activeHotspot.value && event.key === 'ArrowRight') switchScene(1)
}

onMounted(() => {
  syncOrientation()
  window.addEventListener('resize', syncOrientation)
  window.addEventListener('orientationchange', syncOrientation)
  window.addEventListener('keydown', onKeydown)
})
onUnmounted(() => {
  window.removeEventListener('resize', syncOrientation)
  window.removeEventListener('orientationchange', syncOrientation)
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <main class="app-frame" :class="{ 'is-archive': onArchive, 'is-leisure': onLeisure, 'is-world-quest-page': isWorldQuestPage, 'is-side-shadow-page': isSideShadowPage, 'is-infinite-stories-page': isInfiniteStoriesPage, 'is-quest-recap': route.name === 'world-quest-recap', 'is-portrait-phone': isPortraitPhone }">
    <div class="ambient-grain" aria-hidden="true"></div>

    <header v-if="!isImmersivePage" class="topbar">
      <RouterLink class="brand" to="/" aria-label="世界之外资料站首页">
        <span class="brand-lockup"><span class="brand-title">世界之外资料站</span><span class="brand-tagline">Here to Everywhere</span></span>
      </RouterLink>

      <nav class="main-nav" aria-label="主导航">
        <RouterLink to="/" :class="{ active: onCity }"><span>01</span> 现实世界</RouterLink>
        <RouterLink to="/archive" :class="{ active: onArchive }"><span>02</span> 主神空间</RouterLink>
        <RouterLink to="/leisure" :class="{ active: onLeisure }"><span>03</span> 暇光空间</RouterLink>
      </nav>

      <div class="top-meta"><span class="status-dot"></span><span>LOADING</span></div>
    </header>

    <section class="scene-wrap">
      <RouterView v-slot="{ Component }">
        <Transition name="scene-fade" mode="out-in">
          <component :is="Component" :key="route.fullPath" @activate="handleHotspot" @back="router.push('/archive')" />
        </Transition>
      </RouterView>

      <button v-if="!isImmersivePage" class="scene-arrow arrow-left" aria-label="切换到上一个场景" @click="switchScene(-1)">
        <span class="arrow-caption">PREVIOUS<br />SCENE</span><span class="arrow-glyph" aria-hidden="true"><svg viewBox="0 0 48 48"><path d="M7 6 41 24 7 42 17 24 7 6Z" /><path d="M2 24h16" /></svg></span>
      </button>
      <button v-if="!isImmersivePage" class="scene-arrow arrow-right" aria-label="切换到下一个场景" @click="switchScene(1)">
        <span class="arrow-caption">NEXT<br />SCENE</span><span class="arrow-glyph" aria-hidden="true"><svg viewBox="0 0 48 48"><path d="M7 6 41 24 7 42 17 24 7 6Z" /><path d="M2 24h16" /></svg></span>
      </button>
    </section>

    <BottomDock v-if="!isImmersivePage && !onLeisure" :active="onArchive ? 'archive' : 'city'" @activate="handleHotspot" />

    <Transition name="panel">
      <div v-if="activeHotspot" class="detail-scrim" :class="{ 'profile-scrim': activeHotspot.id === 'profile' }" @click.self="closeHotspot">
        <section class="detail-card" :class="{ 'profile-card': activeHotspot.id === 'profile' }" role="dialog" aria-modal="true" :aria-label="activeHotspot.title">
          <button v-if="activeHotspot.id !== 'profile'" class="detail-close" aria-label="关闭" @click="closeHotspot">×</button>
          <template v-if="activeHotspot.id === 'profile'">
            <h2 class="profile-title">是否<span>确认</span>加入无限世界的游戏？</h2>
            <div class="profile-warning">
              <p>在这里，你将有可能获得超越现实的能力，发现世界的真谛</p>
              <p>而一旦失败，你将失去一切，永困轮回</p>
            </div>
            <p class="profile-invitation">如确认，请在此签署你的姓名</p>
            <div class="profile-fields">
              <label class="profile-field">
                <span>姓</span>
                <input v-model="draftLastname" type="text" autocomplete="family-name" aria-label="姓" />
                <i aria-hidden="true"></i>
              </label>
              <label class="profile-field">
                <span>名</span>
                <input v-model="draftFirstName" type="text" autocomplete="given-name" aria-label="名" />
                <i aria-hidden="true"></i>
              </label>
              <label class="profile-field profile-codename-field">
                <span>代号</span>
                <input v-model="draftGameName" type="text" autocomplete="nickname" aria-label="代号" />
                <i aria-hidden="true"></i>
              </label>
            </div>
            <div class="profile-footer">
              <label class="profile-prompt-setting">
                <input v-model="readerNamePromptEnabled" type="checkbox" @change="updateReaderNamePromptPreference">
                <span>进入剧情前提示</span>
              </label>
              <div class="profile-actions">
                <button class="profile-reject" type="button" @click="closeHotspot">拒绝</button>
                <button class="profile-confirm" type="button" @click="confirmReaderProfile">确认</button>
              </div>
            </div>
          </template>
          <template v-else>
            <p class="detail-kicker">{{ activeHotspot.eyebrow || 'STORY ARCHIVE' }}</p>
            <h2>{{ activeHotspot.title }}</h2>
            <p class="detail-description">{{ activeHotspot.description }}</p>
            <div class="detail-rule"><span></span><i>✦</i><span></span></div>
            <p class="detail-note">功能入口原型 · 后续可连接到作品、章节或系列页面</p>
          </template>
        </section>
      </div>
    </Transition>

  </main>
</template>
