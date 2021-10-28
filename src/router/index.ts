import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'

export const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  },
  {
    path: '/parallax',
    name: 'parallax',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "parallel" */ '../views/Parallax.vue'),
    meta: {
      title: "Parallax Scroll"
    }
  },
  {
    path: '/split-pane',
    name: 'split-pane',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "parallel" */ '../views/SplitPane.vue'),
    meta: {
      title: "Split Pane"
    }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
