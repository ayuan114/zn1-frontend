<template>
  <div id="userRegisterPage">
    <div class="header-menu">
      <RouterLink to="/" class="title-bar">
        <div class="title-container">
          <div class="title">JI'S BLOG</div>
          <div class="subtitle">热衷于编程，做饭，收集，游戏，动漫</div>
        </div>
      </RouterLink>
      <div class="menu-container">
        <a-menu v-model:selectedKeys="current" mode="horizontal" :items="items" @click="doMenuClick" />
      </div>
    </div>
    <div class="desc">个人博客网</div>
    <a-form :model="formState" name="basic" label-align="left" autocomplete="off" @finish="handleSubmit"
      class="message-form">
      <a-form-item name="userAccount" :rules="[{ required: true, message: '请输入账号' }]">
        <a-input v-model:value="formState.userAccount" placeholder="请输入账号" />
      </a-form-item>
      <a-form-item name="userPassword" :rules="[
        { required: true, message: '请输入密码' },
        { min: 4, message: '密码不能小于 4 位' },
      ]">
        <a-input-password v-model:value="formState.userPassword" placeholder="请输入密码" />
      </a-form-item>
      <a-form-item name="checkPassword" :rules="[
        { required: true, message: '请输入确认密码' },
        { min: 4, message: '确认密码不能小于 4 位' },
      ]">
        <a-input-password v-model:value="formState.checkPassword" placeholder="请输入确认密码" />
      </a-form-item>
      <div class="tips">
        已有账号？
        <RouterLink to="/login/user">去登录</RouterLink>
      </div>
      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%">注册</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { createBlogArticleUsingPost, queryArticleIdByDetailUsingPost, queryBlogArticleTitleUsingPost, queryCategoryDataUsingPost, queryTagDataUsingPost, uploadUsingPost } from '@/api/blogArticleController'
import { message } from 'ant-design-vue'
import { log } from 'console'
import { nextTick, onMounted, reactive, ref, h, onUnmounted, computed } from 'vue'

// 引入富文本编辑器与样式
import { Quill, QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

// 引入缩放图片的插件
import BlotFormatter from 'quill-blot-formatter'
Quill.register('modules/blotFormatter', BlotFormatter)

import { MailOutlined, AppstoreOutlined, SettingOutlined } from '@ant-design/icons-vue'
import { MenuProps } from 'ant-design-vue'

const items1 = ref<MenuProps['items']>([
  {
    key: '/',
    label: h(RouterLink, { to: '/' }, () => '首页'),
    title: '首页',
  },
  {
    key: '/admin/blog/manage',
    label: h(RouterLink, { to: '/admin/blog/manage' }, () => '管理'),
    title: '管理',
  },
  {
    key: '/user/blog/edit',
    label: h(RouterLink, { to: '/user/blog/edit' }, () => '编辑'),
    title: '博客',
  },
  {
    key: '/blog/message/',
    label: h(RouterLink, { to: '/blog/message/' }, () => '留言'),
    title: '留言',
  },
  {
    key: '/blog/about/',
    label: h(RouterLink, { to: '/blog/about/' }, () => '关于'),
    title: '关于',
  },
])

// 菜单列表
const originItems = [
  {
    key: '/',
    label: h(RouterLink, { to: '/' }, () => '首页'),
    title: '首页',
  },
  {
    key: '/admin/blog/manage',
    label: h(RouterLink, { to: '/admin/blog/manage' }, () => '管理'),
    title: '管理',
  },
  {
    key: '/user/blog/edit',
    label: h(RouterLink, { to: '/user/blog/edit' }, () => '编辑'),
    title: '博客',
  },
  {
    key: '/blog/message/',
    label: h(RouterLink, { to: '/blog/message/' }, () => '留言'),
    title: '留言',
  },
  {
    key: '/blog/about/',
    label: h(RouterLink, { to: '/blog/about/' }, () => '关于'),
    title: '关于',
  },
]
import { useLoginUserStore } from '@/stores/useLonginUserStore'

const loginUserStore = useLoginUserStore()
// 过滤菜单项
const filterMenus = (menus = [] as MenuProps['items']) => {
  return menus?.filter((menu) => {
    if (menu.key.startsWith('/admin')) {
      const loginUser = loginUserStore.loginUser
      if (!loginUser || loginUser.userRole !== "admin") {
        return false
      }
    } else if (menu.key.startsWith('/user')) {
      const loginUser = loginUserStore.loginUser
      if (loginUser && loginUser.userName === "未登录") {
        return false
      }
    }
    return true
  })
}

// 展示在菜单的路由数组
const items = computed<MenuProps['items']>(() => filterMenus(originItems))

import { useRoute, RouterLink, useRouter } from 'vue-router'
import { userLoginUsingPost, userRegisterUsingPost } from '@/api/userController'
const route = useRoute()
const articleId = route.query.id


//路由跳转事件
const doMenuClick = ({ key }: { key: string }) => {
  router.push({
    path: key,
  })
}

//当前选中菜单
const current = ref<string[]>(['/'])

const formState = reactive<API.UserRegisterRequest>({
  userAccount: '',
  userPassword: '',
})

const router = useRouter()


/**
 * 提交表单
 * @param values
 */
const handleSubmit = async (values: any) => {
  // 判断两次输入的密码是否一致
  if (formState.userPassword !== formState.checkPassword) {
    message.error('二次输入的密码不一致')
    return
  }
  const res = await userRegisterUsingPost(values)
  // 注册成功，跳转到登录页面
  if (res.data.code === 0 && res.data.data) {
    message.success('注册成功')
    router.push({
      path: '/user/login',
      replace: true,
    })
  } else {
    message.error('注册失败，' + res.data.message)
  }
}

</script>


<style scoped>
#userRegisterPage {
  width: 900px;
  margin: 20px auto;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  min-height: calc(100vh - 40px);
  /* 设置最小高度为视口高度减去上下边距 */
}

.content {
  min-height: calc(100vh - 200px);
  /* 内容区域的最小高度，减去头部高度和边距 */
  display: flex;
  flex-direction: column;
}

.article-detail {
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  flex: 1;
  /* 让内容区域占据剩余空间 */
}

.header-menu {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 900px;
  margin: 0 auto;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  position: sticky;
  top: 0;
  background: #fff;
  z-index: 100;
}

.title-bar {
  display: flex;
  align-items: center;
  text-decoration: none;
  transition: transform 0.3s ease;
}

.title-bar:hover {
  transform: scale(1.05);
}

.title-container {
  display: flex;
  flex-direction: column;
}

.title {
  font-size: 28px;
  font-weight: bold;
  background: linear-gradient(45deg, #1890ff, #36cfc9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 4px;
  letter-spacing: 2px;
}

.subtitle {
  font-size: 14px;
  color: #666;
  letter-spacing: 1px;
  opacity: 0.8;
}

.menu-container {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

:deep(.ant-menu-horizontal) {
  border-bottom: none;
  background: transparent;
  justify-content: flex-end;
}

:deep(.ant-menu-item) {
  font-size: 16px;
  font-weight: 500;
  margin: 0 10px;
}


@media (max-width: 768px) {
  .title {
    font-size: 24px;
  }

  .subtitle {
    font-size: 12px;
  }

  :deep(.ant-menu-item) {
    margin: 0 8px;
  }
}


.desc {
  margin-top: 50px;
  text-align: center;
  color: #bbb;
  margin-bottom: 16px;
}

.tips {
  margin-bottom: 16px;
  color: #bbb;
  font-size: 13px;
  text-align: right;
}

.message-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
}

.message-form :deep(.ant-form-item) {
  margin-bottom: 24px;
}

.message-form :deep(.ant-input),
.message-form :deep(.ant-input:hover),
.message-form :deep(.ant-input:focus) {
  border-color: #e6f7ff;
}

.message-form :deep(.ant-input-textarea) {
  height: 500px !important;
  min-height: 500px !important;
  font-size: 16px;
  padding: 100px;
  resize: vertical;
  background-color: #e6f7ff;
  border-color: #e6f7ff;
}

.message-form :deep(.ant-input-textarea .ant-input) {
  height: 600px !important;
  min-height: 500px !important;
  background-color: #e6f7ff;
  border-color: #e6f7ff;
}


.message-form :deep(.ant-btn) {
  height: 40px;
  border-radius: 6px;
  font-weight: 500;
}

.message-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
}

.message-form :deep(.ant-form-item) {
  margin-bottom: 24px;
}

.message-form :deep(.ant-input),
.message-form :deep(.ant-input:hover),
.message-form :deep(.ant-input:focus) {
  border-color: #e6f7ff;
}

.message-form :deep(.ant-input-textarea) {
  height: 500px !important;
  min-height: 500px !important;
  font-size: 16px;
  padding: 100px;
  resize: vertical;
  background-color: #e6f7ff;
  border-color: #e6f7ff;
}

.message-form :deep(.ant-input-textarea .ant-input) {
  height: 600px !important;
  min-height: 500px !important;
  background-color: #e6f7ff;
  border-color: #e6f7ff;
}


.message-form :deep(.ant-btn) {
  height: 40px;
  border-radius: 6px;
  font-weight: 500;
}
</style>
