<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCampusStore } from '@/stores/campus'
import { ElDialog, ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElButton, ElMessage } from 'element-plus'
import { Plus, User, Search } from '@element-plus/icons-vue'
import dayjs from 'dayjs'

const campusStore = useCampusStore()

const showPostDialog = ref(false)
const searchQuery = ref('')
const filterType = ref('all')
const filterTag = ref('')

const form = ref({
  title: '',
  description: '',
  type: 'competition' as 'competition' | 'course' | 'study' | 'club',
  tags: [] as string[],
  requiredMembers: 3
})

const types = [
  { value: 'competition', label: '竞赛组队' },
  { value: 'course', label: '课程作业' },
  { value: 'study', label: '学习搭伴' },
  { value: 'club', label: '社团招新' }
]

const availableTags = ['数模', '编程', '前端', '后端', 'AI', '考研', '英语', '数学', '设计', '写作']

const filteredPosts = computed(() => {
  let posts = campusStore.teamUpPosts
  
  if (filterType.value !== 'all') {
    posts = posts.filter(p => p.type === filterType.value)
  }
  
  if (filterTag.value) {
    posts = posts.filter(p => p.tags.includes(filterTag.value))
  }
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    posts = posts.filter(p => 
      p.title.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query)
    )
  }
  
  return posts
})

const getTypeLabel = (type: string) => {
  return types.find(t => t.value === type)?.label || type
}

const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    competition: '#E6A23C',
    course: '#409EFF',
    study: '#67C23A',
    club: '#909399'
  }
  return colors[type] || '#909399'
}

const toggleTag = (tag: string) => {
  const index = form.value.tags.indexOf(tag)
  if (index === -1) {
    form.value.tags.push(tag)
  } else {
    form.value.tags.splice(index, 1)
  }
}

const postTeamUp = () => {
  if (!form.value.title || !form.value.description) {
    ElMessage.warning('请填写标题和描述')
    return
  }

  campusStore.addTeamUpPost({
    ...form.value,
    publisher: {
      id: '1',
      username: 'current_user',
      email: '',
      studentId: '',
      avatar: '',
      name: '当前用户',
      major: '',
      grade: '',
      campus: '',
      isVerified: true,
      createdAt: new Date().toISOString()
    },
    currentMembers: 1
  })

  ElMessage.success('发布成功')
  showPostDialog.value = false
}

const joinTeam = (postId: string) => {
  ElMessage.info(`申请加入组队: ${postId}`)
}
</script>

<template>
  <div class="teamup-page">
    <div class="teamup-header">
      <div class="search-box">
        <Search />
        <input v-model="searchQuery" type="text" placeholder="搜索组队需求..." />
      </div>
      <ElButton type="primary" icon="Plus" @click="showPostDialog = true">发布组队</ElButton>
    </div>

    <div class="filter-bar">
      <div class="type-filter">
        <button
          :class="['type-btn', { active: filterType === 'all' }]"
          @click="filterType = 'all'"
        >
          全部
        </button>
        <button
          v-for="type in types"
          :key="type.value"
          :class="['type-btn', { active: filterType === type.value }]"
          @click="filterType = type.value"
        >
          {{ type.label }}
        </button>
      </div>
      <div class="tag-filter">
        <span class="filter-label">标签:</span>
        <button
          v-for="tag in availableTags"
          :key="tag"
          :class="['tag-btn', { active: filterTag === tag }]"
          @click="filterTag = filterTag === tag ? '' : tag"
        >
          {{ tag }}
        </button>
      </div>
    </div>

    <div class="posts-grid">
      <div
        v-for="post in filteredPosts"
        :key="post.id"
        class="post-card"
      >
        <div class="post-header">
          <span class="type-tag" :style="{ backgroundColor: getTypeColor(post.type) + '15', color: getTypeColor(post.type) }">
            {{ getTypeLabel(post.type) }}
          </span>
          <span class="publish-time">{{ dayjs(post.createdAt).format('MM-DD') }}</span>
        </div>
        <h3 class="post-title">{{ post.title }}</h3>
        <p class="post-description">{{ post.description }}</p>
        <div class="post-tags">
          <span v-for="tag in post.tags" :key="tag" class="post-tag">{{ tag }}</span>
        </div>
        <div class="post-footer">
          <div class="members-info">
            <div class="members-avatars">
              <div class="member-avatar">{{ post.publisher.name.charAt(0) }}</div>
              <div class="member-avatar" v-for="i in Math.min(post.currentMembers - 1, 3)" :key="i">?</div>
              <div v-if="post.currentMembers > 4" class="more-members">+{{ post.currentMembers - 4 }}</div>
            </div>
            <span>{{ post.currentMembers }}/{{ post.requiredMembers }}人</span>
          </div>
          <button class="join-btn" @click="joinTeam(post.id)">
            <Users /> 加入
          </button>
        </div>
      </div>
    </div>

    <div v-if="filteredPosts.length === 0" class="empty-state">
      <Users style="font-size: 48px; color: #c0c4cc;" />
      <p>暂无组队需求，发布一个吧！</p>
    </div>

    <ElDialog title="发布组队需求" v-model="showPostDialog" width="500px">
      <ElForm :model="form">
        <ElFormItem label="标题" required>
          <ElInput v-model="form.title" placeholder="请输入组队标题" />
        </ElFormItem>
        <ElFormItem label="类型">
          <ElSelect v-model="form.type">
            <ElOption v-for="type in types" :key="type.value" :label="type.label" :value="type.value" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="描述" required>
          <ElInput v-model="form.description" type="textarea" :rows="4" placeholder="请详细描述组队需求" />
        </ElFormItem>
        <ElFormItem label="标签">
          <div class="tag-selector">
            <button
              v-for="tag in availableTags"
              :key="tag"
              :class="['tag-btn', { active: form.tags.includes(tag) }]"
              @click="toggleTag(tag)"
            >
              {{ tag }}
            </button>
          </div>
        </ElFormItem>
        <ElFormItem label="需要人数">
          <ElInput v-model="form.requiredMembers" type="number" :min="2" :max="20" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="showPostDialog = false">取消</ElButton>
        <ElButton type="primary" @click="postTeamUp">发布</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<style lang="scss" scoped>
.teamup-page {
  .teamup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .search-box {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 300px;
      padding: 8px 16px;
      border: 1px solid #d9d9d9;
      border-radius: 20px;
      color: #909399;

      input {
        flex: 1;
        border: none;
        outline: none;
        font-size: 14px;
      }
    }
  }

  .filter-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid #f0f0f0;

    .type-filter {
      display: flex;
      gap: 8px;

      .type-btn {
        padding: 6px 14px;
        border-radius: 4px;
        border: 1px solid #d9d9d9;
        background: #fff;
        color: #606266;
        font-size: 13px;
        cursor: pointer;

        &:hover {
          border-color: #409eff;
          color: #409eff;
        }

        &.active {
          background: #409eff;
          border-color: #409eff;
          color: #fff;
        }
      }
    }

    .tag-filter {
      display: flex;
      align-items: center;
      gap: 8px;

      .filter-label {
        font-size: 13px;
        color: #606266;
      }

      .tag-btn {
        padding: 4px 10px;
        border-radius: 4px;
        border: 1px solid #d9d9d9;
        background: #fff;
        color: #606266;
        font-size: 12px;
        cursor: pointer;

        &:hover {
          border-color: #409eff;
          color: #409eff;
        }

        &.active {
          background: #ecf5ff;
          border-color: #409eff;
          color: #409eff;
        }
      }
    }
  }

  .posts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
  }

  .post-card {
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    .post-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .type-tag {
        font-size: 12px;
        padding: 4px 10px;
        border-radius: 4px;
      }

      .publish-time {
        font-size: 12px;
        color: #909399;
      }
    }

    .post-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 8px;
    }

    .post-description {
      font-size: 14px;
      color: #606266;
      line-height: 1.5;
      margin-bottom: 12px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .post-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 16px;

      .post-tag {
        font-size: 12px;
        padding: 3px 8px;
        background: #f0f0f0;
        color: #606266;
        border-radius: 4px;
      }
    }

    .post-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 12px;
      border-top: 1px solid #f0f0f0;

      .members-info {
        display: flex;
        align-items: center;
        gap: 8px;

        .members-avatars {
          display: flex;

          .member-avatar {
            width: 24px;
            height: 24px;
            background: #f0f0f0;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            color: #606266;
            border: 2px solid #fff;
            margin-left: -6px;

            &:first-child {
              margin-left: 0;
            }
          }

          .more-members {
            width: 24px;
            height: 24px;
            background: #e8e8e8;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            color: #606266;
            border: 2px solid #fff;
            margin-left: -6px;
          }
        }

        span {
          font-size: 13px;
          color: #606266;
        }
      }

      .join-btn {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 6px 12px;
        background: #409eff;
        color: #fff;
        border: none;
        border-radius: 4px;
        font-size: 13px;
        cursor: pointer;

        &:hover {
          background: #66b1ff;
        }
      }
    }
  }

  .empty-state {
    text-align: center;
    padding: 60px;
    color: #c0c4cc;

    p {
      margin-top: 12px;
      font-size: 14px;
    }
  }

  .tag-selector {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .tag-btn {
      padding: 4px 10px;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      background: #fff;
      color: #606266;
      font-size: 12px;
      cursor: pointer;

      &.active {
        background: #ecf5ff;
        border-color: #409eff;
        color: #409eff;
      }
    }
  }
}
</style>
