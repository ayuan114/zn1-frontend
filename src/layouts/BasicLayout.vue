<template>
  <div id="basicLayout">
    <a-layout style="min-height: 100vh">
      <a-layout-content class="content">
        <router-view />
      </a-layout-content>

      <a-layout-footer class="footer">
        <div class="footer-content">
          <div class="footer-left">
            <div class="category-section">
              <h4 class="category-title">分类</h4>
              <div class="category-list">
                <div v-for="category in categories" :key="category.value"
                  :class="['category-item', { active: blogArticleForm.categoryId === category.value }]"
                  @click="handleCategoryClick(category.value)">
                  <span class="category-name">-- {{ category.label }}</span>
                  <span class="category-count">({{ category.count || 0 }})</span>
                </div>
              </div>
            </div>

            <div class="search-section">
              <a-input v-model:value="blogArticleForm.title" placeholder="搜索标题" style="width: 200px"
                @keydown.enter.prevent="handleSearch">
                <template #suffix>
                  <search-outlined style="color: rgba(0, 0, 0, 0.45)" />
                </template>
              </a-input>
            </div>



          </div>
          <div class="footer-right">
            <h4>标签 </h4>
            <div class="tag-list">
              <div v-for="tag in tags" :key="tag.value"
                :class="['tag-item', { active: blogArticleForm.tags.includes(tag.value) }]"
                @click="handleTagClick(tag.value)">
                <span class="tag-name">{{ tag.label }}</span>
                <span class="tag-count">({{ tag.count || 0 }})</span>
              </div>
            </div>
          </div>
        </div>

        <div class="footer-bottom">
          <p target="_blank">@2025 JI'S BLOG BY JI </p>
          <a href="https://beian.miit.gov.cn/" style="color: #000;" target="_blank">滇ICP备2025057768号-1</a>
        </div>
      </a-layout-footer>
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import GlobalHeader from '@/components/GlobalHeader.vue'

import { ref, onMounted, watch, reactive } from 'vue'
import { queryCategoryDataUsingPost, queryTagDataUsingPost, queryBlogArticleTitleUsingPost } from '@/api/blogArticleController'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const searchText = ref('')
const categories = ref([])
const tags = ref([])
const selectedCategory = ref(null)
const selectedTags = ref([])
const loading = ref(false)
const articles = ref([])
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})


// 修改获取分类数据
const fetchCategories = async () => {
  try {
    const res = await queryCategoryDataUsingPost()
    if (res.data.code === 0 && res.data.data) {
      categories.value = await Promise.all(res.data.data.map(async (item) => {
        // 获取每个分类的文章数量
        const countRes = await queryBlogArticleTitleUsingPost({
          current: 1,
          pageSize: 1,
          categoryId: item.id
        })
        return {
          value: item.id,
          label: item.name,
          count: countRes.data.data?.total || 0
        }
      }))
    }
  } catch (error) {
    console.error('获取分类数据失败:', error)
  }
}


// 修改获取标签数据
const fetchTags = async () => {
  try {
    const res = await queryTagDataUsingPost()
    if (res.data.code === 0 && res.data.data) {
      tags.value = await Promise.all(res.data.data.map(async (item) => {
        // 获取每个标签的文章数量
        const countRes = await queryBlogArticleTitleUsingPost({
          current: 1,
          pageSize: 1,
          tags: item.id
        })
        return {
          value: item.id,
          label: item.name,
          count: countRes.data.data?.total || 0
        }
      }))
    }
  } catch (error) {
    console.error('获取标签数据失败:', error)
  }
}



// 修改 blogArticleForm 的结构
const blogArticleForm = reactive<API.BlogArticleDTO>({
  title: '',
  categoryId: undefined,
  tags: []
})

// 修改搜索处理函数
const handleSearch = () => {
  const query: any = {
    current: 1
  }

  if (blogArticleForm.title) {
    query.title = blogArticleForm.title
  }

  // 更新路由参数，确保跳转到首页
  router.push({
    path: '/',
    query
  })
}


// 修改 fetchArticles 函数
const fetchArticles = async () => {
  loading.value = true
  try {
    const params: any = {
      current: pagination.current,
      pageSize: pagination.pageSize,
      ...blogArticleForm
    }

    // 处理标签数组
    if (params.tags && Array.isArray(params.tags)) {
      params.tags = params.tags.join(',')
    }

    const res = await queryBlogArticleTitleUsingPost(params)
    if (res.data.code === 0 && res.data.data) {
      articles.value = res.data.data.records || []
      pagination.total = res.data.data.total || 0
    } else {
      message.error('获取文章列表失败，' + res.data.message)
    }
  } catch (error) {
    message.error('获取文章列表失败，请重试')
  } finally {
    loading.value = false
  }
}

// 修改处理分类点击
const handleCategoryClick = (categoryId) => {
  const query: any = {
    current: 1
  }

  if (categoryId) {
    query.categoryId = categoryId
  }

  // 更新路由参数，确保跳转到首页
  router.push({
    path: '/',
    query
  })
}


// 修改处理标签点击
const handleTagClick = (tagId) => {
  const query: any = {
    current: 1
  }

  // 直接设置选中的标签，而不是叠加
  blogArticleForm.tags = blogArticleForm.tags[0] === tagId ? [] : [tagId]

  if (blogArticleForm.tags.length > 0) {
    query.tags = blogArticleForm.tags.join(',')
  }

  // 更新路由参数，确保跳转到首页
  router.push({
    path: '/',
    query
  })
}



// 修改监听路由变化
watch(() => route.query, async (newQuery) => {
  // 重置表单
  blogArticleForm.title = newQuery.title || ''
  blogArticleForm.categoryId = newQuery.categoryId ? Number(newQuery.categoryId) : undefined
  blogArticleForm.tags = newQuery.tags ? (newQuery.tags as string).split(',') : []

  if (newQuery.current) {
    pagination.current = Number(newQuery.current)
  }

  // 重新获取分类和标签数据
  await fetchCategories()
  await fetchTags()

  // 触发文章列表更新
  //fetchArticles()
}, { immediate: true })

// 修改onMounted部分
onMounted(() => {
  fetchCategories()
  fetchTags()
})


</script>

<style scoped>
#basicLayout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

#basicLayout .footer {
  background: #efefef;
  padding: 16px;
  text-align: center;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
}

#basicLayout .content {
  background: linear-gradient(to right, #fefefe, #fff);
  padding: 20px;
  flex: 1;
}

#basicLayout .header {
  padding-inline: 20px;
  margin-bottom: 5px;
  color: cornflowerblue;
  background: white;
}

.footer {
  background: #efefef;
  padding: 20px 0;
  text-align: center;
}

.footer-content {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  padding: 20px;
  gap: 40px;
  /* 添加间距 */
}

.footer-left,
.footer-right {
  flex: 1;
  /* 让两侧等宽 */
  text-align: left;
}

.search-section {
  margin-top: 12px;
}

:deep(.ant-input) {
  border-radius: 16px;
  background: #f5f5f5;
  border-color: #000;
  padding: 6px 12px;

  &:focus {
    background: #fff;
    border-color: #000;
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
  }

  &:hover {
    border-color: #000;
  }
}


.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  cursor: pointer;
  border-radius: 14px;
  background: #f5f5f5;
  transition: all 0.3s;
  font-size: 13px;
  border: 1px solid transparent;
}

.tag-item:hover {
  background: #e6f7ff;
  border-color: #91d5ff;
}

.tag-item.active {
  background: #1890ff;
  color: #fff;
  border-color: #1890ff;
}

.tag-name {
  font-size: 13px;
}

.tag-count {
  font-size: 11px;
  opacity: 0.8;
}

.category-section {
  text-align: left;
}

.category-title {
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-item {
  display: flex;
  align-items: center;


  cursor: pointer;
  transition: all 0.3s;
}

.category-name {
  color: #666;
  font-size: 14px;
}

.category-count {
  color: #999;
  font-size: 12px;
}

.category-item:hover .category-name {
  color: #1890ff;
}

.category-item.active .category-name {
  color: #1890ff;
  font-weight: 500;
}
</style>
