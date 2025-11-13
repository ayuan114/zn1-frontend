<template>
  <div id="BlogEidt">
    <div>
      <div class="app-container">
        <!-- 头部 -->
        <div class="header">
          <h1>博客文章编辑器</h1>
        </div>
      </div>

 <a-form
    layout="vertical"
    :model="blogArticleForm"
    @finish="handleSubmit"
  >
        <a-form-item label="标题" name="title" :rules="[{ required: true, message: '请输入文章标题' }]">
         <a-input v-model:value="blogArticleForm.title" placeholder="请输入标题" />
        </a-form-item>
        <a-form-item label="内容" name="content">
          <quill-editor
            ref="editorRef"
            v-model:content="blogArticleForm.content"
            :options="options"
            contentType="html"
            style="height: 400px"
            allowClear
          ></quill-editor>
        </a-form-item>
        <a-form-item label="分类" name="category_id">
        <a-auto-complete
  v-model:value="categoryDisplayValue"
  :options="categoryOptions"
  placeholder="请输入分类"
  allowClear
  @select="handleCategorySelect"
/>


        </a-form-item>
        <a-form-item label="标签" name="tags">
          <a-select
            v-model:value="blogArticleForm.tags"
            :options="tagOptions"
            mode="tags"
            placeholder="请输入标签"
            allowClear
          />
        </a-form-item>

              <!-- ... 其他代码 ... -->
    <a-form-item>
      <a-space style="width: 100%; display: flex; justify-content: center;">
        <a-button type="primary" html-type="submit">创建文章</a-button>
        <a-button @click="showPreview">预览</a-button>
      </a-space>
    </a-form-item>
      </a-form>



    <!-- 预览模态框 -->
<a-modal
  v-model:open="previewVisible"
  title="文章预览"
  width="80%"
  :footer="null"
>
  <div class="preview-content">
    <h1>{{ blogArticleForm.title }}</h1>
    <div class="meta-info">
      <span v-if="blogArticleForm.category_id">
        分类：{{ getCategoryName(blogArticleForm.category_id) }}
      </span>
      <span v-if="blogArticleForm.tags">
        标签：{{ getTagNames(blogArticleForm.tags) }}
      </span>
    </div>
    <div class="article-content" v-html="blogArticleForm.content"></div>
  </div>
</a-modal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { createBlogArticleUsingPost, queryCategoryDataUsingPost, queryTagDataUsingPost, uploadUsingPost } from '@/api/blogArticleController'
import { message } from 'ant-design-vue'
import { log } from 'console'
import { nextTick, onMounted, reactive, ref } from 'vue'

// 引入富文本编辑器与样式
import { Quill, QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

// 引入缩放图片的插件
import BlotFormatter from 'quill-blot-formatter'
Quill.register('modules/blotFormatter', BlotFormatter)

const blogArticle = ref<API.BlogArticle>()
const blogArticleForm = reactive<API.BlogArticleDTO>({})

const categoryOptions = ref<API.Category[]>([])
const tagOptions = ref<API.Tag[]>([])
// 在 script setup 中添加
const editorRef = ref()

/**
 * 获取标签和分类
 * @param values
 */
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

// 添加用于显示的变量
const categoryDisplayValue = ref<string>('')

// 处理分类选择
const handleCategorySelect = (value: string, option: any) => {
   console.log(option,'qqqq')
  blogArticleForm.category_id = option.value  // 存储分类ID
  console.log(blogArticleForm,'qqqq1')
  categoryDisplayValue.value = option.label   // 显示分类名称
  console.log(categoryDisplayValue,'qqqq2')
}



// 修改 getCategoryOptions 函数，确保正确设置初始值
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



const customPaste = async (e: ClipboardEvent) => {
  const clipboardData = e.clipboardData
  if (!clipboardData?.types.includes('Files')) return

  e.preventDefault()
  const files = Array.from(clipboardData.files)

  try {
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        const res = await uploadUsingPost({}, file)
        if (res.data.code === 0 && res.data.data) {
          const quill = editorRef.value?.getQuill()
          const range = quill?.getSelection()
          if (range) {
            quill.insertEmbed(range.index, 'image', res.data.data)
          }
        } else {
          message.error('图片上传失败：' + res.data.message)
        }
      }
    }
  } catch (error) {
    message.error('图片上传失败，请重试')
  }
}



onMounted(async () => {
  await Promise.all([
    getCategoryOptions(),
    getTagOptions()
  ])
  nextTick(() => {
    // 确保编辑器初始化完成后再设置提示
    const quill = editorRef.value?.getQuill()
    if (quill) {
      quill.root.addEventListener('paste', customPaste)
      initTitle()
    }
  })
})

// 获取分类名称
const getCategoryName = (categoryId: number) => {
  const category = categoryOptions.value.find(c => c.value === categoryId)
  return category ? category.label : ''
}

// 获取标签名称
const getTagNames = (tags: number[] | string) => {
  const tagIds = Array.isArray(tags) ? tags : tags.split(',')
  return tagIds
    .map(id => {
      const tag = tagOptions.value.find(t => t.value === id)
      return tag ? tag.label : ''
    })
    .filter(name => name)
    .join(', ')
}




// 富文本配置
const options = ref({
  theme: 'snow', // 使用snow主题
  modules: {
    // 富文本头部栏的功能配置
    toolbar: {
      container: [
        ['bold', 'italic', 'underline', 'strike'], // 加粗 斜体 下划线 删除线
        [{ color: [] }, { background: [] }], // 字体颜色、字体背景颜色
        [{ align: [] }], // 对齐方式
        [{ size: ['small', false, 'large', 'huge'] }], // 字体大小
        [{ font: [] }], // 字体种类
        [{ header: [1, 2, 3, 4, 5, 6, false] }], // 标题
        [{ direction: 'ltl' }], // 文本方向
        [{ direction: 'rtl' }], // 文本方向
        [{ indent: '-1' }, { indent: '+1' }], // 缩进
        [{ list: 'ordered' }, { list: 'bullet' }], // 有序、无序列表
        [{ script: 'sub' }, { script: 'super' }], // 上标/下标
        ['blockquote', 'code-block'], // 引用  代码块
        ['clean'], // 清除文本格式
        ['link', 'image', 'video'], // 链接、图片、视频
      ],
      handlers: {
        image: function() {
          const input = document.createElement('input')
          input.setAttribute('type', 'file')
          input.setAttribute('accept', 'image/*')
          input.click()

          input.onchange = async () => {
            const file = input.files?.[0]
            if (file) {
              try {
                const res = await uploadUsingPost({}, file)
                if (res.data.code === 0 && res.data.data) {
                  const quill = this.quill
                  const range = quill.getSelection()
                  quill.insertEmbed(range.index, 'image', res.data.data)
                } else {
                  message.error('图片上传失败：' + res.data.message)
                }
              } catch (error) {
                message.error('图片上传失败，请重试')
              }
            }
          }
        }
      }
    },
    // 图片缩放
    blotFormatter: {
      // 可以在这里设置缩放样式
      // overlay: {
      //    style: {
      //        border: '2px solid red',
      //    }
      // },
      toolbar: {
        mainClassName: 'blot-formatter__toolbar',
      },
    },
  },
})

// toolbar标题,划过富文本头部提示信息
const titleConfig = [
  { Choice: '.ql-insertMetric', title: '跳转配置' },
  { Choice: '.ql-bold', title: '加粗' },
  { Choice: '.ql-italic', title: '斜体' },
  { Choice: '.ql-underline', title: '下划线' },
  { Choice: '.ql-header', title: '段落格式' },
  { Choice: '.ql-strike', title: '删除线' },
  { Choice: '.ql-blockquote', title: '块引用' },
  { Choice: '.ql-code', title: '插入代码' },
  { Choice: '.ql-code-block', title: '插入代码段' },
  { Choice: '.ql-font', title: '字体' },
  { Choice: '.ql-size', title: '字体大小' },
  { Choice: '.ql-list[value="ordered"]', title: '编号列表' },
  { Choice: '.ql-list[value="bullet"]', title: '项目列表' },
  { Choice: '.ql-direction', title: '文本方向' },
  { Choice: '.ql-header[value="1"]', title: 'h1' },
  { Choice: '.ql-header[value="2"]', title: 'h2' },
  { Choice: '.ql-align', title: '对齐方式' },
  { Choice: '.ql-color', title: '字体颜色' },
  { Choice: '.ql-background', title: '背景颜色' },
  { Choice: '.ql-image', title: '图像' },
  { Choice: '.ql-video', title: '视频' },
  { Choice: '.ql-link', title: '添加链接' },
  { Choice: '.ql-clean', title: '清除字体格式' },
  { "Choice": '.ql-script[value="sub"]', title: '下标' },
  { "Choice": '.ql-script[value="super"]', title: '上标' },
  { "Choice": '.ql-indent[value="-1"]', title: '向左缩进' },
  { "Choice": '.ql-indent[value="+1"]', title: '向右缩进' },
  { Choice: '.ql-header .ql-picker-label', title: '标题大小' },
  { "Choice": '.ql-size .ql-picker-item[data-value="small"]', title: '小号' },
  { "Choice": '.ql-size .ql-picker-item[data-value="large"]', title: '大号' },
  { "Choice": '.ql-size .ql-picker-item[data-value="huge"]', title: '超大号' },
  { "Choice": '.ql-align .ql-picker-item[data-value="center"]', title: '居中对齐' },
  { "Choice": '.ql-align .ql-picker-item[data-value="right"]', title: '居右对齐' },
  { "Choice": '.ql-align .ql-picker-item[data-value="justify"]', title: '两端对齐' }
]


// 给富文本框工具栏加上鼠标悬浮中文提示
// 修改 initTitle 函数
const initTitle = () => {
  // 使用 setTimeout 确保在 DOM 完全渲染后执行
  setTimeout(() => {
    for (const item of titleConfig) {
      // 移除多余的空格，直接使用选择器
      const tip = document.querySelector(item.Choice)
      if (tip) {
        tip.setAttribute('title', item.title)
      }
    }
  }, 100)
}
console.log(blogArticleForm,'qqqq1')

// 在 BlogEdit.vue 中添加
const handleSubmit = async (values: API.BlogArticleDTO) => {
  console.log('提交的表单数据:', values)
  try {
    // 验证必填字段
    if (!values.title?.trim()) {
      message.error('请输入文章标题')
      return
    }
    if (!values.content?.trim()) {
      message.error('请输入文章内容')
      return
    }
    if (!values.category_id) {
      message.error('请输入文章分类')
      return
    }


    // 将tags数组转换为字符串
    const submitData = {
      ...values,
      tags: Array.isArray(values.tags) ? values.tags.join(',') : values.tags
    }
    const res = await createBlogArticleUsingPost(submitData)
    if (res.data.code === 0) {
      message.success('文章创建成功')
      // 可以在这里添加路由跳转逻辑
    } else {
      message.error('创建失败，' + res.data.message)
    }
  } catch (error) {
    message.error('创建失败，请稍后重试')
  }
}


// 添加预览相关的响应式变量
const previewVisible = ref(false)

// 显示预览的方法
const showPreview = () => {
  if (!blogArticleForm.title?.trim()) {
    message.error('请先输入文章标题')
    return
  }
  if (!blogArticleForm.content?.trim()) {
    message.error('请先输入文章内容')
    return
  }
  previewVisible.value = true
}




</script>

<style scoped>
#BlogEidt {
  width: 900px;  /* 增加宽度 */
  margin: 20px auto;  /* 增加上下边距 */
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

#BlogEidt .header {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;  /* 增加底部间距 */
}

#BlogEidt .header h1 {
  color: #1a1a1a;
  font-size: 24px;
  font-weight: 600;
}

:deep(.ant-form-item) {
  margin-bottom: 24px;
}

:deep(.ant-input) {
  border-radius: 6px;
  padding: 8px 12px;
}

:deep(.ant-btn) {
  height: 40px;
  border-radius: 6px;
  font-weight: 500;
}

.preview-content {
  padding: 30px;
  background: #fff;
  border-radius: 8px;
}

.preview-content h1 {
  margin-bottom: 24px;
  color: #1a1a1a;
  font-size: 28px;
  font-weight: 600;
  text-align: center;
}

.meta-info {
  color: #666;
  margin-bottom: 24px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.meta-info span {
  margin-right: 24px;
  font-size: 14px;
}

.article-content {
  line-height: 1.8;
  color: #333;
  max-width: 100%;
  margin: 0 auto;
}

.article-content :deep(img) {
  max-width: 48%;
  height: auto;
  display: inline-block;
  margin: 8px;
  vertical-align: top;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
}

.article-content :deep(img):hover {
  transform: scale(1.02);
}

.article-content :deep(p:has(img)) {
  text-align: center;
  text-indent: 0;
  margin: 20px 0;
  line-height: 0;
}

.article-content :deep(pre) {
  background-color: #f6f8fa;
  padding: 16px;
  border-radius: 6px;
  overflow-x: auto;
  text-align: left;
  font-size: 14px;
  line-height: 1.5;
}

.article-content :deep(code) {
  background-color: #f6f8fa;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 14px;
}

.article-content :deep(blockquote) {
  border-left: 4px solid #dfe2e5;
  padding: 16px 20px;
  margin: 20px 0;
  background: #f6f8fa;
  border-radius: 6px;
  color: #586069;
}

.article-content :deep(p) {
  margin-bottom: 1.2em;
  text-align: justify;
  text-indent: 2em;
  line-height: 1.8;
  font-size: 16px;
}

/* 模态框样式优化 */
:deep(.ant-modal) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.ant-modal-header) {
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

:deep(.ant-modal-title) {
  font-size: 18px;
  font-weight: 600;
}

</style>
