<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-semibold text-gray-800">文件管理</h2>
      <div class="flex gap-2">
        <Button
          label="上传文件"
          icon="pi pi-upload"
          size="small"
          @click="openUploadDialog"
        />
      </div>
    </div>

    <!-- 面包屑导航 -->
    <div class="flex items-center mb-4 text-sm">
      <ol class="flex items-center space-x-1">
        <li
          v-for="(item, index) in breadcrumbs"
          :key="index"
          class="flex items-center"
        >
          <template v-if="index > 0">
            <span class="mx-1 text-gray-500">/</span>
          </template>
          <a
            href="#"
            class="text-blue-600 hover:underline"
            @click.prevent="navigateTo(item.path)"
          >
            {{ item.label }}
          </a>
        </li>
      </ol>
      <Button
        v-if="currentPath"
        icon="pi pi-arrow-up"
        class="p-button-text p-button-sm ml-2"
        @click="navigateUp"
        title="返回上一级"
      />
    </div>

    <DataTable
      :value="files"
      :paginator="true"
      :rows="15"
      class="p-datatable-sm rounded-lg"
      :loading="loading"
      responsiveLayout="scroll"
      :removableSort="true"
      :sortMode="'multiple'"
    >
      <template #empty>
        <div class="text-center">暂无文件数据</div>
      </template>
      <Column field="key" header="文件名" sortable style="width: 30%">
        <template #body="slotProps">
          <div
            class="flex items-center truncate max-w-md cursor-pointer hover:text-blue-600"
            @click="handleFileClick(slotProps.data)"
          >
            <i :class="getFileIcon(slotProps.data)" class="mr-2"></i>
            {{ getFileName(slotProps.data.key) }}
          </div>
        </template>
      </Column>
      <Column field="size" header="大小" sortable style="width: 15%">
        <template #body="slotProps">
          {{ formatFileSize(slotProps.data.size) }}
        </template>
      </Column>
      <Column
        field="lastModified"
        header="修改时间"
        sortable
        style="width: 20%"
      >
        <template #body="slotProps">
          {{ formatDate(slotProps.data.lastModified) }}
        </template>
      </Column>
      <Column header="预览" style="width: 15%">
        <template #body="slotProps">
          <Button
            v-if="!isFolder(slotProps.data)"
            icon="pi pi-eye"
            class="p-button-sm p-button-secondary"
            @click="viewFile(slotProps.data)"
          />
        </template>
      </Column>
      <Column header="操作" style="width: 20%">
        <template #body="slotProps">
          <div class="flex gap-2">
            <Button
              v-if="!isFolder(slotProps.data)"
              icon="pi pi-download"
              class="p-button-sm p-button-success"
              @click="downloadFile(slotProps.data)"
            />
            <Button
              icon="pi pi-pencil"
              class="p-button-sm p-button-info"
              @click="openRenameDialog(slotProps.data)"
            />
            <Button
              icon="pi pi-trash"
              class="p-button-sm p-button-danger"
              @click="confirmDeleteFile(slotProps.data)"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- 上传文件对话框 -->
    <Dialog
      :visible="uploadDialog"
      :style="{ width: '500px' }"
      header="上传文件"
      :modal="true"
      @update:visible="uploadDialog = false"
    >
      <div class="p-fluid">
        <div class="field mb-4">
          <label for="folder">目标文件夹</label>
          <Dropdown
            id="folder"
            v-model="uploadFolder"
            :options="folderOptions"
            optionLabel="name"
            optionValue="value"
            placeholder="选择文件夹"
            class="w-full"
          />
        </div>

        <div class="field mb-4">
          <label for="file">选择文件</label>
          <div
            class="p-4 border-2 border-dashed rounded-lg hover:bg-gray-50 cursor-pointer"
            @click="triggerFileInput"
            @dragover.prevent
            @drop.prevent="onFileDrop"
          >
            <div class="text-center">
              <i class="pi pi-upload text-3xl mb-2"></i>
              <div v-if="!selectedFile">拖拽文件到此处或点击选择文件</div>
              <div v-else>
                已选择: {{ selectedFile.name }} ({{
                  formatFileSize(selectedFile.size)
                }})
              </div>
            </div>
            <input
              type="file"
              ref="fileInput"
              @change="onFileSelect"
              class="hidden"
            />
          </div>
        </div>
      </div>

      <template #footer>
        <Button
          label="取消"
          icon="pi pi-times"
          class="p-button-text"
          @click="uploadDialog = false"
        />
        <Button
          label="上传"
          icon="pi pi-check"
          @click="uploadFile"
          :loading="uploading"
          :disabled="!selectedFile"
        />
      </template>
    </Dialog>

    <!-- 重命名文件对话框 -->
    <Dialog
      :visible="renameDialog"
      :style="{ width: '500px' }"
      header="重命名文件"
      :modal="true"
      @update:visible="renameDialog = false"
    >
      <div class="p-fluid">
        <div class="field mb-4">
          <label for="newFilename">新文件名</label>
          <InputText
            id="newFilename"
            v-model="newFilename"
            required
            class="w-full"
          />
        </div>
      </div>

      <template #footer>
        <Button
          label="取消"
          icon="pi pi-times"
          class="p-button-text"
          @click="renameDialog = false"
        />
        <Button
          label="保存"
          icon="pi pi-check"
          @click="renameFile"
          :loading="renaming"
        />
      </template>
    </Dialog>

    <!-- 文件预览对话框 -->
    <Dialog
      :visible="previewDialog"
      :style="{ width: '80%', maxWidth: '800px' }"
      header="文件预览"
      :modal="true"
      @update:visible="previewDialog = false"
    >
      <div v-if="selectedFileData" class="flex flex-col items-center">
        <h3 class="text-lg font-medium mb-4">
          {{ getFileName(selectedFileData.key) }}
        </h3>

        <!-- 图片预览 -->
        <img
          v-if="isImageFile(selectedFileData.key)"
          :src="getPreviewUrl(selectedFileData)"
          class="max-w-full max-h-[500px] object-contain"
        />

        <!-- PDF预览 -->
        <iframe
          v-else-if="isPdfFile(selectedFileData.key)"
          :src="selectedFileData.url"
          width="100%"
          height="500px"
        ></iframe>

        <!-- 其他文件类型 -->
        <div v-else class="text-center p-4">
          <i class="pi pi-file text-5xl mb-3"></i>
          <p>此文件类型无法直接预览，请下载后查看</p>
          <Button
            label="下载文件"
            icon="pi pi-download"
            class="mt-4"
            @click="downloadFile(selectedFileData)"
          />
        </div>
      </div>

      <template #footer>
        <Button
          label="关闭"
          icon="pi pi-times"
          @click="previewDialog = false"
        />
      </template>
    </Dialog>

    <ConfirmDialog></ConfirmDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import axios from 'axios'

import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import ConfirmDialog from 'primevue/confirmdialog'
import Dropdown from 'primevue/dropdown'

interface FileData {
  key: string
  url: string
  size: number | string
  lastModified: string
  etag?: string
  isFolder?: boolean
}

const confirm = useConfirm()
const toast = useToast()
const fileInput = ref<HTMLInputElement | null>(null)

const files = ref<FileData[]>([])
const loading = ref(false)
const uploading = ref(false)
const renaming = ref(false)

const uploadDialog = ref(false)
const renameDialog = ref(false)
const previewDialog = ref(false)

const selectedFile = ref<File | null>(null)
const selectedFileData = ref<FileData | null>(null)
const newFilename = ref('')
const fileToRename = ref<FileData | null>(null)

const currentPath = ref('')
const breadcrumbs = computed(() => {
  if (!currentPath.value) return [{ label: '根目录', path: '' }]

  const segments = currentPath.value.split('/').filter((s) => s)
  const result = [{ label: '根目录', path: '' }]

  let currentSegmentPath = ''
  for (const segment of segments) {
    currentSegmentPath += segment + '/'
    result.push({
      label: segment,
      path: currentSegmentPath,
    })
  }

  return result
})

const uploadFolder = ref('')

const folderOptions = computed(() => {
  const options = [{ name: '根目录', value: '' }]

  if (currentPath.value) {
    options.push({
      name: `当前目录 (${getFileName(currentPath.value)})`,
      value: currentPath.value,
    })
  }

  const folderPaths = files.value
    .filter((file) => isFolder(file))
    .map((folder) => ({
      name: getFileName(folder.key),
      value: folder.key,
    }))

  return [...options, ...folderPaths]
})

const formatFileSize = (bytes: number | string) => {
  if (bytes === 0 || bytes === '0') return '-'

  const numBytes = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(numBytes) / Math.log(k))

  return parseFloat((numBytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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

const getFileName = (path: string) => {
  if (!path) return ''

  const cleanPath = path.endsWith('/') ? path.slice(0, -1) : path
  const lastPart = cleanPath.split('/').pop()
  return lastPart || path
}

const isImageFile = (filename: string) => {
  const extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp']
  return extensions.some((ext) => filename.toLowerCase().endsWith(ext))
}

const isPdfFile = (filename: string) => {
  return filename.toLowerCase().endsWith('.pdf')
}

const isFolder = (file: FileData) => {
  return file.key.endsWith('/') && (file.size === 0 || file.size === '0')
}

const getFileIcon = (file: FileData) => {
  if (isFolder(file)) return 'pi pi-folder'
  if (isImageFile(file.key)) return 'pi pi-image'
  if (isPdfFile(file.key)) return 'pi pi-file-pdf'
  return 'pi pi-file'
}

const navigateTo = (path: string) => {
  currentPath.value = path
  loadFiles()
}

const navigateUp = () => {
  if (!currentPath.value) return

  const segments = currentPath.value.split('/').filter((s) => s)
  segments.pop()

  currentPath.value = segments.length ? segments.join('/') + '/' : ''
  loadFiles()
}

onMounted(async () => {
  await loadFiles()
})

const loadFiles = async () => {
  loading.value = true
  try {
    let folderParam = currentPath.value

    if (folderParam && folderParam.endsWith('/') && folderParam !== '/') {
      folderParam = folderParam.slice(0, -1)
    }

    const params = currentPath.value ? { folder: folderParam } : {}
    const response = await axios.get('/api/uploads/list', { params })

    if (response.data.code === 200 && response.data.data) {
      const fileList = response.data.data.files || []

      files.value = fileList
        .filter((file: FileData) => {
          if (currentPath.value && file.key === currentPath.value) return false

          if (!currentPath.value) {
            const segments = file.key.split('/').filter((s) => s)
            return (
              segments.length === 1 ||
              (segments.length === 0 && file.key.endsWith('/'))
            )
          } else {
            if (!file.key.startsWith(currentPath.value)) return false
            const remainingPath = file.key.substring(currentPath.value.length)
            const segments = remainingPath.split('/').filter((s) => s)
            return segments.length === 1
          }
        })
        .map((file: FileData) => ({
          ...file,
          isFolder:
            file.key.endsWith('/') && (file.size === 0 || file.size === '0'),
        }))
    } else {
      files.value = []
    }
  } catch (error) {
    console.error('Failed to load files:', error)
    toast.add({
      severity: 'error',
      summary: '加载失败',
      detail: '无法加载文件列表，请稍后再试',
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}

const handleFileClick = (file: FileData) => {
  if (isFolder(file)) {
    navigateTo(file.key)
  } else {
    viewFile(file)
  }
}

const openUploadDialog = () => {
  selectedFile.value = null
  uploadFolder.value = currentPath.value
  uploadDialog.value = true
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const onFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    selectedFile.value = input.files[0]
  }
}

const onFileDrop = (event: DragEvent) => {
  if (event.dataTransfer?.files.length) {
    selectedFile.value = event.dataTransfer.files[0]
  }
}

const uploadFile = async () => {
  if (!selectedFile.value) return

  uploading.value = true

  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)

    if (uploadFolder.value) {
      formData.append('folder', uploadFolder.value)
    }

    await axios.put('/api/uploads/file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    toast.add({
      severity: 'success',
      summary: '上传成功',
      detail: '文件已成功上传',
      life: 3000,
    })

    uploadDialog.value = false
    await loadFiles()
  } catch (error) {
    console.error('Failed to upload file:', error)
    toast.add({
      severity: 'error',
      summary: '上传失败',
      detail: '无法上传文件，请稍后再试',
      life: 3000,
    })
  } finally {
    uploading.value = false
  }
}

const openRenameDialog = (fileData: FileData) => {
  fileToRename.value = fileData
  newFilename.value = getFileName(fileData.key)
  renameDialog.value = true
}

const renameFile = async () => {
  if (!fileToRename.value || !newFilename.value) return

  renaming.value = true

  try {
    await axios.put('/api/uploads/modify', {
      path: fileToRename.value.key,
      newFilename: newFilename.value,
    })

    toast.add({
      severity: 'success',
      summary: '重命名成功',
      detail: '文件已成功重命名',
      life: 3000,
    })

    renameDialog.value = false
    await loadFiles()
  } catch (error) {
    console.error('Failed to rename file:', error)
    toast.add({
      severity: 'error',
      summary: '重命名失败',
      detail: '无法重命名文件，请稍后再试',
      life: 3000,
    })
  } finally {
    renaming.value = false
  }
}

const confirmDeleteFile = (fileData: FileData) => {
  const isFileFolder = isFolder(fileData)
  confirm.require({
    message: `确定要删除${isFileFolder ? '文件夹' : '文件'} "${getFileName(fileData.key)}" 吗？${isFileFolder ? '这将删除文件夹中的所有内容！' : ''}`,
    header: '删除确认',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await axios.delete(`/api/uploads/${encodeURIComponent(fileData.key)}`)

        await loadFiles()

        toast.add({
          severity: 'success',
          summary: '删除成功',
          detail: `${isFileFolder ? '文件夹' : '文件'}已删除`,
          life: 3000,
        })
      } catch (error) {
        console.error('Failed to delete:', error)
        toast.add({
          severity: 'error',
          summary: '删除失败',
          detail: `无法删除${isFileFolder ? '文件夹' : '文件'}，请稍后再试`,
          life: 3000,
        })
      }
    },
  })
}

const viewFile = (fileData: FileData) => {
  selectedFileData.value = fileData
  previewDialog.value = true
}

const getPreviewUrl = (fileData: FileData) => {
  if (isImageFile(fileData.key)) {
    return `/attachments/${fileData.key}`
  }
  return fileData.url
}

const downloadFile = (fileData: FileData) => {
  if (isFolder(fileData)) return

  const link = document.createElement('a')
  link.href = fileData.url
  link.download = getFileName(fileData.key)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>
