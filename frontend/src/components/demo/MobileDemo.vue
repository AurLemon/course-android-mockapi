<template>
  <div class="demo h-full overflow-auto bg-gray-50 relative flex flex-col">
    <div class="bg-primary text-white p-4 shadow-md flex items-center">
      <i class="pi pi-android text-xl mr-2"></i>
      <h1 class="text-xl font-bold">景区导览App</h1>
      <div class="ml-auto" v-if="isLoggedIn">
        <Badge
          :value="currentUser.role === 1 ? '学生' : '管理员'"
          :severity="currentUser.role === 1 ? 'info' : 'warning'"
        />
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="p-4 flex-1 overflow-auto pb-16">
      <!-- 首页 -->
      <div v-if="activeTab === 'home'">
        <Card class="mb-4">
          <template #title>
            <div class="flex items-center">
              <i class="pi pi-home mr-2"></i>
              <span>首页</span>
            </div>
          </template>
          <template #content>
            <div class="p-4">
              <h3 class="text-lg font-bold mb-4">欢迎使用景区导览App</h3>

              <div
                v-if="isLoggedIn"
                class="flex items-center mb-6 bg-blue-50 p-4 rounded-lg"
              >
                <Avatar
                  icon="pi pi-user"
                  size="large"
                  class="mr-3"
                  style="background-color: #2196f3; color: #ffffff"
                />
                <div>
                  <h3 class="text-lg font-bold">{{ currentUser.trueName }}</h3>
                  <p class="text-sm text-gray-600">{{ currentUser.dept }}</p>
                </div>
              </div>

              <div v-else class="bg-blue-50 p-4 rounded-lg mb-6">
                <p class="mb-2">请登录以使用完整功能</p>
                <Button
                  label="去登录"
                  icon="pi pi-sign-in"
                  @click="activeTab = 'profile'"
                />
              </div>

              <h4 class="font-bold mb-2">最新通知</h4>
              <div v-if="notices.length > 0" class="mb-4">
                <div
                  v-for="notice in notices.slice(0, 2)"
                  :key="notice.id"
                  class="border-b pb-2 mb-2 cursor-pointer"
                  @click="viewNotice(notice)"
                >
                  <div class="flex justify-between">
                    <h5 class="font-medium">{{ notice.title }}</h5>
                    <span class="text-xs text-gray-500">
                      {{ new Date(notice.createdAt).toLocaleDateString() }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-600 truncate">
                    {{ notice.content }}
                  </p>
                </div>
                <Button
                  label="查看全部"
                  text
                  @click="activeTab = 'notices'"
                  class="p-0"
                />
              </div>

              <h4 class="font-bold mb-2">景区相册</h4>
              <div class="grid grid-cols-2 gap-2 mb-2">
                <div
                  v-for="album in albums.slice(0, 2)"
                  :key="album.id"
                  class="cursor-pointer"
                  @click="viewAlbum(album)"
                >
                  <Card class="h-full">
                    <template #header>
                      <img
                        :src="album.coverPath"
                        alt="相册封面"
                        class="w-full h-24 object-cover"
                      />
                    </template>
                    <template #title>
                      <div class="text-sm font-bold truncate">
                        {{ album.title }}
                      </div>
                    </template>
                  </Card>
                </div>
              </div>
              <Button
                label="查看全部"
                text
                @click="activeTab = 'albums'"
                class="p-0"
              />
            </div>
          </template>
        </Card>
      </div>

      <!-- 通知页面 -->
      <div v-if="activeTab === 'notices'">
        <Card class="mb-4">
          <template #title>
            <div class="flex items-center">
              <i class="pi pi-bell mr-2"></i>
              <span>通知管理</span>
            </div>
          </template>
          <template #content>
            <div v-if="isAdmin" class="mb-4">
              <Button
                label="发布通知"
                icon="pi pi-plus"
                @click="showAddNoticeForm = true"
              />
            </div>

            <div v-if="showAddNoticeForm" class="mb-4 p-3 border rounded-lg">
              <h4 class="text-lg font-bold mb-2">发布新通知</h4>
              <div class="field mb-3">
                <label for="notice-title" class="block mb-1">标题</label>
                <InputText
                  id="notice-title"
                  v-model="newNotice.title"
                  placeholder="通知标题"
                  class="w-full"
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
                  class="w-full"
                />
              </div>
              <div class="flex gap-2">
                <Button label="发布" icon="pi pi-send" @click="publishNotice" />
                <Button
                  label="取消"
                  icon="pi pi-times"
                  outlined
                  @click="showAddNoticeForm = false"
                />
              </div>
            </div>

            <DataTable
              :value="notices"
              :paginator="true"
              :rows="5"
              class="mb-4"
              responsiveLayout="stack"
              :loading="loadingNotices"
            >
              <Column field="title" header="标题">
                <template #body="slotProps">
                  <div
                    class="cursor-pointer text-blue-600"
                    @click="viewNotice(slotProps.data)"
                  >
                    {{ slotProps.data.title }}
                  </div>
                </template>
              </Column>
              <Column field="createdAt" header="发布时间">
                <template #body="slotProps">
                  {{ new Date(slotProps.data.createdAt).toLocaleString() }}
                </template>
              </Column>
              <Column field="authorName" header="发布人"></Column>
              <Column v-if="isAdmin" header="操作">
                <template #body="slotProps">
                  <div class="flex gap-1">
                    <Button
                      icon="pi pi-pencil"
                      rounded
                      text
                      @click="editNotice(slotProps.data)"
                    />
                    <Button
                      icon="pi pi-trash"
                      rounded
                      text
                      severity="danger"
                      @click="confirmDeleteNotice(slotProps.data)"
                    />
                  </div>
                </template>
              </Column>
            </DataTable>

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
                <p class="whitespace-pre-line">{{ selectedNotice.content }}</p>
              </div>
            </Dialog>

            <!-- 删除确认框 -->
            <Dialog
              v-model:visible="deleteNoticeDialogVisible"
              header="确认删除"
              :style="{ width: '350px' }"
              :modal="true"
            >
              <div class="flex flex-column align-items-center">
                <i
                  class="pi pi-exclamation-triangle text-yellow-500"
                  style="font-size: 2rem"
                ></i>
                <p class="mt-3">确定要删除此通知吗？此操作不可恢复。</p>
              </div>
              <template #footer>
                <Button
                  label="取消"
                  icon="pi pi-times"
                  outlined
                  @click="deleteNoticeDialogVisible = false"
                />
                <Button
                  label="删除"
                  icon="pi pi-check"
                  severity="danger"
                  @click="deleteNotice"
                />
              </template>
            </Dialog>
          </template>
        </Card>
      </div>

      <!-- 相册页面 -->
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
                @change="filterAlbumsByType"
              />
              <Button
                v-if="isAdmin"
                icon="pi pi-plus"
                rounded
                severity="success"
                @click="showAddAlbumDialog = true"
              />
            </div>

            <div v-if="loadingAlbums" class="flex justify-center my-4">
              <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
            </div>

            <div v-else class="grid grid-cols-2 gap-4">
              <div
                v-for="album in filteredAlbums"
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

            <!-- 相册详情对话框 -->
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

                <div v-if="isAdmin" class="flex gap-2 mt-4">
                  <Button
                    label="编辑"
                    icon="pi pi-pencil"
                    outlined
                    class="flex-1"
                  />
                  <Button
                    label="删除"
                    icon="pi pi-trash"
                    severity="danger"
                    outlined
                    class="flex-1"
                  />
                </div>
              </div>
            </Dialog>

            <!-- 添加相册对话框 -->
            <Dialog
              v-model:visible="showAddAlbumDialog"
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
                    url="/api/upload"
                    accept="image/*"
                    :maxFileSize="1000000"
                    @upload="onCoverUpload"
                  />
                </div>
                <div class="field mb-3">
                  <label class="block mb-1">相册图片</label>
                  <FileUpload
                    name="albumImages"
                    url="/api/upload"
                    multiple
                    accept="image/*"
                    :maxFileSize="1000000"
                    @upload="onAlbumImagesUpload"
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

      <!-- 个人中心页面 -->
      <div v-if="activeTab === 'profile'">
        <Card class="mb-4">
          <template #title>
            <div class="flex items-center">
              <i class="pi pi-user mr-2"></i>
              <span>我的</span>
            </div>
          </template>
          <template #content>
            <!-- 未登录状态 -->
            <div v-if="!isLoggedIn" class="p-4">
              <h3 class="text-lg font-bold mb-4">登录</h3>
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
                  class="w-full mb-4"
                  @click="login"
                  :loading="loginLoading"
                />
              </div>
            </div>

            <!-- 已登录状态 -->
            <div v-else>
              <div class="p-4 bg-white rounded-lg">
                <div class="flex items-center mb-6">
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
                    <p class="text-sm text-gray-600">{{ currentUser.dept }}</p>
                    <Badge
                      :value="currentUser.role === 1 ? '学生' : '管理员'"
                      :severity="currentUser.role === 1 ? 'info' : 'warning'"
                      class="mt-1"
                    />
                  </div>
                </div>

                <Divider align="center">
                  <span class="text-sm text-gray-500">个人信息</span>
                </Divider>

                <div class="grid grid-cols-1 gap-4 mb-4">
                  <div
                    class="flex justify-between py-2 border-b border-gray-200"
                  >
                    <span class="text-gray-600">学号</span>
                    <span class="font-medium">{{ currentUser.username }}</span>
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
                    <span class="font-medium">{{ currentUser.telephone }}</span>
                  </div>
                  <div
                    class="flex justify-between py-2 border-b border-gray-200"
                  >
                    <span class="text-gray-600">出生日期</span>
                    <span class="font-medium">{{ currentUser.birth }}</span>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-2">
                  <Button
                    label="修改信息"
                    icon="pi pi-pencil"
                    outlined
                    @click="showEditProfileDialog = true"
                  />
                  <Button
                    label="修改密码"
                    icon="pi pi-lock"
                    severity="secondary"
                    outlined
                    @click="showChangePasswordDialog = true"
                  />
                </div>

                <Divider align="center">
                  <span class="text-sm text-gray-500">账号管理</span>
                </Divider>

                <div class="flex justify-between gap-2">
                  <Button
                    label="刷新令牌"
                    icon="pi pi-refresh"
                    outlined
                    class="flex-1"
                    @click="refreshToken"
                    :loading="refreshingToken"
                  />
                  <Button
                    label="注销"
                    icon="pi pi-sign-out"
                    severity="danger"
                    outlined
                    class="flex-1"
                    @click="logout"
                    :loading="loggingOut"
                  />
                </div>

                <div
                  v-if="auth.token"
                  class="mt-4 p-3 bg-gray-50 rounded-lg text-xs"
                >
                  <p class="font-bold mb-1">访问令牌:</p>
                  <p class="text-gray-700 break-all mb-3 truncate">
                    {{ auth.token }}
                  </p>
                  <p class="font-bold mb-1">刷新令牌:</p>
                  <p class="text-gray-700 break-all truncate">
                    {{ auth.refreshToken }}
                  </p>
                </div>
              </div>

              <!-- 管理员专属功能 -->
              <div v-if="isAdmin" class="mt-4">
                <Accordion>
                  <AccordionTab header="用户管理">
                    <DataTable
                      :value="users"
                      :paginator="true"
                      :rows="5"
                      class="mb-4"
                      responsiveLayout="scroll"
                      :loading="loadingUsers"
                    >
                      <Column field="uid" header="ID"></Column>
                      <Column field="username" header="用户名"></Column>
                      <Column field="trueName" header="姓名"></Column>
                      <Column field="dept" header="班级"></Column>
                      <Column field="role" header="角色">
                        <template #body="slotProps">
                          <Badge
                            :value="
                              slotProps.data.role === 1 ? '学生' : '管理员'
                            "
                            :severity="
                              slotProps.data.role === 1 ? 'info' : 'warning'
                            "
                          />
                        </template>
                      </Column>
                      <Column header="操作">
                        <template #body="slotProps">
                          <Button
                            icon="pi pi-trash"
                            rounded
                            text
                            severity="danger"
                            @click="confirmDeleteUser(slotProps.data)"
                          />
                        </template>
                      </Column>
                    </DataTable>

                    <Button
                      label="添加用户"
                      icon="pi pi-plus"
                      @click="showAddUserDialog = true"
                    />
                  </AccordionTab>
                </Accordion>
              </div>
            </div>

            <!-- 修改信息对话框 -->
            <Dialog
              v-model:visible="showEditProfileDialog"
              :style="{ width: '90%' }"
              header="修改个人信息"
              :modal="true"
            >
              <div class="p-fluid">
                <div class="field mb-3">
                  <label for="edit-trueName" class="block mb-1">姓名</label>
                  <InputText
                    id="edit-trueName"
                    v-model="editUserForm.trueName"
                  />
                </div>
                <div class="field mb-3">
                  <label for="edit-sex" class="block mb-1">性别</label>
                  <Dropdown
                    id="edit-sex"
                    v-model="editUserForm.sex"
                    :options="['男', '女']"
                    placeholder="选择性别"
                  />
                </div>
                <div class="field mb-3">
                  <label for="edit-telephone" class="block mb-1">手机号</label>
                  <InputText
                    id="edit-telephone"
                    v-model="editUserForm.telephone"
                  />
                </div>
                <div class="field mb-3">
                  <label for="edit-birth" class="block mb-1">出生日期</label>
                  <Calendar
                    id="edit-birth"
                    v-model="editUserForm.birth"
                    dateFormat="yy-mm-dd"
                  />
                </div>
                <div class="field mb-3">
                  <label for="edit-dept" class="block mb-1">班级</label>
                  <InputText id="edit-dept" v-model="editUserForm.dept" />
                </div>
                <Button
                  label="保存修改"
                  icon="pi pi-check"
                  class="w-full"
                  @click="updateUserInfo"
                  :loading="updatingProfile"
                />
              </div>
            </Dialog>

            <!-- 修改密码对话框 -->
            <Dialog
              v-model:visible="showChangePasswordDialog"
              :style="{ width: '90%' }"
              header="修改密码"
              :modal="true"
            >
              <div class="p-fluid">
                <div class="field mb-3">
                  <label for="old-password" class="block mb-1">当前密码</label>
                  <Password
                    id="old-password"
                    v-model="passwordForm.oldPassword"
                    placeholder="请输入当前密码"
                    toggleMask
                    :feedback="false"
                  />
                </div>
                <div class="field mb-3">
                  <label for="new-password" class="block mb-1">新密码</label>
                  <Password
                    id="new-password"
                    v-model="passwordForm.newPassword"
                    placeholder="请输入新密码"
                    toggleMask
                  />
                </div>
                <div class="field mb-3">
                  <label for="confirm-password" class="block mb-1"
                    >确认新密码</label
                  >
                  <Password
                    id="confirm-password"
                    v-model="passwordForm.confirmPassword"
                    placeholder="请再次输入新密码"
                    toggleMask
                    :feedback="false"
                  />
                </div>
                <Button
                  label="修改密码"
                  icon="pi pi-check"
                  class="w-full"
                  @click="changePassword"
                  :loading="changingPassword"
                />
              </div>
            </Dialog>

            <!-- 添加用户对话框 -->
            <Dialog
              v-model:visible="showAddUserDialog"
              :style="{ width: '90%' }"
              header="添加用户"
              :modal="true"
            >
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
                  :loading="addingUser"
                />
              </div>
            </Dialog>

            <!-- 删除用户确认框 -->
            <Dialog
              v-model:visible="deleteUserDialogVisible"
              header="确认删除用户"
              :style="{ width: '350px' }"
              :modal="true"
            >
              <div class="flex flex-column align-items-center">
                <i
                  class="pi pi-exclamation-triangle text-yellow-500"
                  style="font-size: 2rem"
                ></i>
                <p class="mt-3">确定要删除此用户吗？此操作不可恢复。</p>
              </div>
              <template #footer>
                <Button
                  label="取消"
                  icon="pi pi-times"
                  outlined
                  @click="deleteUserDialogVisible = false"
                />
                <Button
                  label="删除"
                  icon="pi pi-check"
                  severity="danger"
                  @click="deleteUser"
                  :loading="deletingUser"
                />
              </template>
            </Dialog>
          </template>
        </Card>
      </div>
    </div>

    <!-- Android风格底部导航栏 -->
    <div
      class="absolute bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200"
    >
      <div class="flex justify-around">
        <div
          @click="activeTab = 'home'"
          class="flex flex-col items-center py-2 px-4 cursor-pointer"
          :class="{
            'text-primary': activeTab === 'home',
            'text-gray-500': activeTab !== 'home',
          }"
        >
          <i class="pi pi-home text-xl"></i>
          <span class="text-xs mt-1">首页</span>
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
        <div
          @click="activeTab = 'profile'"
          class="flex flex-col items-center py-2 px-4 cursor-pointer"
          :class="{
            'text-primary': activeTab === 'profile',
            'text-gray-500': activeTab !== 'profile',
          }"
        >
          <i class="pi pi-user text-xl"></i>
          <span class="text-xs mt-1">我的</span>
        </div>
      </div>
    </div>

    <!-- 全局消息提示 -->
    <Toast position="top-center" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
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

const API_BASE_URL = '/api'

const toast = useToast()
const activeTab = ref('home')

const isLoggedIn = ref(false)
const isAdmin = computed(() => currentUser.value?.role === 0)

const currentUser = ref({
  uid: null,
  username: '',
  trueName: '',
  sex: '',
  telephone: '',
  birth: '',
  dept: '',
  role: 1,
})

const auth = reactive({
  token: '',
  refreshToken: '',
})

const loginForm = reactive({
  username: '',
  password: '',
})

const loginLoading = ref(false)
const refreshingToken = ref(false)
const loggingOut = ref(false)

const users = ref([])
const loadingUsers = ref(false)
const showAddUserDialog = ref(false)
const deleteUserDialogVisible = ref(false)
const userToDelete = ref(null)
const addingUser = ref(false)
const deletingUser = ref(false)

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

const showEditProfileDialog = ref(false)
const updatingProfile = ref(false)
const editUserForm = reactive({
  trueName: '',
  sex: '',
  telephone: '',
  birth: '',
  dept: '',
})

const showChangePasswordDialog = ref(false)
const changingPassword = ref(false)
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const notices = ref([])
const loadingNotices = ref(false)
const noticeDialogVisible = ref(false)
const deleteNoticeDialogVisible = ref(false)
const selectedNotice = ref(null)
const noticeToDelete = ref(null)
const showAddNoticeForm = ref(false)

const newNotice = reactive({
  title: '',
  content: '',
})

const albums = ref([])
const albumTypes = ref([])
const loadingAlbums = ref(false)
const loadingAlbumTypes = ref(false)
const albumDialogVisible = ref(false)
const selectedAlbum = ref(null)
const selectedAlbumType = ref(null)
const showAddAlbumDialog = ref(false)

const filteredAlbums = computed(() => {
  if (!selectedAlbumType.value) return albums.value
  return albums.value.filter(
    (album) => album.type === selectedAlbumType.value.id,
  )
})

const newAlbum = reactive({
  title: '',
  describe: '',
  type: null,
  coverPath: '',
  loopPicPath: '',
})

const fetchApi = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  }

  if (auth.token) {
    defaultOptions.headers.Authorization = `Bearer ${auth.token}`
  }

  const requestOptions = { ...defaultOptions, ...options }

  try {
    const response = await fetch(url, requestOptions)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.msg || '请求失败')
    }

    return data
  } catch (error) {
    console.error('API 请求错误:', error)
    toast.add({
      severity: 'error',
      summary: '请求失败',
      detail: error.message,
      life: 3000,
    })
    throw error
  }
}

const login = async () => {
  if (!loginForm.username || !loginForm.password) {
    toast.add({
      severity: 'error',
      summary: '登录失败',
      detail: '请输入用户名和密码',
      life: 3000,
    })
    return
  }

  try {
    loginLoading.value = true

    const response = await fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: loginForm.username,
        password: loginForm.password,
      }),
    })

    auth.token = response.data.access_token
    auth.refreshToken = response.data.refresh_token
    isLoggedIn.value = true

    await fetchUserInfo()

    toast.add({
      severity: 'success',
      summary: '登录成功',
      detail: `欢迎回来，${currentUser.value.trueName || loginForm.username}`,
      life: 3000,
    })

    loginForm.username = ''
    loginForm.password = ''
  } catch (error) {
    console.error('登录失败:', error)
  } finally {
    loginLoading.value = false
  }
}

const logout = async () => {
  try {
    loggingOut.value = true

    await fetchApi('/auth/logout', {
      method: 'POST',
    })

    auth.token = ''
    auth.refreshToken = ''
    isLoggedIn.value = false
    currentUser.value = {
      uid: null,
      username: '',
      trueName: '',
      sex: '',
      telephone: '',
      birth: '',
      dept: '',
      role: 1,
    }

    toast.add({
      severity: 'success',
      summary: '注销成功',
      detail: '您已成功退出登录',
      life: 3000,
    })

    activeTab.value = 'home'
  } catch (error) {
    console.error('注销失败:', error)
  } finally {
    loggingOut.value = false
  }
}

const refreshToken = async () => {
  if (!auth.refreshToken) {
    toast.add({
      severity: 'error',
      summary: '刷新失败',
      detail: '没有有效的刷新令牌',
      life: 3000,
    })
    return
  }

  try {
    refreshingToken.value = true

    const response = await fetchApi('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({
        refresh_token: auth.refreshToken,
      }),
    })

    auth.token = response.data.access_token
    auth.refreshToken = response.data.refresh_token

    toast.add({
      severity: 'success',
      summary: '刷新成功',
      detail: '访问令牌已更新',
      life: 3000,
    })
  } catch (error) {
    console.error('刷新令牌失败:', error)

    if (error.message.includes('无效') || error.message.includes('过期')) {
      isLoggedIn.value = false
      auth.token = ''
      auth.refreshToken = ''

      toast.add({
        severity: 'warn',
        summary: '会话过期',
        detail: '请重新登录',
        life: 3000,
      })
    }
  } finally {
    refreshingToken.value = false
  }
}

const fetchUserInfo = async () => {
  try {
    const response = await fetchApi('/users/info')
    currentUser.value = response.data

    editUserForm.trueName = currentUser.value.trueName
    editUserForm.sex = currentUser.value.sex
    editUserForm.telephone = currentUser.value.telephone
    editUserForm.birth = currentUser.value.birth
    editUserForm.dept = currentUser.value.dept
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

const updateUserInfo = async () => {
  try {
    updatingProfile.value = true

    await fetchApi('/users/info/modify', {
      method: 'PUT',
      body: JSON.stringify(editUserForm),
    })

    currentUser.value = {
      ...currentUser.value,
      ...editUserForm,
    }

    showEditProfileDialog.value = false

    toast.add({
      severity: 'success',
      summary: '修改成功',
      detail: '个人信息已更新',
      life: 3000,
    })
  } catch (error) {
    console.error('修改用户信息失败:', error)
  } finally {
    updatingProfile.value = false
  }
}

const changePassword = async () => {
  if (!passwordForm.oldPassword || !passwordForm.newPassword) {
    toast.add({
      severity: 'error',
      summary: '修改失败',
      detail: '请填写完整的密码信息',
      life: 3000,
    })
    return
  }

  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    toast.add({
      severity: 'error',
      summary: '修改失败',
      detail: '两次输入的新密码不一致',
      life: 3000,
    })
    return
  }

  try {
    changingPassword.value = true

    await fetchApi('/auth/modify/password', {
      method: 'PUT',
      body: JSON.stringify({
        old_password: passwordForm.oldPassword,
        new_password: passwordForm.newPassword,
      }),
    })

    showChangePasswordDialog.value = false

    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''

    toast.add({
      severity: 'success',
      summary: '修改成功',
      detail: '密码已更新，请使用新密码登录',
      life: 3000,
    })
  } catch (error) {
    console.error('修改密码失败:', error)
  } finally {
    changingPassword.value = false
  }
}

const fetchUsers = async () => {
  if (!isAdmin.value) return

  try {
    loadingUsers.value = true
    const response = await fetchApi('/users/list')
    users.value = response.data
  } catch (error) {
    console.error('获取用户列表失败:', error)
  } finally {
    loadingUsers.value = false
  }
}

const addUser = async () => {
  if (!newUser.username || !newUser.password || !newUser.trueName) {
    toast.add({
      severity: 'error',
      summary: '添加失败',
      detail: '请填写必要的用户信息',
      life: 3000,
    })
    return
  }

  try {
    addingUser.value = true

    const response = await fetchApi('/users/add', {
      method: 'POST',
      body: JSON.stringify(newUser),
    })

    users.value.push(response.data)

    showAddUserDialog.value = false

    toast.add({
      severity: 'success',
      summary: '添加成功',
      detail: `用户 ${newUser.username} 已成功添加`,
      life: 3000,
    })

    Object.keys(newUser).forEach((key) => {
      newUser[key] = key === 'sex' ? '男' : key === 'role' ? 1 : ''
    })
  } catch (error) {
    console.error('添加用户失败:', error)
  } finally {
    addingUser.value = false
  }
}

const confirmDeleteUser = (user) => {
  userToDelete.value = user
  deleteUserDialogVisible.value = true
}

const deleteUser = async () => {
  if (!userToDelete.value) return

  try {
    deletingUser.value = true

    await fetchApi(`/users/delete/${userToDelete.value.uid}`, {
      method: 'DELETE',
    })

    // 从列表中移除
    users.value = users.value.filter((u) => u.uid !== userToDelete.value.uid)

    deleteUserDialogVisible.value = false
    userToDelete.value = null

    toast.add({
      severity: 'success',
      summary: '删除成功',
      detail: '用户已成功删除',
      life: 3000,
    })
  } catch (error) {
    console.error('删除用户失败:', error)
  } finally {
    deletingUser.value = false
  }
}

const fetchNotices = async () => {
  try {
    loadingNotices.value = true
    const response = await fetchApi('/notices/list')
    notices.value = response.data
  } catch (error) {
    console.error('获取通知列表失败:', error)
  } finally {
    loadingNotices.value = false
  }
}

const viewNotice = async (notice) => {
  try {
    // 可以选择是否重新请求完整的通知详情
    // const response = await fetchApi(`/notices/${notice.id}`)
    // selectedNotice.value = response.data
    selectedNotice.value = notice
    noticeDialogVisible.value = true
  } catch (error) {
    console.error('获取通知详情失败:', error)
  }
}

const publishNotice = async () => {
  if (!newNotice.title || !newNotice.content) {
    toast.add({
      severity: 'error',
      summary: '发布失败',
      detail: '请填写通知标题和内容',
      life: 3000,
    })
    return
  }

  try {
    const response = await fetchApi('/notices/send', {
      method: 'POST',
      body: JSON.stringify(newNotice),
    })

    notices.value.unshift(response.data)

    showAddNoticeForm.value = false

    toast.add({
      severity: 'success',
      summary: '发布成功',
      detail: '通知已成功发布',
      life: 3000,
    })

    newNotice.title = ''
    newNotice.content = ''
  } catch (error) {
    console.error('发布通知失败:', error)
  }
}

const editNotice = (notice) => {
  selectedNotice.value = notice
  newNotice.title = notice.title
  newNotice.content = notice.content
  showAddNoticeForm.value = true
}

const confirmDeleteNotice = (notice) => {
  noticeToDelete.value = notice
  deleteNoticeDialogVisible.value = true
}

const deleteNotice = async () => {
  if (!noticeToDelete.value) return

  try {
    await fetchApi(`/notices/delete/${noticeToDelete.value.id}`, {
      method: 'DELETE',
    })

    notices.value = notices.value.filter(
      (n) => n.id !== noticeToDelete.value.id,
    )

    deleteNoticeDialogVisible.value = false
    noticeToDelete.value = null

    toast.add({
      severity: 'success',
      summary: '删除成功',
      detail: '通知已成功删除',
      life: 3000,
    })
  } catch (error) {
    console.error('删除通知失败:', error)
  }
}

const fetchAlbumTypes = async () => {
  try {
    loadingAlbumTypes.value = true
    const response = await fetchApi('/albums/types')
    albumTypes.value = response.data
  } catch (error) {
    console.error('获取相册类型失败:', error)
  } finally {
    loadingAlbumTypes.value = false
  }
}

const fetchAlbums = async () => {
  try {
    loadingAlbums.value = true
    const response = await fetchApi('/albums')
    albums.value = response.data
  } catch (error) {
    console.error('获取相册列表失败:', error)
  } finally {
    loadingAlbums.value = false
  }
}

const filterAlbumsByType = async () => {
  if (!selectedAlbumType.value) {
    await fetchAlbums()
    return
  }

  try {
    loadingAlbums.value = true
    const response = await fetchApi(
      `/albums/type/${selectedAlbumType.value.id}`,
    )
    albums.value = response.data
  } catch (error) {
    console.error('按类型获取相册失败:', error)
  } finally {
    loadingAlbums.value = false
  }
}

const viewAlbum = async (album) => {
  try {
    // 可以选择是否重新请求完整的相册详情
    // const response = await fetchApi(`/albums/${album.id}`)
    // selectedAlbum.value = response.data
    selectedAlbum.value = album
    albumDialogVisible.value = true
  } catch (error) {
    console.error('获取相册详情失败:', error)
  }
}

const getAlbumImages = (album) => {
  if (!album || !album.loopPicPath) return []
  return album.loopPicPath.split(',')
}

const addAlbum = async () => {
  if (!newAlbum.title || !newAlbum.describe || !newAlbum.type) {
    toast.add({
      severity: 'error',
      summary: '添加失败',
      detail: '请填写完整的相册信息',
      life: 3000,
    })
    return
  }

  if (!newAlbum.coverPath) {
    newAlbum.coverPath = '/profile/scenic/album/cover/default.jpg'
  }

  if (!newAlbum.loopPicPath) {
    newAlbum.loopPicPath =
      '/profile/scenic/album/images/default1.jpg,/profile/scenic/album/images/default2.jpg'
  }

  try {
    const response = await fetchApi('/albums/send', {
      method: 'POST',
      body: JSON.stringify(newAlbum),
    })

    albums.value.push(response.data)

    showAddAlbumDialog.value = false

    toast.add({
      severity: 'success',
      summary: '添加成功',
      detail: '相册已成功添加',
      life: 3000,
    })

    Object.keys(newAlbum).forEach((key) => {
      newAlbum[key] = ''
    })
  } catch (error) {
    console.error('添加相册失败:', error)
  }
}

const onCoverUpload = (event) => {
  const file = event.files[0]

  newAlbum.coverPath = '/profile/scenic/album/cover/' + file.name

  toast.add({
    severity: 'info',
    summary: '上传成功',
    detail: '封面图片已上传',
    life: 3000,
  })
}

const onAlbumImagesUpload = (event) => {
  const files = event.files
  const paths = files.map((file) => '/profile/scenic/album/images/' + file.name)

  newAlbum.loopPicPath = paths.join(',')

  toast.add({
    severity: 'info',
    summary: '上传成功',
    detail: `${files.length}张相册图片已上传`,
    life: 3000,
  })
}

onMounted(async () => {
  try {
    await fetchNotices()
    await fetchAlbumTypes()
    await fetchAlbums()

    const savedToken = localStorage.getItem('auth_token')
    const savedRefreshToken = localStorage.getItem('refresh_token')

    if (savedToken && savedRefreshToken) {
      auth.token = savedToken
      auth.refreshToken = savedRefreshToken

      try {
        await fetchUserInfo()
        isLoggedIn.value = true

        if (isAdmin.value) {
          await fetchUsers()
        }
      } catch (error) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('refresh_token')
      }
    }
  } catch (error) {
    console.error('初始化数据加载失败:', error)
  }
})
</script>

<style lang="scss" scoped>
.demo {
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

  .p-dialog {
    width: 90% !important;
  }
}
</style>
