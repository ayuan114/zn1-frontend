<template>
  <div id="BlogMessage">
    <div>
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
      <div class="content">
        <div class="message-welcome">
          <h2>欢迎给我留言</h2>
          <p>你的留言不会被公开</p>
        </div>

        <a-spin :spinning="loading">
          <a-form :model="messageForm" layout="vertical" @finish="handleSubmit" class="message-form">
            <a-form-item label="称呼" name="name" :rules="[{ required: true, message: '请输入您的称呼' }]">
              <a-input v-model:value="messageForm.name" placeholder="请输入您的称呼" />
            </a-form-item>

            <a-form-item label="邮箱" name="email" :rules="[
              { required: true, message: '请输入您的邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]">
              <a-input v-model:value="messageForm.email" placeholder="请输入您的邮箱" />
            </a-form-item>

            <a-form-item label="留言" name="content" :rules="[{ required: true, message: '请输入留言内容' }]">
              <a-textarea v-model:value="messageForm.content" placeholder="请输入您的留言" :rows="4" />
            </a-form-item>

            <a-form-item>
              <a-button type="primary" html-type="submit" block>
                提交留言
              </a-button>
            </a-form-item>
          </a-form>
        </a-spin>
      </div>


    </div>
  </div>

</template>

<script setup lang="ts">
import { createBlogMessageUsingPost, queryArticleIdByDetailUsingPost, queryBlogArticleTitleUsingPost } from '@/api/blogArticleController'
import { message } from 'ant-design-vue'
import { log } from 'console'
import { nextTick, onMounted, reactive, ref, h, watch } from 'vue'

// 引入富文本编辑器与样式
import { Quill, QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

// 引入缩放图片的插件
import BlotFormatter from 'quill-blot-formatter'
Quill.register('modules/blotFormatter', BlotFormatter)

import { MailOutlined, AppstoreOutlined, SettingOutlined } from '@ant-design/icons-vue'
import { MenuProps } from 'ant-design-vue'

const items = ref<MenuProps['items']>([
  {
    key: '/',
    label: h(RouterLink, { to: '/' }, () => '首页'),
    title: '首页',
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

import { useRoute, RouterLink } from 'vue-router'
const route = useRoute()
const articleId = route.query.id


//路由跳转事件
const doMenuClick = ({ key }: { key: string }) => {
  router.push({
    path: key,
  })
}

//当前选中菜单
// 当前选中菜单
const current = ref<string[]>([route.path])

// 监听路由变化，更新菜单选中状态
watch(() => route.path, (newPath) => {
  current.value = [newPath]
})


const loading = ref(false)


// 留言表单数据
const messageForm = reactive({
  name: '',
  email: '',
  content: ''
})

// 提交留言
const handleSubmit = async (values: any) => {
  loading.value = true
  try {
    const res = await createBlogMessageUsingPost({
      name: values.name,
      email: values.email,
      content: values.content
    })

    if (res.data.code === 0) {
      message.success('留言提交成功')
      // 重置表单
      messageForm.name = ''
      messageForm.email = ''
      messageForm.content = ''
    } else {
      message.error('留言提交失败：' + res.data.message)
    }
  } catch (error) {
    message.error('留言提交失败，请重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
#BlogMessage {
  width: 900px;
  margin: 20px auto;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  min-height: calc(100vh - 40px);
}

.content {
  min-height: calc(100vh - 200px);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
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
  margin: 0 16px;
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

.message-welcome {
  text-align: center;
  margin-bottom: 32px;
  padding: 24px;
  background: #f8f9fa;
  border-radius: 8px;
}

.message-welcome h2 {
  color: #333;
  margin-bottom: 8px;
}

.message-welcome p {
  color: #666;
  font-size: 14px;
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
