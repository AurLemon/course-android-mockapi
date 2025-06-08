<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-semibold text-gray-800">用户管理</h2>
      <Button
        label="添加用户"
        icon="pi pi-plus"
        size="small"
        @click="openAddUserDialog"
        v-if="isSuperAdmin"
      />
    </div>

    <DataTable
      :value="users"
      :paginator="true"
      :rows="15"
      class="p-datatable-sm rounded-lg"
      :loading="loading"
      responsiveLayout="scroll"
      :removableSort="true"
      :sortMode="'multiple'"
    >
      <template #empty>
        <div class="text-center">暂无用户数据</div>
      </template>
      <Column field="uid" header="ID" sortable style="width: 5%"></Column>
      <Column
        field="username"
        header="学号"
        sortable
        style="width: 15%"
      ></Column>
      <Column
        field="trueName"
        header="姓名"
        sortable
        style="width: 10%"
      ></Column>
      <Column field="sex" header="性别" style="width: 5%"></Column>
      <Column field="telephone" header="电话" style="width: 15%"></Column>
      <Column field="birth" header="出生日期" style="width: 10%"></Column>
      <Column field="dept" header="专业班级" style="width: 10%"></Column>
      <Column field="regtime" header="注册时间" style="width: 15%">
        <template #body="slotProps">
          {{ formatDateTime(slotProps.data.regtime) }}
        </template>
      </Column>
      <Column field="balance" header="余额" style="width: 5%">
        <template #body="slotProps"> {{ slotProps.data.balance }} 元 </template>
      </Column>
      <Column field="role" header="角色" style="width: 10%">
        <template #body="slotProps">
          <Badge
            :value="
              slotProps.data.role !== 1
                ? slotProps.data.role === 0
                  ? '管理员'
                  : '超级管理员'
                : '学生'
            "
            :severity="slotProps.data.role !== 1 ? 'danger' : 'success'"
          />
        </template>
      </Column>
      <Column header="操作" style="width: 10%" v-if="isSuperAdmin">
        <template #body="slotProps">
          <div class="flex gap-2">
            <Button
              icon="pi pi-pencil"
              class="p-button-sm p-button-info"
              @click="editUser(slotProps.data)"
            />
            <Button
              icon="pi pi-key"
              class="p-button-sm p-button-help"
              @click="openChangePasswordDialog(slotProps.data)"
            />
            <Button
              icon="pi pi-trash"
              class="p-button-sm p-button-danger"
              @click="confirmDeleteUser(slotProps.data)"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <Dialog
      v-model:visible="changePasswordDialog"
      header="修改密码"
      :style="{ width: '400px' }"
      :modal="true"
    >
      <div class="p-fluid">
        <div class="field">
          <label for="newPassword">新密码</label>
          <Password
            id="newPassword"
            v-model="newPassword"
            toggleMask
            :feedback="false"
            class="w-full"
          />
        </div>
      </div>
      <template #footer>
        <Button
          label="取消"
          icon="pi pi-times"
          class="p-button-text"
          @click="changePasswordDialog = false"
        />
        <Button
          label="确认修改"
          icon="pi pi-check"
          @click="changeUserPassword"
          :loading="changingPassword"
        />
      </template>
    </Dialog>

    <Dialog
      :visible="userDialog"
      :style="{ width: '500px' }"
      :header="editMode ? '编辑用户' : '添加用户'"
      :modal="true"
      @update:visible="userDialog = false"
    >
      <div class="p-fluid">
        <div class="field mb-4 flex items-center gap-[0.5rem]">
          <label for="username">学号</label>
          <InputText
            id="username"
            v-model="user.username"
            :disabled="editMode"
            class="ml-auto w-80"
            required
          />
        </div>

        <div class="field mb-4 flex items-center gap-[0.5rem]" v-if="!editMode">
          <label for="password">密码</label>
          <Password
            id="password"
            v-model="user.password"
            :feedback="false"
            class="ml-auto w-80"
            toggleMask
            required
          />
        </div>

        <div class="field mb-4 flex items-center gap-[0.5rem]">
          <label for="trueName">真实姓名</label>
          <InputText
            id="trueName"
            v-model="user.trueName"
            class="ml-auto w-80"
          />
        </div>

        <div class="field mb-4 flex items-center gap-[0.5rem]">
          <label for="sex">性别</label>
          <Dropdown
            id="sex"
            v-model="user.sex"
            class="ml-auto w-80"
            :options="['男', '女']"
            placeholder="选择性别"
          />
        </div>

        <div class="field mb-4 flex items-center gap-[0.5rem]">
          <label for="telephone">电话</label>
          <InputText
            id="telephone"
            v-model="user.telephone"
            class="ml-auto w-80"
          />
        </div>

        <div class="field mb-4 flex items-center gap-[0.5rem]">
          <label for="birth">出生日期</label>
          <Calendar
            id="birth"
            v-model="birthDate"
            class="ml-auto w-80"
            dateFormat="yy-mm-dd"
            :showIcon="true"
          />
        </div>

        <div class="field mb-4 flex items-center gap-[0.5rem]">
          <label for="dept">专业班级</label>
          <InputText id="dept" v-model="user.dept" class="ml-auto w-80" />
        </div>

        <div
          v-if="isSuperAdmin"
          class="field mb-4 flex items-center gap-[0.5rem]"
        >
          <label for="role">角色</label>
          <Dropdown
            id="role"
            v-model="user.role"
            :options="[
              { label: '超级管理员', value: 2 },
              { label: '管理员', value: 0 },
              { label: '学生', value: 1 },
            ]"
            optionLabel="label"
            optionValue="value"
            class="ml-auto w-80"
            placeholder="选择角色"
          />
        </div>
      </div>

      <template #footer>
        <Button
          label="取消"
          icon="pi pi-times"
          class="p-button-text"
          @click="userDialog = false"
        />
        <Button
          label="保存"
          icon="pi pi-check"
          @click="saveUser"
          :loading="saving"
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
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { useAuthStore } from '@/stores/auth'

dayjs.extend(utc)
dayjs.extend(timezone)

import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import Password from 'primevue/password'
import Badge from 'primevue/badge'
import ConfirmDialog from 'primevue/confirmdialog'

interface User {
  uid?: number
  username: string
  password?: string
  trueName?: string
  sex?: string
  telephone?: string
  birth?: string
  dept?: string
  role: number
  regtime?: string
  balance?: number
}

const authStore = useAuthStore()

const confirm = useConfirm()
const toast = useToast()

const users = ref<User[]>([])
const user = ref<User>({
  username: '',
  password: '',
  trueName: '',
  sex: '',
  telephone: '',
  birth: '',
  dept: '',
  role: 1,
})
const loading = ref(false)
const saving = ref(false)
const userDialog = ref(false)
const editMode = ref(false)
const birthDate = ref<Date | null>(null)

const changePasswordDialog = ref(false)
const selectedUser = ref<User | null>(null)
const newPassword = ref('')
const changingPassword = ref(false)

const isSuperAdmin = computed(() => authStore.currentUser?.role === 2)

const openChangePasswordDialog = (userData: User) => {
  selectedUser.value = userData
  newPassword.value = ''
  changePasswordDialog.value = true
}

const changeUserPassword = async () => {
  if (!newPassword.value) {
    toast.add({
      severity: 'warn',
      summary: '警告',
      detail: '新密码不能为空',
      life: 3000,
    })
    return
  }

  changingPassword.value = true
  try {
    await axios.put('/api/auth/modify/password/admin', {
      uid: selectedUser.value?.uid,
      new_password: newPassword.value.toString(),
    })

    toast.add({
      severity: 'success',
      summary: '修改成功',
      detail: '用户密码已更新',
      life: 3000,
    })
    changePasswordDialog.value = false
  } catch (error) {
    console.error('修改密码失败:', error)
    toast.add({
      severity: 'error',
      summary: '修改失败',
      detail: '密码更新失败，请稍后重试',
      life: 3000,
    })
  } finally {
    changingPassword.value = false
  }
}

const formatDateTime = (datetime: string) => {
  if (!datetime) return ''
  return dayjs(datetime).format('YYYY-MM-DD HH:mm:ss')
}

const birthDateFormatted = computed(() => {
  if (!birthDate.value) return ''

  const date = new Date(birthDate.value)
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')

  return `${yyyy}-${mm}-${dd}`
})

onMounted(async () => {
  await loadUsers()
})

const loadUsers = async () => {
  loading.value = true
  try {
    const response = await axios.get('/api/users/list')
    users.value = response.data.data || []
  } catch (error) {
    console.error('Failed to load users:', error)
    toast.add({
      severity: 'error',
      summary: '加载失败',
      detail: '无法加载用户列表，请稍后再试',
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}

const openAddUserDialog = () => {
  user.value = {
    username: '',
    password: '123456',
    trueName: '',
    sex: '',
    telephone: '',
    birth: '',
    dept: '',
    role: 1,
  }
  birthDate.value = null
  editMode.value = false
  userDialog.value = true
}

const editUser = (userData: User) => {
  user.value = { ...userData }

  if (userData.birth) {
    birthDate.value = new Date(userData.birth)
  } else {
    birthDate.value = null
  }

  editMode.value = true
  userDialog.value = true
}

const saveUser = async () => {
  saving.value = true

  try {
    if (birthDate.value) {
      user.value.birth = birthDateFormatted.value
    }

    if (editMode.value) {
      const payload: any = {
        uid: user.value.uid,
        trueName: user.value.trueName,
        sex: user.value.sex,
        telephone: user.value.telephone,
        birth: user.value.birth,
        dept: user.value.dept,
      }

      if (isSuperAdmin.value) {
        payload.role = user.value.role
      }

      await axios.put('/api/users/info/modify', payload)

      toast.add({
        severity: 'success',
        summary: '更新成功',
        detail: '用户信息已更新',
        life: 3000,
      })
    } else {
      await axios.post('/api/users/add', user.value)

      toast.add({
        severity: 'success',
        summary: '添加成功',
        detail: '新用户已创建',
        life: 3000,
      })
    }

    userDialog.value = false
    await loadUsers()
  } catch (error) {
    console.error('Failed to save user:', error)
    toast.add({
      severity: 'error',
      summary: '保存失败',
      detail: '无法保存用户信息，请稍后再试',
      life: 3000,
    })
  } finally {
    saving.value = false
  }
}

const confirmDeleteUser = (userData: User) => {
  confirm.require({
    message: `确定要删除用户 "${userData.trueName || userData.username}" 吗？`,
    header: '删除确认',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await axios.delete(`/api/users/delete/${userData.uid}`)

        await loadUsers()

        toast.add({
          severity: 'success',
          summary: '删除成功',
          detail: '用户已删除',
          life: 3000,
        })
      } catch (error) {
        console.error('Failed to delete user:', error)
        toast.add({
          severity: 'error',
          summary: '删除失败',
          detail: '无法删除用户，请稍后再试',
          life: 3000,
        })
      }
    },
  })
}
</script>
