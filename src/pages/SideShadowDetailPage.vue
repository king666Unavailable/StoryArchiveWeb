<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { ArrowLeft, Eye, Heart, Repeat2, Sparkles } from '@lucide/vue'
import {
  getSideShadowCardVariant,
  loadSideShadows,
  saveSideShadowCardVariant,
  type SideShadow,
  type SideShadowCardVariant,
} from '../content/sideShadows'

const route = useRoute()
const shadow = ref<SideShadow | null>(null)
const selectedCard = ref<SideShadowCardVariant>('card1')
const selectedEntry = ref('')
const isUiVisible = ref(true)
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
const storyEntries = [
  { id: 'meeting', label: '相会', icon: Heart },
  { id: 'approach', label: '贴近', icon: Sparkles },
  { id: 'reunion', label: '重逢', icon: Heart },
]

const hasSecondCard = computed(() => Boolean(shadow.value?.card2))
const activeImage = computed(() => {
  if (!shadow.value) return ''
  return selectedCard.value === 'card2' && shadow.value.card2
    ? shadow.value.card2
    : shadow.value.card1
})
const rarityIcon = computed(() => shadow.value ? rarityIcons[shadow.value.rarity] ?? '' : '')

onMounted(async () => {
  window.addEventListener('keydown', onKeydown)
  try {
    const records = await loadSideShadows()
    const { worldId, characterId, shadowId } = route.params
    shadow.value = records.find((item) =>
      item.worldId === String(worldId) &&
      item.characterId === String(characterId) &&
      item.shadowId === String(shadowId)) ?? null
    if (shadow.value) selectedCard.value = getSideShadowCardVariant(shadow.value)
  } catch (error) {
    console.error('侧影详情读取失败', error)
    loadError.value = true
  } finally {
    isLoading.value = false
  }
})

onUnmounted(() => window.removeEventListener('keydown', onKeydown))

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && !isUiVisible.value) isUiVisible.value = true
}

function toggleCard() {
  if (!shadow.value?.card2) return
  selectedCard.value = selectedCard.value === 'card1' ? 'card2' : 'card1'
  saveSideShadowCardVariant(shadow.value, selectedCard.value)
}
</script>

<template>
  <section class="side-shadow-detail" aria-label="侧影详情" @click.self="isUiVisible = true">
    <img v-if="activeImage" class="detail-background" :src="activeImage" :alt="`${shadow?.title ?? '侧影'}卡面`" />
    <div class="detail-shade" aria-hidden="true"></div>

    <button v-if="!isUiVisible" class="restore-ui" type="button" aria-label="显示界面" @click="isUiVisible = true"></button>

    <Transition name="detail-ui">
      <div v-if="isUiVisible" class="detail-overlay">
        <header class="quest-header">
          <RouterLink class="quest-back" to="/side-shadows" aria-label="返回侧影筛选">
            <ArrowLeft :size="25" :stroke-width="1.4" />
          </RouterLink>
          <span class="quest-header-divider" aria-hidden="true"></span>
          <div class="quest-header-title"><strong>侧影详情</strong><small>SHADOW DETAILS</small></div>
          <div class="detail-header-tools">
            <button v-if="hasSecondCard" class="card-switch" type="button" :aria-label="selectedCard === 'card1' ? '切换到卡面2' : '切换到卡面1'" :title="selectedCard === 'card1' ? '切换到卡面2' : '切换到卡面1'" @click="toggleCard">
              <Repeat2 :size="22" :stroke-width="1.5" />
            </button>
            <button class="eye-toggle" type="button" aria-label="隐藏界面" title="隐藏界面" @click="isUiVisible = false">
              <Eye :size="23" :stroke-width="1.6" />
            </button>
          </div>
        </header>

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
        </section>

        <nav v-if="shadow" class="story-entries" aria-label="侧影剧情入口">
          <button v-for="entry in storyEntries" :key="entry.id" type="button" :class="{ active: selectedEntry === entry.id }" :aria-pressed="selectedEntry === entry.id" @click="selectedEntry = entry.id">
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
  </section>
</template>

<style scoped>
.side-shadow-detail { position:absolute; inset:0; overflow:hidden; isolation:isolate; color:#f8f6ff; background:#111629; }
.detail-background { position:absolute; z-index:0; inset:0; width:100%; height:100%; object-fit:cover; object-position:center; animation:card-reveal .5s ease-out both; }
.detail-shade { position:absolute; z-index:1; inset:0; pointer-events:none; background:linear-gradient(90deg,rgba(5,8,21,.7),transparent 38%,transparent 67%,rgba(5,8,21,.35)),linear-gradient(180deg,rgba(5,8,18,.43),transparent 22%,transparent 61%,rgba(5,8,18,.62)); }
.detail-overlay { position:absolute; z-index:2; inset:0; }
.quest-header { position:absolute; top:0; left:0; right:0; height:76px; padding:0 clamp(24px,4.7vw,78px); display:flex; align-items:center; gap:13px; border-bottom:1px solid rgba(228,237,255,.12); background:linear-gradient(180deg,rgba(9,14,33,.44),rgba(9,14,33,.08)); }
.quest-back,.eye-toggle,.card-switch { width:42px; height:42px; display:grid; place-items:center; color:#f4f6ff; border:1px solid #eef4ff85; border-radius:4px; background:#dfeaff10; box-shadow:0 0 18px #c7dcff18; cursor:pointer; }
.quest-back { text-decoration:none; }.quest-back :deep(svg) { width:27px; height:27px; }
.quest-header-divider { height:29px; width:1px; background:linear-gradient(transparent,#eff4ff9a,transparent); margin:0 1px; }
.quest-header-title { display:flex; flex-direction:column; gap:3px; }.quest-header-title strong { font-size:17px; font-weight:600; letter-spacing:.12em; }.quest-header-title small { color:#e9eeff91; font:8px var(--mono); letter-spacing:.2em; }
.detail-header-tools { margin-left:auto; display:flex; align-items:center; gap:10px; }
.shadow-meta { position:absolute; left:clamp(28px,3.2vw,52px); bottom:clamp(28px,7.4vh,82px); max-width:min(58vw,820px); text-shadow:0 2px 10px #050719,0 0 18px #050719b0; }
.shadow-topline { display:flex; align-items:baseline; gap:clamp(8px,1vw,14px); margin-bottom:1px; }
.shadow-character { color:#c9cbd5; font-size:clamp(23px,2.7vw,38px); font-weight:600; letter-spacing:.06em; }
.world-label { display:inline-flex; align-items:center; gap:.32em; line-height:1; }
.world-sparkle { flex:0 0 auto; color:#f1e8ff; font-size:1em; line-height:1; }
.shadow-world { color:#eeeef8e8; font-size:clamp(16px,1.9vw,26px); line-height:1; letter-spacing:.06em; }
.shadow-title-line { display:flex; align-items:center; gap:clamp(8px,1vw,15px); }
.shadow-rarity-icon { flex:0 0 auto; width:clamp(66px,7.6vw,104px); height:clamp(66px,9.5vh,106px); object-fit:contain; filter:drop-shadow(0 2px 8px #171321ad); transform:scale(1.3); }
.shadow-title-line h1 { margin:0; font-size:clamp(34px,4.2vw,62px); line-height:1; font-weight:600; letter-spacing:.04em; }
.story-entries { position:absolute; right:clamp(24px,3.5vw,58px); bottom:clamp(20px,3.5vh,42px); width:min(32vw,430px); display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:5px 8px; }
.story-entries button { position:relative; display:flex; flex-direction:row; align-items:center; justify-content:center; gap:9px; min-width:0; height:clamp(44px,6vh,58px); padding:7px 12px; color:#fff; border:1px solid #eef4ff78; border-radius:6px; background:transparent; box-shadow:0 0 0 3px #e7efff0c; text-shadow:0 2px 12px #1b2545c4,0 0 24px #fff9; cursor:pointer; transition:filter .2s,transform .2s,border-color .2s,box-shadow .2s,color .2s; }
.story-entries button::after { position:absolute; inset:0; z-index:0; content:''; border-radius:inherit; background:rgba(231,223,205,.075); box-shadow:inset 0 0 16px rgba(239,229,205,.1),0 0 11px rgba(219,207,175,.13); opacity:0; pointer-events:none; transition:opacity .2s; }
.story-entries button:nth-child(1) { grid-column:2; grid-row:1; }
.story-entries button:nth-child(2) { grid-column:1; grid-row:2; }
.story-entries button:nth-child(3) { grid-column:2; grid-row:2; }
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
@keyframes card-reveal { from { opacity:.55; transform:scale(1.015); } to { opacity:1; transform:scale(1); } }

@media (max-width:850px) and (orientation:landscape), (max-width:820px) and (orientation:portrait) {
  .quest-header { height:49px; padding:0 18px; }.quest-back,.eye-toggle,.card-switch { width:31px; height:31px; }.quest-back :deep(svg),.eye-toggle :deep(svg),.card-switch :deep(svg) { width:19px; height:19px; }.quest-header-title strong { font-size:14px; }.quest-header-title small { font-size:7px; }.detail-header-tools { gap:7px; }
  .shadow-meta { left:20px; bottom:25px; max-width:49vw; }.shadow-topline { gap:6px; }.shadow-character { font-size:clamp(16px,2.7vw,21px); }.shadow-world { font-size:clamp(11px,1.8vw,14px); }.shadow-rarity-icon { width:clamp(42px,7vw,60px); height:clamp(45px,9vh,64px); }.shadow-title-line { gap:5px; }.shadow-title-line h1 { font-size:clamp(26px,4.7vw,38px); }
  .story-entries { right:17px; bottom:14px; width:min(54vw,390px); gap:3px 5px; }.story-entries button { height:clamp(34px,9vh,44px); gap:5px; padding:5px 7px; }.story-button-icon { width:clamp(16px,2.8vw,21px); height:clamp(16px,2.8vw,21px); }.story-button-label { font-size:clamp(10px,1.9vw,14px); }
}
@media (max-width:820px) and (orientation:portrait) {
  .app-frame.is-portrait-phone .shadow-meta { max-width:49vh; }
  .app-frame.is-portrait-phone .shadow-character { font-size:clamp(16px,2.7vh,21px); }
  .app-frame.is-portrait-phone .shadow-world { font-size:clamp(11px,1.8vh,14px); }
  .app-frame.is-portrait-phone .shadow-rarity-icon { width:clamp(42px,7vh,60px); height:clamp(45px,9vw,64px); }
  .app-frame.is-portrait-phone .shadow-title-line h1 { font-size:clamp(26px,4.7vh,38px); }
  .app-frame.is-portrait-phone .story-entries { width:min(54vh,390px); }
}
</style>
