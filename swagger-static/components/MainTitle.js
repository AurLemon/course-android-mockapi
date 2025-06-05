export default {
  template: `
    <div class="custom-container">
      <div class="custom-background">
        <video
          v-for="(img, index) in backgroundImages"
          :key="index"
          :src="img.path"
          autoplay
          muted
          loop
          playsinline
          :style="{
            transform: 'rotate(' + img.rotate + 'deg)' + ' scale(1.1)',
            gridArea: img.gridArea,
            opacity: 0.15
          }"
          class="background-video"
        />
      </div>
      <div class="custom-foreground">
        <h1 class="custom-title">基于 Nest.js + TypeScript + PostgreSQL 开发</h1>
        <div class="custom-repo">
          <div class="custom-repo__desc">
            老师我在这里加点私货不要骂我🥺🥺🥺<br />
            这个 API 应该不太可能有 Bug，我们 Node.js can also do anything，欢迎大家给 Repo 点个 Star🥺
          </div>
          <div class="custom-repo__link">
            <a target="_blank" href="https://github.com/AurLemon/course-android-mockapi">GitHub 仓库</a>
            <a target="_blank" href="https://gitee.com/AurLemon/course-android-mockapi">Gitee 仓库</a>
          </div>
        </div>
        <div class="custom-describe">
          欢迎参观 <a target="_blank" href="https://fjcpc-teps.aurlemon.top">计大转轨考刷题系统</a> 😋
        </div>
      </div>
    </div>
  `,
  data() {
    const generateGrid = () => {
      const positions = []
      const videos = [
        { path: '/swagger-static/kipfel/1.webm', rotate: -15 },
        { path: '/swagger-static/kipfel/2.webm', rotate: 5 },
        { path: '/swagger-static/kipfel/3.webm', rotate: 25 }
      ]

      for (let row = 1; row <= 3; row++) {
        for (let col = 1; col <= 7; col++) {
          const videoIndex = (row + col) % 3
          positions.push({
            ...videos[videoIndex],
            gridArea: `${row} / ${col} / ${row + 1} / ${col + 1}`
          })
        }
      }
      return positions
    }

    return {
      backgroundImages: generateGrid()
    }
  }
}
