<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">系统仪表盘</h1>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="rounded-full bg-blue-100 p-3 mr-4">
            <i class="pi pi-users text-blue-500 text-xl"></i>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-700">用户总数</h3>
            <p class="text-3xl font-bold text-blue-600">
              {{ stats.userCount }}
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="rounded-full bg-green-100 p-3 mr-4">
            <i class="pi pi-bell text-green-500 text-xl"></i>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-700">通知总数</h3>
            <p class="text-3xl font-bold text-green-600">
              {{ stats.noticeCount }}
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="rounded-full bg-purple-100 p-3 mr-4">
            <i class="pi pi-images text-purple-500 text-xl"></i>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-700">相册总数</h3>
            <p class="text-3xl font-bold text-purple-600">
              {{ stats.albumCount }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow p-6 mb-8">
      <h2 class="text-xl font-bold mb-4">最近通知</h2>

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

    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-bold mb-4">系统信息</h2>

      <div class="grid grid-cols-2 gap-4">
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

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
