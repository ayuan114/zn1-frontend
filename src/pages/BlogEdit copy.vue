<template>
  <div id="BlogEidt">
    <div class="app-container">
      <!-- 头部 -->
      <div class="header">
        <h1>博客文章编辑器</h1>
      </div>

      <!-- 编辑区域 -->
      <div class="editor-container">
        <a-form layout="vertical">
          <!-- 标题 -->
          <div class="form-section">
            <h3 class="section-title"><a-icon type="edit" /> 文章标题</h3>
            <a-input
              v-model:value="formState.title"
              placeholder="请输入文章标题"
              size="large"
            />
          </div>

          <!-- 分类和标签 -->
          <div class="form-section">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 class="section-title"><a-icon type="folder" /> 文章分类</h3>
                <a-select
                  v-model:value="formState.categoryId"
                  placeholder="请选择文章分类"
                  style="width: 100%"
                >
                  <a-select-option v-for="category in categories" :key="category.id" :value="category.id">
                    {{ category.name }}
                  </a-select-option>
                </a-select>
              </div>

              <div>
                <h3 class="section-title"><a-icon type="tags" /> 文章标签</h3>
                <a-select
                  v-model:value="formState.tags"
                  mode="multiple"
                  placeholder="请选择文章标签"
                  style="width: 100%"
                  :options="tags"
                  :field-names="{ label: 'name', value: 'id' }"
                ></a-select>
              </div>
            </div>
          </div>

          <!-- 内容 -->
          <div class="form-section">
            <h3 class="section-title"><a-icon type="file-text" /> 文章内容</h3>

            <div class="editor-toolbar">
              <a-button type="primary" @click="addTextBlock">
                <a-icon type="file-add" /> 添加文本块
              </a-button>
              <a-button type="primary" @click="addImageBlock">
                <a-icon type="picture" /> 添加图片
              </a-button>
              <a-button @click="togglePreview">
                <a-icon type="eye" /> {{ showPreview ? '隐藏预览' : '显示预览' }}
              </a-button>
            </div>

            <div class="content-editor">
              <div v-for="(block, index) in formState.blocks" :key="index"
                   class="content-block" :class="block.type === 'TEXT' ? 'text-block' : 'image-block'">
                <div class="block-counter">{{ index + 1 }}</div>

                <div v-if="block.type === 'TEXT'">
                  <a-textarea
                    v-model:value="block.content"
                    placeholder="请输入文本内容..."
                    :auto-size="{ minRows: 3, maxRows: 10 }"
                    style="width: 100%"
                  />
                </div>

                <div v-if="block.type === 'IMAGE'">
                  <div class="image-upload-container" @click="triggerImageUpload(index)">
                    <div class="upload-icon">
                      <a-icon type="cloud-upload" />
                    </div>
                    <p class="upload-text" v-if="!block.content">点击上传图片</p>
                    <p class="upload-text" v-else>点击更换图片</p>
                    <p style="font-size: 12px; color: #999;">支持 JPG, PNG 格式，最大 5MB</p>
                  </div>

                  <input
                    type="file"
                    ref="fileInput"
                    style="display: none"
                    accept="image/*"
                    @change="handleImageUpload($event, index)"
                  >

                  <img
                    v-if="block.content"
                    :src="block.content"
                    class="image-preview"
                    alt="图片预览"
                  >
                </div>

                <div class="block-actions">
                  <a-tooltip title="上移">
                    <a-button size="small" @click="moveBlockUp(index)" v-if="index > 0">
                      <a-icon type="arrow-up" />
                    </a-button>
                  </a-tooltip>
                  <a-tooltip title="下移">
                    <a-button size="small" @click="moveBlockDown(index)" v-if="index < formState.blocks.length - 1">
                      <a-icon type="arrow-down" />
                    </a-button>
                  </a-tooltip>
                  <a-tooltip title="删除">
                    <a-button size="small" type="danger" @click="removeBlock(index)">
                      <a-icon type="delete" />
                    </a-button>
                  </a-tooltip>
                </div>
              </div>

              <div v-if="formState.blocks.length === 0" class="empty-state">
                <a-icon type="file-exclamation" />
                <p>请添加内容块开始编辑您的文章</p>
                <div style="margin-top: 16px;">
                  <a-button type="primary" @click="addTextBlock">
                    <a-icon type="file-add" /> 添加文本块
                  </a-button>
                  <a-button type="primary" @click="addImageBlock" style="margin-left: 8px;">
                    <a-icon type="picture" /> 添加图片
                  </a-button>
                </div>
              </div>
            </div>
          </div>

          <!-- 统计信息 -->
          <div class="stats-bar">
            <div class="stat-item">
              <span>文本块</span>
              <span class="stat-value">{{ textBlocksCount }}</span>
            </div>
            <div class="stat-item">
              <span>图片块</span>
              <span class="stat-value">{{ imageBlocksCount }}</span>
            </div>
            <div class="stat-item">
              <span>总字数</span>
              <span class="stat-value">{{ totalCharacters }}</span>
            </div>
            <div class="stat-item">
              <span>总块数</span>
              <span class="stat-value">{{ formState.blocks.length }}</span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="actions-bar">
            <a-button type="default" size="large" @click="resetForm">
              <a-icon type="undo" /> 重置
            </a-button>
            <a-button type="primary" size="large" @click="saveDraft" :loading="saving">
              <a-icon type="save" /> 保存草稿
            </a-button>
            <a-button type="primary" size="large" @click="publishArticle" :loading="publishing">
              <a-icon type="rocket" /> 发布文章
            </a-button>
          </div>
        </a-form>
      </div>

      <!-- 预览区域 -->
      <div class="preview-container" v-if="showPreview">
        <h2 class="preview-title">{{ formState.title || '无标题文章' }}</h2>

        <div class="tag-list">
          <div class="category-badge" v-if="selectedCategory">
            <a-icon type="folder" /> {{ selectedCategory.name }}
          </div>
          <a-tag v-for="tag in selectedTags" :key="tag.id" color="blue">
            <a-icon type="tag" /> {{ tag.name }}
          </a-tag>
        </div>

        <div class="preview-content">
          <div v-for="(block, index) in formState.blocks" :key="index">
            <p v-if="block.type === 'TEXT'">{{ block.content }}</p>
            <img v-if="block.type === 'IMAGE' && block.content" :src="block.content" alt="文章图片">
          </div>
        </div>
      </div>

      <!-- 页脚 -->
      <div class="footer">
        <p>© 2023 博客文章编辑器 | Vue3组合式API + Ant Design Vue 实现</p>
      </div>
    </div>
  </div>

</template>

<script setup lang="ts">
const { createApp, ref, reactive, computed, onMounted } = Vue;
    const {
      Button,
      Form,
      Input,
      Select,
      Icon,
      Tag,
      Tooltip,
      message
    } = antd;

    // 使用组合式API
    const useFormState = () => {
      return reactive({
        title: '',
        categoryId: null,
        tags: [],
        blocks: []
      });
    };

    const useCategories = () => {
      return ref([
        { id: 1, name: '技术教程' },
        { id: 2, name: '生活随笔' },
        { id: 3, name: '产品设计' },
        { id: 4, name: '行业分析' },
        { id: 5, name: '读书笔记' },
        { id: 6, name: '旅行见闻' },
        { id: 7, name: '影音娱乐' }
      ]);
    };

    const useTags = () => {
      return ref([
        { id: 1, name: 'Vue.js' },
        { id: 2, name: 'JavaScript' },
        { id: 3, name: '前端开发' },
        { id: 4, name: '后端技术' },
        { id: 5, name: '数据库' },
        { id: 6, name: '算法' },
        { id: 7, name: '设计模式' },
        { id: 8, name: '云计算' },
        { id: 9, name: '微服务' },
        { id: 10, name: '容器化' }
      ]);
    };

    const useBlockManagement = (formState) => {
      const addTextBlock = () => {
        formState.blocks.push({
          type: 'TEXT',
          content: '',
          imageId: '',
          sortOrder: formState.blocks.length
        });
      };

      const addImageBlock = () => {
        formState.blocks.push({
          type: 'IMAGE',
          content: '',
          imageId: '',
          sortOrder: formState.blocks.length
        });
      };

      const removeBlock = (index) => {
        formState.blocks.splice(index, 1);
        updateSortOrder();
      };

      const moveBlockUp = (index) => {
        if (index <= 0) return;
        const block = formState.blocks[index];
        formState.blocks.splice(index, 1);
        formState.blocks.splice(index - 1, 0, block);
        updateSortOrder();
      };

      const moveBlockDown = (index) => {
        if (index >= formState.blocks.length - 1) return;
        const block = formState.blocks[index];
        formState.blocks.splice(index, 1);
        formState.blocks.splice(index + 1, 0, block);
        updateSortOrder();
      };

      const updateSortOrder = () => {
        formState.blocks.forEach((block, idx) => {
          block.sortOrder = idx;
        });
      };

      return {
        addTextBlock,
        addImageBlock,
        removeBlock,
        moveBlockUp,
        moveBlockDown
      };
    };

    const useImageUpload = (formState) => {
      const fileInput = ref([]);

      const triggerImageUpload = (index) => {
        fileInput.value[index].click();
      };

      const handleImageUpload = (event, index) => {
        const file = event.target.files[0];
        if (!file) return;

        // 验证文件类型
        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validTypes.includes(file.type)) {
          message.error('只支持 JPG, PNG 或 GIF 格式的图片');
          return;
        }

        // 验证文件大小
        if (file.size > 5 * 1024 * 1024) {
          message.error('图片大小不能超过 5MB');
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          // 将图片转换为Base64
          formState.blocks[index].content = e.target.result;
          // 在实际应用中，这里应该调用API上传图片并获取imageId
          formState.blocks[index].imageId = `img-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          message.success('图片上传成功');
        };
        reader.readAsDataURL(file);
      };

      return {
        fileInput,
        triggerImageUpload,
        handleImageUpload
      };
    };

    const useFormActions = (formState, categories, tags) => {
      const saving = ref(false);
      const publishing = ref(false);
      const showPreview = ref(false);

      const selectedCategory = computed(() => {
        return categories.value.find(cat => cat.id === formState.categoryId) || null;
      });

      const selectedTags = computed(() => {
        return tags.value.filter(tag => formState.tags.includes(tag.id));
      });

      const textBlocksCount = computed(() => {
        return formState.blocks.filter(block => block.type === 'TEXT').length;
      });

      const imageBlocksCount = computed(() => {
        return formState.blocks.filter(block => block.type === 'IMAGE').length;
      });

      const totalCharacters = computed(() => {
        return formState.blocks
          .filter(block => block.type === 'TEXT')
          .reduce((sum, block) => sum + (block.content || '').length, 0);
      });

      const saveDraft = () => {
        if (!validateForm()) return;

        saving.value = true;
        setTimeout(() => {
          saving.value = false;
          message.success('草稿保存成功');
          console.log('保存的草稿数据:', getFormattedData());
        }, 1000);
      };

      const publishArticle = () => {
        if (!validateForm()) return;

        publishing.value = true;
        setTimeout(() => {
          publishing.value = false;
          message.success('文章发布成功');
          console.log('发布的数据:', getFormattedData());
        }, 1500);
      };

      const resetForm = () => {
        formState.title = '';
        formState.categoryId = null;
        formState.tags = [];
        formState.blocks = [];
        message.info('表单已重置');
      };

      const togglePreview = () => {
        showPreview.value = !showPreview.value;
      };

      const validateForm = () => {
        if (!formState.title.trim()) {
          message.error('请输入文章标题');
          return false;
        }

        if (!formState.categoryId) {
          message.error('请选择文章分类');
          return false;
        }

        if (formState.blocks.length === 0) {
          message.error('请添加文章内容');
          return false;
        }

        return true;
      };

      const getFormattedData = () => {
        return {
          title: formState.title,
          categoryId: formState.categoryId,
          tags: formState.tags,
          authorId: 1,
          blocks: formState.blocks.map(block => {
            if (block.type === 'IMAGE') {
              return {
                type: block.type,
                imageId: block.imageId,
                sortOrder: block.sortOrder,
                content: ''
              };
            }
            return {
              type: block.type,
              content: block.content,
              sortOrder: block.sortOrder,
              imageId: ''
            };
          })
        };
      };

      return {
        saving,
        publishing,
        showPreview,
        selectedCategory,
        selectedTags,
        textBlocksCount,
        imageBlocksCount,
        totalCharacters,
        saveDraft,
        publishArticle,
        resetForm,
        togglePreview
      };
    };

    const useSampleData = (formState) => {
      const initSampleData = () => {
        formState.title = 'Vue3组合式API最佳实践';
        formState.categoryId = 1;
        formState.tags = [1, 3, 7]; // Vue.js, 前端开发, 设计模式

        formState.blocks = [
          {
            type: 'TEXT',
            content: '在Vue3中，组合式API（Composition API）彻底改变了我们构建组件的方式。与Options API相比，它提供了更灵活、更强大的代码组织和复用能力。',
            imageId: '',
            sortOrder: 0
          },
          {
            type: 'IMAGE',
            content: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
            imageId: 'img-1691234567890-123',
            sortOrder: 1
          },
          {
            type: 'TEXT',
            content: '## 核心优势\n\n1. **更好的代码组织**：将相关逻辑组织在一起\n2. **更强大的复用能力**：自定义组合函数\n3. **更好的TypeScript支持**：类型推断更自然\n4. **更灵活的逻辑抽取**：跨组件复用逻辑',
            imageId: '',
            sortOrder: 2
          },
          {
            type: 'IMAGE',
            content: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
            imageId: 'img-1691234567890-456',
            sortOrder: 3
          },
          {
            type: 'TEXT',
            content: '## 使用示例\n\n```javascript\nimport { ref, computed, onMounted } from \'vue\';\n\nexport default function useUserData() {\n  const user = ref(null);\n  const isLoading = ref(false);\n  \n  const fetchUser = async (userId) => {\n    isLoading.value = true;\n    try {\n      const response = await fetch(`/api/users/${userId}`);\n      user.value = await response.json();\n    } catch (error) {\n      console.error(\'Error fetching user:\', error);\n    } finally {\n      isLoading.value = false;\n    }\n  };\n  \n  return { user, isLoading, fetchUser };\n}\n```',
            imageId: '',
            sortOrder: 4
          }
        ];
      };

      return {
        initSampleData
      };
    };

    const app = createApp({
      setup() {
        // 初始化状态
        const formState = useFormState();
        const categories = useCategories();
        const tags = useTags();

        // 组合功能
        const blockManagement = useBlockManagement(formState);
        const imageUpload = useImageUpload(formState);
        const formActions = useFormActions(formState, categories, tags);
        const sampleData = useSampleData(formState);

        // 初始化示例数据
        onMounted(() => {
          sampleData.initSampleData();
        });

        return {
          formState,
          categories,
          tags,
          ...blockManagement,
          ...imageUpload,
          ...formActions
        };
      }
    });

    app.use(Button);
    app.use(Form);
    app.use(Input);
    app.use(Select);
    app.use(Icon);
    app.use(Tag);
    app.use(Tooltip);

    app.mount('#app');
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
:root {
  --primary-color: #1890ff;
  --primary-light: #e6f7ff;
  --success-color: #52c41a;
  --warning-color: #faad14;
  --error-color: #ff4d4f;
  --text-color: #333;
  --text-light: #666;
  --border-color: #d9d9d9;
  --bg-color: #f8f9fa;
  --card-bg: #ffffff;
  --shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  --radius: 8px;
  --transition: all 0.3s ease;
}
#BlogEidt {
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background-color: var(--bg-color);
  color: var(--text-color);
  line-height: 1.6;
}
.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}
.header {
  text-align: center;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--primary-color);
}
.header h1 {
  color: var(--primary-color);
  font-size: 32px;
  margin-bottom: 8px;
  font-weight: 600;
}
.header p {
  color: var(--text-light);
  font-size: 16px;
}
.editor-container {
  background: var(--card-bg);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 32px;
  margin-bottom: 32px;
  transition: var(--transition);
}
.form-section {
  margin-bottom: 24px;
}
.section-title {
  font-size: 18px;
  margin-bottom: 16px;
  color: var(--primary-color);
  display: flex;
  align-items: center;
  font-weight: 500;
}
.section-title i {
  margin-right: 8px;
}
.content-editor {
  border: 1px solid var(--border-color);
  border-radius: 4px;
  min-height: 300px;
  padding: 16px;
  transition: var(--transition);
  background: var(--card-bg);
}
.content-editor:focus-within {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}
.editor-toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.content-block {
  margin-bottom: 16px;
  padding: 16px;
  border-radius: 4px;
  background-color: #f9f9f9;
  position: relative;
  transition: var(--transition);
  border-left: 3px solid transparent;
}
.content-block:hover {
  background-color: var(--primary-light);
  border-left-color: var(--primary-color);
}
.text-block {
  border-left-color: #52c41a;
}
.image-block {
  border-left-color: #faad14;
}
.block-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
  opacity: 0.7;
  transition: var(--transition);
}
.content-block:hover .block-actions {
  opacity: 1;
}
.image-preview {
  max-width: 100%;
  max-height: 300px;
  margin-top: 8px;
  border-radius: 4px;
  display: block;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.actions-bar {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 32px;
}
.preview-container {
  background: var(--card-bg);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 32px;
  margin-top: 32px;
  transition: var(--transition);
}
.preview-title {
  font-size: 28px;
  margin-bottom: 16px;
  color: var(--primary-color);
  font-weight: 600;
}
.preview-content {
  line-height: 1.8;
  font-size: 16px;
}
.preview-content p {
  margin-bottom: 16px;
}
.preview-content img {
  max-width: 100%;
  border-radius: 4px;
  margin: 16px 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 16px 0 24px;
}
.category-badge {
  background-color: var(--primary-light);
  border: 1px solid #91d5ff;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  color: var(--primary-color);
  font-weight: 500;
}
.footer {
  text-align: center;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  color: var(--text-light);
  font-size: 14px;
}
.image-upload-container {
  border: 2px dashed var(--border-color);
  border-radius: 4px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: var(--transition);
  margin-bottom: 16px;
  background: #fafafa;
}
.image-upload-container:hover {
  border-color: var(--primary-color);
  background: var(--primary-light);
}
.upload-icon {
  font-size: 48px;
  color: var(--primary-color);
  margin-bottom: 16px;
}
.upload-text {
  color: var(--text-light);
  margin-bottom: 8px;
}
.stats-bar {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 4px;
  font-size: 14px;
  color: var(--text-light);
}
.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.stat-value {
  font-weight: 600;
  color: var(--primary-color);
  font-size: 18px;
}
.block-counter {
  position: absolute;
  top: 10px;
  left: 10px;
  background: var(--primary-color);
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}
.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #999;
}
.empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
  color: #d9d9d9;
}
@media (max-width: 768px) {
  .app-container {
    padding: 16px;
  }
  .editor-container {
    padding: 16px;
  }
  .actions-bar {
    flex-direction: column;
  }
  .content-block {
    padding: 12px 12px 12px 36px;
  }
  .block-counter {
    left: 6px;
    top: 6px;
  }
}
</style>
