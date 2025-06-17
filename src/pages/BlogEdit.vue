<template>
  <div id="BlogEidt">
    <div class="app-container">
      <!-- 头部 -->
      <div class="header">
        <h1>博客文章编辑器</h1>
        <p>使用Vue3组合式API构建的现代编辑器</p>
      </div>
    </div>

    <a-form layout="vertical" :model="blogArticleForm" @finish="handleSubmit">
      <a-form-item label="标题" name="name">
        <a-input v-model:value="blogArticleForm.title" placeholder="请输入标题" />
      </a-form-item>
      <a-form-item label="内容" name="introduction">
        <a-textarea v-model:value="blogArticleForm.content" placeholder="请输入内容" :rows="2" autoSize allowClear />
      </a-form-item>
      <a-form-item label="分类" name="category">
        <a-auto-complete v-model:value="blogArticleForm.category_id" :options="categoryOptions" placeholder="请输入分类"
          allowClear />
      </a-form-item>
      <a-form-item label="标签" name="tags">
        <a-select v-model:value="blogArticleForm.tags" :options="tagOptions" mode="tags" placeholder="请输入标签" allowClear />
      </a-form-item>

      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%">创建文章</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { queryCategoryDataUsingPost, queryTagDataUsingPost } from '@/api/blogArticleController';
import { message } from 'ant-design-vue';
import { onMounted, reactive, ref } from 'vue';

const blogArticle = ref<API.BlogArticle>();
const blogArticleForm = reactive<API.BlogArticleDTO>({
})

const categoryOptions = ref<API.Category[]>([])
const tagOptions = ref<API.Tag[]>([])

/**
 * 获取标签和分类
 * @param values
 */
const getTagOptions = async () => {

  const res = await queryTagDataUsingPost()
  if (res.data.code === 0 && res.data.data) {
    tagOptions.value = (res.data.data ?? []).map((data: string) => {
      return {
        value: data,
        label: data,
      }
    })
  } else {
    message.error("获取标签分类列表失败，" + res.data.message)
  }
}

const getCategoryOptions = async () => {

  const res = await queryCategoryDataUsingPost()
  if (res.data.code === 0 && res.data.data) {
    categoryOptions.value = (res.data.data ?? []).map((data: string) => {
      return {
        value: data,
        label: data,
      }
    })
  } else {
    message.error("获取标签分类列表失败，" + res.data.message)
  }
}

onMounted(() => {
  getCategoryOptions()
})

onMounted(() => {
  getTagOptions()
})


</script>

<style scoped></style>
