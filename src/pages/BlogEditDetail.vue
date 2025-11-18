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
          <a-menu v-model:selectedKeys="current" mode="horizontal" :items="items" @click="doMenuClick" />
        </div>
      </div>
<!-- 修改目录列表的渲染 -->
<!-- 修改目录列表的渲染，移除缩进 -->
<div class="catalog" v-if="catalogList.length">
  <h3>目录</h3>
  <ul>
    <li v-for="(item, index) in catalogList"
        :key="index"
        :data-level="item.level">
      <a :href="`#${item.id}`" @click.prevent="scrollToHeading(item.id)">{{ item.text }}</a>
    </li>
  </ul>
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
            <!-- 在文章内容div上添加点击事件监听 -->
            <div class="article-content" v-html="articles.content" @click="handleImageClick"></div>
          </div>

          <!-- 修改图片预览模态框 -->
          <a-modal v-model:open="previewVisible" :footer="null" :width="800">
            <div class="image-preview">
              <a-button class="preview-btn prev" @click="handlePrev" v-if="imageList.length > 1">
                <LeftOutlined />
              </a-button>
              <img :src="previewImage" style="width: 100%" />
              <a-button class="preview-btn next" @click="handleNext" v-if="imageList.length > 1">
                <RightOutlined />
              </a-button>
            </div>
          </a-modal>


        </a-spin>
      </div>


    </div>
  </div>

</template>

<script setup lang="ts">
import { createBlogArticleUsingPost, queryArticleIdByDetailUsingPost, queryBlogArticleTitleUsingPost, queryCategoryDataUsingPost, queryTagDataUsingPost, uploadUsingPost } from '@/api/blogArticleController'
import { message } from 'ant-design-vue'
import { log } from 'console'
import { nextTick, onMounted, reactive, ref, h, onUnmounted } from 'vue'

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
const current = ref<string[]>(['/'])


const articles = ref<API.BlogArticle>()
const loading = ref(false)


const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  onChange: (page: number) => {
    pagination.current = page
    fetchArticles()
  }
})

// 在script setup中添加目录相关的变量和方法
const catalogList = ref<Array<{id: string, text: string, level: number}>>([])

// 修改getCatalog方法，确保标题ID正确设置
const getCatalog = () => {
  if (!articles.value?.content) return
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = articles.value.content
  const headings = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6')

  catalogList.value = Array.from(headings).map((heading, index) => {
    const id = `heading-${index}`
    heading.id = id
    return {
      id,
      text: heading.textContent || '',
      level: parseInt(heading.tagName.charAt(1))
    }
  })

  // 更新实际文章内容中的标题ID
  nextTick(() => {
    const articleHeadings = document.querySelector('.article-content')?.querySelectorAll('h1, h2, h3, h4, h5, h6')
    articleHeadings?.forEach((heading, index) => {
      heading.id = `heading-${index}`
    })
  })
}

// 修改点击目录项的方法
const scrollToHeading = (id: string) => {
  const element = document.getElementById(id)
  if (element) {
    const headerOffset = 100 // 顶部偏移量
    const elementPosition = element.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    })
  }
}

// 修改fetchArticles函数，在获取文章内容后调用getCatalog
const fetchArticles = async () => {
  if (!articleId) return
  loading.value = true
  try {
    const res = await queryArticleIdByDetailUsingPost({
      id: Number(articleId),
    })
    if (res.data.code === 0 && res.data.data) {
      articles.value = res.data.data
      nextTick(() => {
        getCatalog()
      })
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

// 在 script setup 中添加图片预览相关的变量和方法
const previewVisible = ref(false)
const previewImage = ref('')
const currentImageIndex = ref(0)
const imageList = ref<string[]>([])

// 添加图片点击处理方法
const handleImageClick = (e: Event) => {
  const target = e.target as HTMLImageElement
  if (target.tagName === 'IMG') {
    imageList.value = getImageList()
    currentImageIndex.value = imageList.value.indexOf(target.src)
    previewImage.value = target.src
    previewVisible.value = true
  }
}

// 获取文章中的所有图片
const getImageList = () => {
  if (!articles.value?.content) return []
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = articles.value.content
  const images = tempDiv.getElementsByTagName('img')
  return Array.from(images).map(img => img.src)
}

// 切换到上一张图片
const handlePrev = () => {
  currentImageIndex.value = (currentImageIndex.value - 1 + imageList.value.length) % imageList.value.length
  previewImage.value = imageList.value[currentImageIndex.value]
}

// 切换到下一张图片
const handleNext = () => {
  currentImageIndex.value = (currentImageIndex.value + 1) % imageList.value.length
  previewImage.value = imageList.value[currentImageIndex.value]
}


// 添加目录滚动监听
const handleScroll = () => {
  const catalog = document.querySelector('.catalog')
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')

  // 获取当前滚动位置
  const scrollPosition = window.scrollY + 150

  // 找到当前可见的标题
  let currentHeading = null
  headings.forEach((heading, index) => {
    const rect = heading.getBoundingClientRect()
    const elementTop = rect.top + window.scrollY

    if (elementTop <= scrollPosition) {
      currentHeading = heading
    }
  })

  // 更新目录项的激活状态
  if (currentHeading) {
    const links = catalog.querySelectorAll('a')
    links.forEach(link => link.classList.remove('active'))

    const currentIndex = Array.from(headings).indexOf(currentHeading)
    const activeLink = catalog.querySelector(`a[href="#heading-${currentIndex}"]`)
    if (activeLink) {
      activeLink.classList.add('active')
      // 确保激活的目录项在视口内
      const linkRect = activeLink.getBoundingClientRect()
      const catalogRect = catalog.getBoundingClientRect()

      if (linkRect.bottom > catalogRect.bottom) {
        activeLink.scrollIntoView({ behavior: 'smooth', block: 'end' })
      } else if (linkRect.top < catalogRect.top) {
        activeLink.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }
}

// 修改onMounted钩子
onMounted(() => {
  fetchArticles()
  getCategoryOptions()
  getTagOptions()
  window.addEventListener('scroll', handleScroll)
})

// 在组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})


</script>

<style scoped>
#BlogEditDetil {
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
  text-align: center;
  /* 添加这行实现标题居中 */
}

.article-content {
  color: #333;
  line-height: 1.8;
  margin-top: 16px;
}

.article-content :deep(img) {
  max-width: 48%;
  height: auto;
  border-radius: 4px;
  margin: 8px;
  display: inline-block;
  cursor: pointer;
  transition: transform 0.3s ease;
  vertical-align: top;
}

.article-content :deep(img):hover {
  transform: scale(1.02);
}

.image-preview {
  position: relative;
  width: 100%;
}

.preview-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.preview-btn:hover {
  background: rgba(0, 0, 0, 0.7);
  opacity: 1;
  transform: translateY(-50%) scale(1.1);
}

.preview-btn.prev {
  left: 20px;
}

.preview-btn.next {
  right: 20px;
}

.preview-btn :deep(.anticon) {
  font-size: 20px;
}


/* 修改目录样式 */
.catalog {
  position: fixed;
  right: 20px;
  top: 100px;
  width: 200px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 99;
  max-height: calc(100vh - 140px);
  overflow-y: auto;
  border: 1px solid #f0f0f0;
  backdrop-filter: blur(8px);
}

.catalog h3 {
  margin-bottom: 12px;
  font-size: 16px;
  color: #333;
  font-weight: 600;
  padding-bottom: 8px;
  border-bottom: 2px solid #1890ff;
  text-align: left;
}

.catalog ul {
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
}

.catalog li {
  margin-bottom: 6px;
  text-align: left;
}

.catalog a {
  color: #000;
  text-decoration: none;
  font-size: 13px;
  line-height: 1.6;
  display: block;
  padding: 6px 10px;
  border-radius: 4px;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
  text-align: left;
}

/* 不同级别标题的字体粗细 */
.catalog li[data-level="1"] a {
  font-weight: 700;
}

.catalog li[data-level="2"] a {
  font-weight: 600;
}

.catalog li[data-level="3"] a {
  font-weight: 500;
}

.catalog li[data-level="4"] a {
  font-weight: 400;
}

.catalog li[data-level="5"] a {
  font-weight: 400;
}

.catalog li[data-level="6"] a {
  font-weight: 400;
}

.catalog a:hover {
  background: rgba(0, 0, 0, 0.05);
  transform: translateX(-4px);
}

.catalog a.active {
  background: rgba(24, 144, 255, 0.15);
}

.catalog a.active::before {
  content: '';
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: #1890ff;
  border-radius: 2px 0 0 2px;
}

/* 保持滚动条样式不变 */
.catalog::-webkit-scrollbar {
  width: 6px;
}

.catalog::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.catalog::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

.catalog::-webkit-scrollbar-track {
  background: transparent;
}




</style>
