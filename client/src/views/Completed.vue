<script setup lang="ts">
defineProps({
  projectName: { type: String, required: true },
})
</script>

<template>
  <div id="completed">
    <h1 class="center">Consent given!</h1>
    <div class="wrapper block">
      <p>Your consent has been given to '{{ projectName }}'</p>
      <p>This tab can be closed</p>
    </div>
  </div>
</template>

<style scoped>
</style>
