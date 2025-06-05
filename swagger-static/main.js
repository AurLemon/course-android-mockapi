const initVueApp = async () => {
  try {
    const { createApp } = await import('/swagger-static/js/vue.esm-browser.min.js')
    const MainTitle = await import('./components/MainTitle.js')
    
    const waitForInfoContainer = () => {
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          const infoContainer = document.querySelector('.information-container .info')
          if (infoContainer) {
            clearInterval(checkInterval)
            resolve(infoContainer)
          }
        }, 100)
      })
    }
    
    const infoContainer = await waitForInfoContainer()
    const container = document.createElement('div')
    container.id = 'main-title-container'
    
    infoContainer.parentNode.insertBefore(container, infoContainer.nextSibling)
    
    const app = createApp({
      components: {
        MainTitle: MainTitle.default
      },
      template: `<main-title />`
    })

    app.mount(container)
  } catch (error) {
    console.error('初始化失败:', error)
  }
}

const observer = new MutationObserver((mutations) => {
  if (document.querySelector('.information-container')) {
    initVueApp()
    observer.disconnect()
  }
})

document.addEventListener('DOMContentLoaded', () => {
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false,
    characterData: false
  })
})
