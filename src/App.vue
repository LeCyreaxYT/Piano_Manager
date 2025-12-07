<template>
  <div class="h-screen w-screen flex flex-col bg-base-200 overflow-hidden" data-theme="pianomanager">
    <!-- Custom Titlebar -->
    <Titlebar />

    <!-- Main Content -->
    <main class="flex-1 flex flex-col overflow-hidden">
      <RouterView v-slot="{ Component }">
        <KeepAlive>
          <component :is="Component" />
        </KeepAlive>
      </RouterView>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Titlebar from '@components/layout/Titlebar.vue'

const router = useRouter()

onMounted(() => {
  router.push('/')
})
</script>
