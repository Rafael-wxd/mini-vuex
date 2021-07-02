import { inject } from 'vue'

const storeKey = 'store'

function useStore (injectKey = null) {
  return inject(injectKey !== null ? injectKey : storeKey)
}

export {
  useStore,
  storeKey
}
