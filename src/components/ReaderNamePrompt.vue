<script setup lang="ts">
defineEmits<{ continue: []; cancel: [] }>()
</script>

<template>
  <div class="reader-name-scrim" @click.self="$emit('cancel')">
    <section class="reader-name-prompt" role="alertdialog" aria-modal="true" aria-labelledby="reader-name-title">
      <button class="reader-name-close" type="button" aria-label="关闭提示" @click="$emit('cancel')">×</button>
      <h2 id="reader-name-title">姓名提示</h2>
      <p class="reader-name-message">这篇剧情涉及玩家姓名。<br>如有需要，请返回主页右下角的“拾录者”修改</p>
      <div class="reader-name-rule" aria-hidden="true"><span></span><i>✦</i><span></span></div>
      <p class="reader-name-note">如果没有填写，正文会直接显示变量名</p>
      <div class="reader-name-actions">
        <button type="button" class="reader-name-cancel" @click="$emit('cancel')">返回</button>
        <button type="button" class="reader-name-continue" @click="$emit('continue')">继续阅读</button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.reader-name-scrim { position:absolute; z-index:40; inset:0; display:grid; place-items:center; padding:18px; background:#0b102b52; backdrop-filter:blur(5px); }
.reader-name-prompt { position:relative; width:min(560px,90vw); display:flex; flex-direction:column; align-items:center; padding:48px 38px 28px; border:1px solid #e5efff77; background:linear-gradient(145deg,#d7e4f229,#172441ed 68%); box-shadow:0 20px 80px #11182d88,inset 0 0 30px #e7f1ff12; color:#f6f4ef; text-align:center; }
.reader-name-prompt::before,.reader-name-prompt::after { position:absolute; width:17px; height:17px; content:''; border-color:#d4f3ff; border-style:solid; }.reader-name-prompt::before { top:-4px; left:-4px; border-width:1px 0 0 1px; }.reader-name-prompt::after { right:-4px; bottom:-4px; border-width:0 1px 1px 0; }
.reader-name-close { position:absolute; top:16px; right:18px; width:30px; height:30px; padding:0; border:0; background:transparent; color:#f3f5f8c7; font-size:31px; font-weight:200; line-height:1; cursor:pointer; }
.reader-name-prompt h2 { margin:0 0 19px; color:#f8f7ff; font-size:clamp(25px,3vw,34px); letter-spacing:.15em; text-shadow:0 2px 12px #d5e7ff6b; }
.reader-name-message { max-width:560px; margin:0; color:#f1f0eced; font-size:clamp(14px,1.6vw,17px); line-height:1.9; letter-spacing:.035em; }
.reader-name-rule { display:flex; align-items:center; justify-content:center; gap:15px; width:min(250px,70%); margin:25px auto 21px; color:#c7ebff; font-size:14px; text-shadow:0 0 10px #d8edff99; }.reader-name-rule span { flex:1; height:1px; background:linear-gradient(90deg,transparent,#d8edff99); }.reader-name-rule span:last-child { transform:rotate(180deg); }.reader-name-rule i { font-style:normal; }
.reader-name-prompt .reader-name-note { margin:0; color:#d9e1f0b8; font-size:14px; line-height:1.7; letter-spacing:.04em; }
.reader-name-actions { display:flex; justify-content:center; gap:28px; width:100%; margin-top:auto; padding-top:30px; }.reader-name-actions button { min-width:112px; padding:9px 14px; border:1px solid #e5efff62; background:#e4edff0c; color:#f6f4ef; font-size:14px; letter-spacing:.08em; transition:background .2s,border-color .2s; }.reader-name-actions button:hover { border-color:#eef4ffb0; background:#e4edff22; }.reader-name-continue { box-shadow:inset 0 0 14px #dce8ff10; }
@media (max-width:850px) and (orientation:landscape) { .reader-name-prompt { width:min(520px,92%); padding:30px 28px 18px; }.reader-name-close { top:8px;right:10px;font-size:26px; }.reader-name-prompt h2 { margin-bottom:8px;font-size:clamp(19px,3.5vh,25px); }.reader-name-message { font-size:clamp(11px,2.2vh,14px);line-height:1.65; }.reader-name-rule { margin:12px auto 10px;font-size:11px; }.reader-name-prompt .reader-name-note { font-size:11px; }.reader-name-actions { gap:18px;padding-top:14px; }.reader-name-actions button { min-width:90px;padding:6px 10px;font-size:11px; } }
</style>
