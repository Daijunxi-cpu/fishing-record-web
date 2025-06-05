import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: '钓鱼记录 - 首页'
    }
  },
  {
    path: '/add',
    name: 'Add',
    component: () => import('../views/Add.vue'),
    meta: {
      title: '添加钓鱼记录'
    }
  },
  {
    path: '/record/:id',
    name: 'RecordDetail',
    component: () => import('../views/RecordDetail.vue'),
    meta: {
      title: '钓鱼记录详情'
    }
  },
  {
    path: '/edit/:id',
    name: 'EditRecord',
    component: () => import('../views/Add.vue'),
    props: route => ({ isEdit: true, recordId: Number(route.params.id) }),
    meta: {
      title: '编辑钓鱼记录'
    }
  },
  {
    path: '/statistics',
    name: 'Statistics',
    component: () => import('../views/Statistics.vue'),
    meta: {
      title: '钓鱼统计'
    }
  },
  {
    path: '/diary',
    name: 'Diary',
    component: () => import('../views/Diary.vue'),
    meta: {
      title: '钓鱼日记'
    }
  },
  {
    path: '/diary/add',
    name: 'AddDiary',
    component: () => import('../views/AddDiary.vue'),
    meta: {
      title: '写钓鱼日记'
    }
  },
  {
    path: '/diary/:id',
    name: 'DiaryDetail',
    component: () => import('../views/DiaryDetail.vue'),
    meta: {
      title: '日记详情'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 设置页面标题
router.beforeEach((to, from, next) => {
  document.title = to.meta.title as string || '钓鱼记录应用'
  next()
})

export default router