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
    path: '/split-pane-template',
    name: 'split-pane-template',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "parallel" */ '../views/SplitPaneTemplate.vue'),
    meta: {
      title: "Split Pane with template"
    }
  },
  {
    path: '/split-pane-props',
    name: 'split-pane-props',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "parallel" */ '../views/SplitPaneProps.vue'),
    meta: {
      title: "Split Pane with props"
    }
  },
  {
    path: '/modifiable-props',
    name: 'modifiable-props',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "parallel" */ '../views/ModifiableProps.vue'),
    meta: {
      title: "Modifiable props"
    }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
