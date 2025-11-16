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

      <div class="about-container">
        <div class="profile-section">
          <div class="profile-info">
            <h2>JI | 95后Java开发者</h2>
            <div class="job-title">互联网医疗公司Java工程师</div>
            <div class="experience">5年线上医疗业务开发经验</div>
          </div>
        </div>

        <div class="tech-stack">
          <h3>技术栈</h3>
          <div class="tech-items">
            <span class="tech-item">Java后端</span>
            <span class="tech-item">前端</span>
            <span class="tech-item">AI探索</span>
          </div>
        </div>

        <div class="interests">
          <h3>兴趣点</h3>
          <ul>
            <li>电子产品</li>
            <li>新技术</li>
            <li>涂鸦</li>
            <li>生活折腾</li>
          </ul>
        </div>

        <div class="gallery">
          <h3>个人图库</h3>
          <a href="http://beer.jizy.top" target="_blank" class="gallery-link" >来杯尼格罗尼</a>
        </div>

      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { createBlogMessageUsingPost, queryArticleIdByDetailUsingPost, queryBlogArticleTitleUsingPost } from '@/api/blogArticleController'
import { message } from 'ant-design-vue'
import { log } from 'console'
import { nextTick, onMounted, reactive, ref, h } from 'vue'

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
  {
    key: '/blog/edit',
    label: h(RouterLink, { to: '/blog/edit' }, () => '编辑'),
    title: '博客',
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
const current = ref<string[]>(['/'])

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

.about-container {
  max-width: 800px;
  margin: 40px auto;
  padding: 0 20px;
}

.profile-section {
  text-align: center;
  margin-bottom: 40px;
  padding: 30px;
  background: linear-gradient(135deg, #f8f9fa 0%, #f0f2f5 100%);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.profile-info h2 {
  font-size: 24px;
  color: #333;
  margin-bottom: 12px;
  font-weight: 600;
}

.job-title {
  font-size: 18px;
  color: #666;
  margin-bottom: 8px;
}

.experience {
  font-size: 16px;
  color: #999;
}

.tech-stack,
.interests,
.gallery {
  margin-bottom: 30px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

.tech-stack h3,
.interests h3,
.gallery h3 {
  font-size: 18px;
  color: #333;
  margin-bottom: 15px;
  font-weight: 500;
  position: relative;
  padding-left: 12px;
}

.tech-stack h3::before,
.interests h3::before,
.gallery h3::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 16px;
  background: #1890ff;
  border-radius: 2px;
}

.tech-items {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.tech-item {
  padding: 6px 12px;
  background: #e6f7ff;
  color: #1890ff;
  border-radius: 4px;
  font-size: 14px;
}

.interests ul {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.interests li {
  color: #666;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  transition: all 0.3s;
}

.interests li:hover {
  background: #e6f7ff;
  color: #1890ff;
  transform: translateX(4px);
}

.gallery-link {
  color: #1890ff;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
}

.gallery-link:hover {
  color: #40a9ff;
  transform: translateX(4px);
}

.gallery-link::after {
  content: "→";
  margin-left: 4px;
  transition: transform 0.3s;
}

.gallery-link:hover::after {
  transform: translateX(4px);
}

@media (max-width: 768px) {
  .about-container {
    padding: 0 16px;
  }

  .interests ul {
    grid-template-columns: 1fr;
  }
}
</style>
