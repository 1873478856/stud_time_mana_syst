<script setup lang="ts">import { ref, computed } from 'vue';
import { useUserStore } from '@/stores/user';
import { useRouter } from 'vue-router';
import { ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElButton, ElMessage } from 'element-plus';
import { User, Camera, Lock, Setting, TurnOff } from '@element-plus/icons-vue';
const router = useRouter();
const userStore = useUserStore();
const isEditing = ref(false);
const form = ref({
 name: '',
 email: '',
 studentId: '',
 major: '',
 grade: '',
 campus: ''
});
const majors = ['计算机科学与技术', '软件工程', '人工智能', '信息管理', '网络工程', '其他'];
const grades = ['2020级', '2021级', '2022级', '2023级', '2024级'];
const campuses = ['东校区', '西校区', '南校区', '北校区'];
const currentUser = computed(() => userStore.currentUser);
const editProfile = () => {
 if (!currentUser.value)
 return;
 form.value = {
 name: currentUser.value.name,
 email: currentUser.value.email,
 studentId: currentUser.value.studentId,
 major: currentUser.value.major,
 grade: currentUser.value.grade,
 campus: currentUser.value.campus
 };
 isEditing.value = true;
};
const saveProfile = () => {
 userStore.updateProfile(form.value);
 isEditing.value = false;
 ElMessage.success('资料更新成功');
};
const logout = () => {
 userStore.logout();
 router.push('/login');
};
const verifyCampus = () => {
 if (!currentUser.value?.isVerified) {
 ElMessage.success('校园认证成功！');
 userStore.updateProfile({ isVerified: true });
 }
 else {
 ElMessage.info('您已完成校园认证');
 }
};
</script>

<template>
  <div class="profile-page">
    <div class="profile-header">
      <div class="avatar-section">
        <div class="avatar">
          {{ currentUser?.name?.charAt(0) || 'U' }}
        </div>
        <button class="change-avatar-btn">
          <Camera /> 更换头像
        </button>
      </div>
      <div class="user-info">
        <h1>{{ currentUser?.name }}</h1>
        <div class="user-meta">
          <span>{{ currentUser?.username }}</span>
          <span>{{ currentUser?.studentId }}</span>
          <span :class="['verified-tag', { verified: currentUser?.isVerified }]">
            {{ currentUser?.isVerified ? '已认证' : '未认证' }}
          </span>
        </div>
      </div>
    </div>

    <div class="profile-content">
      <div class="profile-tabs">
        <button
          :class="['tab', { active: !isEditing }]"
          @click="isEditing = false"
        >
          <User /> 个人资料
        </button>
        <button class="tab">
          <Setting /> 设置
        </button>
      </div>

      <div class="profile-form">
        <ElForm v-if="isEditing" :model="form">
          <ElFormItem label="姓名">
            <ElInput v-model="form.name" />
          </ElFormItem>
          <ElFormItem label="邮箱">
            <ElInput v-model="form.email" />
          </ElFormItem>
          <ElFormItem label="学号">
            <ElInput v-model="form.studentId" />
          </ElFormItem>
          <ElFormItem label="专业">
            <ElSelect v-model="form.major">
              <ElOption v-for="m in majors" :key="m" :label="m" :value="m" />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="年级">
            <ElSelect v-model="form.grade">
              <ElOption v-for="g in grades" :key="g" :label="g" :value="g" />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="校区">
            <ElSelect v-model="form.campus">
              <ElOption v-for="c in campuses" :key="c" :label="c" :value="c" />
            </ElSelect>
          </ElFormItem>
          <div class="form-actions">
            <ElButton @click="isEditing = false">取消</ElButton>
            <ElButton type="primary" @click="saveProfile">保存</ElButton>
          </div>
        </ElForm>

        <div v-else class="profile-info">
          <div class="info-item">
            <span class="info-label">姓名</span>
            <span class="info-value">{{ currentUser?.name }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">用户名</span>
            <span class="info-value">{{ currentUser?.username }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">邮箱</span>
            <span class="info-value">{{ currentUser?.email }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">学号</span>
            <span class="info-value">{{ currentUser?.studentId }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">专业</span>
            <span class="info-value">{{ currentUser?.major }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">年级</span>
            <span class="info-value">{{ currentUser?.grade }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">校区</span>
            <span class="info-value">{{ currentUser?.campus }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">注册时间</span>
            <span class="info-value">{{ currentUser?.createdAt?.split('T')[0] }}</span>
          </div>

          <div class="profile-actions">
            <ElButton type="primary" @click="editProfile">编辑资料</ElButton>
            <ElButton @click="verifyCampus">
              <Lock /> {{ currentUser?.isVerified ? '查看认证' : '校园认证' }}
            </ElButton>
            <ElButton type="danger" @click="logout">
              <TurnOff /> 退出登录
            </ElButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.profile-page {
  .profile-header {
    display: flex;
    gap: 32px;
    padding: 32px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    margin-bottom: 24px;

    .avatar-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;

      .avatar {
        width: 120px;
        height: 120px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 48px;
        color: #fff;
        font-weight: 600;
      }

      .change-avatar-btn {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 6px 14px;
        border: 1px dashed #d9d9d9;
        background: #fff;
        border-radius: 4px;
        font-size: 13px;
        color: #606266;
        cursor: pointer;

        &:hover {
          border-color: #409eff;
          color: #409eff;
        }
      }
    }

    .user-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;

      h1 {
        font-size: 24px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 12px;
      }

      .user-meta {
        display: flex;
        gap: 16px;

        span {
          font-size: 14px;
          color: #606266;
        }

        .verified-tag {
          padding: 4px 10px;
          background: #fffbe6;
          color: #e6a23c;
          border-radius: 4px;
          font-size: 12px;

          &.verified {
            background: #f0f9ff;
            color: #409eff;
          }
        }
      }
    }
  }

  .profile-content {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    .profile-tabs {
      display: flex;
      border-bottom: 1px solid #f0f0f0;

      .tab {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 16px 24px;
        border: none;
        background: #fff;
        color: #606266;
        font-size: 15px;
        cursor: pointer;
        border-bottom: 2px solid transparent;
        transition: all 0.2s;

        &:hover {
          color: #409eff;
        }

        &.active {
          color: #409eff;
          border-bottom-color: #409eff;
        }
      }
    }

    .profile-form {
      padding: 24px;
    }

    .profile-info {
      padding: 24px;

      .info-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid #f0f0f0;

        .info-label {
          font-size: 14px;
          color: #606266;
        }

        .info-value {
          font-size: 14px;
          color: #303133;
          font-weight: 500;
        }
      }

      .profile-actions {
        display: flex;
        gap: 12px;
        margin-top: 24px;
        padding-top: 24px;
        border-top: 1px solid #f0f0f0;
      }
    }
  }
}
</style>
