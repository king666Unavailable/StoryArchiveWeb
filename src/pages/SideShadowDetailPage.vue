<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, ArrowRight, Eye, Heart, Images, KeyRound, Repeat2, Sparkles, X } from '@lucide/vue'
import {
  getSideShadowCardVariant,
  loadSideShadowFilterContext,
  loadSideShadowStories,
  loadSideShadows,
  saveSideShadowCardVariant,
  type SideShadow,
  type SideShadowCardVariant,
  type SideShadowStoryType,
} from '../content/sideShadows'
import { hasReaderNameVariables, loadReaderNamePromptEnabled } from '../content/readerProfile'
import ReaderNamePrompt from '../components/ReaderNamePrompt.vue'
import PageNavHeader from '../components/PageNavHeader.vue'

const route = useRoute()
const router = useRouter()
const shadow = ref<SideShadow | null>(null)
const resultShadows = ref<SideShadow[]>([])
const filterContextId = typeof route.query.context === 'string' ? route.query.context : ''
const selectedCard = ref<SideShadowCardVariant>('card1')
const isUiVisible = ref(true)
const portraitViewerOpen = ref(false)
const portraitIndex = ref(0)
const portraitPointerStart = ref<{ x: number; y: number } | null>(null)
const namePromptOpen = ref(false)
const pendingStoryType = ref<SideShadowStoryType | null>(null)
const isLoading = ref(true)
const loadError = ref(false)

const rarityIcons: Record<string, string> = {
  刹那: '/icon/ChaNa.png',
  世界: '/icon/ShiJie.png',
  瞬: '/icon/Shun.png',
  月: '/icon/Yue.png',
  辰星: '/icon/ChenXing.png',
  星: '/icon/Xing.png',
}
const storyEntries: Array<{ id: SideShadowStoryType; label: string; icon: typeof Heart }> = [
  { id: 'meeting', label: '相会', icon: Heart },
  { id: 'approach', label: '贴近', icon: Sparkles },
  { id: 'reunion', label: '重逢', icon: Heart },
]
const keyStoryEntry: { id: SideShadowStoryType; label: string; icon: typeof Heart } = { id: 'key', label: '钥匙', icon: KeyRound }

const hasSecondCard = computed(() => Boolean(shadow.value?.card2))
const hasPortraits = computed(() => Boolean(shadow.value?.portraitImages.length))
const activePortrait = computed(() => shadow.value?.portraitImages[portraitIndex.value] ?? '')
const hasKeyStoryButton = computed(() => shadow.value?.rarity === '瞬'
  || (shadow.value?.rarity === '世界' && shadow.value.hasKeyStory))
const visibleStoryEntries = computed(() => {
  if (!shadow.value) return []
  const entries = ['星', '辰星'].includes(shadow.value.rarity)
    ? storyEntries.filter((entry) => entry.id === 'meeting')
    : [...storyEntries]
  if (hasKeyStoryButton.value) {
    const approachIndex = entries.findIndex((entry) => entry.id === 'approach')
    entries.splice(approachIndex < 0 ? entries.length : approachIndex, 0, keyStoryEntry)
  }
  return entries
})
const activeImage = computed(() => {
  if (!shadow.value) return ''
  return selectedCard.value === 'card2' && shadow.value.card2
    ? shadow.value.card2
    : shadow.value.card1
})
const rarityIcon = computed(() => shadow.value ? rarityIcons[shadow.value.rarity] ?? '' : '')
const resultIndex = computed(() => resultShadows.value.findIndex((item) => item.id === shadow.value?.id))
const canBrowseResults = computed(() => resultShadows.value.length > 1 && resultIndex.value >= 0)
const canBrowsePrevious = computed(() => canBrowseResults.value && resultIndex.value > 0)
const canBrowseNext = computed(() => canBrowseResults.value && resultIndex.value < resultShadows.value.length - 1)
const filterReturnLocation = computed(() => ({
  name: 'side-shadows',
  query: filterContextId ? { context: filterContextId } : {},
}))

onMounted(async () => {
  window.addEventListener('keydown', onKeydown)
  try {
    const records = await loadSideShadows()
    const { worldId, characterId, shadowId } = route.params
    shadow.value = records.find((item) =>
      item.worldId === String(worldId) &&
      item.characterId === String(characterId) &&
      item.shadowId === String(shadowId)) ?? null
    const filterContext = loadSideShadowFilterContext(filterContextId)
    if (filterContext) {
      resultShadows.value = filterContext.resultIds
        .map((id) => records.find((item) => item.id === id))
        .filter((item): item is SideShadow => Boolean(item))
    }
    if (shadow.value) {
      if (filterContext && !resultShadows.value.some((item) => item.id === shadow.value?.id)) {
        resultShadows.value.push(shadow.value)
      }
      selectedCard.value = getSideShadowCardVariant(shadow.value)
      portraitIndex.value = loadPortraitIndex(shadow.value.id, shadow.value.portraitImages.length)
    }
  } catch (error) {
    console.error('侧影详情读取失败', error)
    loadError.value = true
  } finally {
    isLoading.value = false
  }
})

onUnmounted(() => window.removeEventListener('keydown', onKeydown))

function onKeydown(event: KeyboardEvent) {
  if (portraitViewerOpen.value) {
    if (event.key === 'Escape') closePortraitViewer()
    if (event.key === 'ArrowLeft') { event.preventDefault(); stepPortrait(-1) }
    if (event.key === 'ArrowRight') { event.preventDefault(); stepPortrait(1) }
    return
  }
  if (event.key === 'Escape' && !isUiVisible.value) isUiVisible.value = true
  if (isUiVisible.value && event.key === 'ArrowLeft' && canBrowsePrevious.value) {
    event.preventDefault()
    browseResults(-1)
  }
  if (isUiVisible.value && event.key === 'ArrowRight' && canBrowseNext.value) {
    event.preventDefault()
    browseResults(1)
  }
}

function browseResults(direction: -1 | 1) {
  const nextShadow = resultShadows.value[resultIndex.value + direction]
  if (!nextShadow || !filterContextId) return
  router.replace({
    name: 'side-shadow-detail',
    params: { worldId: nextShadow.worldId, characterId: nextShadow.characterId, shadowId: nextShadow.shadowId },
    query: { context: filterContextId },
  })
}

function portraitPreferenceKey(shadowId: string) {
  return `side-shadow-portrait:${shadowId}`
}

function loadPortraitIndex(shadowId: string, count: number) {
  if (!count) return 0
  try {
    const saved = Number(localStorage.getItem(portraitPreferenceKey(shadowId)) ?? 0)
    return Number.isInteger(saved) && saved >= 0 && saved < count ? saved : 0
  } catch {
    return 0
  }
}

function openPortraitViewer() {
  if (!hasPortraits.value) return
  portraitViewerOpen.value = true
}

function closePortraitViewer() {
  portraitViewerOpen.value = false
  portraitPointerStart.value = null
}

function setPortrait(index: number) {
  const currentShadow = shadow.value
  if (!currentShadow || index < 0 || index >= currentShadow.portraitImages.length) return
  portraitIndex.value = index
  try {
    localStorage.setItem(portraitPreferenceKey(currentShadow.id), String(index))
  } catch {
    // Keep the viewer usable if browser storage is unavailable.
  }
}

function stepPortrait(direction: -1 | 1) {
  const count = shadow.value?.portraitImages.length ?? 0
  if (!count) return
  setPortrait((portraitIndex.value + direction + count) % count)
}

function onPortraitPointerDown(event: PointerEvent) {
  portraitPointerStart.value = { x: event.clientX, y: event.clientY }
}

function onPortraitPointerUp(event: PointerEvent) {
  if (!portraitPointerStart.value) return
  const deltaX = event.clientX - portraitPointerStart.value.x
  const deltaY = event.clientY - portraitPointerStart.value.y
  portraitPointerStart.value = null
  if (Math.abs(deltaX) < 42 || Math.abs(deltaX) < Math.abs(deltaY)) return
  stepPortrait(deltaX < 0 ? 1 : -1)
}

function toggleCard() {
  if (!shadow.value?.card2) return
  selectedCard.value = selectedCard.value === 'card1' ? 'card2' : 'card1'
  saveSideShadowCardVariant(shadow.value, selectedCard.value)
}

async function openStory(type: SideShadowStoryType) {
  if (!shadow.value) return
  try {
    const story = (await loadSideShadowStories(shadow.value))[type]
    if (story && loadReaderNamePromptEnabled() && hasReaderNameVariables(story)) {
      pendingStoryType.value = type
      namePromptOpen.value = true
      return
    }
  } catch (error) {
    console.warn('侧影剧情读取失败', error)
  }
  continueToStory(type)
}

function continueToStory(type = pendingStoryType.value) {
  namePromptOpen.value = false
  if (!shadow.value || !type) return
  router.push({
    name: 'side-shadow-recap',
    params: {
      worldId: shadow.value.worldId,
      characterId: shadow.value.characterId,
      shadowId: shadow.value.shadowId,
      storyType: type,
    },
      query: filterContextId ? { context: filterContextId } : {},
  })
}
</script>

<template>
  <section class="side-shadow-detail" aria-label="侧影详情" @click.self="isUiVisible = true">
    <img v-if="activeImage" class="detail-background" :src="activeImage" :alt="`${shadow?.title ?? '侧影'}卡面`" />
    <div class="detail-shade" aria-hidden="true"></div>

    <button v-if="!isUiVisible" class="restore-ui" type="button" aria-label="显示界面" @click="isUiVisible = true"></button>

    <Transition name="detail-ui">
      <div v-if="isUiVisible" class="detail-overlay">
        <PageNavHeader title="侧影详情" subtitle="SHADOW DETAILS" back-label="返回侧影筛选" :back-to="filterReturnLocation">
          <template #actions>
            <div class="detail-header-tools">
              <button v-if="hasSecondCard" class="card-switch" type="button" :aria-label="selectedCard === 'card1' ? '切换到卡面2' : '切换到卡面1'" :title="selectedCard === 'card1' ? '切换到卡面2' : '切换到卡面1'" @click="toggleCard">
                <Repeat2 :size="22" :stroke-width="1.5" />
              </button>
              <button v-if="hasPortraits" class="portrait-gallery-toggle" type="button" aria-label="预览竖版卡面" title="预览竖版卡面" @click="openPortraitViewer">
                <Images :size="22" :stroke-width="1.5" />
              </button>
              <button class="eye-toggle" type="button" aria-label="隐藏界面" title="隐藏界面" @click="isUiVisible = false">
                <Eye :size="23" :stroke-width="1.6" />
              </button>
            </div>
          </template>
        </PageNavHeader>

        <nav v-if="canBrowseResults" class="result-browse-nav" aria-label="浏览当前筛选结果">
          <button type="button" aria-label="上一个侧影" title="上一个侧影" :disabled="!canBrowsePrevious" @click="browseResults(-1)"><ArrowLeft :size="26" :stroke-width="1.5" /></button>
          <button type="button" aria-label="下一个侧影" title="下一个侧影" :disabled="!canBrowseNext" @click="browseResults(1)"><ArrowRight :size="26" :stroke-width="1.5" /></button>
        </nav>

        <div v-if="isLoading" class="detail-status">正在读取侧影资料…</div>
        <div v-else-if="loadError || !shadow" class="detail-status">侧影资料读取失败</div>
        <section v-else class="shadow-meta" aria-label="侧影信息">
          <div class="shadow-topline">
            <span class="shadow-character">{{ shadow.character }}</span>
            <span class="world-label">
              <span class="world-sparkle" aria-hidden="true">✧</span>
              <span class="shadow-world">{{ shadow.world }}</span>
            </span>
          </div>
          <div class="shadow-title-line">
            <img v-if="rarityIcon" class="shadow-rarity-icon" :src="rarityIcon" :alt="`${shadow.rarity}稀有度`" />
            <h1>{{ shadow.title }}</h1>
          </div>
          <div class="shadow-meet">{{ shadow.meet }}</div>
        </section>

        <nav v-if="shadow" class="story-entries" :class="{ 'has-key': hasKeyStoryButton }" aria-label="侧影剧情入口">
          <button v-for="entry in visibleStoryEntries" :key="entry.id" :class="`story-entry-${entry.id}`" type="button" @click="openStory(entry.id)">
            <span class="story-button-icon" aria-hidden="true">
              <img v-if="entry.id === 'reunion'" src="/icon/two_hearts.png" alt="">
              <component v-else :is="entry.icon" :size="24" :stroke-width="1.5" />
            </span>
            <span class="story-button-label">{{ entry.label }}</span>
          </button>
        </nav>

        <div v-if="!activeImage && !isLoading && !loadError" class="missing-card">尚未添加卡面图片</div>
      </div>
    </Transition>
    <Transition name="portrait-viewer">
      <section v-if="portraitViewerOpen && shadow && activePortrait" class="portrait-viewer" role="dialog" aria-modal="true" :aria-label="`${shadow.title}竖版卡面预览`" @click.self="closePortraitViewer">
        <button class="portrait-viewer-close" type="button" aria-label="关闭竖版卡面预览" @click="closePortraitViewer"><X :size="26" :stroke-width="1.5" /></button>
        <button class="portrait-viewer-arrow portrait-viewer-previous" type="button" aria-label="上一张竖版卡面" @click="stepPortrait(-1)"><ArrowLeft :size="28" :stroke-width="1.5" /></button>
        <div class="portrait-viewer-stage" @pointerdown="onPortraitPointerDown" @pointerup="onPortraitPointerUp" @pointercancel="portraitPointerStart = null">
          <img class="portrait-viewer-image" :src="activePortrait" :alt="`${shadow.title}竖版卡面 ${portraitIndex + 1}`" draggable="false">
        </div>
        <button class="portrait-viewer-arrow portrait-viewer-next" type="button" aria-label="下一张竖版卡面" @click="stepPortrait(1)"><ArrowRight :size="28" :stroke-width="1.5" /></button>
        <div class="portrait-viewer-pagination" aria-label="选择竖版卡面">
          <button v-for="(portrait, index) in shadow.portraitImages" :key="portrait" type="button" :class="{ active: portraitIndex === index }" :aria-label="`第 ${index + 1} 张竖版卡面`" :aria-pressed="portraitIndex === index" @click="setPortrait(index)"></button>
        </div>
        <span class="portrait-viewer-counter">{{ portraitIndex + 1 }} / {{ shadow.portraitImages.length }}</span>
      </section>
    </Transition>
    <ReaderNamePrompt v-if="namePromptOpen" @continue="continueToStory" @cancel="namePromptOpen = false" />
  </section>
</template>

<style scoped>
.side-shadow-detail { position:absolute; inset:0; overflow:hidden; isolation:isolate; color:#f8f6ff; background:#111629; }
.detail-background { position:absolute; z-index:0; inset:0; width:100%; height:100%; object-fit:cover; object-position:center; animation:card-reveal .5s ease-out both; }
.detail-shade { position:absolute; z-index:1; inset:0; pointer-events:none; background:linear-gradient(90deg,rgba(5,8,21,.7),transparent 38%,transparent 67%,rgba(5,8,21,.35)),linear-gradient(180deg,rgba(5,8,18,.43),transparent 22%,transparent 61%,rgba(5,8,18,.62)); }
.detail-overlay { position:absolute; z-index:2; inset:0; }
.eye-toggle,.card-switch,.portrait-gallery-toggle { width:42px; height:42px; display:grid; place-items:center; color:#f4f6ff; border:1px solid #eef4ff85; border-radius:4px; background:#dfeaff10; box-shadow:0 0 18px #c7dcff18; cursor:pointer; }
.detail-header-tools { display:flex; align-items:center; gap:10px; }
.result-browse-nav { position:absolute; z-index:4; top:50%; left:0; right:0; display:flex; justify-content:space-between; padding:0 clamp(14px,2.5vw,38px); transform:translateY(-50%); pointer-events:none; }
.result-browse-nav button { width:44px; height:44px; display:grid; place-items:center; padding:0; color:#f4f6ffed; border:1px solid #eef4ff68; border-radius:50%; background:#dfeaff12; box-shadow:0 0 18px #c7dcff18; cursor:pointer; pointer-events:auto; transition:background .2s,border-color .2s,opacity .2s; }
.result-browse-nav button:hover:not(:disabled) { border-color:#fff; background:#e4edff25; }
.result-browse-nav button:disabled { opacity:.3; cursor:default; }
.shadow-meta { position:absolute; left:clamp(28px,3.2vw,52px); bottom:clamp(28px,7.4vh,82px); max-width:min(58vw,820px); text-shadow:0 2px 10px #050719,0 0 18px #050719b0; }
.shadow-topline { display:flex; align-items:baseline; gap:clamp(8px,1vw,14px); margin-bottom:1px; }
.shadow-character { color:#c9cbd5; font-size:clamp(23px,2.7vw,38px); font-weight:600; letter-spacing:.06em; }
.world-label { display:inline-flex; align-items:center; gap:.32em; line-height:1; }
.world-sparkle { flex:0 0 auto; color:#f1e8ff; font-size:1em; line-height:1; }
.shadow-world { color:#eeeef8e8; font-size:clamp(16px,1.9vw,26px); line-height:1; letter-spacing:.06em; }
.shadow-meet { color:#eeeef8e8; min-height:1em; margin-top:10px; text-align:left; white-space:nowrap; font-size:clamp(10.67px,1.267vw,17.33px); line-height:1; letter-spacing:.06em; }
.shadow-title-line { display:flex; align-items:center; gap:clamp(8px,1vw,15px); }
.shadow-rarity-icon { flex:0 0 auto; width:clamp(66px,7.6vw,104px); height:clamp(66px,9.5vh,106px); object-fit:contain; filter:drop-shadow(0 2px 8px #171321ad); transform:scale(1.3); }
.shadow-title-line h1 { margin:0; font-size:clamp(34px,4.2vw,62px); line-height:1; font-weight:600; letter-spacing:.04em; }
.story-entries { position:absolute; right:clamp(24px,3.5vw,58px); bottom:clamp(20px,3.5vh,42px); width:min(32vw,430px); display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); grid-template-rows:repeat(2,clamp(44px,6vh,58px)); gap:5px 8px; }
.story-entries button { position:relative; display:flex; flex-direction:row; align-items:center; justify-content:center; gap:9px; min-width:0; height:clamp(44px,6vh,58px); padding:7px 12px; color:#fff; border:1px solid #eef4ff78; border-radius:6px; background:transparent; box-shadow:0 0 0 3px #e7efff0c; text-shadow:0 2px 12px #1b2545c4,0 0 24px #fff9; cursor:pointer; transition:filter .2s,transform .2s,border-color .2s,box-shadow .2s,color .2s; }
.story-entries button::after { position:absolute; inset:0; z-index:0; content:''; border-radius:inherit; background:rgba(231,223,205,.075); box-shadow:inset 0 0 16px rgba(239,229,205,.1),0 0 11px rgba(219,207,175,.13); opacity:0; pointer-events:none; transition:opacity .2s; }
.story-entry-meeting { grid-column:2; grid-row:1; }
.story-entry-approach { grid-column:1; grid-row:2; }
.story-entry-reunion { grid-column:2; grid-row:2; }
.story-entries.has-key { width:max-content; grid-template-columns:repeat(3,calc(min(16vw,215px) - 4px)); grid-template-areas:'. . meeting' 'key approach reunion'; }
.story-entries.has-key .story-entry-meeting { grid-area:meeting; }
.story-entries.has-key .story-entry-key { grid-area:key; }
.story-entries.has-key .story-entry-approach { grid-area:approach; }
.story-entries.has-key .story-entry-reunion { grid-area:reunion; }
.story-entries button:hover,.story-entries button.active { transform:translateY(-2px); color:#f8f5eb; border-color:#e8dfca; box-shadow:0 0 0 1px #e8dfca35,0 0 12px #dfd2b052; }
.story-entries button:hover::after,.story-entries button.active::after { opacity:1; }
.story-entries button:hover .story-button-icon,.story-entries button.active .story-button-icon { color:#f0e9d9; filter:drop-shadow(0 0 4px #e8dcc1a6) drop-shadow(0 0 8px #e3d5b77a); }
.story-entries button:hover .story-button-icon img,.story-entries button.active .story-button-icon img { filter:brightness(0) saturate(100%) invert(92%) sepia(13%) saturate(420%) hue-rotate(10deg) brightness(105%) contrast(95%); }
.story-button-icon { position:relative; z-index:1; flex:0 0 auto; width:clamp(20px,2vw,27px); height:clamp(20px,2vw,27px); display:grid; place-items:center; color:#fff; filter:drop-shadow(0 1px 4px #101426b3); }
.story-button-icon :deep(svg) { width:100%; height:100%; }
.story-button-icon img { width:100%; height:100%; object-fit:contain; filter:brightness(0) invert(1); }
.story-button-label { position:relative; z-index:1; min-width:0; font-size:clamp(15px,1.45vw,20px); line-height:1.2; letter-spacing:.1em; font-weight:600; white-space:nowrap; }
.detail-status,.missing-card { position:absolute; z-index:4; left:50%; top:50%; transform:translate(-50%,-50%); padding:12px 18px; color:#f1f1fa; background:#10162db0; text-shadow:0 1px 5px #050719; }
.missing-card { top:auto; bottom:12px; left:50%; font-size:12px; }
.restore-ui { position:absolute; z-index:5; inset:0; width:100%; height:100%; border:0; background:transparent; cursor:pointer; }
.detail-ui-enter-active,.detail-ui-leave-active { transition:opacity .25s ease; }
.detail-ui-enter-from,.detail-ui-leave-to { opacity:0; }
.portrait-viewer { position:absolute; z-index:30; inset:0; display:grid; place-items:center; overflow:hidden; background:rgba(5,8,20,.2); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); }
.portrait-viewer-stage { position:absolute; inset:0; width:100%; height:100%; touch-action:none; }
.portrait-viewer-image { position:absolute; top:50%; left:50%; display:block; max-width:min(66vw,760px); max-height:82vh; object-fit:contain; user-select:none; transform:translate(-50%,-50%); box-shadow:0 12px 48px rgba(0,0,0,.56); }
.portrait-viewer-close,.portrait-viewer-arrow { position:absolute; z-index:1; display:grid; place-items:center; padding:0; color:#f4f6ffed; border:1px solid #eef4ff68; border-radius:50%; background:#dfeaff12; box-shadow:0 0 18px #c7dcff18; cursor:pointer; }
.portrait-viewer-close { top:clamp(14px,3vh,30px); right:clamp(16px,3vw,38px); width:42px; height:42px; }
.portrait-viewer-arrow { top:50%; width:48px; height:48px; transform:translateY(-50%); }
.portrait-viewer-previous { left:clamp(14px,3vw,38px); }.portrait-viewer-next { right:clamp(14px,3vw,38px); }
.portrait-viewer-close:hover,.portrait-viewer-arrow:hover { border-color:#fff; background:#e4edff25; }
.portrait-viewer-pagination { position:absolute; bottom:clamp(17px,4vh,38px); left:50%; display:flex; align-items:center; gap:12px; transform:translateX(-50%); }
.portrait-viewer-pagination button { width:8px; height:8px; padding:0; border:1px solid #f4f6ff9c; border-radius:50%; background:#f4f6ff3a; transition:transform .2s,background .2s,box-shadow .2s; }
.portrait-viewer-pagination button.active { transform:scale(1.35); background:#fff; box-shadow:0 0 9px #fff; }
.portrait-viewer-counter { position:absolute; right:clamp(17px,4vw,52px); bottom:clamp(16px,3.8vh,34px); color:#f4f6ffae; font:12px var(--mono); letter-spacing:.12em; }
.portrait-viewer-enter-active,.portrait-viewer-leave-active { transition:opacity .2s ease; }.portrait-viewer-enter-from,.portrait-viewer-leave-to { opacity:0; }
@keyframes card-reveal { from { opacity:.55; transform:scale(1.015); } to { opacity:1; transform:scale(1); } }

@media (max-width:850px) and (orientation:landscape), (max-width:820px) and (orientation:portrait) {
  .eye-toggle,.card-switch,.portrait-gallery-toggle { width:34px; height:34px; }.eye-toggle :deep(svg),.card-switch :deep(svg),.portrait-gallery-toggle :deep(svg) { width:19px; height:19px; }.detail-header-tools { gap:7px; }.result-browse-nav { padding:0 10px; }.result-browse-nav button { width:32px; height:32px; }.result-browse-nav button :deep(svg) { width:20px; height:20px; }
  .shadow-meta { left:20px; bottom:25px; max-width:49vw; }.shadow-topline { gap:6px; }.shadow-character { font-size:clamp(16px,2.7vw,21px); }.shadow-world { font-size:clamp(11px,1.8vw,14px); }.shadow-meet { margin-top:7px; font-size:clamp(7.33px,1.2vw,9.33px); }.shadow-rarity-icon { width:clamp(42px,7vw,60px); height:clamp(45px,9vh,64px); }.shadow-title-line { gap:5px; }.shadow-title-line h1 { font-size:clamp(26px,4.7vw,38px); }
  .story-entries { right:17px; bottom:14px; width:min(46vw,350px); grid-template-columns:repeat(3,minmax(0,1fr)); grid-template-rows:repeat(2,clamp(34px,9vh,44px)); grid-template-areas:'. . meeting' '. approach reunion'; gap:3px 5px; }.story-entry-meeting { grid-area:meeting; }.story-entry-approach { grid-area:approach; }.story-entry-reunion { grid-area:reunion; }.story-entries.has-key { width:min(46vw,350px); grid-template-columns:repeat(3,minmax(0,1fr)); grid-template-areas:'. . meeting' 'key approach reunion'; }.story-entries.has-key .story-entry-key { grid-area:key; }.story-entries button { height:clamp(34px,9vh,44px); gap:5px; padding:5px 7px; }.story-button-icon { width:clamp(16px,2.8vw,21px); height:clamp(16px,2.8vw,21px); }.story-button-label { font-size:clamp(10px,1.9vw,14px); }
}
@media (max-width:820px) and (orientation:portrait) {
  .app-frame.is-portrait-phone .shadow-meta { max-width:49vh; }
  .app-frame.is-portrait-phone .shadow-character { font-size:clamp(16px,2.7vh,21px); }
  .app-frame.is-portrait-phone .shadow-world { font-size:clamp(11px,1.8vh,14px); }
  .app-frame.is-portrait-phone .shadow-meet { font-size:clamp(7.33px,1.2vh,9.33px); }
  .app-frame.is-portrait-phone .shadow-rarity-icon { width:clamp(42px,7vh,60px); height:clamp(45px,9vw,64px); }
  .app-frame.is-portrait-phone .shadow-title-line h1 { font-size:clamp(26px,4.7vh,38px); }
  .app-frame.is-portrait-phone .story-entries,.app-frame.is-portrait-phone .story-entries.has-key { width:min(46vh,350px); }
}
@media (max-width:850px) and (orientation:landscape) {
  .portrait-viewer-image { width:min(38vw,76vh); height:auto; max-width:none; max-height:none; transform:translate(-50%,-50%) rotate(-90deg); }
  .portrait-viewer-arrow { width:38px; height:38px; }
  .portrait-viewer-arrow :deep(svg) { width:22px; height:22px; }
  .portrait-viewer-close { width:34px; height:34px; }
  .portrait-viewer-close :deep(svg) { width:20px; height:20px; }
  .portrait-viewer-pagination { bottom:11px; gap:9px; }.portrait-viewer-pagination button { width:6px; height:6px; }.portrait-viewer-counter { right:17px; bottom:12px; font-size:9px; }
}
@media (max-width:820px) and (orientation:portrait) {
  .portrait-viewer-image { width:min(76vw,38vh); height:auto; max-width:none; max-height:none; transform:translate(-50%,-50%) rotate(-90deg); }
  .portrait-viewer-arrow { width:38px; height:38px; }
  .portrait-viewer-arrow :deep(svg) { width:22px; height:22px; }
  .portrait-viewer-close { width:34px; height:34px; }
  .portrait-viewer-close :deep(svg) { width:20px; height:20px; }
  .portrait-viewer-pagination { bottom:11px; gap:9px; }.portrait-viewer-pagination button { width:6px; height:6px; }.portrait-viewer-counter { right:17px; bottom:12px; font-size:9px; }
}
</style>
