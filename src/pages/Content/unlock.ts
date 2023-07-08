interface IUnlockPlan {
    create: () => void
    remove: () => void
}

const forceBrowserDefault = function (e: Event) {
    e.stopImmediatePropagation()
    return true
}

class DefaultPlan implements IUnlockPlan {
    create() {
        const id = chrome.runtime.id
        const style = document.createElement('style')
        style.innerHTML = '* { user-select: text !important; }'
        style.setAttribute('id', id)
        document.head.appendChild(style)

        document.addEventListener('contextmenu', forceBrowserDefault, true)
        document.addEventListener('copy', forceBrowserDefault, true)
        document.addEventListener('cut', forceBrowserDefault, true)
        document.addEventListener('paste', forceBrowserDefault, true)
    }

    remove() {
        try {
            document.removeEventListener('contextmenu', forceBrowserDefault, true)
            document.removeEventListener('copy', forceBrowserDefault, true)
            document.removeEventListener('cut', forceBrowserDefault, true)
            document.removeEventListener('paste', forceBrowserDefault, true)
            const domHtml = document.getElementById(chrome.runtime.id)
            if (domHtml) {
                document.head.removeChild(domHtml)
            }
        } catch (e) {}
    }
}

const planMap = new Map<string, IUnlockPlan>()
const defaultPlan = new DefaultPlan()

export const createUnlockPlan = (url: string) => {
    const urlPlan = planMap.get('url')
    if (urlPlan) {
        urlPlan.create()
    } else {
        defaultPlan.create()
    }
}

export const removeUnlockPlan = (url: string) => {
    const urlPlan = planMap.get('url')
    if (urlPlan) {
        urlPlan.remove()
    } else {
        defaultPlan.remove()
    }
}
