<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { loadWorldQuestTopics, type WorldQuest } from '../content/worldQuestLoader'

type RecapBlock = { type: 'dialogue' | 'narration' | 'scene-break'; speaker?: string; text: string; alignment?: 'left' | 'right' | 'center' }
type RecapSection = { id: string; title: string; blocks: RecapBlock[] }

const route = useRoute()
const router = useRouter()
const quest = ref<WorldQuest | null>(null)
const loadError = ref('')
const recapScroll = ref<HTMLElement | null>(null)
const activeSectionId = ref('')
const myDialogueAlignment = ref<'left' | 'right'>('right')
const alignmentStorageKey = 'world-quest-recap:my-dialogue-alignment'
const scrollStorageKey = computed(() => `world-quest-recap:${String(route.params.topicId)}:${String(route.params.questId)}`)

const recapSections = computed<RecapSection[]>(() => {
  const body = (quest.value?.body ?? '')
    .replace(/<!--([\s\S]*?)-->/g, '')
  const sections: RecapSection[] = [{ id: 'recap-intro', title: '', blocks: [] }]
  let activeSection = sections[0]
  let sectionNumber = 0
  let narrationLines: string[] = []
  let activeDialogue: RecapBlock | null = null
  const cleanText = (text: string) => text
    .replace(/^>\s?/, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')

  const flushNarration = () => {
    const text = cleanText(narrationLines.join(' ').trim())
    if (text) {
      const parenthetical = /^(（[\s\S]*）|\([\s\S]*\))$/.test(text)
      activeSection.blocks.push({ type: 'narration', text, alignment: parenthetical ? 'center' : 'left' })
    }
    narrationLines = []
  }
  const flushDialogue = () => {
    if (activeDialogue?.text.trim()) activeSection.blocks.push(activeDialogue)
    activeDialogue = null
  }

  for (const rawLine of body.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (/^-{3,}$/.test(line)) {
      flushDialogue()
      flushNarration()
      activeSection.blocks.push({ type: 'scene-break', text: '' })
      continue
    }

    if (!line || /^[*_]{3,}$/.test(line)) {
      flushDialogue()
      flushNarration()
      continue
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/)
    if (heading) {
      flushDialogue()
      flushNarration()
      const text = heading[2].trim()
      if (/^正文[：:]?$/.test(text) || text === quest.value?.title) continue
      if (heading[1].length === 3) {
        sectionNumber += 1
        activeSection = { id: `recap-section-${sectionNumber}`, title: text, blocks: [] }
        sections.push(activeSection)
        continue
      }
      narrationLines.push(text)
      continue
    }

    const dialogue = line.match(/^([^：:]{1,24})[：:]\s*(.*)$/)
    if (dialogue) {
      flushNarration()
      flushDialogue()
      const speaker = dialogue[1].trim()
      activeDialogue = {
        type: 'dialogue',
        speaker,
        alignment: speaker === '我' ? 'right' : 'left',
        text: cleanText(dialogue[2].trim()),
      }
      continue
    }

    if (activeDialogue) activeDialogue.text = `${activeDialogue.text}\n${cleanText(line)}`.trim()
    else narrationLines.push(line)
  }
  flushDialogue()
  flushNarration()
  return sections.filter((section) => section.title || section.blocks.length)
})

const recapContents = computed(() => recapSections.value.flatMap((section) => section.blocks))
const tocSections = computed(() => recapSections.value.filter((section) => section.title))

function updateActiveSection() {
  const scrollElement = recapScroll.value
  if (!scrollElement) return
  const threshold = scrollElement.getBoundingClientRect().top + 30
  const visibleSections = tocSections.value.filter((section) => {
    const anchor = document.getElementById(section.id)
    return anchor && anchor.getBoundingClientRect().top <= threshold
  })
  activeSectionId.value = visibleSections.at(-1)?.id ?? tocSections.value[0]?.id ?? ''
}

function rememberScrollPosition() {
  const scrollElement = recapScroll.value
  if (!scrollElement) return
  sessionStorage.setItem(scrollStorageKey.value, String(scrollElement.scrollTop))
  updateActiveSection()
}

function jumpToSection(section: RecapSection) {
  const scrollElement = recapScroll.value
  const anchor = document.getElementById(section.id)
  if (!scrollElement || !anchor) return
  let top = 0
  let element: HTMLElement | null = anchor
  while (element && element !== scrollElement) {
    top += element.offsetTop
    element = element.offsetParent as HTMLElement | null
  }
  if (element !== scrollElement) return
  top = Math.max(0, top - 12)
  scrollElement.scrollTo({ top, behavior: 'smooth' })
  activeSectionId.value = section.id
}

onMounted(async () => {
  const savedAlignment = localStorage.getItem(alignmentStorageKey)
  if (savedAlignment === 'left' || savedAlignment === 'right') myDialogueAlignment.value = savedAlignment
  try {
    const topics = await loadWorldQuestTopics()
    const topic = topics.find((item) => item.id === String(route.params.topicId))
    quest.value = topic?.quests.find((item) => item.id === String(route.params.questId)) ?? null
    if (!quest.value) loadError.value = '没有找到这篇回顾内容。'
    await nextTick()
    const previousPosition = Number(sessionStorage.getItem(scrollStorageKey.value) ?? 0)
    if (recapScroll.value) recapScroll.value.scrollTop = previousPosition
    updateActiveSection()
  } catch (error) {
    console.error(error)
    loadError.value = '回顾内容读取失败，请稍后重试。'
  }
})

onBeforeUnmount(rememberScrollPosition)

function toggleMyDialogueAlignment() {
  myDialogueAlignment.value = myDialogueAlignment.value === 'right' ? 'left' : 'right'
  localStorage.setItem(alignmentStorageKey, myDialogueAlignment.value)
}

function goBack() {
  rememberScrollPosition()
  if (route.query.source === 'infinite-stories') {
    router.push({ name: 'infinite-stories' })
    return
  }
  router.push({
    name: 'world-quests',
    query: { topic: String(route.params.topicId), quest: String(route.params.questId) },
  })
}
</script>

<template>
  <section class="recap-page" aria-label="剧情回顾">
    <div class="recap-backdrop" aria-hidden="true"><div class="recap-vignette"></div></div>

    <header class="recap-header">
      <button class="recap-back" aria-label="返回世界任务" @click="goBack">
        <svg viewBox="0 0 40 40" aria-hidden="true"><path d="M25 8 13 20l12 12M14 20h19" /></svg>
      </button>
      <span class="recap-header-divider"></span>
      <div class="recap-header-title"><strong>剧情回顾</strong><small>STORY RECAP</small></div>
      <button
        class="recap-alignment-toggle"
        type="button"
        :aria-pressed="myDialogueAlignment === 'left'"
        @click="toggleMyDialogueAlignment"
      >
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <path v-if="myDialogueAlignment === 'right'" d="M4 5h12M8 9h8M4 13h12M8 17h8" />
          <path v-else d="M4 5h12M4 9h8M4 13h12M4 17h8" />
        </svg>
        排版：{{ myDialogueAlignment === 'right' ? '右对齐' : '左对齐' }}
      </button>
    </header>

    <nav v-if="tocSections.length" class="recap-toc" aria-label="章节目录">
      <p class="recap-toc-title">目录</p>
      <div class="recap-toc-list">
        <div class="recap-toc-rail" aria-hidden="true"></div>
        <button
          v-for="section in tocSections"
          :key="section.id"
          class="recap-toc-item"
          :class="{ active: activeSectionId === section.id }"
          @click="jumpToSection(section)"
        >
          <span class="recap-toc-star" aria-hidden="true">{{ activeSectionId === section.id ? '✦' : '✧' }}</span>
          <span>{{ section.title }}</span>
        </button>
      </div>
    </nav>

    <div ref="recapScroll" class="recap-scroll" tabindex="0" aria-label="回顾正文" @scroll.passive="rememberScrollPosition">
      <div class="recap-flow">
        <p v-if="loadError" class="recap-message">{{ loadError }}</p>
        <p v-else-if="!quest" class="recap-message">正在读取回顾内容…</p>
        <template v-else>
          <template v-for="section in recapSections" :key="section.id">
            <div v-if="section.title" :id="section.id" class="recap-section-anchor" aria-hidden="true"></div>
            <template v-for="(block, index) in section.blocks" :key="`${section.id}-${index}`">
              <section v-if="block.type === 'dialogue'" class="recap-dialogue" :class="`align-${block.speaker === '我' ? myDialogueAlignment : block.alignment}`">
                <strong class="recap-speaker">{{ block.speaker }}</strong>
                <p>{{ block.text }}</p>
              </section>
              <p
                v-else-if="block.type === 'narration'"
                class="recap-narration"
                :class="{
                  'parenthetical-left': block.alignment === 'center' && myDialogueAlignment === 'left',
                  'parenthetical-right': block.alignment === 'center' && myDialogueAlignment === 'right',
                }"
              >{{ block.text }}</p>
              <div v-else class="recap-scene-break" aria-hidden="true"></div>
            </template>
          </template>
          <p v-if="recapContents.length === 0" class="recap-message">这篇故事还没有添加回顾正文。</p>
        </template>
      </div>
    </div>
  </section>
</template>

<style scoped>
.recap-page { position:absolute; inset:0; overflow:hidden; color:#f7f7ff; isolation:isolate; background:#111731; }
.recap-backdrop { position:absolute; z-index:-1; inset:0; overflow:hidden; background:#151b38 url('/backgrounds/story_bg2.webp') center / cover no-repeat; }
.recap-vignette { position:absolute; inset:0; background:linear-gradient(rgba(7,11,28,.4),rgba(7,11,28,.4)),linear-gradient(90deg,rgba(9,14,31,.54),rgba(13,18,40,.2) 46%,rgba(11,16,36,.31)),linear-gradient(0deg,rgba(9,14,32,.56),transparent 28%,rgba(9,14,32,.2)); }
.recap-header { position:absolute; z-index:2; top:0; left:0; right:0; height:76px; padding:0 clamp(24px,4.7vw,78px); display:flex; align-items:center; gap:13px; border-bottom:1px solid rgba(228,237,255,.12); background:linear-gradient(180deg,rgba(9,14,33,.44),rgba(9,14,33,.08)); }
.recap-back { width:42px; height:42px; display:grid; place-items:center; color:#f4f6ff; border:1px solid #eef4ff85; border-radius:4px; background:#dfeaff10; box-shadow:0 0 18px #c7dcff18; cursor:pointer; }.recap-back svg { width:27px; height:27px; fill:none; stroke:currentColor; stroke-width:1.3; stroke-linecap:round; stroke-linejoin:round; }
.recap-header-divider { height:29px; width:1px; background:linear-gradient(transparent,#eff4ff9a,transparent); margin:0 1px; }
.recap-header-title { display:flex; flex-direction:column; gap:3px; }.recap-header-title strong { font-size:17px; font-weight:600; letter-spacing:.12em; }.recap-header-title small { color:#e9eeff91; font:8px var(--mono); letter-spacing:.2em; }
.recap-alignment-toggle { margin-left:auto; display:inline-flex; align-items:center; gap:8px; padding:8px 12px; border:1px solid #e5edff42; border-radius:3px; color:#f0f3ffdc; background:#dfeaff0d; font:13px var(--mono); letter-spacing:.05em; cursor:pointer; transition:background .2s,border-color .2s,color .2s; }
.recap-alignment-toggle:hover { border-color:#e5edff88; color:#fff; background:#dfeaff1c; }.recap-alignment-toggle svg { width:16px; height:16px; fill:none; stroke:currentColor; stroke-width:1.25; stroke-linecap:round; }
.recap-toc { position:absolute; z-index:1; top:112px; bottom:28px; left:clamp(25px,5vw,76px); width:min(15vw,220px); overflow-y:auto; padding:8px 16px 12px 0; scrollbar-width:none; }
.recap-toc::-webkit-scrollbar { display:none; }.recap-toc-title { margin:0 8px 12px 0; padding-bottom:9px; border-bottom:1px solid #dce8ff45; color:#e4ebffca; font:14px var(--mono); letter-spacing:.14em; }
.recap-toc-list { position:relative; display:flex; flex:none; flex-direction:column; }.recap-toc-rail { position:absolute; top:20px; bottom:20px; left:10px; width:1px; background:linear-gradient(#f1f5ff9e,#e5edff22); }
.recap-toc-item { position:relative; z-index:1; display:flex; align-items:center; gap:10px; width:100%; min-height:42px; padding:7px 4px 7px 0; border:0; background:transparent; color:#e8edffb7; text-align:left; font-size:13px; letter-spacing:.04em; cursor:pointer; transition:color .2s,text-shadow .2s; }
.recap-toc-item:hover,.recap-toc-item.active { color:#fff; text-shadow:0 0 10px #d4e4ff90; }.recap-toc-star { flex:0 0 20px; color:#dceaffc2; font-size:13px; text-align:center; text-shadow:0 0 7px #d2e5ff75; }.recap-toc-item.active .recap-toc-star { color:#fff; font-size:18px; text-shadow:0 0 6px #fff,0 0 12px #c9deff; }
.recap-scroll { position:absolute; top:94px; right:clamp(25px,5vw,76px); bottom:20px; left:clamp(230px,22vw,340px); overflow-y:auto; padding:18px 14px 36px; scrollbar-width:thin; scrollbar-color:#e6e1d6b5 transparent; }
.recap-flow { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1.15fr) minmax(0,1fr); column-gap:clamp(20px,4vw,62px); row-gap:8px; align-items:start; width:82%; margin-inline:auto; }
.recap-section-anchor { grid-column:1 / -1; width:100%; height:0; scroll-margin-top:14px; }
.recap-dialogue { grid-column:1 / -1; width:100%; max-width:none; padding:0 4px; color:#f0cf68; font-size:clamp(15px,1.25vw,18px); line-height:1.65; letter-spacing:.04em; }
.recap-dialogue p { margin:0; white-space:pre-line; }.recap-speaker { display:inline-block; margin:0 0 7px; padding:3px 12px 4px; border:1px solid rgba(232,236,244,.5); border-radius:1px; background:transparent; color:#f0cf68; font-size:.93em; font-weight:600; letter-spacing:.11em; text-shadow:0 0 12px #d5a92f45; }
.align-left { justify-self:start; text-align:left; }.align-right { justify-self:end; text-align:right; }
.recap-narration { grid-column:1 / -1; justify-self:center; width:100%; margin:0; color:#f1eee9e8; text-align:left; font-size:clamp(15px,1.25vw,18px); line-height:1.75; letter-spacing:.045em; text-shadow:0 0 11px #e5eaff35; white-space:pre-wrap; }
.recap-narration.parenthetical-left { text-align:left; }.recap-narration.parenthetical-right { text-align:right; }
.recap-narration.parenthetical-left,.recap-narration.parenthetical-right { color:#f0cf68; text-shadow:0 0 11px #d5a92f35; }
.recap-scene-break { grid-column:1 / -1; justify-self:center; width:92%; height:1px; margin:8px 0; background:linear-gradient(90deg,transparent,#e4eaff9c 12%,#e4eaffc7 50%,#e4eaff9c 88%,transparent); box-shadow:0 0 7px #dce8ff55; }
.recap-message { grid-column:1 / -1; margin:0; color:#f1eee9bd; text-align:center; font-size:15px; line-height:1.8; }
.recap-scroll::-webkit-scrollbar { width:3px; }.recap-scroll::-webkit-scrollbar-track { background:transparent; }.recap-scroll::-webkit-scrollbar-thumb { background:#e6e1d6b5; }
@media (max-width:850px) and (orientation:landscape) {
  .recap-header { height:54px; padding:0 24px; }.recap-back { width:34px;height:34px; }.recap-header-title strong { font-size:15px; }.recap-alignment-toggle { padding:6px 8px; gap:5px; font-size:11px; }.recap-alignment-toggle svg { width:13px; height:13px; }.recap-scroll { top:64px; right:18px; bottom:10px; left:calc(29vw + 28px); padding:12px 10px 24px; }
  .recap-toc { top:75px; bottom:16px; left:28px; width:27vw; padding-right:10px; }.recap-toc-title { margin-bottom:7px; padding-bottom:5px; font-size:11px; }.recap-toc-rail { top:16px; bottom:16px; }.recap-toc-item { min-height:32px; gap:6px; font-size:11px; }.recap-toc-star { flex-basis:16px; font-size:11px; }
  .recap-flow { grid-template-columns:minmax(0,1fr) minmax(0,1.1fr) minmax(0,1fr); column-gap:14px; row-gap:8px; }
  .recap-dialogue,.recap-narration { font-size:clamp(12px,2.2vh,16px); line-height:1.55; }.recap-speaker { margin-bottom:4px; }
}
@media (max-width:820px) and (orientation:portrait) {
  .recap-header { height:54px; padding:0 24px; }.recap-back { width:34px;height:34px; }.recap-header-title strong { font-size:15px; }.recap-alignment-toggle { padding:6px 8px; gap:5px; font-size:11px; }.recap-alignment-toggle svg { width:13px; height:13px; }.recap-scroll { top:64px; right:18px; bottom:10px; left:calc(29vw + 28px); padding:12px 10px 24px; }
  .recap-toc { top:75px; bottom:16px; left:28px; width:27vw; padding-right:10px; }.recap-toc-title { margin-bottom:7px; padding-bottom:5px; font-size:11px; }.recap-toc-rail { top:16px; bottom:16px; }.recap-toc-item { min-height:32px; gap:6px; font-size:11px; }.recap-toc-star { flex-basis:16px; font-size:11px; }
  .recap-flow { grid-template-columns:minmax(0,1fr) minmax(0,1.1fr) minmax(0,1fr); column-gap:14px; row-gap:8px; }
  .recap-dialogue,.recap-narration { font-size:clamp(12px,2.2vh,16px); line-height:1.55; }.recap-speaker { margin-bottom:4px; }
}
</style>
