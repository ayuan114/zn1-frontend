<template>
  <div id="globalHeader">
    <div class="heater">
      <div style="margin-right: 250px;">
        <RouterLink to="/">
          <div class="title-bar">
            <img class="logo" src="../assets/favicon.ico" alt="logo" />
            <div class="title">ZN1</div>
          </div>
        </RouterLink>
      </div>
      <div class="items">
        <a-menu
          v-model:selectedKeys="current"
          mode="horizontal"
          :items="items"
          @click="doMenuClick"
        />
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
#globalHeader .heater{
  display: flex;
  justify-content: center;
  margin: 0 auto;
}

#globalHeader {
  margin: 0 auto;
}
.title-bar {
  display: flex;
  align-items: center;
}

.title {
  color: black;
  font-size: 18px;
  margin-left: 16px;
}

.logo {
  height: 48px;
}
</style>
