<template>
  <div id="globalHeader">
    <div class="header">
  <div class="header-content">
    <RouterLink to="/" class="title-bar">
      <img class="logo" src="../assets/favicon.ico" alt="logo" />
      <div class="title">ZN1</div>
    </RouterLink>
    <div class="menu-container">
      <a-menu
        v-model:selectedKeys="current"
        mode="horizontal"
        :items="items"
        @click="doMenuClick"
      />
    </div>
    <div class="user-info">
      <!-- 可以在这里添加用户信息显示 -->
    </div>
  </div>
</div>


    <a-row :wrap="false">
      <a-col flex="200px"> </a-col>
      <a-col flex="auto"> </a-col>
    </a-row>
  </div>
</template>
<script lang="ts" setup>
import { h, ref } from 'vue'
import { MailOutlined, AppstoreOutlined, SettingOutlined } from '@ant-design/icons-vue'
import { MenuProps } from 'ant-design-vue'

const items = ref<MenuProps['items']>([
  {
    key: '/',
    icon: () => h(MailOutlined),
    label: '主页',
    title: '主页',
  },
  {
    key: '/blog/edit',
    icon: () => h(AppstoreOutlined),
    label: '编辑',
    title: '博客',
  },
])

import { useRouter } from 'vue-router'
const router = useRouter()

//路由跳转事件
const doMenuClick = ({ key }: { key: string }) => {
  router.push({
    path: key,
  })
}

//当前选中菜单
const current = ref<string[]>([])
//监听路由变化，更新当前选中的菜单
router.afterEach((to, from, next) => {
  current.value = [to.path]
})

import { useLoginUserStore } from '@/stores/useLonginUserStore'

const loginUserStore = useLoginUserStore()
loginUserStore.fetchLoginUser()
</script>

<style scoped>
#globalHeader {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.header {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.title-bar {
  display: flex;
  align-items: center;
  text-decoration: none;
}

.title {
  color: #1890ff;
  font-size: 20px;
  font-weight: 600;
  margin-left: 12px;
}

.logo {
  height: 32px;
}

.menu-container {
  flex: 1;
  margin: 0 24px;
  border-bottom: none;
}

.user-info {
  display: flex;
  align-items: center;
}

@media (max-width: 768px) {
  .header-content {
    padding: 0 16px;
  }

  .menu-container {
    margin: 0 16px;
  }

  .title {
    font-size: 18px;
  }
}


</style>
