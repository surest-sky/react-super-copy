import session from '../utils/storage'
import * as unlock from './unlock'

const c_url = new URL(window.location.href)
const rootUrl = c_url.protocol + '//' + c_url.hostname
function showToast(message, duration) {
    var toast = document.createElement('div')
    var textNode = document.createTextNode(message)

    toast.appendChild(textNode)
    toast.style.backgroundColor = '#000'
    toast.style.color = '#fff'
    toast.style.position = 'fixed'
    toast.style.bottom = '30vh'
    toast.style.left = '50%'
    toast.style.transform = 'translateX(-50%)'
    toast.style.padding = '10px 20px'
    toast.style.borderRadius = '4px'
    toast.style.fontSize = '14px'
    toast.style.display = 'none'

    document.body.appendChild(toast)

    setTimeout(function () {
        toast.style.display = 'block'

        setTimeout(function () {
            toast.style.display = 'none'

            setTimeout(function () {
                document.body.removeChild(toast)
            }, 200)
        }, duration || 2000)
    }, 200)
}

const initCopyService = async () => {
    const listKey = 'infiniteCopyList'
    let list = await session.get(listKey)
    if (!list) {
        return false
    }
    list = JSON.parse(list)
    const isExist = list.some((item) => {
        return item.host === rootUrl
    })
    if (isExist) {
        openInfiniteCopy()
    } else {
        removeUnLockMark()
    }
}

const sendBackgroundMessage = (type, data) => {
    chrome.runtime.sendMessage({ type, data })
}

const showMessage = (success) => {
    if (success) {
        showToast('解锁复制成功', 2000)
    } else {
        showToast('已移除', 3000)
    }
}

const openInfiniteCopy = () => {
    createUnLockMark()
    unlock.createUnlockPlan(rootUrl)
}

const createUnLockMark = () => {
    sendBackgroundMessage('setActive', { isActive: true })
    const id = chrome.runtime.id
    const style = document.createElement('div')
    style.setAttribute('id', id)
    document.body.appendChild(style)
}

const removeUnLockMark = () => {
    sendBackgroundMessage('setActive', { isActive: false })
    unlock.removeUnlockPlan(rootUrl)
}

const handleOenInfiniteCopy = () => {
    return !!document.querySelector(`#${chrome.runtime.id}`)
}

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    const { flag, data } = req
    switch (flag) {
        case 'openInfiniteCopy':
            openInfiniteCopy()
            break
        case 'closeInfiniteCopy':
            removeUnLockMark()
            break
        case 'initCopyService':
            initCopyService()
            break
        case 'showMessage':
            const { isSuccess } = data
            showMessage(isSuccess)
            break
        case 'isInfiniteCopy':
            sendResponse(handleOenInfiniteCopy())
            break
        default:
            break
    }
})

setTimeout(() => {
    initCopyService()
}, 500)
