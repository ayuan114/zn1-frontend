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
        <a-form-item label="标题" name="name">
          <a-input v-model:value="blogArticleForm.title" placeholder="请输入标题" />
        </a-form-item>
        <a-form-item label="内容" name="introduction">
          <quill-editor
            ref="editorRef"
            v-model:content="blogArticleForm.content"
            :options="options"
            contentType="html"
            style="height: 280px"
            allowClear
          ></quill-editor>
        </a-form-item>
        <a-form-item label="分类" name="category">
          <a-auto-complete
            v-model:value="blogArticleForm.category_id"
            :options="categoryOptions"
            placeholder="请输入分类"
            allowClear
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

        <a-form-item>
          <a-button type="primary" html-type="submit" style="width: 100%; display: flex; justify-content: center;">创建文章</a-button>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { queryCategoryDataUsingPost, queryTagDataUsingPost } from '@/api/blogArticleController'
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

const getCategoryOptions = async () => {
  const res = await queryCategoryDataUsingPost()
  if (res.data.code === 0 && res.data.data) {
    categoryOptions.value = (res.data.data ?? []).map((data: API.Category) => {
      return {
        value: data.name,
        label: data.name,
      }
    })
  } else {
    message.error('获取标签分类列表失败，' + res.data.message)
  }
}

onMounted(() => {
  getCategoryOptions()
})

onMounted(() => {
  getTagOptions()
})

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
  { Choice: '.ql-formula', title: '插入公式' },
  { Choice: '.ql-clean', title: '清除字体格式' },
  { Choice: '.ql-script[value="sub"]', title: '下标' },
  { Choice: '.ql-script[value="super"]', title: '上标' },
  { Choice: '.ql-indent[value="-1"]', title: '向左缩进' },
  { Choice: '.ql-indent[value="+1"]', title: '向右缩进' },
  { Choice: '.ql-header .ql-picker-label', title: '标题大小' },
  { Choice: '.ql-header .ql-picker-item[data-value="1"]', title: '标题一' },
  { Choice: '.ql-header .ql-picker-item[data-value="2"]', title: '标题二' },
  { Choice: '.ql-header .ql-picker-item[data-value="3"]', title: '标题三' },
  { Choice: '.ql-header .ql-picker-item[data-value="4"]', title: '标题四' },
  { Choice: '.ql-header .ql-picker-item[data-value="5"]', title: '标题五' },
  { Choice: '.ql-header .ql-picker-item[data-value="6"]', title: '标题六' },
  { Choice: '.ql-header .ql-picker-item:last-child', title: '标准' },
  { Choice: '.ql-size .ql-picker-item[data-value="small"]', title: '小号' },
  { Choice: '.ql-size .ql-picker-item[data-value="large"]', title: '大号' },
  { Choice: '.ql-size .ql-picker-item[data-value="huge"]', title: '超大号' },
  { Choice: '.ql-size .ql-picker-item:nth-child(2)', title: '标准' },
  { Choice: '.ql-align .ql-picker-item:first-child', title: '居左对齐' },
  { Choice: '.ql-align .ql-picker-item[data-value="center"]', title: '居中对齐' },
  { Choice: '.ql-align .ql-picker-item[data-value="right"]', title: '居右对齐' },
  { Choice: '.ql-align .ql-picker-item[data-value="justify"]', title: '两端对齐' },
]
// 给富文本框工具栏加上鼠标悬浮中文提示
const initTitle = () => {
  for (const item of titleConfig) {
    // .editor 是富文本编辑器的类名
    const tip = document.querySelector('.editor ' + item.Choice)
    if (tip) {
      tip.setAttribute('title', item.title)
    }
  }
}

// 自定义粘贴事件
const customPaste = (e) => {
  // 获取当前最新时间 改名啥的可以用
  const newTime = new Date().getTime()

  const clipboardData = e.clipboardData // 粘贴信息
  const types = clipboardData.types // 当前文件类型
  if (types.includes('Files')) {
    e.preventDefault()
    e.clipboardData.files.forEach((file) => {
      // 在这里可以拿到粘贴后的图片与文件信息
      // 在这里做操作
    })
  }
}

onMounted(() => {
  nextTick(() => {
    // 给富文本框工具栏加上鼠标悬浮中文提示
    initTitle()
  })
  // 给富文本增加粘贴事件

})
</script>

<style scoped>
#BlogEidt {
  width: 800px;
  margin: 0 auto;
}

#BlogEidt .header{
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
}
</style>
