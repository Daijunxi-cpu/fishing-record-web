import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/Home.vue'),
      meta: { title: '首页' }
    },
    {
      path: '/record',
      name: 'record',
      component: () => import('../views/Record.vue'),
      meta: { title: '记录' }
    },
    {
      path: '/add',
      name: 'add',
      component: () => import('../views/Add.vue'),
      meta: { title: '添加' }
    },
    {
      path: '/statistics',
      name: 'statistics',
      component: () => import('../views/Statistics.vue'),
      meta: { title: '统计' }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/Profile.vue'),
      meta: { title: '我的' }
    }
  ]
})

router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title} - 钓鱼记录`
  next()
})

export default router 