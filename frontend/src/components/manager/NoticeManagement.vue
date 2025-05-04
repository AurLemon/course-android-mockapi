<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-semibold text-gray-800">通知管理</h2>
      <Button label="发布通知" icon="pi pi-plus" size="small" @click="openAddNoticeDialog" />
    </div>

    <DataTable
      :value="notices"
      :paginator="true"
      :rows="15"
      class="p-datatable-sm rounded-lg"
      :loading="loading"
      :rowClass="rowClass"
      responsiveLayout="scroll"
      :emptyMessage="'暂无通知数据'"
      :removableSort="true"
      :sortMode="'multiple'"
      style="min-height: 300px"
    >
      <Column field="id" header="ID" sortable style="width: 5%"></Column>
      <Column field="title" header="标题" sortable style="width: 25%"></Column>
      <Column field="content" header="内容" style="width: 40%">
        <template #body="slotProps">
          <div class="truncate max-w-md">{{ slotProps.data.content }}</div>
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
          <InputText id="title" v-model="notice.title" required class="ml-auto w-120" />
        </div>

        <div class="field mb-4 flex items-center gap-[0.5rem]">
          <label for="content">内容</label>
          <Textarea id="content" v-model="notice.content" rows="8" required class="ml-auto w-120" />
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

const rowClass = (data) => {
  return {
    'bg-blue-50': data.id % 2 === 0,
    'bg-gray-50': data.id % 2 !== 0,
  }
}

onMounted(async () => {
  await loadNotices()
})

const loadNotices = async () => {
  loading.value = true
  try {
    const response = await axios.get('/api/notices/list')
    notices.value = response.data.data || []
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
