<script setup lang="ts">
import SceneHotspot from '../components/SceneHotspot.vue'
import { archiveHotspots, type Hotspot } from '../content/navigation'

defineEmits<{ activate: [item: Hotspot] }>()
</script>

<template>
  <section class="scene archive-scene" aria-label="世界档案场景">
    <div class="archive-aurora aurora-one"></div><div class="archive-aurora aurora-two"></div>
    <div class="archive-stars"><i v-for="n in 28" :key="n" :style="{ left: `${(n * 37.7) % 100}%`, top: `${(n * 19.3) % 76}%`, animationDelay: `${(n % 8) * -0.35}s` }"></i></div>
    <div class="archive-grid"></div>
    <svg class="world-tree-art" viewBox="0 0 700 700" role="presentation" aria-hidden="true">
      <defs><linearGradient id="treeGlow" x1="0" x2="1" y1="1" y2="0"><stop stop-color="#8098da" stop-opacity=".04"/><stop offset=".55" stop-color="#d4e2ff" stop-opacity=".78"/><stop offset="1" stop-color="#a8c7ff" stop-opacity=".16"/></linearGradient><filter id="softGlow"><feGaussianBlur stdDeviation="5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
      <g fill="none" stroke="url(#treeGlow)" stroke-linecap="round" filter="url(#softGlow)">
        <path d="M339 680 C340 556 351 457 336 347 C324 261 318 190 340 74" stroke-width="10"/>
        <path d="M337 456 C279 393 226 331 155 273 C110 236 76 185 56 137" stroke-width="5"/><path d="M343 395 C400 334 443 269 511 217 C558 181 586 124 605 73" stroke-width="5"/>
        <path d="M331 338 C272 305 218 255 195 192 C178 150 148 125 115 96" stroke-width="3"/><path d="M346 302 C404 267 452 218 467 159 C480 111 523 85 555 53" stroke-width="3"/>
        <path d="M337 525 C273 490 206 466 136 445 C92 431 63 398 35 361" stroke-width="3"/><path d="M345 499 C412 460 475 436 542 394 C582 369 617 330 640 291" stroke-width="3"/>
        <path d="M309 274 C275 218 265 162 270 102 M369 242 C397 190 407 132 394 82 M265 340 C207 336 151 348 103 377 M415 354 C470 347 521 353 573 376" stroke-width="2"/>
      </g>
      <g fill="#dce8ff" opacity=".8"><circle cx="56" cy="137" r="3"/><circle cx="605" cy="73" r="3"/><circle cx="115" cy="96" r="2"/><circle cx="555" cy="53" r="3"/><circle cx="35" cy="361" r="2"/><circle cx="640" cy="291" r="3"/></g>
    </svg>
    <div class="archive-pillar"><span></span><i></i></div>
    <div class="archive-door door-left"></div><div class="archive-door door-right"></div>
    <div class="archive-floor-light"></div>
    <div class="scene-label archive-label"><span>02</span><i></i> AN ARCHIVE BETWEEN WORLDS</div>
    <SceneHotspot v-for="(item, index) in archiveHotspots" :key="item.id" :item="item" :index="index" @activate="$emit('activate', $event)" />
    <div class="archive-coordinates">THE ARCHIVE IS NEVER CLOSED <span>·</span> INDEX 02 / 02</div>
  </section>
</template>

<style scoped>
.archive-scene { background:radial-gradient(ellipse at 50% 68%,#cad8f5 0,#8292ba 24%,#444e71 55%,#131d38 100%); }
.archive-aurora { position:absolute; pointer-events:none; border-radius:50%; filter:blur(23px); mix-blend-mode:screen; }.aurora-one { left:-8%; top:22%; width:79%; height:38%; background:linear-gradient(115deg,#a6d6ff00,#c6d8ff94,#e7ecff16,#98bfff00); transform:rotate(-14deg); }.aurora-two { right:-15%; top:13%; width:65%; height:46%; background:linear-gradient(135deg,#877bf400,#789cf05e,#d4e3ff88,#6c77cb00); transform:rotate(28deg); }
.archive-stars { position:absolute; inset:0; background:radial-gradient(ellipse at 53% 42%,#e6eeff20,transparent 53%); }.archive-stars i { position:absolute; width:2px; height:2px; border-radius:50%; background:#e8f4ff; box-shadow:0 0 8px 2px #d8e8ff99; opacity:.7; animation:twinkle 3s ease-in-out infinite alternate; }.archive-stars i:nth-child(3n) { opacity:.35; }.archive-stars i:nth-child(4n) { width:2px; height:15px; border-radius:3px; transform:rotate(42deg); opacity:.28; }
@keyframes twinkle { to { opacity:.25; transform:scale(.7); } }
.archive-grid { position:absolute; left:-15%; right:-15%; bottom:-20%; height:58%; background-image:linear-gradient(#d9e6ff3a 1px,transparent 1px),linear-gradient(90deg,#d9e6ff3a 1px,transparent 1px); background-size:62px 42px; transform:perspective(290px) rotateX(62deg); transform-origin:50% 0; mask-image:linear-gradient(0deg,#000 0%,#0009 48%,transparent 100%); opacity:.53; }
.world-tree-art { position:absolute; left:50%; top:12%; width:min(62vw,760px); height:84%; transform:translateX(-50%); opacity:.62; filter:drop-shadow(0 0 11px #c8e2ff8c); }
.archive-pillar { position:absolute; z-index:1; left:50%; top:9%; width:3px; height:36%; background:linear-gradient(180deg,#e8f6ff00,#eef6ffdc,#d4e7ff00); box-shadow:0 0 20px 7px #bbdcff77; }.archive-pillar span { position:absolute; top:0; left:-27px; width:57px; height:14px; background:radial-gradient(ellipse,#fff,#cde4ff77 34%,transparent 70%); }.archive-pillar i { position:absolute; left:-1px; top:50%; width:5px; height:5px; border-radius:50%; background:white; box-shadow:0 0 18px 7px #deedff; }
.archive-door { position:absolute; z-index:1; bottom:24%; width:84px; height:30%; border:1px solid #e3eeff58; background:linear-gradient(100deg,#111b3aab,#94a4cd22 45%,#18233f99); box-shadow:inset 0 0 28px #c7dcff1c,0 0 26px #bccaff16; }.archive-door::after { content:''; position:absolute; inset:8px 7px 0; border:1px solid #e3eeff30; border-bottom:0; border-radius:50% 50% 0 0; }.door-left { left:7%; border-radius:48px 48px 0 0; transform:perspective(230px) rotateY(14deg); }.door-right { right:8%; height:24%; width:69px; border-radius:38px 38px 0 0; opacity:.53; transform:perspective(230px) rotateY(-18deg); }
.archive-floor-light { position:absolute; z-index:2; left:0; right:0; bottom:25%; height:2px; background:linear-gradient(90deg,transparent,#dceaff85 19%,#fff 51%,#c0dcff94 80%,transparent); box-shadow:0 0 25px 6px #c5e0ff55; }
.archive-label { color:#dbe4ffb5; }
@media (max-width:850px) and (orientation:landscape) { .world-tree-art { width:60vw; top:10%; height:84%; }.archive-door { bottom:21%; height:27%; width:55px; }.door-right { height:21%; width:45px; } }
</style>
