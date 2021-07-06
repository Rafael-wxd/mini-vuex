import buble from '@rollup/plugin-buble'
import replace from '@rollup/plugin-replace'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

export default {
  external: ['vue'],
  input: 'src/vuex/index.js',
  output: {
    file: 'dist/index.js',
    name: 'index.js',
    format: 'cjs'
  },
  plugins: [
    replace({
      preventAssignment: true,
      name: 'wxd-vuex'
    }),
    buble(),
    resolve(),
    commonjs()
  ]
}