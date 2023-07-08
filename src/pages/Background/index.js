const unlockPage = 'unlock-page'
const unlockPagePop = 'unlock-page-pop'

const setActive = (isActive) => {
    if (isActive) {
        chrome.action.setIcon({
            path: 'copy-active-32.png',
        })
        chrome.action.setBadgeText({
            text: 'ON',
        })
        chrome.action.setTitle({
            title: '站点已解锁',
        })
        return
    }

    chrome.action.setIcon({
        path: 'copy-inactive-32.png',
    })
    chrome.action.setBadgeText({
        text: '',
    })
    chrome.action.setTitle({
        title: '站点等待解锁',
    })
}

chrome.contextMenus.removeAll()
chrome.contextMenus.create({
    id: unlockPage,
    title: '解锁此站点复制', // %s表示选中的文字
    contexts: ['page', 'frame', 'selection', 'link', 'image'],
})

chrome.contextMenus.create({
    id: unlockPagePop,
    title: '解锁此站点复制', // %s表示选中的文字
    contexts: ['action'],
})

chrome.contextMenus.onClicked.addListener(async function (info, tab) {
    if (info.menuItemId === unlockPage) {
        sendContentMessage('openInfiniteCopy', '')
    }
})

chrome.tabs.onActivated.addListener(({ tabId }) => {
    chrome.tabs.get(tabId, (tab) => {
        sendContentMessage('initCopyService', '')
    })
})

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.type === 'getActivePage') {
        chrome.tabs.query(
            { active: true, currentWindow: true },
            function (tabs) {
                console.log('tabs[0].url', tabs)
                sendResponse({ url: tabs[0].url })
            }
        )
        return true
    }

    if (request.type === 'openOptionsPage') {
        chrome.runtime.openOptionsPage()
        return true
    }

    if (request.type === 'openInfiniteCopy') {
        sendContentMessage('openInfiniteCopy', '')
        return true
    }

    if (request.type === 'setActive') {
        const { isActive } = request.data
        setActive(isActive)
        return true
    }
})

/**
 * 给content发送消息
 * @param flag string 发送的标识
 * @param action string 发送的动作
 */
const sendContentMessage = (flag, action) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { flag, action })
    })
}
