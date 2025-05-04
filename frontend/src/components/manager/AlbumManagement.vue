<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800">相册管理</h2>
      <Button label="发布相册" icon="pi pi-plus" @click="openAddAlbumDialog" />
    </div>

    <DataTable
      :value="albums"
      :paginator="true"
      :rows="10"
      class="p-datatable-sm"
      :loading="loading"
      stripedRows
      responsiveLayout="scroll"
    >
      <Column field="id" header="ID" sortable style="width: 5%"></Column>
      <Column field="title" header="标题" sortable style="width: 15%"></Column>
      <Column header="封面" style="width: 10%">
        <template #body="slotProps">
          <img
            :src="slotProps.data.coverPath"
            class="w-16 h-16 object-cover rounded-md"
            :alt="slotProps.data.title"
            @error="handleImageError"
          />
        </template>
      </Column>
      <Column field="describe" header="描述" style="width: 20%">
        <template #body="slotProps">
          <div class="truncate max-w-md">{{ slotProps.data.describe }}</div>
        </template>
      </Column>
      <Column field="typeName" header="分类" sortable style="width: 10%">
        <template #body="slotProps">
          <Tag :value="slotProps.data.typeName" />
        </template>
      </Column>
      <Column field="createTime" header="创建时间" sortable style="width: 15%">
        <template #body="slotProps">
          {{ formatDate(slotProps.data.createTime) }}
        </template>
      </Column>
      <Column header="操作" style="width: 15%">
        <template #body="slotProps">
          <div class="flex gap-2">
            <Button
              icon="pi pi-eye"
              class="p-button-sm p-button-secondary"
              @click="viewAlbum(slotProps.data)"
            />
            <Button
              icon="pi pi-pencil"
              class="p-button-sm p-button-info"
              @click="editAlbum(slotProps.data)"
            />
            <Button
              icon="pi pi-trash"
              class="p-button-sm p-button-danger"
              @click="confirmDeleteAlbum(slotProps.data)"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <Dialog
      :visible="albumDialog"
      :style="{ width: '700px' }"
      :header="editMode ? '编辑相册' : '发布相册'"
      :modal="true"
      @update:visible="albumDialog = false"
    >
      <div class="p-fluid">
        <div class="field mb-4">
          <label for="title">标题</label>
          <InputText id="title" v-model="album.title" required />
        </div>

        <div class="field mb-4">
          <label for="type">分类</label>
          <Dropdown
            id="type"
            v-model="album.type"
            :options="albumTypes"
            optionLabel="name"
            optionValue="id"
            placeholder="选择相册分类"
          />
        </div>

        <div class="field mb-4">
          <label for="describe">描述</label>
          <Textarea id="describe" v-model="album.describe" rows="3" />
        </div>

        <div class="field mb-4">
          <label for="coverPath">封面图路径</label>
          <InputText id="coverPath" v-model="album.coverPath" required />
        </div>

        <div class="mb-2">
          <label class="block mb-1">封面预览</label>
          <div class="bg-gray-100 p-2 rounded-md flex justify-center">
            <img
              :src="album.coverPath"
              class="max-w-full h-40 object-contain"
              alt="封面预览"
              @error="handleImageError"
            />
          </div>
        </div>

        <div class="field mb-4">
          <label for="loopPicPath">轮播图路径 (多个图片用逗号分隔)</label>
          <Textarea
            id="loopPicPath"
            v-model="album.loopPicPath"
            rows="3"
            required
          />
        </div>

        <div class="mb-4">
          <label class="block mb-1">轮播图预览</label>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div
              v-for="(path, index) in loopPicPaths"
              :key="index"
              class="bg-gray-100 p-2 rounded-md"
            >
              <img
                :src="path"
                class="w-full h-24 object-cover rounded"
                :alt="`轮播图 ${index + 1}`"
                @error="handleImageError"
              />
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <Button
          label="取消"
          icon="pi pi-times"
          class="p-button-text"
          @click="albumDialog = false"
        />
        <Button
          label="保存"
          icon="pi pi-check"
          @click="saveAlbum"
          :loading="saving"
        />
      </template>
    </Dialog>

    <Dialog
      :visible="viewDialog"
      :style="{ width: '800px' }"
      header="相册详情"
      :modal="true"
      @update:visible="viewDialog = false"
    >
      <div v-if="selectedAlbum" class="p-4">
        <div class="flex mb-6 gap-4">
          <img
            :src="selectedAlbum.coverPath"
            class="w-40 h-40 object-cover rounded-md shadow-md"
            :alt="selectedAlbum.title"
            @error="handleImageError"
          />
          <div>
            <h3 class="text-2xl font-bold mb-2">{{ selectedAlbum.title }}</h3>
            <p class="text-gray-600 mb-2">{{ selectedAlbum.describe }}</p>
            <div class="flex items-center gap-2">
              <Tag :value="selectedAlbum.typeName" severity="info" />
              <span class="text-sm text-gray-500"
                >创建于：{{ formatDate(selectedAlbum.createTime) }}</span
              >
            </div>
          </div>
        </div>

        <h4 class="text-lg font-semibold mb-3">轮播图预览</h4>
        <Carousel
          :value="getLoopPicPaths(selectedAlbum)"
          :numVisible="1"
          :numScroll="1"
          class="mb-4"
        >
          <template #item="slotProps">
            <div class="flex justify-center p-2">
              <img
                :src="slotProps.data"
                class="max-w-full max-h-96 object-contain rounded-md"
                @error="handleImageError"
              />
            </div>
          </template>
        </Carousel>
      </div>

      <template #footer>
        <Button label="关闭" icon="pi pi-times" @click="viewDialog = false" />
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
import Textarea from 'primevue/textarea'
import Dropdown from 'primevue/dropdown'
import Tag from 'primevue/tag'
import ConfirmDialog from 'primevue/confirmdialog'
import Carousel from 'primevue/carousel'

interface AlbumType {
  id: number
  name: string
}

interface Album {
  id?: number
  title: string
  coverPath: string
  describe: string
  type: number
  loopPicPath: string
  typeName?: string
  createTime?: string
  updateTime?: string
}

const confirm = useConfirm()
const toast = useToast()

const albums = ref<Album[]>([])
const albumTypes = ref<AlbumType[]>([])
const album = ref<Album>({
  title: '',
  coverPath: '',
  describe: '',
  type: 1,
  loopPicPath: '',
})
const selectedAlbum = ref<Album | null>(null)
const loading = ref(false)
const saving = ref(false)
const albumDialog = ref(false)
const viewDialog = ref(false)
const editMode = ref(false)

const loopPicPaths = computed(() => {
  if (!album.value.loopPicPath) return []
  return album.value.loopPicPath.split(',').map((path) => path.trim())
})

const getLoopPicPaths = (albumData: Album) => {
  if (!albumData.loopPicPath) return []
  return albumData.loopPicPath.split(',').map((path) => path.trim())
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = ''
}

const formatDate = (dateStr: string | undefined) => {
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

const loadAlbums = async () => {
  loading.value = true
  try {
    const response = await axios.get('/api/albums')
    albums.value = response.data.data || []
  } catch (error) {
    console.error('Failed to load albums:', error)
    toast.add({
      severity: 'error',
      summary: '加载失败',
      detail: '无法加载相册列表，请稍后再试',
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}

const loadAlbumTypes = async () => {
  try {
    const response = await axios.get('/api/albums/types')
    albumTypes.value = response.data.data || []
  } catch (error) {
    console.error('Failed to load album types:', error)
    toast.add({
      severity: 'error',
      summary: '加载失败',
      detail: '无法加载相册类型，请稍后再试',
      life: 3000,
    })
  }
}

onMounted(async () => {
  await Promise.all([loadAlbums(), loadAlbumTypes()])
})

const openAddAlbumDialog = () => {
  album.value = {
    title: '',
    coverPath: '',
    describe: '',
    type: 1,
    loopPicPath: '',
  }
  editMode.value = false
  albumDialog.value = true
}

const editAlbum = (albumData: Album) => {
  album.value = { ...albumData }
  editMode.value = true
  albumDialog.value = true
}

const viewAlbum = (albumData: Album) => {
  selectedAlbum.value = albumData
  viewDialog.value = true
}

const saveAlbum = async () => {
  saving.value = true

  try {
    if (editMode.value && album.value.id) {
      await axios.put(`/api/albums/modify/${album.value.id}`, {
        title: album.value.title,
        coverPath: album.value.coverPath,
        describe: album.value.describe,
        type: album.value.type,
        loopPicPath: album.value.loopPicPath,
      })

      toast.add({
        severity: 'success',
        summary: '更新成功',
        detail: '相册信息已更新',
        life: 3000,
      })
    } else {
      // 添加新相册
      await axios.post('/api/albums/send', {
        title: album.value.title,
        coverPath: album.value.coverPath,
        describe: album.value.describe,
        type: album.value.type,
        loopPicPath: album.value.loopPicPath,
      })

      toast.add({
        severity: 'success',
        summary: '发布成功',
        detail: '新相册已发布',
        life: 3000,
      })
    }

    albumDialog.value = false
    await loadAlbums()
  } catch (error) {
    console.error('Failed to save album:', error)
    toast.add({
      severity: 'error',
      summary: '保存失败',
      detail: '无法保存相册信息，请稍后再试',
      life: 3000,
    })
  } finally {
    saving.value = false
  }
}

const confirmDeleteAlbum = (albumData: Album) => {
  confirm.require({
    message: `确定要删除相册 "${albumData.title}" 吗？`,
    header: '删除确认',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await axios.delete(`/api/albums/delete/${albumData.id}`)

        await loadAlbums()

        toast.add({
          severity: 'success',
          summary: '删除成功',
          detail: '相册已删除',
          life: 3000,
        })
      } catch (error) {
        console.error('Failed to delete album:', error)
        toast.add({
          severity: 'error',
          summary: '删除失败',
          detail: '无法删除相册，请稍后再试',
          life: 3000,
        })
      }
    },
  })
}
</script>
