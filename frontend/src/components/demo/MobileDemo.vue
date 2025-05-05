<template>
  <div class="h-full overflow-auto bg-gray-50 relative flex flex-col">
    <div class="bg-primary text-white p-4 shadow-md flex items-center">
      <i class="pi pi-android text-xl mr-2"></i>
      <h1 class="text-xl font-bold">Demo</h1>
    </div>

    <div class="p-4 flex-1 overflow-auto pb-16">
      <div v-if="activeTab === 'users'">
        <Card class="mb-4">
          <template #title>
            <div class="flex items-center">
              <i class="pi pi-users mr-2"></i>
              <span>用户管理</span>
            </div>
          </template>
          <template #content>
            <Accordion :activeIndex="0">
              <AccordionTab header="用户列表">
                <DataTable
                  :value="users"
                  :paginator="true"
                  :rows="5"
                  class="mb-4"
                  responsiveLayout="scroll"
                >
                  <Column field="uid" header="ID"></Column>
                  <Column field="username" header="用户名"></Column>
                  <Column field="trueName" header="姓名"></Column>
                  <Column field="sex" header="性别"></Column>
                  <Column field="dept" header="班级"></Column>
                  <Column field="role" header="角色">
                    <template #body="slotProps">
                      <Badge
                        :value="slotProps.data.role === 1 ? '学生' : '管理员'"
                        :severity="
                          slotProps.data.role === 1 ? 'info' : 'warning'
                        "
                      ></Badge>
                    </template>
                  </Column>
                </DataTable>
              </AccordionTab>

              <AccordionTab header="添加用户">
                <div class="p-fluid">
                  <div class="field mb-3">
                    <label for="username" class="block mb-1">用户名</label>
                    <InputText
                      id="username"
                      v-model="newUser.username"
                      placeholder="学号"
                    />
                  </div>
                  <div class="field mb-3">
                    <label for="password" class="block mb-1">密码</label>
                    <Password
                      id="password"
                      v-model="newUser.password"
                      placeholder="密码"
                      :feedback="false"
                      toggleMask
                    />
                  </div>
                  <div class="field mb-3">
                    <label for="trueName" class="block mb-1">姓名</label>
                    <InputText
                      id="trueName"
                      v-model="newUser.trueName"
                      placeholder="真实姓名"
                    />
                  </div>
                  <div class="field mb-3">
                    <label for="sex" class="block mb-1">性别</label>
                    <Dropdown
                      id="sex"
                      v-model="newUser.sex"
                      :options="['男', '女']"
                      placeholder="选择性别"
                    />
                  </div>
                  <div class="field mb-3">
                    <label for="telephone" class="block mb-1">手机号</label>
                    <InputText
                      id="telephone"
                      v-model="newUser.telephone"
                      placeholder="联系电话"
                    />
                  </div>
                  <div class="field mb-3">
                    <label for="birth" class="block mb-1">出生日期</label>
                    <Calendar
                      id="birth"
                      v-model="newUser.birth"
                      dateFormat="yy-mm-dd"
                      placeholder="选择日期"
                    />
                  </div>
                  <div class="field mb-3">
                    <label for="dept" class="block mb-1">班级</label>
                    <InputText
                      id="dept"
                      v-model="newUser.dept"
                      placeholder="班级"
                    />
                  </div>
                  <div class="field mb-3">
                    <label for="role" class="block mb-1">角色</label>
                    <Dropdown
                      id="role"
                      v-model="newUser.role"
                      :options="[
                        { name: '学生', value: 1 },
                        { name: '管理员', value: 0 },
                      ]"
                      optionLabel="name"
                      optionValue="value"
                      placeholder="选择角色"
                    />
                  </div>
                  <Button
                    label="添加用户"
                    icon="pi pi-plus"
                    class="w-full"
                    @click="addUser"
                  />
                </div>
              </AccordionTab>

              <AccordionTab header="个人信息">
                <div class="p-4 bg-white rounded-lg shadow">
                  <div class="flex items-center mb-4">
                    <Avatar
                      icon="pi pi-user"
                      size="large"
                      class="mr-3"
                      style="background-color: #2196f3; color: #ffffff"
                    />
                    <div>
                      <h3 class="text-lg font-bold">
                        {{ currentUser.trueName }}
                      </h3>
                      <p class="text-sm text-gray-600">
                        {{ currentUser.dept }}
                      </p>
                    </div>
                  </div>
                  <div class="grid grid-cols-1 gap-4 mb-4">
                    <div
                      class="flex justify-between py-2 border-b border-gray-200"
                    >
                      <span class="text-gray-600">学号</span>
                      <span class="font-medium">{{
                        currentUser.username
                      }}</span>
                    </div>
                    <div
                      class="flex justify-between py-2 border-b border-gray-200"
                    >
                      <span class="text-gray-600">性别</span>
                      <span class="font-medium">{{ currentUser.sex }}</span>
                    </div>
                    <div
                      class="flex justify-between py-2 border-b border-gray-200"
                    >
                      <span class="text-gray-600">手机号</span>
                      <span class="font-medium">{{
                        currentUser.telephone
                      }}</span>
                    </div>
                    <div
                      class="flex justify-between py-2 border-b border-gray-200"
                    >
                      <span class="text-gray-600">出生日期</span>
                      <span class="font-medium">{{ currentUser.birth }}</span>
                    </div>
                  </div>
                  <div class="flex gap-2">
                    <Button
                      label="修改信息"
                      icon="pi pi-pencil"
                      outlined
                      class="flex-1"
                    />
                    <Button
                      label="修改密码"
                      icon="pi pi-lock"
                      severity="secondary"
                      outlined
                      class="flex-1"
                    />
                  </div>
                </div>
              </AccordionTab>
            </Accordion>
          </template>
        </Card>
      </div>

      <div v-if="activeTab === 'auth'">
        <Card class="mb-4">
          <template #title>
            <div class="flex items-center">
              <i class="pi pi-shield mr-2"></i>
              <span>认证服务</span>
            </div>
          </template>
          <template #content>
            <div class="p-fluid">
              <div class="field mb-3">
                <label for="auth-username" class="block mb-1">用户名</label>
                <InputText
                  id="auth-username"
                  v-model="loginForm.username"
                  placeholder="请输入用户名"
                />
              </div>
              <div class="field mb-3">
                <label for="auth-password" class="block mb-1">密码</label>
                <Password
                  id="auth-password"
                  v-model="loginForm.password"
                  placeholder="请输入密码"
                  toggleMask
                  :feedback="false"
                />
              </div>
              <Button
                label="登录"
                icon="pi pi-sign-in"
                class="w-full mb-3"
                @click="login"
              />

              <div class="flex justify-between">
                <Button
                  label="刷新令牌"
                  icon="pi pi-refresh"
                  outlined
                  class="flex-1 mr-2"
                />
                <Button
                  label="注销"
                  icon="pi pi-sign-out"
                  severity="danger"
                  outlined
                  class="flex-1"
                />
              </div>
            </div>

            <Divider align="center">
              <span class="text-sm text-gray-500">令牌信息</span>
            </Divider>

            <div
              v-if="auth.token"
              class="mt-4 p-3 bg-gray-50 rounded-lg text-sm"
            >
              <p class="font-bold mb-1">访问令牌:</p>
              <p class="text-gray-700 break-all mb-3">{{ auth.token }}</p>
              <p class="font-bold mb-1">刷新令牌:</p>
              <p class="text-gray-700 break-all">{{ auth.refreshToken }}</p>
            </div>
          </template>
        </Card>
      </div>

      <div v-if="activeTab === 'notices'">
        <Card class="mb-4">
          <template #title>
            <div class="flex items-center">
              <i class="pi pi-bell mr-2"></i>
              <span>通知管理</span>
            </div>
          </template>
          <template #content>
            <Accordion :activeIndex="0">
              <AccordionTab header="通知列表">
                <DataTable
                  :value="notices"
                  :paginator="true"
                  :rows="3"
                  class="mb-4"
                  responsiveLayout="stack"
                >
                  <Column field="title" header="标题"></Column>
                  <Column field="createdAt" header="发布时间">
                    <template #body="slotProps">
                      {{ new Date(slotProps.data.createdAt).toLocaleString() }}
                    </template>
                  </Column>
                  <Column field="authorName" header="发布人"></Column>
                  <Column header="操作">
                    <template #body="slotProps">
                      <Button
                        icon="pi pi-eye"
                        rounded
                        text
                        @click="viewNotice(slotProps.data)"
                      />
                    </template>
                  </Column>
                </DataTable>
              </AccordionTab>

              <AccordionTab header="发布通知">
                <div class="p-fluid">
                  <div class="field mb-3">
                    <label for="notice-title" class="block mb-1">标题</label>
                    <InputText
                      id="notice-title"
                      v-model="newNotice.title"
                      placeholder="通知标题"
                    />
                  </div>
                  <div class="field mb-3">
                    <label for="notice-content" class="block mb-1">内容</label>
                    <Textarea
                      id="notice-content"
                      v-model="newNotice.content"
                      rows="5"
                      autoResize
                      placeholder="通知内容"
                    />
                  </div>
                  <Button
                    label="发布通知"
                    icon="pi pi-send"
                    class="w-full"
                    @click="publishNotice"
                  />
                </div>
              </AccordionTab>
            </Accordion>

            <!-- 通知详情对话框 -->
            <Dialog
              v-model:visible="noticeDialogVisible"
              :style="{ width: '90%' }"
              header="通知详情"
              :modal="true"
            >
              <div v-if="selectedNotice">
                <h3 class="text-xl font-bold mb-2">
                  {{ selectedNotice.title }}
                </h3>
                <div class="flex justify-between text-sm text-gray-500 mb-4">
                  <span>{{ selectedNotice.authorName }}</span>
                  <span>{{
                    new Date(selectedNotice.createdAt).toLocaleString()
                  }}</span>
                </div>
                <p class="whitespace-pre-line">
                  {{ selectedNotice.content }}
                </p>
              </div>
            </Dialog>
          </template>
        </Card>
      </div>

      <div v-if="activeTab === 'albums'">
        <Card class="mb-4">
          <template #title>
            <div class="flex items-center">
              <i class="pi pi-images mr-2"></i>
              <span>景区相册</span>
            </div>
          </template>
          <template #content>
            <div class="mb-4 flex justify-between items-center">
              <Dropdown
                v-model="selectedAlbumType"
                :options="albumTypes"
                optionLabel="name"
                placeholder="选择相册类型"
                class="mr-2"
              />
              <Button
                icon="pi pi-plus"
                rounded
                severity="success"
                @click="showAddAlbumDialog"
                v-if="isAdmin"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div
                v-for="album in albums"
                :key="album.id"
                class="cursor-pointer"
                @click="viewAlbum(album)"
              >
                <Card class="h-full">
                  <template #header>
                    <img
                      :src="album.coverPath"
                      alt="相册封面"
                      class="w-full h-40 object-cover"
                    />
                  </template>
                  <template #title>
                    <div class="text-base font-bold truncate">
                      {{ album.title }}
                    </div>
                  </template>
                  <template #subtitle>
                    <Badge :value="album.typeName" />
                  </template>
                  <template #content>
                    <p class="text-sm text-gray-600 line-clamp-2">
                      {{ album.describe }}
                    </p>
                  </template>
                </Card>
              </div>
            </div>

            <Dialog
              v-model:visible="albumDialogVisible"
              :style="{ width: '90%' }"
              header="相册详情"
              :modal="true"
            >
              <div v-if="selectedAlbum">
                <h3 class="text-xl font-bold mb-2">
                  {{ selectedAlbum.title }}
                </h3>
                <p class="text-sm text-gray-600 mb-4">
                  {{ selectedAlbum.describe }}
                </p>

                <Carousel
                  :value="getAlbumImages(selectedAlbum)"
                  :numVisible="1"
                  :numScroll="1"
                >
                  <template #item="slotProps">
                    <div class="flex justify-center">
                      <img
                        :src="slotProps.data"
                        :alt="selectedAlbum.title"
                        class="w-full h-64 object-cover rounded-lg"
                      />
                    </div>
                  </template>
                </Carousel>

                <div class="flex justify-between mt-4 text-sm text-gray-500">
                  <span
                    >创建于:
                    {{
                      new Date(selectedAlbum.createTime).toLocaleDateString()
                    }}</span
                  >
                  <span
                    >更新于:
                    {{
                      new Date(selectedAlbum.updateTime).toLocaleDateString()
                    }}</span
                  >
                </div>
              </div>
            </Dialog>

            <Dialog
              v-model:visible="addAlbumDialogVisible"
              :style="{ width: '90%' }"
              header="添加相册"
              :modal="true"
            >
              <div class="p-fluid">
                <div class="field mb-3">
                  <label for="album-title" class="block mb-1">标题</label>
                  <InputText
                    id="album-title"
                    v-model="newAlbum.title"
                    placeholder="相册标题"
                  />
                </div>
                <div class="field mb-3">
                  <label for="album-describe" class="block mb-1">描述</label>
                  <Textarea
                    id="album-describe"
                    v-model="newAlbum.describe"
                    rows="3"
                    autoResize
                    placeholder="相册描述"
                  />
                </div>
                <div class="field mb-3">
                  <label for="album-type" class="block mb-1">类型</label>
                  <Dropdown
                    id="album-type"
                    v-model="newAlbum.type"
                    :options="albumTypes"
                    optionLabel="name"
                    optionValue="id"
                    placeholder="选择类型"
                  />
                </div>
                <div class="field mb-3">
                  <label class="block mb-1">封面图片</label>
                  <FileUpload
                    mode="basic"
                    name="coverImage"
                    url="./upload"
                    accept="image/*"
                    :maxFileSize="1000000"
                    @upload="onUpload"
                  />
                </div>
                <div class="field mb-3">
                  <label class="block mb-1">相册图片</label>
                  <FileUpload
                    name="albumImages"
                    url="./upload"
                    multiple
                    accept="image/*"
                    :maxFileSize="1000000"
                    @upload="onUpload"
                  />
                </div>
                <Button
                  label="添加相册"
                  icon="pi pi-plus"
                  class="w-full"
                  @click="addAlbum"
                />
              </div>
            </Dialog>
          </template>
        </Card>
      </div>
    </div>

    <div
      class="absolute bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200"
    >
      <div class="flex justify-around">
        <div
          @click="activeTab = 'users'"
          class="flex flex-col items-center py-2 px-4 cursor-pointer"
          :class="{
            'text-primary': activeTab === 'users',
            'text-gray-500': activeTab !== 'users',
          }"
        >
          <i class="pi pi-users text-xl"></i>
          <span class="text-xs mt-1">用户</span>
        </div>
        <div
          @click="activeTab = 'auth'"
          class="flex flex-col items-center py-2 px-4 cursor-pointer"
          :class="{
            'text-primary': activeTab === 'auth',
            'text-gray-500': activeTab !== 'auth',
          }"
        >
          <i class="pi pi-shield text-xl"></i>
          <span class="text-xs mt-1">认证</span>
        </div>
        <div
          @click="activeTab = 'notices'"
          class="flex flex-col items-center py-2 px-4 cursor-pointer"
          :class="{
            'text-primary': activeTab === 'notices',
            'text-gray-500': activeTab !== 'notices',
          }"
        >
          <i class="pi pi-bell text-xl"></i>
          <span class="text-xs mt-1">通知</span>
        </div>
        <div
          @click="activeTab = 'albums'"
          class="flex flex-col items-center py-2 px-4 cursor-pointer"
          :class="{
            'text-primary': activeTab === 'albums',
            'text-gray-500': activeTab !== 'albums',
          }"
        >
          <i class="pi pi-images text-xl"></i>
          <span class="text-xs mt-1">相册</span>
        </div>
      </div>
      <Toast />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import Card from 'primevue/card'
import Accordion from 'primevue/accordion'
import AccordionTab from 'primevue/accordiontab'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Badge from 'primevue/badge'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import Button from 'primevue/button'
import Avatar from 'primevue/avatar'
import Dialog from 'primevue/dialog'
import Divider from 'primevue/divider'
import Textarea from 'primevue/textarea'
import Carousel from 'primevue/carousel'
import FileUpload from 'primevue/fileupload'
import Toast from 'primevue/toast'

const toast = useToast()

const activeTab = ref('users')

const users = ref([
  {
    uid: 1,
    username: '245810101',
    trueName: '林檬',
    sex: '男',
    telephone: '13300000000',
    birth: '2006-05-18',
    dept: '24计应(3+2)1',
    role: 1,
    regtime: '2025-05-03T08:30:00Z',
  },
  {
    uid: 2,
    username: 'admin',
    trueName: '管理员',
    sex: '男',
    telephone: '13300000001',
    birth: '1990-01-01',
    dept: '信息系',
    role: 0,
    regtime: '2024-01-01T00:00:00Z',
  },
])

const newUser = reactive({
  username: '',
  password: '',
  trueName: '',
  sex: '男',
  telephone: '',
  birth: null,
  dept: '',
  role: 1,
})

const currentUser = reactive({
  uid: 1,
  username: '245810101',
  trueName: '林檬',
  sex: '男',
  telephone: '13300000000',
  birth: '2006-05-18',
  dept: '24计应(3+2)1',
  role: 1,
})

const loginForm = reactive({
  username: '',
  password: '',
})

const auth = reactive({
  token: '',
  refreshToken: '',
  isLoggedIn: false,
})

const notices = ref([
  {
    id: 1,
    title: '期末考试安排通知',
    content:
      '期末考试将于2023年7月1日开始，请各位同学做好准备...\n\n请携带学生证和身份证，不要迟到。\n\n祝大家考试顺利！',
    createdAt: '2023-06-15T10:30:00Z',
    updatedAt: '2023-06-16T08:15:00Z',
    authorId: 1,
    authorName: '张老师',
  },
  {
    id: 2,
    title: '放假通知',
    content:
      '根据学校安排，本学期将于2023年7月15日正式结束，暑假从7月16日开始，9月1日开学报到。',
    createdAt: '2023-06-20T14:20:00Z',
    updatedAt: '2023-06-20T14:20:00Z',
    authorId: 1,
    authorName: '张老师',
  },
])

const newNotice = reactive({
  title: '',
  content: '',
})

const noticeDialogVisible = ref(false)
const selectedNotice = ref(null)

const albums = ref([
  {
    id: 1,
    title: '九寨沟风景区',
    coverPath:
      'https://img.freepik.com/free-photo/beautiful-view-mountains-landscape_23-2150822879.jpg',
    describe: '美丽的童话世界',
    type: 1,
    loopPicPath:
      'https://img.freepik.com/free-photo/beautiful-view-mountains-landscape_23-2150822879.jpg,https://img.freepik.com/free-photo/beautiful-shot-tree-covered-mountains-with-fog_181624-19466.jpg',
    createTime: '2023-02-08T19:49:30Z',
    updateTime: '2023-02-09T09:59:18Z',
    typeName: '自然风景',
  },
  {
    id: 2,
    title: '长城',
    coverPath:
      'https://img.freepik.com/free-photo/great-wall-china_1232-3111.jpg',
    describe: '中国古代伟大的建筑奇迹',
    type: 2,
    loopPicPath:
      'https://img.freepik.com/free-photo/great-wall-china_1232-3111.jpg,https://img.freepik.com/free-photo/aerial-shot-great-wall-china_181624-9815.jpg',
    createTime: '2023-03-10T15:30:20Z',
    updateTime: '2023-03-12T11:20:15Z',
    typeName: '人文景观',
  },
])

const albumTypes = ref([
  { id: 1, name: '自然风景' },
  { id: 2, name: '人文景观' },
  { id: 3, name: '城市景观' },
])

const selectedAlbumType = ref(null)
const albumDialogVisible = ref(false)
const selectedAlbum = ref(null)
const addAlbumDialogVisible = ref(false)

const newAlbum = reactive({
  title: '',
  describe: '',
  type: null,
  coverPath: '',
  loopPicPath: '',
})

const isAdmin = ref(true)

const addUser = () => {
  users.value.push({
    ...newUser,
    uid: users.value.length + 1,
    regtime: new Date().toISOString(),
  })

  toast.add({
    severity: 'success',
    summary: '添加成功',
    detail: `用户 ${newUser.username} 已成功添加`,
    life: 3000,
  })

  Object.keys(newUser).forEach((key) => {
    newUser[key] = key === 'sex' ? '男' : key === 'role' ? 1 : ''
  })
}

const login = () => {
  if (loginForm.username && loginForm.password) {
    auth.token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    auth.refreshToken = '550e8400-e29b-41d4-a716-446655440000'
    auth.isLoggedIn = true

    toast.add({
      severity: 'success',
      summary: '登录成功',
      detail: `欢迎回来，${loginForm.username}`,
      life: 3000,
    })
  } else {
    toast.add({
      severity: 'error',
      summary: '登录失败',
      detail: '请输入用户名和密码',
      life: 3000,
    })
  }
}

const viewNotice = (notice) => {
  selectedNotice.value = notice
  noticeDialogVisible.value = true
}

const publishNotice = () => {
  if (newNotice.title && newNotice.content) {
    notices.value.push({
      id: notices.value.length + 1,
      title: newNotice.title,
      content: newNotice.content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authorId: 1,
      authorName: '当前用户',
    })

    toast.add({
      severity: 'success',
      summary: '发布成功',
      detail: '通知已成功发布',
      life: 3000,
    })

    newNotice.title = ''
    newNotice.content = ''
  } else {
    toast.add({
      severity: 'error',
      summary: '发布失败',
      detail: '请填写标题和内容',
      life: 3000,
    })
  }
}

const viewAlbum = (album) => {
  selectedAlbum.value = album
  albumDialogVisible.value = true
}

const getAlbumImages = (album) => {
  return album.loopPicPath.split(',')
}

const showAddAlbumDialog = () => {
  addAlbumDialogVisible.value = true
}

const addAlbum = () => {
  if (newAlbum.title && newAlbum.describe && newAlbum.type) {
    const type = albumTypes.value.find((t) => t.id === newAlbum.type)

    albums.value.push({
      id: albums.value.length + 1,
      title: newAlbum.title,
      describe: newAlbum.describe,
      type: newAlbum.type,
      typeName: type ? type.name : '',
      coverPath:
        'https://img.freepik.com/free-photo/beautiful-scenery-rock-formations-by-sea-reine-village-norway_181624-19742.jpg',
      loopPicPath:
        'https://img.freepik.com/free-photo/beautiful-scenery-rock-formations-by-sea-reine-village-norway_181624-19742.jpg',
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString(),
    })

    toast.add({
      severity: 'success',
      summary: '添加成功',
      detail: '相册已成功添加',
      life: 3000,
    })

    addAlbumDialogVisible.value = false
    Object.keys(newAlbum).forEach((key) => {
      newAlbum[key] = ''
    })
  } else {
    toast.add({
      severity: 'error',
      summary: '添加失败',
      detail: '请填写完整的相册信息',
      life: 3000,
    })
  }
}

const onUpload = () => {
  toast.add({
    severity: 'info',
    summary: '上传模拟',
    detail: '这是一个虚拟展示，上传功能被模拟',
    life: 3000,
  })
}

onMounted(() => {
  toast.add({
    severity: 'info',
    summary: '虚拟展示',
    detail: '这是一个API功能的虚拟展示，不会实际调用API',
    life: 5000,
  })
})
</script>

<style lang="scss">
:root {
  --android-primary: #2196f3;
  --android-accent: #ff9800;
}

.bg-primary {
  background-color: var(--android-primary);
}

.text-primary {
  color: var(--android-primary);
}

@media (max-width: 640px) {
  .p-accordion .p-accordion-header .p-accordion-header-link {
    padding: 0.75rem 1rem;
  }
}
</style>
