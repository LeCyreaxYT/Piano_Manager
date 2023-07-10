<template>
    <!-- Navigation on the Top with Piano und Settings als Tab -->
    <nav class="bg-zinc-900/80 z-50">
        <div class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto">
            <div class="block w-auto" id="navbar-default">
                <ul class="flex rounded-lg flex-row mt-0 border-gray-700">
                    <template v-for="(item, index) in list">
                        <li class="p-1.5 bg-slate-600" @click="openSite(item.name)" v-if="getCurrentRoute === item.name">
                            <a href="#" class="block pl-3 pr-3 rounded text-white transition-all hover:text-white/75 text-sm">{{ item.name }}</a>
                        </li>

                        <li class="p-1.5" @click="openSite(item.name)" v-else>
                            <a href="#" class="block pl-3 pr-3 rounded text-white transition-all hover:text-white/75 text-sm">{{ item.name }}</a>
                        </li>
                    </template>
                </ul>
            </div>
        </div>
    </nav>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    name: "Aside",
    data() {
        return {
            list: [
                { name: 'Home', path: '/' },
                { name: 'Settings', path: '/settings' }
            ]
        }
    },
    methods: {
        openSite(name: string) {
            this.$router.push({ name: name })
        },
    },

    computed: {
        getCurrentRoute() {
            return this.$route.name
        },
    },
})
</script>
