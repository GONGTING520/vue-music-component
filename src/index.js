import musicComponent from './Music.vue'
 
const VueMusicComponent = {
 install: function (Vue) {
 if (typeof window !== 'undefined' && window.Vue) {
  Vue = window.Vue
 }
 Vue.component('VueMusicComponent', musicComponent)
 }
}
 
export default VueMusicComponent