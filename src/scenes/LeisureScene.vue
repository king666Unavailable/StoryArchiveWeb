<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { Film, MapPinned, Music2, X } from '@lucide/vue'
import type { Hotspot } from '../content/navigation'

const emit = defineEmits<{ activate: [item: Hotspot] }>()

const areaStorageKey = 'story-world-hub:leisure-area'
const areas = [
  { id: 'YiYu', title: '易宅', image: '/backgrounds/YiYu_xiaguang.webp', x: '22%', y: '45%' },
  { id: 'GuShiYe', title: '顾公馆', image: '/backgrounds/GuShiYe_xiaguang.webp', x: '53%', y: '30%' },
  { id: 'BaiYuan', title: '王宫', image: '/backgrounds/BaiYuan_xiaguang.webp', x: '55%', y: '83%' },
  { id: 'XiaXiaoYin', title: '亲王府', image: '/backgrounds/XiaXiaoYin_xiaguang.webp', x: '79%', y: '70%' },
]

function loadAreaId() {
  try {
    const saved = window.localStorage.getItem(areaStorageKey)
    if (areas.some((area) => area.id === saved)) return saved!
  } catch { /* Storage may be unavailable. */ }
  return 'BaiYuan'
}

const selectedAreaId = ref(loadAreaId())
const selectedArea = computed(() => areas.find((area) => area.id === selectedAreaId.value) ?? areas[0])
const draftAreaId = ref(selectedAreaId.value)
const areaMenuOpen = ref(false)

function openAreaMenu() {
  draftAreaId.value = selectedAreaId.value
  areaMenuOpen.value = true
}

function closeAreaMenu() {
  areaMenuOpen.value = false
}

function confirmArea() {
  selectedAreaId.value = draftAreaId.value
  closeAreaMenu()
  try { window.localStorage.setItem(areaStorageKey, selectedAreaId.value) } catch { /* Keep the current selection for this visit. */ }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') closeAreaMenu()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

const entries: Record<string, Hotspot> = {
  music: { id: 'leisure-music', title: '唱片机', eyebrow: 'RECORD PLAYER', description: '在这里收藏与故事相伴的旋律。', x: 0, y: 0 },
  film: { id: 'leisure-film', title: '珍藏时光', eyebrow: 'CHERISHED MOMENTS', description: '翻看留存在胶片里的片刻。', x: 0, y: 0 },
  bedroom: { id: 'leisure-bedroom', title: '卧室', eyebrow: 'BEDROOM', description: '通往卧室的入口将在这里展开。', x: 0, y: 0 },
  wardrobe: { id: 'leisure-wardrobe', title: '衣帽间', eyebrow: 'WARDROBE', description: '通往衣帽间的入口将在这里展开。', x: 0, y: 0 },
}

function activate(id: keyof typeof entries) {
  emit('activate', entries[id])
}
</script>

<template>
  <section class="scene leisure-scene" aria-label="暇光空间场景" :style="{ backgroundImage: `url('${selectedArea.image}')` }">
    <div class="leisure-shade" aria-hidden="true"></div>

    <nav class="leisure-actions" aria-label="暇光功能">
      <button type="button" aria-label="唱片机" @click="activate('music')">
        <span class="leisure-orb" aria-hidden="true"><i class="orb-stream"></i><Music2 class="leisure-icon" :stroke-width="1.8" /></span>
        <span class="leisure-action-label">唱片机</span>
      </button>
      <button type="button" aria-label="珍藏时光" @click="activate('film')">
        <span class="leisure-orb" aria-hidden="true"><i class="orb-stream"></i><Film class="leisure-icon" :stroke-width="1.8" /></span>
        <span class="leisure-action-label">珍藏时光</span>
      </button>
      <button type="button" aria-label="空间选择" title="空间选择" :aria-expanded="areaMenuOpen" @click="areaMenuOpen ? closeAreaMenu() : openAreaMenu()">
        <span class="leisure-orb" aria-hidden="true"><i class="orb-stream"></i><MapPinned class="leisure-icon" :stroke-width="1.8" /></span>
        <span class="leisure-action-label">空间选择</span>
      </button>
    </nav>

    <div v-if="areaMenuOpen" class="detail-scrim area-menu-layer" @click.self="closeAreaMenu">
      <section class="detail-card area-menu" role="dialog" aria-modal="true" aria-label="暇光空间">
        <div class="area-menu-background" aria-hidden="true"></div>
        <button class="area-menu-close" type="button" aria-label="关闭空间选择" @click="closeAreaMenu"><X :size="20" aria-hidden="true" /></button>
        <header class="area-menu-heading"><h2>暇光空间</h2><p>可在主神空间右侧快速到访暇光空间</p></header>
        <div class="area-map" role="group" aria-label="选择空间">
          <button v-for="area in areas" :key="area.id" class="area-point" type="button" :class="{ selected: draftAreaId === area.id }" :style="{ left: area.x, top: area.y }" :aria-pressed="draftAreaId === area.id" @click="draftAreaId = area.id">
            <span class="area-point-name">{{ area.title }}</span>
            <span v-if="draftAreaId === area.id" class="area-current">当前选择</span>
          </button>
        </div>
        <button class="area-confirm" type="button" @click="confirmArea">确定</button>
      </section>
    </div>

    <div class="leisure-places">
      <button class="leisure-place leisure-bedroom" type="button" @click="activate('bedroom')">
        <span class="place-flourish" aria-hidden="true">✦</span><span>卧室</span><i aria-hidden="true"></i>
      </button>
      <button class="leisure-place leisure-wardrobe" type="button" @click="activate('wardrobe')">
        <span class="place-flourish" aria-hidden="true">✦</span><span>衣帽间</span><i aria-hidden="true"></i>
      </button>
    </div>
  </section>
</template>

<style scoped>
.leisure-scene { background-color:#281b16; background-position:center; background-size:cover; background-repeat:no-repeat; }
.leisure-shade { position:absolute; inset:0; pointer-events:none; background:linear-gradient(180deg,rgba(13,10,13,.38),transparent 34%,rgba(19,10,8,.08) 68%,rgba(18,11,11,.42)),linear-gradient(90deg,rgba(15,9,9,.20),transparent 30%,transparent 68%,rgba(15,9,9,.18)); }
.leisure-actions { position:absolute; z-index:5; top:clamp(96px,10.5vh,126px); right:clamp(76px,6vw,105px); display:flex; align-items:flex-start; gap:clamp(9px,1vw,16px); }
.leisure-actions button { width:clamp(57px,5vw,76px); display:flex; flex-direction:column; align-items:center; gap:7px; padding:3px 0; border:0; color:#fff5e7; background:transparent; cursor:pointer; transition:filter .2s,transform .2s; }
.leisure-actions button:hover { transform:translateY(-3px); filter:brightness(1.2); }
.leisure-orb { position:relative; width:clamp(37px,3.2vw,49px); aspect-ratio:1; display:grid; place-items:center; isolation:isolate; border:1px solid #ffffffb8; border-radius:50%; }
.leisure-orb::before { content:''; position:absolute; inset:-4px; border:1px solid #ffffff80; border-left-color:transparent; border-radius:50%; transform:rotate(25deg); }.leisure-orb::after { content:''; position:absolute; top:5%; right:10%; width:5px; height:5px; border-radius:50%; background:#fff; }
.orb-stream { position:absolute; width:126%; height:42%; border:1px solid #ffffffc7; border-left-color:transparent; border-right-color:#fff7; border-radius:50%; transform:rotate(-28deg); }
.leisure-icon { position:relative; z-index:1; width:clamp(19px,1.8vw,26px); height:clamp(19px,1.8vw,26px); color:#fff; filter:drop-shadow(0 0 5px #fff); }.leisure-action-label { color:#fff5e8; font-size:clamp(10px,.9vw,13px); font-weight:600; letter-spacing:.05em; white-space:nowrap; text-shadow:0 1px 5px #170d0c,0 0 10px #fff9; }
.area-menu { isolation:isolate; width:min(700px,63%); height:min(455px,60%); min-height:0; display:grid; grid-template-rows:auto minmax(0,1fr) auto; padding:clamp(13px,1.5vw,22px) clamp(16px,2.1vw,29px) clamp(11px,1.4vw,20px); overflow:visible; text-align:left; }
.area-menu-background { position:absolute; z-index:0; inset:0; overflow:hidden; pointer-events:none; background:url('/backgrounds/xiaGuangArea.webp') center / 100% 100% no-repeat; opacity:.9; -webkit-mask-image:radial-gradient(ellipse 50% 50% at center,#000 52%,#000b 76%,transparent 100%); mask-image:radial-gradient(ellipse 50% 50% at center,#000 52%,#000b 76%,transparent 100%); }
.area-menu-close { position:absolute; z-index:4; top:17px; right:18px; width:32px; height:32px; display:grid; place-items:center; padding:0; border:0; background:transparent; color:#f4f1ed; cursor:pointer; }
.area-menu-heading { position:relative; z-index:2; }.area-menu-heading h2 { margin:0; color:#f8f7ff; font-size:clamp(18px,2.1vw,27px); letter-spacing:.11em; text-shadow:0 2px 12px #d5e7ff6b; }.area-menu-heading p { margin:6px 0 0; color:#f1f0eced; font-size:clamp(10px,.95vw,13px); font-weight:600; letter-spacing:.04em; }
.area-map { position:relative; z-index:1; min-height:0; margin:2px -12px 0; }
.area-point { position:absolute; z-index:2; transform:translate(-50%,-50%); display:flex; flex-direction:column; align-items:center; gap:2px; min-width:70px; padding:2px 5px; border:0; background:transparent; color:#fff; white-space:nowrap; cursor:pointer; text-shadow:0 1px 7px #131021,0 0 9px #e3deff; }.area-point:hover { filter:brightness(1.25); }.area-point-name { position:relative; padding:0 4px 2px; font-size:clamp(13px,1.35vw,19px); font-weight:600; letter-spacing:.1em; }.area-point-name::after { content:'✦'; position:absolute; left:4px; right:4px; bottom:-3px; border-bottom:1px solid #f5f0ffc2; color:#fff; font-size:8px; line-height:0; text-align:left; }.area-point.selected .area-point-name { color:#fff7da; text-shadow:0 0 12px #fff,0 0 22px #edd9ab; }.area-current { color:#f7df7b; font-size:clamp(9px,.9vw,12px); font-weight:600; text-shadow:0 0 9px #d7b65a; }
.area-confirm { position:relative; z-index:2; justify-self:center; min-width:112px; padding:9px 14px; border:1px solid #e5efff62; color:#f6f4ef; background:#e4edff0c; box-shadow:inset 0 0 14px #dce8ff10; font-size:14px; letter-spacing:.08em; cursor:pointer; transition:background .2s,border-color .2s; }.area-confirm:hover { border-color:#eef4ffb0; background:#e4edff22; }
.leisure-places { position:absolute; inset:0; pointer-events:none; }.leisure-place { position:absolute; z-index:4; width:clamp(120px,15vw,230px); padding:10px 18px 9px; border:1px solid #fff1dca1; background:linear-gradient(90deg,#ecdcbd13,#f6e9d75c 50%,#ecdcbd13); color:#fff9ea; font-size:clamp(20px,2vw,32px); font-weight:600; letter-spacing:.13em; text-shadow:0 2px 10px #26130b,0 0 12px #fff8; box-shadow:0 0 15px #fff5,inset 0 0 12px #fff2; pointer-events:auto; transition:transform .2s,filter .2s; }.leisure-place:hover { transform:translateY(-4px); filter:brightness(1.2); }.leisure-place::before,.leisure-place::after { content:''; position:absolute; width:17px; height:12px; border-color:#fff4dc; border-style:solid; }.leisure-place::before { top:-5px; left:-5px; border-width:1px 0 0 1px; }.leisure-place::after { right:-5px; bottom:-5px; border-width:0 1px 1px 0; }.leisure-place i { position:absolute; top:100%; left:50%; height:clamp(25px,8vh,90px); border-left:1px dotted #fff9edab; }.place-flourish { position:absolute; top:50%; left:-26px; transform:translateY(-50%); font-size:13px; color:#fff9dc; text-shadow:0 0 11px #fff; }.leisure-bedroom { left:22%; bottom:16%; }.leisure-wardrobe { right:12%; bottom:17%; }
@media (max-width:850px) and (orientation:landscape) {
  .leisure-actions { top:68px; right:54px; gap:4px; }.leisure-actions button { width:52px; gap:4px; }.leisure-orb { width:30px; }.leisure-icon { width:16px; height:16px; }.leisure-action-label { font-size:9px; }.area-menu { width:66%; height:63%; padding:8px 12px 7px; }.area-menu-heading h2 { font-size:14px; }.area-menu-heading p { margin-top:2px; font-size:8px; }.area-menu-close { top:4px; right:5px; width:24px; height:24px; }.area-map { margin:0 -5px; }.area-point { min-width:45px; gap:1px; padding:1px 2px; }.area-point-name { font-size:10px; padding-bottom:1px; }.area-current { font-size:8px; }.area-confirm { min-width:90px; padding:6px 10px; font-size:11px; }.leisure-place { width:112px; padding:5px 10px; font-size:16px; }.leisure-bedroom { left:20%; bottom:13%; }.leisure-wardrobe { right:13%; bottom:14%; }.place-flourish { left:-16px; font-size:9px; }
}
@media (max-width:820px) and (orientation:portrait) {
  .leisure-actions { top:68px; right:54px; gap:4px; }.leisure-actions button { width:52px; gap:4px; }.leisure-orb { width:30px; }.leisure-icon { width:16px; height:16px; }.leisure-action-label { font-size:9px; }.area-menu { width:66%; height:63%; padding:8px 12px 7px; }.area-menu-heading h2 { font-size:14px; }.area-menu-heading p { margin-top:2px; font-size:8px; }.area-menu-close { top:4px; right:5px; width:24px; height:24px; }.area-map { margin:0 -5px; }.area-point { min-width:45px; gap:1px; padding:1px 2px; }.area-point-name { font-size:10px; padding-bottom:1px; }.area-current { font-size:8px; }.area-confirm { min-width:90px; padding:6px 10px; font-size:11px; }.leisure-place { width:112px; padding:5px 10px; font-size:16px; }.leisure-bedroom { left:20%; bottom:13%; }.leisure-wardrobe { right:13%; bottom:14%; }.place-flourish { left:-16px; font-size:9px; }
}
</style>
