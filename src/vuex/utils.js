export function objectForEach (obj, fn) {
  if (typeof obj !== 'object' || Array.isArray(obj)) {
    throw 'Must be of type Object'
  }
  if (typeof fn !== 'function') {
    throw 'Muse be of type Function'
  }
  Object.keys(obj).forEach((key) => {
    fn(key, obj[key])
  })
}

export function getNewestState (state, path) {
  return path.reduce((data, key) => data[key] , state)
}

export function normalizeMap (data) {
  if (typeof data !== 'object') {
    data = []
  }
  return Array.isArray(data)
    ? data.map((key, value) => ({key, value}))
    : Object.keys(data).map((key) => ({key, value: data[key]}))
}
