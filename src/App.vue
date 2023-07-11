<template>
  <div className="absolute top-0 left-0 h-full w-full flex flex-row bg-neutral-700">
      <main className="main flex flex-col flex-grow ml-0 transition-all duration-150 ease-in">
        <Navigation />

        <div className="main-content flex flex-col flex-grow p-4">
          <RouterView v-slot="{ Component }">
            <KeepAlive>
              <component :is="Component" />
            </KeepAlive>
          </RouterView>
        </div>
      </main>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

// Layouts
import Navigation from './views/layout/navigation.vue'

export default defineComponent({
  name: 'App',

  data() {
    return {
    }
  },
  components: {
    Navigation 
  },

  created() {
    this.$router.push('/')
  },
})
</script>

<style lang="scss">

</style>
