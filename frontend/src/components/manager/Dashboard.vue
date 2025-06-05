<template>
  <div>
    <h1 class="text-2xl font-semibold mb-6">系统仪表盘</h1>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <!-- 三个统计卡片保持不变 -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex justify-center items-center rounded-full bg-[var(--background-color-primary--hover)] p-3 mr-4">
            <i class="block pi pi-users text-[var(--color-primary)] text-xl"></i>
          </div>
          <div>
            <h3 class="text-sm font-semibold text-[var(--color-text--subtle)]">用户总数</h3>
            <p class="text-3xl font-semibold text-[var(--color-primary)]">
              {{ stats.userCount }}
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex justify-center items-center rounded-full bg-[var(--background-color-primary--hover)] p-3 mr-4">
            <i class="block pi pi-bell text-[var(--color-primary)] text-xl"></i>
          </div>
          <div>
            <h3 class="text-sm font-semibold text-[var(--color-text--subtle)]">通知总数</h3>
            <p class="text-3xl font-semibold text-[var(--color-primary)]">
              {{ stats.noticeCount }}
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex justify-center items-center rounded-full bg-[var(--background-color-primary--hover)] p-3 mr-4">
            <i class="block pi pi-images text-[var(--color-primary)] text-xl"></i>
          </div>
          <div>
            <h3 class="text-sm font-semibold text-[var(--color-text--subtle)]">相册总数</h3>
            <p class="text-3xl font-semibold text-[var(--color-primary)]">
              {{ stats.albumCount }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 最近通知表格保持不变 -->
    <div class="bg-white rounded-lg shadow p-6 mb-8">
      <h2 class="text-xl font-semibold mb-4">最近通知</h2>
      <DataTable
        :value="recentNotices"
        :rows="5"
        stripedRows
        v-if="recentNotices.length > 0"
      >
        <Column field="title" header="标题"></Column>
        <Column field="createdAt" header="发布时间">
          <template #body="slotProps">
            {{ formatDate(slotProps.data.createdAt) }}
          </template>
        </Column>
        <Column field="authorName" header="发布人"></Column>
      </DataTable>
      <div v-else class="text-center py-4 text-gray-500">暂无通知数据</div>
    </div>

    <!-- 系统信息区块 -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold mb-4">系统信息</h2>
      <div class="grid grid-cols-2 gap-4">
        <!-- 原有系统信息字段 -->
        <div>
          <p class="text-gray-600">项目名称</p>
          <p class="font-semibold">
            {{ systemInfo.project_name || '学生管理系统' }}
          </p>
        </div>
        <div>
          <p class="text-gray-600">版本</p>
          <p class="font-semibold">{{ systemInfo.version || '1.0.0' }}</p>
        </div>
        <div>
          <p class="text-gray-600">环境</p>
          <p class="font-semibold">
            {{ systemInfo.environment || 'development' }}
          </p>
        </div>
        <div>
          <p class="text-gray-600">运行时间</p>
          <p class="font-semibold">{{ systemInfo.uptime || 'N/A' }}</p>
        </div>
        
        <!-- 新增修改密码按钮 -->
        <div class="col-span-2">
          <Button 
            label="修改密码" 
            @click="showDialog = true" 
            icon="pi pi-key" 
            class="w-full"
          />
        </div>
      </div>
    </div>

    <!-- 密码修改对话框 -->
    <Dialog v-model:visible="showDialog" header="修改密码" :modal="true">
      <div class="flex flex-col gap-4">
        <div class="field">
          <label for="old_password">旧密码</label>
          <InputText 
            id="old_password" 
            v-model="form.old_password" 
            type="password" 
            class="w-full"
          />
        </div>
        <div class="field">
          <label for="new_password">新密码</label>
          <InputText 
            id="new_password" 
            v-model="form.new_password" 
            type="password" 
            class="w-full"
          />
        </div>
        <div class="field">
          <label for="confirm_password">确认新密码</label>
          <InputText 
            id="confirm_password" 
            v-model="form.confirm_password" 
            type="password" 
            class="w-full"
          />
        </div>
      </div>
      <template #footer>
        <Button label="取消" @click="showDialog = false" text />
        <Button 
          label="提交" 
          @click="submitPasswordChange" 
          :loading="isSubmitting" 
          icon="pi pi-check"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'

interface Notice {
  id: number
  title: string
  createdAt: string
  authorName: string
}

interface Stats {
  userCount: number
  noticeCount: number
  albumCount: number
}

interface SystemInfo {
  project_name: string
  version: string
  environment: string
  uptime: string
  [key: string]: any
}

const toast = useToast()
const showDialog = ref(false)
const form = ref({
  old_password: '',
  new_password: '',
  confirm_password: ''
})
const isSubmitting = ref(false)

const recentNotices = ref<Notice[]>([])
const stats = ref<Stats>({
  userCount: 0,
  noticeCount: 0,
  albumCount: 0,
})
const systemInfo = ref<SystemInfo>({
  project_name: '',
  version: '',
  environment: '',
  uptime: '',
})

const validateForm = () => {
  if (!form.value.old_password || !form.value.new_password) {
    toast.add({ severity: 'warn', summary: '警告', detail: '请填写所有必填项', life: 3000 })
    return false
  }
  if (form.value.new_password !== form.value.confirm_password) {
    toast.add({ severity: 'warn', summary: '警告', detail: '新密码输入不一致', life: 3000 })
    return false
  }
  return true
}

const submitPasswordChange = async () => {
  if (!validateForm()) return
  
  isSubmitting.value = true
  try {
    const { data } = await axios.put('/api/auth/modify/password', {
      old_password: form.value.old_password,
      new_password: form.value.new_password
    })
    
    toast.add({
      severity: 'success',
      summary: '成功',
      detail: data.data.message,
      life: 3000
    })
    showDialog.value = false
    form.value = { old_password: '', new_password: '', confirm_password: '' }
  } catch (error: any) {
    const message = error.response?.data?.msg || '修改失败'
    toast.add({
      severity: 'error',
      summary: '错误',
      detail: message,
      life: 3000
    })
  } finally {
    isSubmitting.value = false
  }
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''

  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

onMounted(async () => {
  try {
    const response = await axios.get('/api')
    systemInfo.value = response.data.data
  } catch (error) {
    console.error('Failed to load system info:', error)
  }

  try {
    const response = await axios.get('/api/notices/list')
    recentNotices.value = (response.data.data || []).slice(0, 5)
  } catch (error) {
    console.error('Failed to load notices:', error)
  }

  try {
    const [usersResponse, noticesResponse, albumsResponse] = await Promise.all([
      axios.get('/api/users/list'),
      axios.get('/api/notices/list'),
      axios.get('/api/albums'),
    ])

    stats.value = {
      userCount: (usersResponse.data.data || []).length,
      noticeCount: (noticesResponse.data.data || []).length,
      albumCount: (albumsResponse.data.data || []).length,
    }
  } catch (error) {
    console.error('Failed to load stats:', error)
  }
})
</script>
