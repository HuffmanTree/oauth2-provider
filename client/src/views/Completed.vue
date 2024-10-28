<script setup lang="ts">
defineProps({
  projectName: { type: String, required: true },
})
</script>

<template>
  <div id="completed">
    <h1>Consent given!</h1>
    <p>You consent has been given to '{{ projectName }}'</p>
    <p>This tab can be closed</p>
  </div>
</template>

<style scoped>
</style>
