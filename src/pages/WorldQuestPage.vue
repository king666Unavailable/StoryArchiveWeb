<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { worldQuestTopics } from '../content/worldQuests'
import { loadWorldQuestTopics, type WorldQuest, type WorldQuestTopic } from '../content/worldQuestLoader'

defineEmits<{ back: [] }>()

const route = useRoute()
const router = useRouter()
const topics = ref<WorldQuestTopic[]>(worldQuestTopics.map(({ id, title }) => ({ id, title, quests: [] })))
const selectedTopicId = ref(worldQuestTopics[0].id)
const topicMenuOpen = ref(false)
const selectedQuestId = ref(worldQuestTopics[0].questIds[0])
const loadingQuest: WorldQuest = { id: 'loading', type: 'world_quests', title: '读取中…', description: '', period: '', character: '', image: '', avatar: '', body: '' }

const selectedTopic = computed(() => topics.value.find((topic) => topic.id === selectedTopicId.value) ?? topics.value[0])
const selectedQuest = computed(() => selectedTopic.value.quests.find((quest) => quest.id === selectedQuestId.value) ?? selectedTopic.value.quests[0] ?? loadingQuest)

onMounted(async () => {
  try {
    topics.value = await loadWorldQuestTopics()
    const requestedTopic = topics.value.find((topic) => topic.id === route.query.topic)
    if (requestedTopic) selectedTopicId.value = requestedTopic.id
    const requestedQuest = selectedTopic.value.quests.find((quest) => quest.id === route.query.quest)
    selectedQuestId.value = requestedQuest?.id ?? selectedTopic.value.quests[0]?.id ?? ''
  } catch (error) {
    console.error(error)
  }
})

function chooseTopic(topicId: string) {
  const topic = topics.value.find((item) => item.id === topicId)
  if (!topic) return
  selectedTopicId.value = topic.id
  selectedQuestId.value = topic.quests[0]?.id ?? ''
  topicMenuOpen.value = false
}

function enterRecap() {
  router.push({ name: 'world-quest-recap', params: { topicId: selectedTopic.value.id, questId: selectedQuest.value.id } })
}

</script>

<template>
  <section class="world-quest-screen" aria-label="世界任务">
    <div class="quest-backdrop" aria-hidden="true">
      <div class="quest-backdrop-vignette"></div>
    </div>

    <header class="quest-header">
      <button class="quest-back" aria-label="返回主神空间" @click="$emit('back')">
        <svg viewBox="0 0 40 40" aria-hidden="true"><path d="M25 8 13 20l12 12M14 20h19" /></svg>
      </button>
      <span class="quest-header-divider"></span>
      <div class="quest-header-title"><strong>世界任务</strong><small>WORLD QUESTS</small></div>
    </header>

    <aside class="quest-selector" aria-label="主题与子任务">
      <div class="topic-control">
        <button class="topic-current" :aria-expanded="topicMenuOpen" @click="topicMenuOpen = !topicMenuOpen">
          <span class="topic-current-copy"><span class="topic-title-line"><span class="topic-stars" aria-hidden="true"><i>✦</i><i>✦</i></span><strong>{{ selectedTopic.title }}</strong></span></span>
          <svg class="topic-chevron" :class="{ open: topicMenuOpen }" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
        </button>
        <Transition name="topic-menu">
          <div v-if="topicMenuOpen" class="topic-menu">
            <button v-for="topic in topics" :key="topic.id" :class="{ selected: topic.id === selectedTopicId }" @click="chooseTopic(topic.id)">
              {{ topic.title }}<i v-if="topic.id === selectedTopicId">✦</i>
            </button>
          </div>
        </Transition>
      </div>

      <nav class="subquest-list" aria-label="子任务列表">
        <div class="subquest-list-content">
          <div class="subquest-rail" aria-hidden="true"></div>
          <button v-for="quest in selectedTopic.quests" :key="quest.id" class="subquest-item" :class="{ selected: quest.id === selectedQuestId }" @click="selectedQuestId = quest.id">
            <span class="subquest-star">
              <svg v-if="quest.type === 'infinite_stories'" viewBox="0 0 24 24" aria-hidden="true"><path d="M7.4 8.2c-1.9 0-3.4 1.7-3.4 3.8s1.5 3.8 3.4 3.8c1.4 0 2.4-.9 4.6-3.8 2.2-2.9 3.2-3.8 4.6-3.8 1.9 0 3.4 1.7 3.4 3.8s-1.5 3.8-3.4 3.8c-1.4 0-2.4-.9-4.6-3.8-2.2-2.9-3.2-3.8-4.6-3.8Z" /></svg>
              <template v-else>{{ quest.id === selectedQuestId ? '✦' : '✧' }}</template>
            </span>
            <span class="subquest-copy"><strong>{{ quest.title }}</strong></span>
          </button>
        </div>
      </nav>
    </aside>

    <section class="quest-detail" aria-live="polite" aria-label="子任务入口">
      <Transition name="quest-change" mode="out-in">
        <div :key="selectedQuest.id" class="quest-content">
          <h1>{{ selectedQuest.title }}</h1>
          <div class="quest-scene-card" aria-label="子任务图片与信息区域">
            <div v-if="selectedQuest.image" class="scene-image" :style="{ backgroundImage: `url('${selectedQuest.image}')` }" aria-hidden="true"></div>
            <div class="scene-copy">
              <p class="quest-description">{{ selectedQuest.description }}</p>
              <p class="scene-period">{{ selectedQuest.period }}</p>
            </div>
            <div v-if="selectedQuest.character?.trim()" class="character-badge">
              <span class="character-name">{{ selectedQuest.character }}</span>
              <span class="character-avatar-wrap">
                <img v-if="selectedQuest.avatar" class="character-avatar has-image" :src="selectedQuest.avatar" :alt="`${selectedQuest.character}头像`">
              </span>
            </div>
          </div>

          <div class="quest-actions">
            <button class="enter-recap" @click="enterRecap">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5c3.2-1.2 5.9-.8 8 1.2v13c-2.1-2-4.8-2.4-8-1.2zM20 5.5c-3.2-1.2-5.9-.8-8 1.2v13c2.1-2 4.8-2.4 8-1.2z" /></svg>
              <span>进入回顾</span><b>→</b>
            </button>
          </div>
        </div>
      </Transition>
    </section>

  </section>
</template>

<style scoped>
.world-quest-screen { position:absolute; inset:0; overflow:hidden; color:#f7f7ff; isolation:isolate; background:#111731; }
.quest-backdrop { position:absolute; inset:0; z-index:-1; overflow:hidden; background:#151b38 url('/backgrounds/worldQuest2.webp') center / cover no-repeat; }
.quest-backdrop-vignette { position:absolute; inset:0; background:linear-gradient(rgba(7,11,28,.4),rgba(7,11,28,.4)),linear-gradient(90deg,rgba(9,14,31,.54),rgba(13,18,40,.2) 46%,rgba(11,16,36,.31)),linear-gradient(0deg,rgba(9,14,32,.56),transparent 28%,rgba(9,14,32,.2)); }
.quest-header { position:absolute; z-index:2; top:0; left:0; right:0; height:76px; padding:0 clamp(24px,4.7vw,78px); display:flex; align-items:center; gap:13px; border-bottom:1px solid rgba(228,237,255,.12); background:linear-gradient(180deg,rgba(9,14,33,.44),rgba(9,14,33,.08)); }
.quest-back { width:42px; height:42px; display:grid; place-items:center; color:#f4f6ff; border:1px solid #eef4ff85; border-radius:4px; background:#dfeaff10; box-shadow:0 0 18px #c7dcff18; cursor:pointer; }.quest-back svg { width:27px; height:27px; fill:none; stroke:currentColor; stroke-width:1.3; stroke-linecap:round; stroke-linejoin:round; }
.quest-header-divider { height:29px; width:1px; background:linear-gradient(transparent,#eff4ff9a,transparent); margin:0 1px; }
.quest-header-title { display:flex; flex-direction:column; gap:3px; }.quest-header-title strong { font-size:17px; font-weight:600; letter-spacing:.12em; }.quest-header-title small,.quest-header-right { color:#e9eeff91; font:8px var(--mono); letter-spacing:.2em; }.quest-header-right { margin-left:auto; display:flex; align-items:center; gap:9px; }.header-star { color:#d9e9ff; font-size:15px; text-shadow:0 0 12px #d6e9ff; }
.quest-selector { position:absolute; z-index:1; left:clamp(32px,7vw,116px); top:112px; bottom:48px; width:min(31vw,430px); padding:12px 26px 18px 0; display:flex; flex-direction:column; transform:perspective(1400px) rotateY(15deg); transform-origin:right center; background:linear-gradient(90deg,rgba(13,20,44,.22),rgba(13,20,44,.03)); }
.selector-eyebrow { display:flex; justify-content:space-between; margin:0 4px 15px 0; color:#e9eeffae; font:8px var(--mono); letter-spacing:.2em; }.selector-eyebrow span { letter-spacing:.08em; color:#e9eeff7f; }
.topic-control { position:relative; z-index:4; margin:0 7px 16px 0; padding-bottom:12px; border-bottom:1px solid #dce8ff55; }.topic-current { width:100%; display:flex; align-items:center; justify-content:space-between; padding:11px 14px 12px 15px; border:1px solid transparent; background:transparent; color:white; text-align:left; cursor:pointer; }.topic-current-copy { display:flex; align-items:center; }.topic-title-line { display:flex; align-items:center; gap:12px; }.topic-stars { display:flex; align-items:center; gap:3px; color:#eef5ff; text-shadow:0 0 7px #d9e9ff,0 0 15px #b9d4ff; }.topic-stars i:first-child { font-size:16px; font-style:normal; }.topic-stars i:last-child { font-size:10px; font-style:normal; opacity:.78; }.topic-current-copy strong { font-size:26px; letter-spacing:.14em; text-shadow:0 2px 9px #141b37; }.topic-chevron { width:20px; height:20px; fill:none; stroke:#f3f6ff; stroke-width:1.4; transition:transform .2s; }.topic-chevron.open { transform:rotate(180deg); }
.topic-menu { position:absolute; top:calc(100% + 7px); left:0; right:7px; padding:6px; border:1px solid #e4ecff55; background:rgba(18,25,51,.96); box-shadow:0 16px 40px #080d22a8; backdrop-filter:blur(12px); }.topic-menu button { width:100%; display:flex; align-items:center; gap:12px; padding:10px 11px; border:0; background:transparent; color:#e8edffb8; text-align:left; font-size:13px; cursor:pointer; }.topic-menu button:hover,.topic-menu button.selected { background:#dbe8ff1b; color:white; }.topic-menu button span { color:#b6c8e98c; font:8px var(--mono); }.topic-menu button i { margin-left:auto; color:#d9ecff; font-style:normal; }
.subquest-heading { display:flex; justify-content:space-between; margin:0 10px 6px 0; padding-bottom:9px; border-bottom:1px solid #dce8ff35; color:#e4ebff9e; font:8px var(--mono); letter-spacing:.17em; }.subquest-list { position:relative; display:flex; flex-direction:column; overflow-y:auto; padding:0 7px 0 0; scrollbar-width:none; }.subquest-list::-webkit-scrollbar { display:none; }.subquest-list-content { position:relative; flex:none; display:flex; flex-direction:column; gap:2px; }.subquest-rail { position:absolute; z-index:0; top:14px; bottom:16px; left:13px; width:1px; background:linear-gradient(#f1f5ff9e,#e5edff22); }
.subquest-item { position:relative; min-height:58px; display:flex; align-items:center; gap:14px; padding:9px 10px 9px 3px; border:1px solid transparent; background:transparent; color:#e8edffc7; text-align:left; cursor:pointer; transition:color .2s; }.subquest-item.selected { color:white; }.subquest-star { position:relative; z-index:1; width:21px; flex:0 0 21px; display:grid; place-items:center; color:#ecf3ffba; font-size:15px; text-shadow:0 0 7px #d2e5ff75; }.subquest-star svg { display:block; width:20px; height:20px; fill:none; stroke:currentColor; stroke-width:1.5; stroke-linecap:round; stroke-linejoin:round; filter:drop-shadow(0 0 4px #d4e4ff72); }.subquest-item.selected .subquest-star { color:#fff; font-size:21px; text-shadow:0 0 5px #fff,0 0 13px #c9deff; }.subquest-item.selected .subquest-star svg { transform:scale(1.15); filter:drop-shadow(0 0 6px #fff) drop-shadow(0 0 9px #c9deff); }.subquest-copy { display:flex; flex-direction:column; gap:4px; }.subquest-copy small { color:#d7e4ff79; font:7px var(--mono); letter-spacing:.16em; }.subquest-copy strong { font-size:19px; font-weight:500; letter-spacing:.08em; }.subquest-item.selected .subquest-copy strong { font-size:20px; }
.selector-foot { display:flex; align-items:center; gap:11px; margin-top:auto; padding:15px 8px 0; color:#e6ecff9a; font-size:11px; letter-spacing:.06em; }.selector-foot small { display:inline-block; margin-top:4px; font:7px var(--mono); letter-spacing:.15em; color:#dbe6ff71; }.foot-orbit { display:grid; place-items:center; width:25px; height:25px; border:1px solid #dfeaff55; border-radius:50%; color:#eaf2ff; }
.quest-detail { position:absolute; z-index:1; top:50%; right:clamp(52px,9vw,148px); width:min(49vw,700px); display:flex; flex-direction:column; padding:0; transform:perspective(1400px) translateY(-50%) rotateY(-15deg); transform-origin:left center; }.detail-kicker { display:flex; align-items:center; gap:10px; color:#e9efffa3; font:8px var(--mono); letter-spacing:.19em; }.kicker-line { display:inline-block; width:24px; height:1px; background:#e7f0ffb5; }.kicker-dot { color:#f0d99e; }
.quest-content { display:flex; flex:none; flex-direction:column; min-height:0; }.quest-content > h1 { flex:none; margin:0 0 12px; font-size:clamp(30px,3.7vw,48px); line-height:1.1; letter-spacing:.1em; font-weight:600; text-shadow:0 3px 18px #080e26a8; }.quest-scene-card { position:relative; flex:none; height:clamp(190px,34vh,320px); overflow:hidden; border:1px solid rgba(234,241,255,.2); background-color:rgba(9,15,34,.08); box-shadow:0 8px 26px #090f2430; isolation:isolate; }.scene-image { position:absolute; z-index:-1; inset:0; background-position:center; background-size:cover; -webkit-mask-image:radial-gradient(ellipse at center,#000 35%,rgba(0,0,0,.92) 48%,transparent 100%); mask-image:radial-gradient(ellipse at center,#000 35%,rgba(0,0,0,.92) 48%,transparent 100%); }.quest-scene-card::before { content:''; position:absolute; z-index:0; inset:0; background:linear-gradient(90deg,rgba(5,10,26,.38),rgba(5,10,26,.04) 75%),linear-gradient(0deg,rgba(5,10,26,.32),transparent 48%); }.scene-copy { position:absolute; z-index:1; top:clamp(18px,4.5%,34px); left:clamp(18px,4.5%,34px); right:24px; text-shadow:0 2px 12px #050a1c; }.quest-description { max-width:610px; margin:0 0 9px; color:#f1f3f8e8; font-size:13px; letter-spacing:.07em; line-height:1.8; }.scene-period { margin:0; color:#e8dbad; font-size:12px; letter-spacing:.06em; }
.character-badge { position:absolute; z-index:1; right:clamp(12px,3%,22px); bottom:clamp(12px,4%,20px); display:flex; align-items:flex-end; gap:9px; padding:4px 5px 4px 11px; }.character-name { padding-bottom:7px; color:#fff; font-size:14px; letter-spacing:.1em; text-shadow:0 1px 8px #050a1c; }.character-avatar-wrap { position:relative; z-index:0; display:block; width:80px; height:80px; flex:0 0 80px; }.character-avatar { position:relative; z-index:1; display:block; width:80px; height:80px; aspect-ratio:1; border:1px solid #eaf1ff99; background:rgba(220,232,255,.04); box-shadow:0 0 14px #c5dcff22; object-fit:cover; }.character-avatar.has-image { border:0; background:transparent; box-shadow:none; }
.quest-meta { display:flex; align-items:center; gap:9px; margin-top:15px; color:#f0f2f8c9; font-size:11px; letter-spacing:.06em; }.meta-spark { color:#e7d59e; text-shadow:0 0 9px #ffeaa8; }.meta-divider { width:1px; height:12px; margin:0 4px; background:#e5edff67; }.quest-actions { display:flex; align-items:center; justify-content:flex-end; gap:25px; margin-top:14px; }.quest-progress { display:flex; align-items:center; gap:6px; color:#f3e6b4; font-size:13px; font-weight:600; text-shadow:0 1px 8px #080f25; }.progress-crystal { font-size:20px; color:#e7d9a4; }
.enter-recap { min-width:190px; height:49px; display:flex; align-items:center; justify-content:center; gap:12px; border:1px solid #edf3ffb5; background:linear-gradient(110deg,#f2f5ff30,#b4c9f01c); color:#fff; box-shadow:0 0 0 3px #e7efff0c,0 9px 24px #0b132a5c,inset 0 0 18px #dce8ff1d; font-size:15px; letter-spacing:.12em; cursor:pointer; transition:background .2s,transform .2s; }.enter-recap:hover { background:#dfeaff32; transform:translateY(-2px); }.enter-recap svg { width:21px; height:21px; fill:none; stroke:currentColor; stroke-width:1.4; stroke-linejoin:round; }.enter-recap b { margin-left:10px; font:18px var(--mono); }
.quest-change-enter-active,.quest-change-leave-active { transition:opacity .18s,transform .18s; }.quest-change-enter-from { opacity:0; transform:translateY(8px); }.quest-change-leave-to { opacity:0; transform:translateY(-5px); }.topic-menu-enter-active,.topic-menu-leave-active { transition:opacity .2s; }.topic-menu-enter-from,.topic-menu-leave-to { opacity:0; }
@media (max-width:850px) and (orientation:landscape) { .quest-header { height:54px; padding:0 24px; }.quest-back { width:34px;height:34px; }.quest-selector { left:36px; top:75px; bottom:16px; width:34vw; padding-right:15px; }.selector-eyebrow { margin-bottom:7px;font-size:6px; }.topic-control { margin-bottom:8px; }.topic-current { padding:1px 10px; }.topic-current-copy strong { font-size:21px; }.subquest-heading { margin-bottom:2px;padding-bottom:5px;font-size:6px; }.subquest-item { min-height:37px;gap:8px;padding:4px 7px 4px 1px; }.subquest-copy small { font-size:6px; }.subquest-copy strong,.subquest-item.selected .subquest-copy strong { font-size:16px; }.subquest-star { width:18px;flex-basis:18px;font-size:12px; }.subquest-item.selected .subquest-star { font-size:17px; }.subquest-star svg { width:18px;height:18px; }.subquest-rail { left:10px; }.selector-foot { padding-top:6px;font-size:9px; }.selector-foot small { font-size:6px; }.quest-detail { top:55%;right:34px;bottom:auto;width:54vw;padding:0;transform:perspective(1000px) translateY(-50%) rotateY(-5deg); }.detail-kicker { font-size:6px; }.quest-content > h1 { margin-bottom:6px;font-size:clamp(21px,3.3vw,30px); }.quest-description { margin-bottom:5px;font-size:10px;line-height:1.4; }.scene-period { font-size:9px; }.quest-scene-card { height:clamp(100px,40vh,180px); }.character-name { padding-bottom:5px;font-size:10px; }.character-avatar-wrap { width:70px;height:70px;flex-basis:70px; }.character-avatar { width:70px;height:70px; }.quest-actions { margin-top:5px;gap:15px; }.enter-recap { min-width:140px;height:36px;font-size:11px; }.enter-recap svg { width:17px;height:17px; } }
@media (max-width:850px) and (orientation:landscape) { .quest-header { height:54px; padding:0 24px; }.quest-back { width:34px;height:34px; }.quest-selector { left:36px; top:75px; bottom:16px; width:34vw; padding-right:15px; }.selector-eyebrow { margin-bottom:7px;font-size:6px; }.topic-control { margin-bottom:8px; }.topic-current { padding:1px 10px; }.topic-current-copy strong { font-size:21px; }.subquest-heading { margin-bottom:2px;padding-bottom:5px;font-size:6px; }.subquest-item { min-height:37px;gap:8px;padding:4px 7px 4px 1px; }.subquest-copy small { font-size:6px; }.subquest-copy strong,.subquest-item.selected .subquest-copy strong { font-size:16px; }.subquest-star { width:18px;flex-basis:18px;font-size:12px; }.subquest-item.selected .subquest-star { font-size:17px; }.subquest-star svg { width:18px;height:18px; }.subquest-rail { left:10px; }.selector-foot { padding-top:6px;font-size:9px; }.selector-foot small { font-size:6px; }.quest-detail { top:55%;right:34px;bottom:auto;width:54vw;padding:0;transform:perspective(1000px) translateY(-50%) rotateY(-5deg); }.detail-kicker { font-size:6px; }.quest-content > h1 { margin-bottom:6px;font-size:clamp(21px,3.3vw,30px); }.quest-description { margin-bottom:5px;font-size:10px;line-height:1.4; }.scene-period { font-size:9px; }.quest-scene-card { height:clamp(100px,40vh,180px); }.character-name { padding-bottom:5px;font-size:10px; }.character-avatar-wrap { width:70px;height:70px;flex-basis:70px; }.character-avatar { width:70px;height:70px; }.quest-actions { margin-top:5px;gap:15px; }.enter-recap { min-width:140px;height:36px;font-size:11px; }.enter-recap svg { width:17px;height:17px; } }
@media (max-width:850px) and (orientation:landscape) { .quest-selector { top:60px;padding-top:4px;transform:perspective(1000px) rotateY(10deg); }.quest-detail { transform:perspective(1000px) translateY(-50%) rotateY(-10deg); } }
@media (max-width:820px) and (orientation:portrait) { .quest-header { height:54px; padding:0 24px; }.quest-back { width:34px;height:34px; }.quest-selector { left:36px;top:60px;bottom:16px;width:34vh;padding:4px 15px 18px 0;transform:perspective(1000px) rotateY(10deg); }.selector-eyebrow { margin-bottom:7px;font-size:6px; }.topic-control { margin-bottom:8px; }.topic-current { padding:1px 10px; }.topic-current-copy strong { font-size:21px; }.subquest-heading { margin-bottom:2px;padding-bottom:5px;font-size:6px; }.subquest-item { min-height:37px;gap:8px;padding:4px 7px 4px 1px; }.subquest-copy small { font-size:6px; }.subquest-copy strong,.subquest-item.selected .subquest-copy strong { font-size:16px; }.subquest-star { width:18px;flex-basis:18px;font-size:12px; }.subquest-item.selected .subquest-star { font-size:17px; }.subquest-star svg { width:18px;height:18px; }.subquest-rail { left:10px; }.selector-foot { padding-top:6px;font-size:9px; }.selector-foot small { font-size:6px; }.quest-detail { top:55%;right:34px;bottom:auto;width:54vh;padding:0;transform:perspective(1000px) translateY(-50%) rotateY(-10deg); }.detail-kicker { font-size:6px; }.quest-content > h1 { margin-bottom:6px;font-size:clamp(21px,3.3vh,30px); }.quest-description { margin-bottom:5px;font-size:10px;line-height:1.4; }.scene-period { font-size:9px; }.quest-scene-card { height:clamp(100px,40vh,180px); }.character-name { padding-bottom:5px;font-size:10px; }.character-avatar-wrap { width:70px;height:70px;flex-basis:70px; }.character-avatar { width:70px;height:70px; }.quest-actions { margin-top:5px;gap:15px; }.enter-recap { min-width:140px;height:36px;font-size:11px; }.enter-recap svg { width:17px;height:17px; } }
</style>






