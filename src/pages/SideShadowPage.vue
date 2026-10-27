<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

const selectedCategory = ref('shadow')
</script>

<template>
  <section class="side-shadow-page" aria-label="侧影图鉴">
    <div class="shadow-backdrop-vignette" aria-hidden="true"></div>
    <header class="quest-header">
      <RouterLink class="quest-back" to="/archive" aria-label="返回主神空间">
        <svg viewBox="0 0 40 40" aria-hidden="true"><path d="M25 8 13 20l12 12M14 20h19" /></svg>
      </RouterLink>
      <span class="quest-header-divider"></span>
      <RouterLink class="quest-header-title shadow-header-link" to="/archive"><strong>侧影图鉴</strong><small>SHADOW GALLERY</small></RouterLink>
    </header>

    <div class="shadow-category shadow-category-main" aria-label="侧影，102">
      <button class="shadow-category-button" type="button" :aria-pressed="selectedCategory === 'shadow'" @click="selectedCategory = 'shadow'">侧影<span class="hotspot-ornament" aria-hidden="true"><i></i><b></b><i></i></span></button>
      <div class="shadow-count"><strong>102</strong></div>
    </div>

    <div class="shadow-category shadow-category-limited" aria-label="限定侧影，131">
      <button class="shadow-category-button" type="button" :aria-pressed="selectedCategory === 'limited'" @click="selectedCategory = 'limited'">限定侧影<span class="hotspot-ornament" aria-hidden="true"><i></i><b></b><i></i></span></button>
      <div class="shadow-count"><strong>131</strong></div>
    </div>

    <div class="shadow-category shadow-category-special" aria-label="特别纪念，20">
      <button class="shadow-category-button" type="button" :aria-pressed="selectedCategory === 'special'" @click="selectedCategory = 'special'">特别纪念<span class="hotspot-ornament" aria-hidden="true"><i></i><b></b><i></i></span></button>
      <div class="shadow-count"><strong>20</strong></div>
    </div>
  </section>
</template>

<style scoped>
.side-shadow-page { position:absolute; inset:0; overflow:hidden; color:#fff; isolation:isolate; background:#12172d url('/images/shadow-gallery-no-text.png') center / cover no-repeat; }
.shadow-backdrop-vignette { position:absolute; inset:0; z-index:0; pointer-events:none; background:linear-gradient(180deg,rgba(7,11,25,.22),transparent 26%,transparent 72%,rgba(7,11,25,.22)),linear-gradient(90deg,rgba(7,11,25,.1),transparent 45%,rgba(7,11,25,.1)); }
.quest-header { position:absolute; z-index:5; top:0; left:0; right:0; height:76px; padding:0 clamp(24px,4.7vw,78px); display:flex; align-items:center; gap:13px; border-bottom:1px solid rgba(228,237,255,.12); background:linear-gradient(180deg,rgba(9,14,33,.44),rgba(9,14,33,.08)); }
.quest-back { width:42px; height:42px; display:grid; place-items:center; color:#f4f6ff; border:1px solid #eef4ff85; border-radius:4px; background:#dfeaff10; box-shadow:0 0 18px #c7dcff18; text-decoration:none; cursor:pointer; }.quest-back svg { width:27px; height:27px; fill:none; stroke:currentColor; stroke-width:1.3; stroke-linecap:round; stroke-linejoin:round; }
.quest-header-divider { height:29px; width:1px; background:linear-gradient(transparent,#eff4ff9a,transparent); margin:0 1px; }
.quest-header-title { display:flex; flex-direction:column; gap:3px; text-decoration:none; }.quest-header-title strong { font-size:17px; font-weight:600; letter-spacing:.12em; }.quest-header-title small { color:#e9eeff91; font:8px var(--mono); letter-spacing:.2em; }
.shadow-category { position:absolute; z-index:3; }.shadow-category-button { position:absolute; display:flex; flex-direction:column; align-items:center; gap:3px; margin:0; padding:0 2px 2px; border:0; color:#fff; background:transparent; font-size:clamp(24px,3.2vw,44px); font-weight:600; letter-spacing:.06em; white-space:nowrap; text-shadow:0 1px 12px #050816aa,0 0 20px #e3e8ff80; cursor:pointer; transition:color .2s,filter .2s,transform .2s; }
.shadow-category-button .hotspot-ornament { width:82%; }
.shadow-category-button:hover,.shadow-category-button[aria-pressed="true"] { color:#fff; filter:brightness(1.18) drop-shadow(0 0 8px #e4eaff7a); }
.shadow-header-link { transition:filter .2s; }.shadow-header-link:hover { filter:brightness(1.2) drop-shadow(0 0 7px #e4eaff7a); }
.shadow-category-main { left:9.5%; top:23%; width:29%; height:58%; }.shadow-category-main .shadow-category-button { top:2%; left:-12%; transform:rotate(-8deg); font-size:clamp(30px,4vw,56px); }.shadow-category-main .shadow-category-button:hover { transform:rotate(-8deg) translateY(-2px); }
.shadow-count { position:absolute; right:2%; bottom:8%; display:flex; align-items:baseline; gap:4px; color:#f5f6ffdc; text-shadow:0 0 8px #fff7; font-family:Georgia,serif; }.shadow-count strong { font-size:clamp(37px,5vw,66px); line-height:.9; font-weight:400; }.shadow-count span { font-size:clamp(18px,2.1vw,29px); color:#e8ebf9ba; }
.shadow-category-limited { right:7.8%; top:10%; width:21%; height:37%; transform:rotate(-7deg); }.shadow-category-limited .shadow-category-button { top:-2%; left:-8%; transform:rotate(-1deg); }
.shadow-category-limited .shadow-count { right:-1%; bottom:-1%; transform:rotate(7deg); }
.shadow-category-special { left:61%; top:55%; width:24%; height:41%; }.shadow-category-special .shadow-category-button { top:11%; left:4%; }.shadow-category-special .shadow-count { right:8%; bottom:0; }
@media (max-width:850px) and (orientation:landscape) {
  .quest-header { height:54px; padding:0 24px; }.quest-back { width:34px;height:34px; }.shadow-category-main { left:9%; top:24%; width:31%; height:57%; }.shadow-category-limited { right:7%; top:12%; width:22%; height:36%; }.shadow-category-special { left:60%; top:51%; width:25%; height:39%; }.shadow-category-main .shadow-category-button { font-size:clamp(28px,5vh,42px); }.shadow-category .shadow-category-button { font-size:clamp(20px,4vh,30px); }.shadow-count strong { font-size:clamp(34px,8vh,50px); }.shadow-count span { font-size:clamp(16px,4vh,23px); }
}
@media (max-width:820px) and (orientation:portrait) {
  .app-frame.is-portrait-phone .quest-header { height:54px; padding:0 24px; }.app-frame.is-portrait-phone .quest-back { width:34px;height:34px; }
  .app-frame.is-portrait-phone .shadow-category-main { left:9%; top:24%; width:31%; height:57%; }.app-frame.is-portrait-phone .shadow-category-limited { right:7%; top:12%; width:22%; height:36%; }.app-frame.is-portrait-phone .shadow-category-special { left:60%; top:51%; width:25%; height:39%; }
  .app-frame.is-portrait-phone .shadow-category-main .shadow-category-button { font-size:clamp(28px,5vh,42px); }.app-frame.is-portrait-phone .shadow-category .shadow-category-button { font-size:clamp(20px,4vh,30px); }.app-frame.is-portrait-phone .shadow-count strong { font-size:clamp(34px,8vh,50px); }.app-frame.is-portrait-phone .shadow-count span { font-size:clamp(16px,4vh,23px); }
}
</style>
