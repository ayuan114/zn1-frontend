<template>
  <div id="AdminHomePage">
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

        <div class="article-list">
          <a-spin :spinning="loading">
            <a-list item-layout="vertical" size="large" :data-source="articles">
              <template #renderItem="{ item }">
                <a-list-item key="item.id" class="article-item" @click="(e) => {
                  if (!e.target.closest('.article-actions')) {
                    router.push(`/blog/detail?id=${item.id}`)
                  }
                }">

                  <a-list-item-meta>
                    <template #title>
                      <RouterLink :to="`/blog/detail?id=${item.id}`" @click.stop>
                        {{ item.title }}
                      </RouterLink>
                    </template>
                    <template #description>
                      <span class="article-meta">
                        <span v-if="item.categoryId">分类：{{ getCategoryName(item.categoryId) }}</span>
                        <span v-if="item.tags">标签：{{ getTagNames(item.tags) }}</span>
                        <span> {{ formatDate(item.createTime) }}</span>
                      </span>
                    </template>

                  </a-list-item-meta>
                  <div class="article-content" v-html="item.content"></div>
                  <div class="article-actions" @click.stop>
                    <a-button type="primary" class="edit-btn" @click.stop="handleEdit(item.id)">
                      <template #icon>
                        <EditOutlined />
                      </template>
                      编辑
                    </a-button>
                    <a-button type="primary" danger class="delete-btn" @click.stop="showDeleteConfirm(item.id)">
                      <template #icon>
                        <DeleteOutlined />
                      </template>
                      删除
                    </a-button>
                  </div>

                </a-list-item>

              </template>

            </a-list>
            <div class="pagination-container">
              <a-pagination v-model:current="pagination.current" :total="pagination.total"
                :pageSize="pagination.pageSize" @change="pagination.onChange" showQuickJumper
                :show-total="(total, range) => `共 ${total} 条`" />
            </div>
          </a-spin>
        </div>
      </div>

    </div>
  </div>

</template>

<script setup lang="ts">
import { createBlogArticleUsingPost, deleteArticleByIdUsingPost, queryBlogArticleTitleUsingPost, queryCategoryDataUsingPost, queryTagDataUsingPost, uploadUsingPost } from '@/api/blogArticleController'
import { message, Modal } from 'ant-design-vue'
import { log } from 'console'
import { nextTick, onMounted, reactive, ref, h, watch } from 'vue'

// 引入富文本编辑器与样式
import { Quill, QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

// 引入缩放图片的插件
import BlotFormatter from 'quill-blot-formatter'
Quill.register('modules/blotFormatter', BlotFormatter)

import { MenuProps } from 'ant-design-vue'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons-vue'


const items = ref<MenuProps['items']>([
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
    key: '/admin/blog/edit',
    label: h(RouterLink, { to: '/admin/blog/edit' }, () => '编辑'),
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

import { RouterLink, useRoute, useRouter } from 'vue-router'
const router = useRouter()
const route = useRoute()


//路由跳转事件
const doMenuClick = ({ key }: { key: string }) => {
  router.push({
    path: key,
  })
}

// 当前选中菜单
const current = ref<string[]>([route.path])

// 监听路由变化，更新菜单选中状态
watch(() => route.path, (newPath) => {
  current.value = [newPath]
})



const articles = ref<API.BlogArticle[]>([])
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

// 修改 fetchArticles 函数
const fetchArticles = async () => {
  loading.value = true
  try {
    const res = await queryBlogArticleTitleUsingPost({
      current: pagination.current,
      pageSize: pagination.pageSize,
    })
    if (res.data.code === 0 && res.data.data) {
      articles.value = res.data.data.records || []
      pagination.total = res.data.data.total || 0
      console.log('', res.data.data.records)
      console.log('11111', articles.value)
    } else {
      message.error('获取文章列表失败，' + res.data.message)
    }
  } catch (error) {
    message.error('获取文章列表失败，请重试')
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

// 编辑文章
const handleEdit = (id: number) => {
  router.push({
    path: '/blog/edit',
    query: { id }
  })
}

// 删除文章
const handleDelete = async (id: number) => {
  try {
    const res = await deleteArticleByIdUsingPost({ id })
    if (res.data.code === 0) {
      message.success('删除成功')
      fetchArticles() // 重新获取文章列表
    } else {
      message.error('删除失败，' + res.data.message)
    }
  } catch (error) {
    message.error('删除失败，请重试')
  }
}

// 删除确认弹窗
const showDeleteConfirm = (id: number) => {
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除这篇文章吗？此操作不可恢复。',
    okText: '确认',
    cancelText: '取消',
    okType: 'danger',
    centered: true,
    onOk: async () => {
      try {
        const res = await deleteArticleByIdUsingPost({ id })
        if (res.data.code === 0) {
          message.success('删除成功')
          fetchArticles()
        } else {
          message.error('删除失败，' + res.data.message)
        }
      } catch (error) {
        message.error('删除失败，请重试')
      }
    }
  })
}




</script>

<style scoped>
#AdminHomePage {
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

.article-list {
  margin-top: 40px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
  /* 让文章列表占据剩余空间 */
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

.article-list {
  margin-top: 40px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}


.article-list :deep(.ant-list-item) {
  padding: 24px;
  margin-bottom: 16px;
  border: 1px solid transparent;
  /* 修改为透明边框 */
  border-radius: 8px;
  background: #fff;
  transition: all 0.3s;
}


.article-list :deep(.ant-list-item:hover) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}


.article-list :deep(.ant-list-item-meta-title) {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 12px;
}

.article-list :deep(.ant-list-item-meta-title a) {
  color: #333;
  text-decoration: none;
  transition: color 0.3s;
}

.article-list :deep(.ant-list-item-meta-title a:hover) {
  color: #1890ff;
}

.article-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  color: #666;
  font-size: 14px;
  margin-bottom: 16px;
}

.article-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.article-meta span:last-child {
  margin-left: auto;
  /* 添加这行 */
}

.article-meta span::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #1890ff;
}


.article-content {
  color: #333;
  line-height: 1.8;
  margin-top: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  min-height: 84px;
  max-height: 84px;
  /* 添加最大高度限制 */
  position: relative;
  /* 添加相对定位 */
}

.article-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  display: none;
  /* 隐藏图片以保持等高 */
}

.article-content :deep(p) {
  margin: 0;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}

.article-item {
  cursor: pointer;
  transition: all 0.3s;
}

.article-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.pagination-container {
  margin-top: 32px;
  padding: 20px 0;
  text-align: center;
  background: #fff;
  border-radius: 8px;
}

.pagination-container :deep(.ant-pagination) {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.pagination-container :deep(.ant-pagination-item) {
  border-radius: 4px;
  border: 1px solid #d9d9d9;
  transition: all 0.3s;
}

.pagination-container :deep(.ant-pagination-item:hover) {
  border-color: #1890ff;
  color: #1890ff;
}

.pagination-container :deep(.ant-pagination-item-active) {
  background: #1890ff;
  border-color: #1890ff;
}

.pagination-container :deep(.ant-pagination-item-active a) {
  color: #fff;
}

.pagination-container :deep(.ant-pagination-prev),
.pagination-container :deep(.ant-pagination-next) {
  border-radius: 4px;
  transition: all 0.3s;
}

.pagination-container :deep(.ant-pagination-prev:hover),
.pagination-container :deep(.ant-pagination-next:hover) {
  border-color: #1890ff;
}

.pagination-container :deep(.ant-pagination-jump-prev),
.pagination-container :deep(.ant-pagination-jump-next) {
  border-radius: 4px;
}

.pagination-container :deep(.ant-pagination-options) {
  margin-left: 16px;
}

.pagination-container :deep(.ant-pagination-options-size-changer) {
  border-radius: 4px;
}

.pagination-container :deep(.ant-pagination-options-quick-jumper) {
  margin-left: 16px;
}

.pagination-container :deep(.ant-pagination-options-quick-jumper input) {
  border-radius: 4px;
}

.article-actions {
  margin-top: 16px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.article-actions .ant-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border-radius: 4px;
  transition: all 0.3s;
  height: 36px;
  opacity: 1;
  color: #fff;
  font-weight: 500;
}

.article-actions .ant-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.edit-btn {
  background: linear-gradient(45deg, #69c0ff, #95de64);
  border: none;
}

.edit-btn:hover {
  background: linear-gradient(45deg, #91d5ff, #b7eb8f);
}

.delete-btn {
  background: linear-gradient(45deg, #ff9c9e, #ffa39e);
  border: none;
}

.delete-btn:hover {
  background: linear-gradient(45deg, #ffb3b3, #ffc9c9);
}
</style>
