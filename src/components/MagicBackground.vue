<template>
  <div class="magic-background" aria-hidden="true">
    <span class="bg-blob blob-a"></span>
    <span class="bg-blob blob-b"></span>
    <span class="bg-blob blob-c"></span>
  </div>
</template>

<script setup>
</script>

<style scoped>
.magic-background {
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
}
.bg-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.22;
}

.blob-a {
  width: 340px;
  height: 340px;
  background: #f5c76e;
  top: -80px;
  left: -60px;
  animation: float-a 9s ease-in-out infinite;
}
.blob-b {
  width: 300px;
  height: 300px;
  background: #f3c6d6;
  bottom: -80px;
  right: -60px;
  animation: float-b 10.5s ease-in-out infinite;
}
.blob-c {
  width: 240px;
  height: 240px;
  background: #c9a6f0;
  top: 45%;
  right: -100px;
  animation: float-c 7.5s ease-in-out infinite;
}

@keyframes float-a {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(50px, 40px) scale(1.12); }
  50% { transform: translate(20px, 90px) scale(0.95); }
  75% { transform: translate(-30px, 30px) scale(1.05); }
}
@keyframes float-b {
  0%, 100% { transform: translate(0, 0) scale(1); }
  30% { transform: translate(-60px, -30px) scale(1.1); }
  60% { transform: translate(-20px, -80px) scale(0.92); }
  85% { transform: translate(30px, -20px) scale(1.06); }
}
@keyframes float-c {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(-70px, 50px) scale(1.15); }
  66% { transform: translate(-30px, -40px) scale(0.9); }
}
</style>