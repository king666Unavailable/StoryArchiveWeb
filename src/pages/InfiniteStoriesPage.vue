<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { infiniteStoryTopics } from '../content/infiniteStories'
import { loadInfiniteStories, type InfiniteStory } from '../content/worldQuestLoader'

const stories = ref<InfiniteStory[]>([])
const selectedTopicId = ref(infiniteStoryTopics[0]?.id ?? '')
const selectedSubfolderId = ref(infiniteStoryTopics[0]?.subfolderIds[0] ?? '')
const themeImageMissing = ref(false)
const router = useRouter()
const selectedTopic = computed(() => infiniteStoryTopics.find((topic) => topic.id === selectedTopicId.value) ?? infiniteStoryTopics[0] ?? null)
const themeImage = computed(() => selectedTopic.value ? `/infinite_stories/${selectedTopic.value.id}/theme.png` : '')

onMounted(async () => {
  const savedTopicId = sessionStorage.getItem('infinite-stories:last-topic')
  const savedTopic = infiniteStoryTopics.find((topic) => topic.id === savedTopicId)
  if (savedTopic) {
    selectedTopicId.value = savedTopic.id
    const savedSubfolderId = sessionStorage.getItem('infinite-stories:last-subfolder')
    selectedSubfolderId.value = savedTopic.subfolderIds.includes(savedSubfolderId ?? '')
      ? savedSubfolderId!
      : savedTopic.subfolderIds[0] ?? ''
  }
  try {
    stories.value = await loadInfiniteStories()
  } catch (error) {
    console.error(error)
  }
})

function selectTopic(topicId: string) {
  const topic = infiniteStoryTopics.find((item) => item.id === topicId)
  if (!topic) return
  selectedTopicId.value = topic.id
  selectedSubfolderId.value = topic.subfolderIds[0] ?? ''
  sessionStorage.setItem('infinite-stories:last-topic', topic.id)
  sessionStorage.setItem('infinite-stories:last-subfolder', selectedSubfolderId.value)
  themeImageMissing.value = false
}

function stepTopic(direction: -1 | 1) {
  const currentIndex = infiniteStoryTopics.findIndex((topic) => topic.id === selectedTopic.value?.id)
  const nextTopic = infiniteStoryTopics[currentIndex + direction]
  if (nextTopic) selectTopic(nextTopic.id)
}

function enterRecap(subfolderId: string) {
  selectedSubfolderId.value = subfolderId
  sessionStorage.setItem('infinite-stories:last-topic', selectedTopic.value!.id)
  sessionStorage.setItem('infinite-stories:last-subfolder', subfolderId)
  router.push({
    name: 'world-quest-recap',
    params: { topicId: selectedTopic.value!.id, questId: subfolderId },
    query: { source: 'infinite-stories' },
  })
}

function onThemeImageError() {
  themeImageMissing.value = true
}
</script>

<template>
  <section class="infinite-stories-page" aria-label="无限副本">
    <div class="infinite-backdrop" aria-hidden="true">
      <div class="infinite-vignette"></div>
      <img v-if="themeImage && !themeImageMissing" class="infinite-theme-image" :src="themeImage" alt="" @error="onThemeImageError">
      <img class="infinite-frame-overlay" src="/images/infinite-dungeon-background-transparent-center.png" alt="">
    </div>

    <header class="infinite-header">
      <RouterLink class="infinite-back" to="/archive" aria-label="返回主神空间">
        <svg viewBox="0 0 40 40" aria-hidden="true"><path d="M25 8 13 20l12 12M14 20h19" /></svg>
      </RouterLink>
      <span class="infinite-header-divider"></span>
      <div class="infinite-header-title"><strong>无限副本</strong><small>INFINITE STORIES</small></div>
    </header>

    <template v-if="selectedTopic">
      <p class="infinite-topic" :aria-label="selectedTopic.title">
        <span class="topic-stars topic-stars-left" aria-hidden="true"><i>✦</i><i>✧</i><i>·</i></span>
        <span class="topic-title-characters" aria-hidden="true">
          <span v-for="(character, index) in [...selectedTopic.title]" :key="`${character}-${index}`" :class="`topic-character-${index + 1}`">{{ character }}</span>
        </span>
        <span class="topic-stars topic-stars-right" aria-hidden="true"><i>✧</i><i>✦</i><i>·</i></span>
      </p>

      <nav class="infinite-subtask-entries" aria-label="当前主题的副本入口">
        <button
          v-for="subfolderId in selectedTopic.subfolderIds"
          :key="subfolderId"
          type="button"
          class="subtask-entry"
          :class="{ active: subfolderId === selectedSubfolderId }"
          :aria-pressed="subfolderId === selectedSubfolderId"
          @click="enterRecap(subfolderId)"
        >
          <span class="subtask-entry-stars" aria-hidden="true">
            <i>✦</i><i>✦</i>
          </span>
          <span class="subtask-entry-copy"><strong>{{ stories.find((story) => story.topicId === selectedTopic.id && story.id === subfolderId)?.title ?? subfolderId }}</strong></span>
        </button>
      </nav>

      <nav class="infinite-tabs" aria-label="无限副本主题">
        <button
          class="theme-step theme-step-previous"
          type="button"
          aria-label="上一个主题"
          :disabled="infiniteStoryTopics.findIndex((topic) => topic.id === selectedTopic.id) === 0"
          @click="stepTopic(-1)"
        >
          <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M7 6 41 24 7 42 17 24 7 6Z" /><path d="M2 24h16" /></svg>
        </button>
        <button
          v-for="topic in infiniteStoryTopics"
          :key="topic.id"
          type="button"
          class="infinite-tab"
          :class="{ active: topic.id === selectedTopic.id }"
          :aria-current="topic.id === selectedTopic.id ? 'page' : undefined"
          @click="selectTopic(topic.id)"
        >
          <span v-if="topic.id === selectedTopic.id" class="tab-active-mark" aria-hidden="true">✦</span>
          <span class="tab-copy"><strong>{{ topic.title }}</strong></span>
        </button>
        <button
          class="theme-step theme-step-next"
          type="button"
          aria-label="下一个主题"
          :disabled="infiniteStoryTopics.findIndex((topic) => topic.id === selectedTopic.id) === infiniteStoryTopics.length - 1"
          @click="stepTopic(1)"
        >
          <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M7 6 41 24 7 42 17 24 7 6Z" /><path d="M2 24h16" /></svg>
        </button>
      </nav>
    </template>
  </section>
</template>

<style scoped>
.infinite-stories-page { position:absolute; inset:0; overflow:hidden; color:#f8f7ff; isolation:isolate; background:#11132c; }
.infinite-backdrop { position:absolute; z-index:0; inset:0; overflow:hidden; background:#0b0d24; }
.infinite-vignette { position:absolute; z-index:3; inset:0; background:linear-gradient(rgba(8,8,25,.16),rgba(8,8,25,.16)),linear-gradient(180deg,rgba(8,8,25,.24),transparent 20%,transparent 77%,rgba(8,9,26,.46)),linear-gradient(90deg,rgba(8,9,25,.28),transparent 29%,transparent 76%,rgba(8,9,25,.3)); }
.infinite-theme-image { position:absolute; z-index:1; left:12.5%; top:12.5%; width:75%; height:75%; object-fit:contain; object-position:center; }
.infinite-frame-overlay { position:absolute; z-index:2; inset:0; width:100%; height:100%; object-fit:cover; pointer-events:none; }
.infinite-header { position:absolute; z-index:5; top:0; left:0; right:0; height:76px; padding:0 clamp(24px,4.7vw,78px); display:flex; align-items:center; gap:13px; border-bottom:1px solid rgba(228,237,255,.12); background:linear-gradient(180deg,rgba(9,14,33,.44),rgba(9,14,33,.08)); }
.infinite-back { width:42px; height:42px; display:grid; place-items:center; color:#f4f6ff; border:1px solid #eef4ff85; border-radius:4px; background:#dfeaff10; box-shadow:0 0 18px #c7dcff18; text-decoration:none; }.infinite-back svg { width:27px; height:27px; fill:none; stroke:currentColor; stroke-width:1.3; stroke-linecap:round; stroke-linejoin:round; }
.infinite-header-divider { height:29px; width:1px; background:linear-gradient(transparent,#eff4ff9a,transparent); margin:0 1px; }
.infinite-header-title { display:flex; flex-direction:column; gap:3px; }.infinite-header-title strong { font-size:17px; font-weight:600; letter-spacing:.12em; }.infinite-header-title small { color:#e9eeff91; font:8px var(--mono); letter-spacing:.2em; }
.infinite-topic { position:absolute; z-index:3; left:50%; top:20%; width:max-content; max-width:88vw; margin:0; padding:8px 28px 14px; transform:translateX(-50%); display:flex; align-items:center; justify-content:center; gap:clamp(8px,1.2vw,18px); font-size:clamp(32px,4vw,56px); font-weight:600; letter-spacing:.13em; text-shadow:0 2px 15px #08081c,0 0 28px #ece8ffab; }
.topic-title-characters { display:flex; align-items:center; gap:.015em; white-space:nowrap; }
.topic-title-characters > span { display:inline-block; line-height:1.2; text-shadow:0 2px 15px #08081c,0 0 28px #ece8ffab; }
.topic-character-1 { transform:translateY(.055em) rotate(-5deg); }.topic-character-2 { transform:translateY(-.09em) rotate(2deg) scale(1.04); }.topic-character-3 { transform:translateY(.08em) rotate(-2deg) scale(.96); }.topic-character-4 { transform:translateY(-.04em) rotate(4deg); }
.topic-stars { position:relative; display:flex; align-items:center; gap:3px; color:#f8f7ff; font-style:normal; text-shadow:0 0 7px #fff,0 0 16px #d7e2ff; }
.topic-stars i { font-style:normal; line-height:1; }.topic-stars i:first-child { font-size:.35em; transform:translateY(-1.1em); }.topic-stars i:nth-child(2) { font-size:.24em; transform:translateY(.7em); }.topic-stars i:last-child { font-size:.34em; opacity:.85; transform:translateY(-.25em); }.topic-stars-right { flex-direction:row-reverse; }
.infinite-feature-image { position:absolute; z-index:1; left:50%; top:48%; width:min(36vw,520px); height:min(43vh,340px); transform:translate(-50%,-50%); object-fit:contain; opacity:.84; filter:drop-shadow(0 0 15px #dce4ff4d); animation:story-reveal .3s ease; pointer-events:none; }
.infinite-story-panel { position:absolute; z-index:2; top:42%; left:7%; width:min(28vw,400px); max-height:38%; display:flex; flex-direction:column; padding:4px 0; animation:story-reveal .3s ease; }
.story-heading { display:flex; align-items:center; gap:15px; }.story-spark { color:#fff; font-size:23px; text-shadow:0 0 9px #fff,0 0 20px #cbd4ff; }.story-eyebrow { margin:0 0 7px; color:#e6e6ff9e; font:9px var(--mono); letter-spacing:.19em; }.story-heading h1 { margin:0; font-size:clamp(27px,3vw,42px); letter-spacing:.1em; text-shadow:0 1px 14px #090b20; }
.story-description { margin:18px 0 0 38px; max-width:560px; color:#e9e9f6e3; font-size:clamp(14px,1.2vw,17px); line-height:1.8; letter-spacing:.04em; text-shadow:0 2px 10px #090b20; }.story-rule { display:flex; align-items:center; gap:10px; width:min(85%,390px); margin:21px 0 15px 38px; color:#f0e8ffba; }.story-rule span { flex:1; height:1px; background:linear-gradient(90deg,transparent,#e6e8ffc2); }.story-rule span:last-child { transform:rotate(180deg); }.story-rule i { font-style:normal; font-size:11px; text-shadow:0 0 8px white; }
.story-body { overflow:auto; max-height:clamp(100px,23vh,240px); margin-left:38px; padding:0 12px 4px 0; color:#f1efffe0; font-size:clamp(13px,1.05vw,15px); line-height:1.9; letter-spacing:.035em; scrollbar-width:thin; scrollbar-color:#ddd9ff7a transparent; white-space:pre-wrap; }.story-body p { margin:0 0 12px; }.story-body p:last-child { margin-bottom:0; }.story-body .story-empty { color:#ebeaff75; font-size:12px; }.story-body::-webkit-scrollbar { width:3px; }.story-body::-webkit-scrollbar-thumb { background:#ddd9ff7a; }
.infinite-subtask-entries { position:absolute; z-index:4; right:clamp(25px,7vw,104px); bottom:20%; width:min(25vw,340px); display:flex; flex-direction:column; gap:9px; }
.subtask-entry { min-height:58px; display:flex; align-items:center; gap:12px; padding:5px 9px 5px 2px; border:0; color:#e8eaffc9; background:transparent; text-align:left; cursor:pointer; transition:color .2s,filter .2s,transform .2s; }.subtask-entry:hover,.subtask-entry.active { color:#fff; filter:drop-shadow(0 0 8px #dce5ff75); transform:translateX(-3px); }
.subtask-entry-stars { width:24px; flex:0 0 24px; display:flex; align-items:center; gap:2px; color:#eef5ff; text-shadow:0 0 7px #d9e9ff,0 0 15px #b9d4ff; }.subtask-entry-stars i { font-style:normal; line-height:1; }.subtask-entry-stars i:first-child { font-size:16px; }.subtask-entry-stars i:last-child { font-size:10px; opacity:.78; }
.subtask-entry-copy { display:flex; flex-direction:column; gap:3px; }.subtask-entry-copy strong { font-size:clamp(15px,1.4vw,19px); letter-spacing:.06em; text-shadow:0 2px 9px #090b21; }
.infinite-tabs { position:absolute; z-index:4; left:clamp(24px,10vw,150px); right:clamp(24px,10vw,150px); bottom:3.5%; min-height:76px; display:flex; align-items:flex-start; justify-content:center; gap:clamp(8px,2vw,28px); }
.infinite-tabs::before { position:absolute; z-index:0; top:55px; left:25px; right:25px; height:1px; content:""; background:linear-gradient(90deg,transparent,#e3e6ff8c 9%,#e3e6ff8c 91%,transparent); box-shadow:0 0 8px #dce4ff38; }
.theme-step { position:absolute; z-index:1; top:39px; flex:0 0 38px; width:38px; height:34px; display:grid; place-items:center; padding:0; border:0; background:transparent; color:#f5f6ffed; cursor:pointer; filter:drop-shadow(0 0 7px #dce5ff70); transition:color .2s,transform .2s,opacity .2s; }
.theme-step-previous { left:0; }.theme-step-next { right:0; }
.theme-step svg { width:100%; height:100%; overflow:visible; fill:#f4f6ff2b; stroke:currentColor; stroke-width:1.7; stroke-linecap:round; stroke-linejoin:round; }
.theme-step-previous svg { transform:rotate(180deg); }.theme-step:hover:not(:disabled) { color:#fff; transform:scale(1.12); }.theme-step:disabled { opacity:.3; cursor:default; filter:none; }
.infinite-tab { position:relative; min-width:0; max-width:min(28vw,250px); display:flex; align-items:center; justify-content:center; gap:8px; padding:8px clamp(7px,1.6vw,22px); border:0; background:transparent; color:#e7e7f7b8; text-align:center; cursor:pointer; transition:color .2s,transform .2s; }.infinite-tab:hover { color:#fff; transform:translateY(-2px); }.infinite-tab.active { color:#fff; }
.tab-copy { min-width:0; display:flex; align-items:center; }.tab-copy strong { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:clamp(12px,1.15vw,16px); font-weight:500; letter-spacing:.08em; text-shadow:0 2px 9px #090b21; }.tab-active-mark { flex:0 0 auto; color:#ffddb2; font-size:16px; text-shadow:0 0 8px #ffcc8c,0 0 16px #ffe8c4; }
.infinite-message { position:absolute; z-index:2; inset:42% 0 auto; margin:0; color:#efeeffc7; text-align:center; font-size:15px; text-shadow:0 2px 8px #080a20; }.infinite-message + .infinite-message { top:calc(42% + 28px); }
@keyframes story-reveal { from { opacity:.3; transform:translateY(5px); } to { opacity:1; transform:translateY(0); } }
@media (max-width:850px) and (orientation:landscape) {
  .infinite-header { height:54px; padding:0 24px; }.infinite-back { width:34px;height:34px; }.infinite-topic { top:12%; padding:6px 18px 10px; gap:8px; font-size:clamp(25px,5vh,38px); }
  .infinite-feature-image { top:48%; width:42vw; height:38vh; }
  .infinite-story-panel { top:40%; left:5%; width:29vw; max-height:38%; padding:4px 0; }.story-heading { gap:9px; }.story-heading h1 { font-size:clamp(20px,4vh,29px); }.story-spark { font-size:17px; }.story-eyebrow { margin-bottom:4px; font-size:7px; }.story-description { margin:9px 0 0 26px; font-size:clamp(11px,2.3vh,14px); }.story-rule { margin:12px 0 9px 26px; }.story-body { max-height:20vh; margin-left:26px; font-size:clamp(10px,2vh,13px); line-height:1.65; }
  .infinite-tabs { left:4%; right:4%; bottom:2%; min-height:54px; gap:4px; }.infinite-tabs::before { top:40px; left:18px; right:18px; }.theme-step { top:25px; flex-basis:30px; width:30px; height:30px; }.infinite-tab { max-width:32vw; padding:4px 5px; gap:4px; }.tab-copy strong { font-size:clamp(10px,2.5vh,13px); }.tab-active-mark { font-size:12px; }
  .infinite-subtask-entries { right:5%; bottom:20%; width:41vw; gap:4px; }.subtask-entry { min-height:47px; gap:7px; }.subtask-entry-stars { width:20px;flex-basis:20px; }.subtask-entry-stars i:first-child { font-size:13px; }.subtask-entry-stars i:last-child { font-size:8px; }.subtask-entry-copy strong { font-size:clamp(12px,2.5vh,16px); }
}
@media (max-width:820px) and (orientation:portrait) {
  .app-frame.is-portrait-phone .infinite-header { height:54px; padding:0 24px; }.app-frame.is-portrait-phone .infinite-back { width:34px;height:34px; }.app-frame.is-portrait-phone .infinite-topic { top:12%; padding:6px 18px 10px; gap:8px; font-size:clamp(25px,5vh,38px); }
  .app-frame.is-portrait-phone .infinite-feature-image { top:48%; width:42vw; height:38vh; }
  .app-frame.is-portrait-phone .infinite-story-panel { top:40%; left:5%; width:29vw; max-height:38%; padding:4px 0; }.app-frame.is-portrait-phone .story-heading { gap:9px; }.app-frame.is-portrait-phone .story-heading h1 { font-size:clamp(20px,4vh,29px); }.app-frame.is-portrait-phone .story-spark { font-size:17px; }.app-frame.is-portrait-phone .story-eyebrow { margin-bottom:4px; font-size:7px; }.app-frame.is-portrait-phone .story-description { margin:9px 0 0 26px; font-size:clamp(11px,2.3vh,14px); }.app-frame.is-portrait-phone .story-rule { margin:12px 0 9px 26px; }.app-frame.is-portrait-phone .story-body { max-height:20vh; margin-left:26px; font-size:clamp(10px,2vh,13px); line-height:1.65; }
  .app-frame.is-portrait-phone .infinite-tabs { left:4%; right:4%; bottom:2%; min-height:54px; gap:4px; }.app-frame.is-portrait-phone .infinite-tabs::before { top:40px; left:18px; right:18px; }.app-frame.is-portrait-phone .theme-step { top:25px; flex-basis:30px; width:30px; height:30px; }.app-frame.is-portrait-phone .infinite-tab { max-width:32vw; padding:4px 5px; gap:4px; }.app-frame.is-portrait-phone .tab-copy strong { font-size:clamp(10px,2.5vh,13px); }.app-frame.is-portrait-phone .tab-active-mark { font-size:12px; }
  .app-frame.is-portrait-phone .infinite-subtask-entries { right:5%; bottom:20%; width:41vw; gap:4px; }.app-frame.is-portrait-phone .subtask-entry { min-height:47px; gap:7px; }.app-frame.is-portrait-phone .subtask-entry-stars { width:20px;flex-basis:20px; }.app-frame.is-portrait-phone .subtask-entry-stars i:first-child { font-size:13px; }.app-frame.is-portrait-phone .subtask-entry-stars i:last-child { font-size:8px; }.app-frame.is-portrait-phone .subtask-entry-copy strong { font-size:clamp(12px,2.5vh,16px); }
}
</style>
