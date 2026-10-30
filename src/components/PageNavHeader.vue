<script setup lang="ts">
import { RouterLink, type RouteLocationRaw } from 'vue-router'
import { ArrowLeft } from '@lucide/vue'

defineProps<{
  title: string
  subtitle: string
  backLabel: string
  backTo?: RouteLocationRaw
}>()

const emit = defineEmits<{ back: [] }>()
</script>

<template>
  <header class="page-nav-header">
    <RouterLink v-if="backTo" class="page-nav-back" :to="backTo" :aria-label="backLabel">
      <ArrowLeft :size="25" :stroke-width="1.4" />
    </RouterLink>
    <button v-else class="page-nav-back" type="button" :aria-label="backLabel" @click="emit('back')">
      <ArrowLeft :size="25" :stroke-width="1.4" />
    </button>
    <span class="page-nav-divider" aria-hidden="true"></span>
    <div class="page-nav-title"><strong>{{ title }}</strong><small>{{ subtitle }}</small></div>
    <div v-if="$slots.actions" class="page-nav-actions"><slot name="actions" /></div>
  </header>
</template>

<style scoped>
.page-nav-header { position:absolute; z-index:5; top:0; left:0; right:0; height:76px; padding:0 clamp(24px,4.7vw,78px); display:flex; align-items:center; gap:13px; border-bottom:1px solid rgba(228,237,255,.12); background:linear-gradient(180deg,rgba(9,14,33,.44),rgba(9,14,33,.08)); }
.page-nav-back { flex:none; width:42px; height:42px; display:grid; place-items:center; padding:0; color:#f4f6ff; border:1px solid #eef4ff85; border-radius:4px; background:#dfeaff10; box-shadow:0 0 18px #c7dcff18; text-decoration:none; cursor:pointer; }
.page-nav-back :deep(svg) { width:27px; height:27px; }
.page-nav-divider { flex:none; height:29px; width:1px; background:linear-gradient(transparent,#eff4ff9a,transparent); margin:0 1px; }
.page-nav-title { display:flex; flex-direction:column; gap:3px; }.page-nav-title strong { font-size:17px; font-weight:600; letter-spacing:.12em; }.page-nav-title small { color:#e9eeff91; font:8px var(--mono); letter-spacing:.2em; }
.page-nav-actions { margin-left:auto; display:flex; align-items:center; gap:10px; }
@media (max-width:850px) and (orientation:landscape), (max-width:820px) and (orientation:portrait) {
  .page-nav-header { height:54px; padding:0 24px; }
  .page-nav-back { width:34px; height:34px; }
  .page-nav-back :deep(svg) { width:22px; height:22px; }
  .page-nav-title strong { font-size:15px; }
  .page-nav-title small { font-size:7px; }
  .page-nav-actions { gap:7px; }
}
</style>
