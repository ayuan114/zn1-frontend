<template>
<div id="BlogEditDetil">
  <div>
    <div class="header-menu">
  <RouterLink to="/" class="title-bar">
    <div class="title-container">
      <div class="title">JI'S BLOG</div>
      <div class="subtitle">热衷于编程，做饭，收集，游戏，动漫</div>
    </div>
  </RouterLink>
  <div class="menu-container">
    <a-menu
      v-model:selectedKeys="current"
      mode="horizontal"
      :items="items"
      @click="doMenuClick"
    />
  </div>
    </div>
<div class="content">
  <a-spin :spinning="loading">
    <div v-if="articles" class="article-detail">
      <h1 class="article-title">{{ articles.title }}</h1>
<div class="article-meta">
  <span v-if="articles.categoryId">分类：{{ getCategoryName(articles.categoryId) }}</span>
  <span v-if="articles.tags">标签：{{ getTagNames(articles.tags) }}</span>
  <span class="create-time">{{ formatDate(articles.createTime) }}</span>
</div>

      <div class="article-content" v-html="articles.content"></div>
    </div>
  </a-spin>
</div>


  </div>
</div>

</template>

<script setup lang="ts">
import { createBlogArticleUsingPost, queryArticleIdByDetailUsingPost, queryBlogArticleTitleUsingPost, queryCategoryDataUsingPost, queryTagDataUsingPost, uploadUsingPost } from '@/api/blogArticleController'
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



const articles = ref<API.BlogArticle>()
const loading = ref(false)
articles.value?.id



const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  onChange: (page: number) => {
    pagination.current = page
    fetchArticles()
  }
})

// 修改 fetchArticles 函数
const fetchArticles = async () => {
  if (!articleId) return
  loading.value = true
  try {
    const res = await queryArticleIdByDetailUsingPost({
      id: Number(articleId),
    })
    if (res.data.code === 0 && res.data.data) {
      articles.value = res.data.data
    }
  } catch (error) {
    message.error('获取文章详情失败')
  } finally {
    loading.value = false
  }
}


const categoryOptions = ref<API.Category[]>([])
const tagOptions = ref<API.Tag[]>([])

// 获取分类名称
const getCategoryName = (categoryId: number) => {
  const category = categoryOptions.value.find(c => c.value === Number(categoryId))
  return category ? category.label : ''
}

// 获取标签名称
const getTagNames = (tags: string | string[]) => {
  const tagIds = Array.isArray(tags) ? tags : tags.split(',')
  return tagIds.map(id => {
    const tag = tagOptions.value.find(t => t.value === Number(id))
    return tag ? tag.label : ''
  }).join(', ')
}


const getTagOptions = async () => {
  const res = await queryTagDataUsingPost()
  if (res.data.code === 0 && res.data.data) {
    tagOptions.value = (res.data.data ?? []).map((data: API.Tag) => {
      return {
        value: data.id,
        label: data.name,
      }
    })
  } else {
    message.error('获取标签分类列表失败，' + res.data.message)
  }
}

const getCategoryOptions = async () => {
  const res = await queryCategoryDataUsingPost()
  if (res.data.code === 0 && res.data.data) {
    categoryOptions.value = (res.data.data ?? []).map((data: API.Category) => {
      return {
        value: data.id,  // 使用分类ID作为value
        label: data.name, // 使用分类名称作为显示文本
      }
    })
        // 如果有已选中的分类，设置显示值

  } else {
    message.error('获取分类列表失败，' + res.data.message)
  }
}

// 格式化日期
const formatDate = (date: string) => {
  if (!date) return ''
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  //const hours = String(d.getHours()).padStart(2, '0')
  //const minutes = String(d.getMinutes()).padStart(2, '0')
  //return `${year}-${month}-${day} ${hours}:${minutes}`
  return `${year}-${month}-${day}`
}



onMounted(() => {
  fetchArticles();
  getCategoryOptions();
  getTagOptions();
})

</script>

<style scoped>
#BlogEditDetil {
  width: 900px;
  margin: 20px auto;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
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

.article-meta {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 16px;
  color: #666;
  font-size: 14px;
  margin-bottom: 16px;
}

.create-time {
  margin-left: auto;
}


.article-detail {
  padding: 24px;
  background: #fff;
  border-radius: 8px;
}

.article-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
  text-align: center;  /* 添加这行实现标题居中 */
}

.article-content {
  color: #333;
  line-height: 1.8;
  margin-top: 16px;
}

.article-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 16px auto;  /* 修改这里，使用 auto 实现水平居中 */
  display: block;     /* 添加这行，使 margin auto 生效 */
}


</style>
