<template>
  <div>
    <div>a: {{ a }}</div>
    <div>b: {{ b }}</div>
    <div>c: {{ c }}</div>
  </div>

  <div style="margin-top: 10px;">
    <div>aGetter: {{ aGetter }}</div>
    <div>bGetter: {{ bGetter }}</div>
    <div>cGetter: {{ cGetter }}</div>
  </div>

  <div style="margin-top: 10px;">
    <span>错误修改a/b/c</span>
    <button @click="$store.state.a += 'a'">修改a</button>
    <button @click="$store.state.b.a += 'b'">修改b</button>
    <button @click="$store.state.c.a += 'c'">修改c</button>
  </div>

  <div style="margin-top: 10px;">
    <span>mutations修改</span>
    <button @click="$store.commit('update', 1)">修改a</button>
    <button @click="$store.commit('b/update', 1)">修改b</button>
    <button @click="$store.commit('c/update', 1)">修改c</button>
  </div>

  <div style="margin-top: 10px;">
    <span>actions修改</span>
    <button @click="$store.dispatch('update', 2)">修改a</button>
    <button @click="$store.dispatch('b/update', 2)">修改b</button>
    <button @click="$store.dispatch('c/update', 2)">修改c</button>
  </div>

  <div style="margin-top: 10px;">
    <span>mapMutations</span>
    <button @click="updateClick">修改a</button>
  </div>
</template>

<script>
import { useStore, mapActions } from '@/vuex'
import { computed } from 'vue'

export default {
  name: 'App',
  components: {},
  methods: {
    ...mapActions(['update']),
    updateClick () {
      this.update('dsa')
    },
  },
  setup () {
    const store = useStore()

    return {
      a: computed(() => store.state.a),
      b: computed(() => store.state.b.a),
      c: computed(() => store.state.c.a),
      aGetter: computed(() => store.getters['aGetters']),
      bGetter: computed(() => store.getters['b/aGetters']),
      cGetter: computed(() => store.getters['c/aGetters'])
    }
  }
}
</script>

<style>
#app {}
</style>
