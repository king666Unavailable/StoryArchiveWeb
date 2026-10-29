<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { Undo2 } from '@lucide/vue'
import {
  createSideShadowFilterContextId,
  getActiveSideShadowFilterContextId,
  getSideShadowThumbnail,
  loadSideShadowFilterContext,
  loadSideShadows,
  saveSideShadowFilterContext,
  type SideShadow,
  type SideShadowFilterContext,
  type SideShadowFilterKey,
  type SideShadowFilterSort,
  type SideShadowFilterState,
} from '../content/sideShadows'

type FilterKey = SideShadowFilterKey
type FilterState = SideShadowFilterState

const categoryTitle = '侧影'
const route = useRoute()
const rarityOptions = ['刹那', '世界', '瞬', '月', '辰星', '星']
const mainAttributeOptions = ['思维', '魅力', '体魄', '感知', '灵巧']

const shadows = ref<SideShadow[]>([])
const isLoading = ref(true)
const loadError = ref(false)

const attributeIcons: Record<string, string> = {
  思维: '/icon/SiWei.png',
  魅力: '/icon/MeiLi.png',
  体魄: '/icon/TiPo.png',
  感知: '/icon/GanZhi.png',
  灵巧: '/icon/LingQiao.png',
}
const rarityIcons: Record<string, string> = {
  刹那: '/icon/ChaNa.png',
  世界: '/icon/ShiJie.png',
  瞬: '/icon/Shun.png',
  月: '/icon/Yue.png',
  辰星: '/icon/ChenXing.png',
  星: '/icon/Xing.png',
}

const worldOptions = computed(() => [...new Set(shadows.value.map((shadow) => shadow.world).filter(Boolean))])
const characters = computed(() => [...new Set(shadows.value.map((shadow) => shadow.character).filter(Boolean))])
const filterGroups = computed(() => [
  { key: 'rarity' as const, title: '稀有度', options: ['全部', ...rarityOptions] },
  { key: 'world' as const, title: '世界', options: ['全部', ...worldOptions.value] },
  { key: 'attribute' as const, title: '属性', options: ['全部', ...mainAttributeOptions] },
])

function attributeIcon(attribute: string) {
  return attributeIcons[attribute] ?? ''
}

function rarityIcon(rarity: string) {
  return rarityIcons[rarity] ?? ''
}

function emptyFilters(): FilterState {
  return { rarity: [], world: [], attribute: [], character: [] }
}

const selectedFilters = ref<FilterState>(emptyFilters())
const sortOrder = ref<SideShadowFilterSort>('rarity-desc')
const contextFromRoute = typeof route.query.context === 'string' ? route.query.context : ''
const contextId = ref(contextFromRoute || getActiveSideShadowFilterContextId() || createSideShadowFilterContextId())
const savedContext = loadSideShadowFilterContext(contextId.value)
if (savedContext) {
  selectedFilters.value = savedContext.filters
  sortOrder.value = savedContext.sortOrder
}

function persistFilterContext() {
  const context: SideShadowFilterContext = {
    resultIds: filteredCards.value.map((card) => card.id),
    filters: selectedFilters.value,
    sortOrder: sortOrder.value,
  }
  saveSideShadowFilterContext(contextId.value, context)
}

onMounted(async () => {
  try {
    shadows.value = await loadSideShadows()
  } catch (error) {
    console.error('侧影列表读取失败', error)
    loadError.value = true
  } finally {
    isLoading.value = false
  }
})

function toggleFilter(key: FilterKey, value: string) {
  if (value === '全部') {
    selectedFilters.value[key] = []
    return
  }
  const current = selectedFilters.value[key]
  selectedFilters.value[key] = current.includes(value)
    ? current.filter((item) => item !== value)
    : [...current, value]
}

function resetFilters() {
  selectedFilters.value = emptyFilters()
}

const filteredCards = computed(() => {
  const selected = selectedFilters.value
  const cards = shadows.value.filter((card) =>
    (selected.rarity.length === 0 || selected.rarity.includes(card.rarity)) &&
    (selected.world.length === 0 || selected.world.includes(card.world)) &&
    (selected.attribute.length === 0 || selected.attribute.includes(card.mainAttribute)) &&
    (selected.character.length === 0 || selected.character.includes(card.character)))
  return [...cards].sort((a, b) => {
    if (sortOrder.value === 'name') return a.title.localeCompare(b.title, 'zh-CN')
    const aRarity = rarityOptions.indexOf(a.rarity)
    const bRarity = rarityOptions.indexOf(b.rarity)
    const aRank = aRarity < 0 ? rarityOptions.length : aRarity
    const bRank = bRarity < 0 ? rarityOptions.length : bRarity
    const difference = aRank - bRank
    return sortOrder.value === 'rarity-desc' ? difference : -difference
  })
})

watch([filteredCards, selectedFilters, sortOrder], persistFilterContext, { deep: true, flush: 'sync' })
</script>

<template>
  <section class="shadow-filter-page" aria-label="侧影筛选">
    <div class="shadow-filter-shade" aria-hidden="true"></div>

    <header class="quest-header">
      <RouterLink class="quest-back" to="/archive" aria-label="返回主神空间">
        <svg viewBox="0 0 40 40" aria-hidden="true"><path d="M25 8 13 20l12 12M14 20h19" /></svg>
      </RouterLink>
      <span class="quest-header-divider"></span>
      <div class="quest-header-title"><strong>侧影筛选</strong><small>SHADOW FILTER</small></div>
    </header>

    <div class="filter-layout">
      <aside class="filter-attributes" aria-label="属性筛选">
        <div class="filter-aside-heading"><span>属性筛选</span><i aria-hidden="true">✦</i></div>
        <section v-for="group in filterGroups" :key="group.key" class="filter-group">
          <h2><span aria-hidden="true">✦</span>{{ group.title }}</h2>
          <div class="filter-options" :class="`filter-options-${group.key}`">
            <button v-for="option in group.options" :key="option" type="button"
              :class="{ active: option === '全部' ? selectedFilters[group.key].length === 0 : selectedFilters[group.key].includes(option) }"
              :aria-pressed="option === '全部' ? selectedFilters[group.key].length === 0 : selectedFilters[group.key].includes(option)"
              @click="toggleFilter(group.key, option)">
              {{ option }}
            </button>
          </div>
        </section>
      </aside>

      <section class="filter-results" aria-label="筛选结果">
        <div class="results-toolbar">
          <div class="results-count"><span>{{ categoryTitle }}</span><span>数量 <strong>{{ filteredCards.length }}</strong></span></div>
          <label class="results-sort"><span>排序</span>
            <select v-model="sortOrder" aria-label="侧影排序">
              <option value="rarity-desc">稀有度 ↓</option>
              <option value="rarity-asc">稀有度 ↑</option>
              <option value="name">名称</option>
            </select>
          </label>
        </div>
        <div class="results-scroll">
          <p v-if="isLoading" class="results-status">正在读取侧影资料…</p>
          <p v-else-if="loadError" class="results-status">侧影资料读取失败</p>
          <div v-else-if="filteredCards.length" class="shadow-card-grid">
            <RouterLink v-for="card in filteredCards" :key="card.id" class="shadow-card" :to="{ name: 'side-shadow-detail', params: { worldId: card.worldId, characterId: card.characterId, shadowId: card.shadowId }, query: { context: contextId } }">
              <img v-if="getSideShadowThumbnail(card)" class="card-thumbnail" :src="getSideShadowThumbnail(card)" :alt="`${card.title}缩略图`" loading="lazy" decoding="async">
              <img v-if="attributeIcon(card.mainAttribute)" class="card-attribute-icon" :src="attributeIcon(card.mainAttribute)" :alt="`${card.mainAttribute}属性`" loading="lazy" decoding="async">
              <img v-if="rarityIcon(card.rarity)" class="card-rarity-icon" :src="rarityIcon(card.rarity)" :alt="`${card.rarity}稀有度`" loading="lazy" decoding="async">
              <strong class="card-title">{{ card.title }}</strong>
            </RouterLink>
          </div>
          <div v-else class="results-empty"><span aria-hidden="true">✧</span><p>没有符合条件的侧影</p><button type="button" @click="resetFilters">清除筛选</button></div>
        </div>
      </section>

      <aside class="filter-characters" aria-label="人物筛选">
        <h2>人物筛选</h2>
        <div class="character-list">
          <button v-for="character in characters" :key="character" type="button"
            :class="{ active: selectedFilters.character.includes(character) }" :aria-pressed="selectedFilters.character.includes(character)"
            @click="toggleFilter('character', character)">
            <span class="character-name">{{ character }}</span>
          </button>
          <button class="character-all" type="button" :class="{ active: selectedFilters.character.length === 0 }" :aria-pressed="selectedFilters.character.length === 0" @click="toggleFilter('character', '全部')">全部</button>
        </div>
        <div class="filter-actions">
          <button class="reset-filter" type="button" aria-label="清除筛选" @click="resetFilters">
            <span class="reset-filter-icon" aria-hidden="true"><Undo2 :size="20" :stroke-width="1.6" /></span>
            <span class="reset-filter-label">清除筛选</span>
          </button>
        </div>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.shadow-filter-page { position:absolute; inset:0; overflow:hidden; isolation:isolate; color:#f5f2fa; background:#12172d url('/backgrounds/shadow-gallery-no-text2.webp') center / cover no-repeat; }
.shadow-filter-shade { position:absolute; inset:0; z-index:0; pointer-events:none; background:linear-gradient(90deg,rgba(7,10,24,.87),rgba(22,24,54,.64) 28%,rgba(25,28,62,.43) 63%,rgba(7,10,24,.82)),linear-gradient(180deg,rgba(8,10,26,.54),transparent 35%,rgba(12,14,34,.46)); }
.quest-header { position:absolute; z-index:5; top:0; left:0; right:0; height:76px; padding:0 clamp(24px,4.7vw,78px); display:flex; align-items:center; gap:13px; border-bottom:1px solid rgba(228,237,255,.12); background:linear-gradient(180deg,rgba(9,14,33,.44),rgba(9,14,33,.08)); }
.quest-back { width:42px; height:42px; display:grid; place-items:center; color:#f4f6ff; border:1px solid #eef4ff85; border-radius:4px; background:#dfeaff10; box-shadow:0 0 18px #c7dcff18; text-decoration:none; cursor:pointer; }.quest-back svg { width:27px; height:27px; fill:none; stroke:currentColor; stroke-width:1.3; stroke-linecap:round; stroke-linejoin:round; }
.quest-header-divider { height:29px; width:1px; background:linear-gradient(transparent,#eff4ff9a,transparent); margin:0 1px; }
.quest-header-title { display:flex; flex-direction:column; gap:3px; }.quest-header-title strong { font-size:17px; font-weight:600; letter-spacing:.12em; }.quest-header-title small { color:#e9eeff91; font:8px var(--mono); letter-spacing:.2em; }
.filter-layout { position:absolute; z-index:1; inset:90px clamp(52px,9vw,148px) 18px clamp(32px,7vw,116px); display:grid; grid-template-columns:minmax(180px,23%) minmax(0,1fr) minmax(138px,17%); gap:clamp(14px,2vw,36px); min-height:0; }
.filter-attributes,.filter-results,.filter-characters { min-width:0; min-height:0; }
.filter-attributes,.filter-characters { overflow-y:auto; scrollbar-width:thin; scrollbar-color:#cbd4f75c transparent; }
.filter-aside-heading { display:flex; justify-content:space-between; align-items:center; min-height:46px; padding:0 10px 10px; border-bottom:1px solid #e6e5fa61; font-size:clamp(15px,1.5vw,20px); font-weight:600; letter-spacing:.14em; }.filter-aside-heading i { color:#d8dbf3; font-size:13px; font-style:normal; }
.filter-group { margin:clamp(18px,5vh,54px) 0 0; }.filter-group h2 { display:flex; align-items:center; gap:11px; margin:0 0 13px; padding:0 7px 11px; border-bottom:1px solid #dce0f452; font-size:clamp(15px,1.5vw,21px); font-weight:600; letter-spacing:.1em; text-shadow:0 0 12px #e4e3ff75; }.filter-group h2 span { font-size:14px; color:#f5f3ff; text-shadow:0 0 8px #fff; }
.filter-options { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:5px 9px; padding:0 6px; }.filter-options-rarity { grid-template-columns:repeat(3,minmax(0,1fr)); }.filter-options button { min-width:0; padding:5px 1px; border:0; background:transparent; color:#c0c4d7; text-align:left; font-size:clamp(12px,1.1vw,16px); font-weight:600; letter-spacing:.03em; cursor:pointer; transition:color .2s,text-shadow .2s; }.filter-options button:hover,.filter-options button.active { color:#fff; text-shadow:0 0 10px #f2f0ff,0 0 20px #ccd5ff; }.filter-options button.active::before { content:'✧'; margin-right:4px; color:#f6f5ff; font-size:.8em; }
.filter-results { display:flex; flex-direction:column; }.results-toolbar { flex:0 0 auto; min-height:55px; display:flex; align-items:center; justify-content:space-between; gap:12px; border-bottom:1px solid #dce3f44e; }.results-count { display:flex; align-items:baseline; flex-wrap:wrap; gap:15px; font-size:clamp(15px,1.3vw,19px); font-weight:600; letter-spacing:.08em; }.results-count span:nth-child(2) { font-size:.9em; }.results-count strong { margin-left:4px; font-size:1.25em; font-family:Georgia,serif; }.results-count small { color:#b9bbd0; font-size:10px; letter-spacing:.14em; font-weight:400; }.results-sort { display:flex; align-items:center; gap:8px; white-space:nowrap; color:#c9cee2; font-size:12px; }.results-sort select { min-width:105px; padding:7px 22px 7px 9px; border:1px solid #f0efff6e; background:#182039d9; color:#f8f7ff; font:inherit; cursor:pointer; }
.results-scroll { min-height:0; overflow-y:auto; padding:18px 3px 24px; scrollbar-width:thin; scrollbar-color:#cbd4f75c transparent; }.shadow-card-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:clamp(10px,1.6vw,23px); }.shadow-card { position:relative; min-width:0; aspect-ratio:1.94; overflow:hidden; border:1px solid #d5e2ff71; background:radial-gradient(circle at 65% 44%,#c1c8e85e,transparent 24%),radial-gradient(circle at 22% 18%,#f0e5d52d,transparent 38%),linear-gradient(128deg,#35405ebd,#687397aa 48%,#202846f0); box-shadow:0 4px 18px #0205128c,inset 0 0 24px #e0eaff28; filter:hue-rotate(var(--card-tone)); }.shadow-card::before { content:''; position:absolute; inset:5px; border:1px solid #dbe5ff4d; clip-path:polygon(0 0,100% 0,100% 75%,78% 100%,0 100%); }.shadow-card::after { content:''; position:absolute; inset:0; background:linear-gradient(0deg,#070a1bbf,transparent 47%); }.card-corner { position:absolute; z-index:2; top:7px; left:9px; color:#e7efff; font-size:16px; text-shadow:0 0 9px #fff; }.card-art-placeholder { position:absolute; top:20%; left:46%; font-size:clamp(27px,4vw,58px); color:#eaf2ff52; text-shadow:0 0 25px #eef5ff; }.card-meta { position:absolute; z-index:2; left:10px; right:31px; bottom:7px; display:flex; align-items:baseline; gap:6px; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; text-shadow:0 1px 4px #050718; }.card-meta strong { overflow:hidden; text-overflow:ellipsis; font-size:clamp(11px,1vw,15px); }.card-character { color:#e0e3f3b8; font-size:clamp(9px,.8vw,12px); }.card-rarity { position:absolute; z-index:2; top:5px; right:8px; color:#f7f1dc; font-size:clamp(11px,1.3vw,19px); font-weight:600; text-shadow:0 0 9px #fff; }
.results-empty { height:65%; display:flex; flex-direction:column; justify-content:center; align-items:center; color:#d5d9ec; }.results-empty span { font-size:34px; text-shadow:0 0 16px #fff; }.results-empty p { margin:10px 0 14px; }.results-empty button { padding:6px 14px; border:1px solid #dce5ff80; background:#d7e7ff16; color:#f4f6ff; cursor:pointer; }
.filter-characters { display:flex; flex-direction:column; align-items:stretch; }.filter-characters h2 { margin:7px 0 17px; min-height:48px; border-bottom:1px solid #dce3f44e; text-align:center; font-size:clamp(16px,1.5vw,21px); letter-spacing:.12em; }.character-list { display:flex; flex-direction:column; align-items:center; gap:8px; }.character-list button { width:100%; padding:0; border:0; background:transparent; color:#e5e3ec; cursor:pointer; }.character-list button:not(.character-all) { display:flex; flex-direction:column; align-items:center; gap:3px; }.character-portrait { position:relative; width:min(100%,150px); height:clamp(32px,5.9vh,57px); display:grid; place-items:center; overflow:hidden; border-top:1px solid #e8e9ffbb; border-bottom:1px solid #e8e9ffbb; background:radial-gradient(ellipse at 50% 35%,#d9daef70,transparent 32%),linear-gradient(110deg,#45536d9e,#1b2442b8 50%,#55617a9e); filter:hue-rotate(var(--portrait-tone)); box-shadow:inset 0 0 17px #d7ddf532; clip-path:polygon(6% 0,100% 0,94% 100%,0 100%); }.character-portrait span { color:#dfe7ff9c; font-size:21px; text-shadow:0 0 14px #fff; }.character-name { color:#c7ccde; }.character-list button.active .character-portrait { border-color:#fff; box-shadow:0 0 13px #d9e4ff8c,inset 0 0 20px #f7f6ff58; }.character-list button.active .character-name { color:#fff; text-shadow:0 0 9px #fff; }.character-all { margin-top:7px; padding:8px 0 !important; border-top:1px solid #e8e9ff84 !important; border-bottom:1px solid #e8e9ff84 !important; font-size:clamp(16px,1.5vw,21px); font-weight:600; letter-spacing:.16em; }.character-all.active { text-shadow:0 0 12px #fff; }
.filter-actions { display:flex; align-items:center; justify-content:center; gap:12px; margin-top:auto; padding:18px 0 2px; }.filter-actions button { color:#f5f6ff; cursor:pointer; }.reset-filter { width:36px; height:36px; border:1px solid #e5e9ff8c; border-radius:50%; background:#d7e6ff1c; font:25px/1 Georgia,serif; }
.shadow-card { background:transparent; box-shadow:none; filter:none; color:inherit; text-decoration:none; }.shadow-card::after { content:none; }
.card-thumbnail { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
.card-attribute-icon,.card-rarity-icon { position:absolute; z-index:2; width:clamp(18px,2.1vw,29px); height:clamp(18px,2.1vw,29px); object-fit:contain; filter:drop-shadow(0 1px 4px #050718c9); }
.card-attribute-icon { top:6px; left:8px; }.card-rarity-icon { right:8px; width:clamp(36px,4.2vw,58px); height:clamp(36px,4.2vw,58px); }
.card-title { position:absolute; z-index:2; left:9px; bottom:6px; max-width:calc(100% - 18px); overflow:hidden; color:#fff; font-size:clamp(11px,1vw,15px); font-weight:600; text-overflow:ellipsis; white-space:nowrap; text-shadow:0 1px 5px #050718,0 0 8px #050718; }
.results-status { margin:0; padding:32px 8px; color:#d5d9ec; text-align:center; }
.character-list button:not(.character-all) { display:flex; min-height:40px; align-items:center; justify-content:center; border-bottom:1px solid #dce3f43b; }
.character-list button.active:not(.character-all) { color:#fff; text-shadow:0 0 9px #fff; }
@media (max-width:850px) and (orientation:landscape) {
  .quest-header { height:49px; padding:0 18px; }.quest-back { width:31px; height:31px; }.quest-back svg { width:23px; }.quest-header-title strong { font-size:14px; }.quest-header-title small { font-size:7px; }
  .filter-layout { inset:56px clamp(24px,4.5vw,36px) 9px; grid-template-columns:minmax(135px,23%) minmax(0,1fr) minmax(95px,17%); gap:10px; }.filter-aside-heading { min-height:29px; font-size:12px; padding-bottom:5px; }.filter-group { margin-top:10px; }.filter-group h2 { margin-bottom:5px; padding-bottom:4px; font-size:12px; gap:5px; }.filter-group h2 span { font-size:10px; }.filter-options { gap:1px 5px; padding:0 3px; }.filter-options button { padding:2px 0; font-size:10px; }.results-toolbar { min-height:32px; }.results-count { gap:6px; font-size:11px; }.results-count small { font-size:8px; }.results-sort { font-size:9px; gap:3px; }.results-sort select { min-width:80px; padding:3px 4px; }.results-scroll { padding-top:8px; }.shadow-card-grid { gap:7px; }.card-meta { left:5px; right:18px; bottom:3px; gap:3px; }.card-meta strong { font-size:9px; }.card-character { display:none; }.card-rarity { top:2px; right:4px; font-size:10px; }.card-corner { top:1px; left:4px; font-size:10px; }.filter-characters h2 { min-height:31px; margin:0 0 6px; font-size:12px; }.character-list { gap:4px; }.character-portrait { height:25px; }.character-all { margin-top:2px; padding:3px 0 !important; font-size:12px; }.filter-actions { gap:5px; padding-top:8px; }.reset-filter { width:26px; height:26px; font-size:18px; }
}
@media (max-width:820px) and (orientation:portrait) {
  .quest-header { height:49px; padding:0 18px; }.quest-back { width:31px; height:31px; }.quest-back svg { width:23px; }.quest-header-title strong { font-size:14px; }.quest-header-title small { font-size:7px; }
  .filter-layout { inset:56px clamp(24px,4.5vw,36px) 9px; grid-template-columns:minmax(135px,23%) minmax(0,1fr) minmax(95px,17%); gap:10px; }.filter-aside-heading { min-height:29px; font-size:12px; padding-bottom:5px; }.filter-group { margin-top:10px; }.filter-group h2 { margin-bottom:5px; padding-bottom:4px; font-size:12px; gap:5px; }.filter-group h2 span { font-size:10px; }.filter-options { gap:1px 5px; padding:0 3px; }.filter-options button { padding:2px 0; font-size:10px; }.results-toolbar { min-height:32px; }.results-count { gap:6px; font-size:11px; }.results-count small { font-size:8px; }.results-sort { font-size:9px; gap:3px; }.results-sort select { min-width:80px; padding:3px 4px; }.results-scroll { padding-top:8px; }.shadow-card-grid { gap:7px; }.card-meta { left:5px; right:18px; bottom:3px; gap:3px; }.card-meta strong { font-size:9px; }.card-character { display:none; }.card-rarity { top:2px; right:4px; font-size:10px; }.card-corner { top:1px; left:4px; font-size:10px; }.filter-characters h2 { min-height:31px; margin:0 0 6px; font-size:12px; }.character-list { gap:4px; }.character-portrait { height:25px; }.character-all { margin-top:2px; padding:3px 0 !important; font-size:12px; }.filter-actions { gap:5px; padding-top:8px; }.reset-filter { width:26px; height:26px; font-size:18px; }
}
.filter-actions { justify-content:flex-end; }
.reset-filter { width:auto; height:auto; display:flex; align-items:center; gap:8px; padding:0; border:0; border-radius:0; background:transparent; font:inherit; }
.reset-filter-icon { width:36px; height:36px; display:grid; place-items:center; border:1px solid #e5e9ff8c; border-radius:50%; background:#d7e6ff1c; font:25px/1 Georgia,serif; }
.reset-filter-label { color:#dce3f4; font-size:clamp(11px,.9vw,13px); letter-spacing:.08em; }
@media (max-width:850px) and (orientation:landscape), (max-width:820px) and (orientation:portrait) {
  .reset-filter-icon { width:26px; height:26px; font-size:18px; }
  .reset-filter-label { font-size:8px; }
  .character-name { font-size:10px; }
  .card-attribute-icon { top:3px; left:4px; }
  .card-rarity-icon { right:4px; }
  .card-title { left:4.5px; bottom:3px; max-width:calc(100% - 9px); }
}
</style>
