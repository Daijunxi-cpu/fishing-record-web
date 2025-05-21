<template>
  <div>
    <router-link to="/">首页</router-link> |
    <router-link to="/add">添加记录</router-link> |
    <router-link to="/records">查看记录</router-link> |
    <router-link to="/statistics">统计</router-link> |
    <router-link to="/profile">个人中心</router-link>
  </div>
  <router-view />
</template>

<script setup lang="ts">
// 这里可以写你的全局逻辑
</script>

<style>
/* 全局样式 */
</style>