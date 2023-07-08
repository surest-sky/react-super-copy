import { goToLoginUrl } from '../../utils/utils'

const iframeId = 'kwhIframe'
const blurDivId = 'kwhBlurDiv'
const createPage = (pageUrl, type = 'normal') => {
    const currentIframe = document.getElementById(iframeId)
    if (currentIframe) {
        currentIframe.remove()
    }
    const url = chrome.runtime.getURL(pageUrl)
    // 在当前页面的右上角创建一个 iframe
    const iframe = document.createElement('iframe')
    iframe.setAttribute('src', url)
    iframe.setAttribute('id', iframeId)
    if (type === 'center') {
        iframe.style.cssText = `
            position: fixed;
            width: 500px;
            z-index: 999999;
            border: none;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            transition: height 0.3s ease-out;
        `
        addScrollHide()
    } else {
        iframe.style.cssText = `
            position: fixed;
            width: 385px;
            height: 500px;
            z-index: 999999;
            top: 20px;
            border: none;
            right: 20px;
        `
    }

    document.body.appendChild(iframe)
    bindListener()
    return iframe
}

const addScrollHide = () => {
    document.querySelector('body').classList.add('dotdotbear-scroll-hidden')
    document.querySelector('html').classList.add('dotdotbear-scroll-hidden')
}

/**
 * 滚动条移除
 */
const removeScrollHide = () => {
    const items = document.querySelectorAll('.dotdotbear-scroll-hidden')
    items.forEach((item) => {
        item.classList.remove('dotdotbear-scroll-hidden')
    })
}

const createBlurBackPage = () => {
    const _blurDiv = document.getElementById(blurDivId)
    if (_blurDiv) {
        _blurDiv.remove()
    }
    const blurDiv = document.createElement('div')
    blurDiv.setAttribute('id', blurDivId)
    blurDiv.setAttribute('class', 'dotdotbear-blur-background')
    blurDiv.style.cssText = `
        position: fixed;
        width: 100vw;
        height: 100vh;
        z-index: 999998;
        top: 0;
        left: 0;
        background-color: hsl(0, 0%, 100%, 0.8);;
    `
    document.body.appendChild(blurDiv)
    return blurDiv
}

const createPreview = (src) => {
    // 创建 modal 元素
    const modal = document.createElement('div')
    modal.classList.add('dotdotbear-modal')

    // 创建 modal-content 元素
    const modalContent = document.createElement('div')
    modalContent.classList.add('dotdotbear-modal-content')

    // 创建 img 元素
    const image = document.createElement('img')
    image.src = src
    image.alt = 'Image'

    // 创建 span 元素
    const closeBtn = document.createElement('span')
    closeBtn.classList.add('dotdotbear-close')
    closeBtn.textContent = '×'
    closeBtn.onclick = pageClose

    // 将 img 和 span 添加到 modal-content 中
    modalContent.appendChild(image)
    modalContent.appendChild(closeBtn)

    // 将 modal-content 添加到 modal 中
    modal.appendChild(modalContent)

    // 将 modal 添加到页面中的 body 元素
    document.body.appendChild(modal)
}

const pageClose = () => {
    var dotdotbearModal = document.querySelector('.dotdotbear-modal')
    if (dotdotbearModal) {
        dotdotbearModal.remove()
        return
    }
    var iframe = document.getElementById(iframeId)
    var blurDiv = document.getElementById(blurDivId)
    if (iframe) {
        iframe.remove()
    }

    if (blurDiv) {
        blurDiv.remove()
    }
    removeScrollHide()
}

const createCenterPage = (pageUrl) => {
    return createPage(pageUrl, 'center')
}

const bindListener = () => {
    var iframe = document.getElementById(iframeId)
    const events = {
        setHeight: (params) => {
            const { height } = params
            iframe.style.height = height
        },
        setClose: () => {
            pageClose()
        },
        setPageImagePreview: (src) => {
            createPreview(src)
        },
    }

    window.addEventListener('message', function (event) {
        if (event.source !== iframe.contentWindow) return
        const { action, params } = event.data
        if (events[action]) {
            events[action](params)
        }
    })
}

// 给 iframe 发送数据
const sendIframeMessage = (iframe, action, data) => {
    if (!iframe) {
        console.error('iframe 不存在')
        return
    }

    iframe.contentWindow.postMessage({ action, data }, '*')
}

const openAcUrl = (url) => {
    chrome.tabs.create({ url })
}

export {
    createPage,
    openAcUrl,
    goToLoginUrl,
    createBlurBackPage,
    createCenterPage,
    sendIframeMessage,
}
