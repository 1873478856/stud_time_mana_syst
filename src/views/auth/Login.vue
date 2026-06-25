<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { mockUser } from '@/data/mockData'
import { ElForm, ElFormItem, ElInput, ElButton, ElCheckbox, ElMessage, ElLink } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const form = ref({
  username: '',
  password: '',
  remember: false
})

const loading = ref(false)

const handleLogin = async () => {
  if (!form.value.username || !form.value.password) {
    ElMessage.warning('请输入用户名和密码')
    return
  }
  
  loading.value = true
  
  await new Promise(resolve => setTimeout(resolve, 800))
  
  const registeredUser = userStore.validateLogin(form.value.username, form.value.password)
  if (registeredUser) {
    userStore.login(registeredUser)
    ElMessage.success('登录成功')
    router.push('/')
  } else if (form.value.username === mockUser.username && form.value.password === '123456') {
    userStore.login(mockUser)
    ElMessage.success('登录成功')
    router.push('/')
  } else {
    ElMessage.error('用户名或密码错误')
  }
  
  loading.value = false
}
</script>

<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <div class="logo">
          <span class="logo-icon">S</span>
          <span class="logo-text">StuTim</span>
        </div>
        <p class="slogan">大学生时间管理与任务协作平台</p>
      </div>
      <ElForm :model="form" class="login-form">
        <ElFormItem>
          <ElInput
            v-model="form.username"
            placeholder="学号 / 用户名"
            prefix-icon="User"
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
            show-password
          />
        </ElFormItem>
        <ElFormItem class="form-row">
          <ElCheckbox v-model="form.remember">记住我</ElCheckbox>
          <ElLink type="primary" @click="router.push('/register')">注册账号</ElLink>
        </ElFormItem>
        <ElFormItem>
          <ElButton
            type="primary"
            size="large"
            class="login-btn"
            :loading="loading"
            @click="handleLogin"
            native-type="button"
          >
            登录
          </ElButton>
        </ElFormItem>
        <div class="login-tips">
          <p>测试账号：zhangsan / 123456</p>
        </div>
      </ElForm>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  .login-container {
    background: #fff;
    border-radius: 16px;
    padding: 48px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    width: 420px;

    .login-header {
      text-align: center;
      margin-bottom: 32px;

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

    .login-form {
      .form-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .login-btn {
        width: 100%;
        height: 44px;
        font-size: 16px;
      }

      .login-tips {
        text-align: center;
        margin-top: 20px;

        p {
          color: #c0c4cc;
          font-size: 12px;
        }
      }
    }
  }
}
</style>