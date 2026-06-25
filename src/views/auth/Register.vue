<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElForm, ElFormItem, ElInput, ElButton, ElMessage, ElLink, ElSelect, ElOption } from 'element-plus'
import { User, Lock, Message, OfficeBuilding } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const form = ref({
  username: '',
  email: '',
  studentId: '',
  password: '',
  confirmPassword: '',
  major: '',
  grade: '',
  campus: ''
})

const majors = ['计算机科学与技术', '软件工程', '人工智能', '信息管理', '网络工程', '其他']
const grades = ['2020级', '2021级', '2022级', '2023级', '2024级']
const campuses = ['东校区', '西校区', '南校区', '北校区']

const loading = ref(false)

const handleRegister = async () => {
  if (!form.value.username || !form.value.password || !form.value.email) {
    ElMessage.warning('请填写必填项')
    return
  }
  
  if (form.value.password !== form.value.confirmPassword) {
    ElMessage.error('两次密码不一致')
    return
  }
  
  loading.value = true
  
  await new Promise(resolve => setTimeout(resolve, 800))
  
  const newUser = {
    id: Date.now().toString(),
    username: form.value.username,
    email: form.value.email,
    studentId: form.value.studentId,
    password: form.value.password,
    avatar: '',
    name: form.value.username,
    major: form.value.major,
    grade: form.value.grade,
    campus: form.value.campus,
    isVerified: false,
    createdAt: new Date().toISOString()
  }
  
  userStore.register(newUser)
  ElMessage.success('注册成功，请登录')
  router.push('/login')
  
  loading.value = false
}
</script>

<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-header">
        <div class="logo">
          <span class="logo-icon">S</span>
          <span class="logo-text">StuTim</span>
        </div>
        <p class="slogan">创建账号，开启高效学习之旅</p>
      </div>
      <ElForm :model="form" class="register-form">
        <ElFormItem>
          <ElInput
            v-model="form.username"
            placeholder="用户名"
            prefix-icon="User"
            size="large"
          />
        </ElFormItem>
        <ElFormItem>
          <ElInput
            v-model="form.email"
            placeholder="邮箱"
            prefix-icon="Message"
            size="large"
          />
        </ElFormItem>
        <ElFormItem>
          <ElInput
            v-model="form.studentId"
            placeholder="学号（选填）"
            prefix-icon="OfficeBuilding"
            size="large"
          />
        </ElFormItem>
        <ElFormItem>
          <ElInput
            v-model="form.password"
            type="password"
            placeholder="密码"
            prefix-icon="Lock"
            size="large"
          />
        </ElFormItem>
        <ElFormItem>
          <ElInput
            v-model="form.confirmPassword"
            type="password"
            placeholder="确认密码"
            prefix-icon="Lock"
            size="large"
          />
        </ElFormItem>
        <div class="form-row">
          <ElFormItem>
            <ElSelect v-model="form.major" placeholder="专业" size="large" style="width: 160px;">
              <ElOption v-for="m in majors" :key="m" :label="m" :value="m" />
            </ElSelect>
          </ElFormItem>
          <ElFormItem>
            <ElSelect v-model="form.grade" placeholder="年级" size="large" style="width: 100px;">
              <ElOption v-for="g in grades" :key="g" :label="g" :value="g" />
            </ElSelect>
          </ElFormItem>
          <ElFormItem>
            <ElSelect v-model="form.campus" placeholder="校区" size="large" style="width: 100px;">
              <ElOption v-for="c in campuses" :key="c" :label="c" :value="c" />
            </ElSelect>
          </ElFormItem>
        </div>
        <ElFormItem>
          <ElButton
            type="primary"
            size="large"
            class="register-btn"
            :loading="loading"
            @click="handleRegister"
            native-type="button"
          >
            注册
          </ElButton>
        </ElFormItem>
        <div class="register-tips">
          <ElLink type="primary" @click="router.push('/login')">已有账号？立即登录</ElLink>
        </div>
      </ElForm>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  .register-container {
    background: #fff;
    border-radius: 16px;
    padding: 40px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    width: 460px;

    .register-header {
      text-align: center;
      margin-bottom: 28px;

      .logo {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        margin-bottom: 12px;

        .logo-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 24px;
          font-weight: bold;
        }

        .logo-text {
          font-size: 28px;
          font-weight: bold;
          color: #303133;
        }
      }

      .slogan {
        color: #909399;
        font-size: 14px;
      }
    }

    .register-form {
      .form-row {
        display: flex;
        gap: 12px;
      }

      .register-btn {
        width: 100%;
        height: 44px;
        font-size: 16px;
      }

      .register-tips {
        text-align: center;
        margin-top: 20px;
      }
    }
  }
}
</style>
