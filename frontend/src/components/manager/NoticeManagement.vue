<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-semibold text-gray-800">通知管理</h2>
      <Button
        label="发布通知"
        icon="pi pi-plus"
        size="small"
        @click="openAddNoticeDialog"
      />
    </div>

    <DataTable
      :value="notices"
      :paginator="true"
      :rows="15"
      class="p-datatable-sm rounded-lg"
      :loading="loading"
      responsiveLayout="scroll"
      :removableSort="true"
      :sortMode="'multiple'"
    >
      <template #empty>
        <div class="text-center">暂无通知数据</div>
      </template>
      <Column field="id" header="ID" sortable style="width: 5%"></Column>
      <Column field="title" header="标题" sortable style="width: 20%"></Column>
      <Column field="content" header="内容" style="width: 35%">
        <template #body="slotProps">
          <div class="truncate max-w-md">{{ slotProps.data.content }}</div>
        </template>
      </Column>
      <Column field="readStats" header="阅读状态" style="width: 10%">
        <template #body="slotProps">
          <div v-if="slotProps.data.readStats">
            已读: {{ slotProps.data.readStats.readUsers }}/{{
              slotProps.data.readStats.totalUsers
            }}
          </div>
          <div v-else>
            <i
              class="pi pi-spin pi-spinner"
              v-if="loadingStats[slotProps.data.id]"
            ></i>
            <span v-else>-</span>
          </div>
        </template>
      </Column>
      <Column field="createdAt" header="发布时间" sortable style="width: 15%">
        <template #body="slotProps">
          {{ formatDate(slotProps.data.createdAt) }}
        </template>
      </Column>
      <Column header="操作" style="width: 15%">
        <template #body="slotProps">
          <div class="flex gap-2">
            <Button
              icon="pi pi-eye"
              class="p-button-sm p-button-secondary"
              @click="viewNotice(slotProps.data)"
            />
            <Button
              icon="pi pi-users"
              class="p-button-sm p-button-success"
              @click="viewReadStatus(slotProps.data)"
            />
            <Button
              icon="pi pi-pencil"
              class="p-button-sm p-button-info"
              @click="editNotice(slotProps.data)"
            />
            <Button
              icon="pi pi-trash"
              class="p-button-sm p-button-danger"
              @click="confirmDeleteNotice(slotProps.data)"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <Dialog
      :visible="noticeDialog"
      :style="{ width: '600px' }"
      :header="editMode ? '编辑通知' : '发布通知'"
      :modal="true"
      @update:visible="noticeDialog = false"
    >
      <div class="p-fluid">
        <div class="field mb-4 flex items-center gap-[0.5rem]">
          <label for="title">标题</label>
          <InputText
            id="title"
            v-model="notice.title"
            required
            class="ml-auto w-120"
          />
        </div>

        <div class="field mb-4 flex items-center gap-[0.5rem]">
          <label for="content">内容</label>
          <Textarea
            id="content"
            v-model="notice.content"
            rows="8"
            required
            class="ml-auto w-120"
          />
        </div>
      </div>

      <template #footer>
        <Button
          label="取消"
          icon="pi pi-times"
          class="p-button-text"
          @click="noticeDialog = false"
        />
        <Button
          label="保存"
          icon="pi pi-check"
          @click="saveNotice"
          :loading="saving"
        />
      </template>
    </Dialog>

    <Dialog
      :visible="viewDialog"
      :style="{ width: '600px' }"
      header="通知详情"
      :modal="true"
      @update:visible="viewDialog = false"
    >
      <div v-if="selectedNotice">
        <h3 class="text-xl font-semibold mb-4">{{ selectedNotice.title }}</h3>
        <div class="text-sm text-gray-500 mb-4">
          发布时间: {{ formatDate(selectedNotice.createdAt) }}
          <span class="mx-2">|</span>
          发布人: {{ selectedNotice.authorName }}
        </div>
        <div class="whitespace-pre-line">{{ selectedNotice.content }}</div>
      </div>

      <template #footer>
        <Button label="关闭" icon="pi pi-times" @click="viewDialog = false" />
      </template>
    </Dialog>

    <Dialog
      :visible="readStatusDialog"
      :style="{ width: '800px' }"
      header="阅读状态详情"
      :modal="true"
      @update:visible="readStatusDialog = false"
    >
      <div v-if="selectedReadStatus" class="p-4">
        <div class="mb-4 flex gap-4">
          <div class="p-3 bg-blue-50 rounded-lg flex-1 text-center">
            <div class="text-sm text-gray-600">总用户数</div>
            <div class="text-xl font-bold text-blue-700">
              {{ selectedReadStatus.status.totalUsers }}
            </div>
          </div>
          <div class="p-3 bg-green-50 rounded-lg flex-1 text-center">
            <div class="text-sm text-gray-600">已读用户</div>
            <div class="text-xl font-bold text-green-700">
              {{ selectedReadStatus.status.readUsers }}
            </div>
          </div>
          <div class="p-3 bg-orange-50 rounded-lg flex-1 text-center">
            <div class="text-sm text-gray-600">未读用户</div>
            <div class="text-xl font-bold text-orange-700">
              {{
                selectedReadStatus.status.totalUsers -
                selectedReadStatus.status.readUsers
              }}
            </div>
          </div>
        </div>

        <div class="border-t pt-4">
          <div class="mb-4">
            <div class="font-semibold mb-2 text-lg">已读用户</div>
            <DataTable
              :value="selectedReadStatus.details.read"
              class="p-datatable-sm"
              v-if="selectedReadStatus.details.read.length > 0"
              :sortMode="'multiple'"
              :removableSort="true"
            >
              <Column
                field="uid"
                header="用户ID"
                sortable
                style="width: 15%"
              ></Column>
              <Column
                field="name"
                header="姓名"
                sortable
                style="width: 20%"
              ></Column>
              <Column
                field="username"
                header="用户名"
                sortable
                style="width: 25%"
              ></Column>
              <Column
                field="dept"
                header="部门"
                sortable
                style="width: 40%"
              ></Column>
            </DataTable>
            <div class="text-center text-gray-500 py-2" v-else>
              暂无已读用户
            </div>
          </div>

          <div class="mb-4">
            <div class="font-semibold mb-2 text-lg">未读用户</div>
            <DataTable
              :value="selectedReadStatus.details.unread"
              class="p-datatable-sm"
              v-if="selectedReadStatus.details.unread.length > 0"
              :sortMode="'multiple'"
              :removableSort="true"
            >
              <Column
                field="uid"
                header="用户ID"
                sortable
                style="width: 15%"
              ></Column>
              <Column
                field="name"
                header="姓名"
                sortable
                style="width: 20%"
              ></Column>
              <Column
                field="username"
                header="用户名"
                sortable
                style="width: 25%"
              ></Column>
              <Column
                field="dept"
                header="部门"
                sortable
                style="width: 40%"
              ></Column>
            </DataTable>
            <div class="text-center text-gray-500 py-2" v-else>
              暂无未读用户
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <Button
          label="关闭"
          icon="pi pi-times"
          @click="readStatusDialog = false"
        />
      </template>
    </Dialog>

    <ConfirmDialog></ConfirmDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import axios from 'axios'

import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import ConfirmDialog from 'primevue/confirmdialog'

interface Notice {
  id?: number
  title: string
  content: string
  createdAt?: string
  updatedAt?: string
  authorId?: number
  authorName?: string
  readStats?: {
    readUsers: number
    totalUsers: number
  }
}

interface ReadStatus {
  status: {
    totalUsers: number
    readUsers: number
  }
  details: {
    read: Array<{
      uid: number
      name: string
      username: string
      dept: string
    }>
    unread: Array<{
      uid: number
      name: string
      username: string
      dept: string
    }>
  }
}

const confirm = useConfirm()
const toast = useToast()

const notices = ref<Notice[]>([])
const notice = ref<Notice>({
  title: '',
  content: '',
})
const selectedNotice = ref<Notice | null>(null)
const loading = ref(false)
const saving = ref(false)
const noticeDialog = ref(false)
const viewDialog = ref(false)
const editMode = ref(false)

// 状态变量
const readStatusDialog = ref(false)
const selectedReadStatus = ref<ReadStatus | null>(null)
const loadingStats = ref<Record<number, boolean>>({})

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
  await loadNotices()
})

const loadNotices = async () => {
  loading.value = true
  try {
    // 确保请求带上token（axios 应该已经配置好默认headers）
    const response = await axios.get('/api/notices/list')
    notices.value = response.data.data || []

    // 异步加载每个通知的阅读状态
    notices.value.forEach(async (notice) => {
      if (notice.id) {
        await loadNoticeReadStats(notice.id)
      }
    })
  } catch (error) {
    console.error('Failed to load notices:', error)
    toast.add({
      severity: 'error',
      summary: '加载失败',
      detail: '无法加载通知列表，请稍后再试',
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}

const loadNoticeReadStats = async (noticeId: number) => {
  if (!noticeId) return

  loadingStats.value[noticeId] = true

  try {
    const response = await axios.get(`/api/notices/${noticeId}/status`)
    const index = notices.value.findIndex((n) => n.id === noticeId)

    if (index !== -1 && response.data && response.data.data) {
      notices.value[index] = {
        ...notices.value[index],
        readStats: {
          readUsers: response.data.data.status.readUsers,
          totalUsers: response.data.data.status.totalUsers,
        },
      }
    }
  } catch (error) {
    console.error(`Failed to load read stats for notice ${noticeId}:`, error)
  } finally {
    loadingStats.value[noticeId] = false
  }
}

const viewReadStatus = async (noticeData: Notice) => {
  if (!noticeData.id) return

  try {
    const response = await axios.get(`/api/notices/${noticeData.id}/status`)
    if (response.data && response.data.data) {
      selectedReadStatus.value = response.data.data
      readStatusDialog.value = true
    }
  } catch (error) {
    console.error('Failed to load read status details:', error)
    toast.add({
      severity: 'error',
      summary: '加载失败',
      detail: '无法加载阅读状态详情，请稍后再试',
      life: 3000,
    })
  }
}

const openAddNoticeDialog = () => {
  notice.value = {
    title: '',
    content: '',
  }
  editMode.value = false
  noticeDialog.value = true
}

const editNotice = (noticeData: Notice) => {
  notice.value = { ...noticeData }
  editMode.value = true
  noticeDialog.value = true
}

const viewNotice = async (noticeData: Notice) => {
  selectedNotice.value = noticeData
  viewDialog.value = true
}

const saveNotice = async () => {
  saving.value = true

  try {
    if (editMode.value && notice.value.id) {
      await axios.post('/api/notices/modify', {
        id: notice.value.id,
        title: notice.value.title,
        content: notice.value.content,
      })

      toast.add({
        severity: 'success',
        summary: '更新成功',
        detail: '通知已更新',
        life: 3000,
      })
    } else {
      await axios.post('/api/notices/send', {
        title: notice.value.title,
        content: notice.value.content,
      })

      toast.add({
        severity: 'success',
        summary: '发布成功',
        detail: '通知已发布',
        life: 3000,
      })
    }

    noticeDialog.value = false
    await loadNotices()
  } catch (error) {
    console.error('Failed to save notice:', error)
    toast.add({
      severity: 'error',
      summary: '保存失败',
      detail: '无法保存通知，请稍后再试',
      life: 3000,
    })
  } finally {
    saving.value = false
  }
}

const confirmDeleteNotice = (noticeData: Notice) => {
  confirm.require({
    message: `确定要删除通知 "${noticeData.title}" 吗？`,
    header: '删除确认',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await axios.delete(`/api/notices/delete/${noticeData.id}`)

        await loadNotices()

        toast.add({
          severity: 'success',
          summary: '删除成功',
          detail: '通知已删除',
          life: 3000,
        })
      } catch (error) {
        console.error('Failed to delete notice:', error)
        toast.add({
          severity: 'error',
          summary: '删除失败',
          detail: '无法删除通知，请稍后再试',
          life: 3000,
        })
      }
    },
  })
}
</script>
