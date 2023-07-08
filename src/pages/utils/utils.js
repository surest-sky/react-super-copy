import { toast } from '../Popup/components/ToastNotify'
import { openAcUrl } from '../Content/modules/business'

const BindExtensionUrl = `${process.env.EXTENSION_PAGE}/module/setting?channel=chrome`
export const EXTENSION_PAGE = process.env.EXTENSION_PAGE

class ToastUtil {
    static toastId = null
    static toastInstance = null
    static interval = null

    static loading(toast, message = '请稍后...', autoCloseDelay = 5000) {
        ToastUtil.toastInstance = toast
        ToastUtil.toastId = ToastUtil.toastInstance.loading('请稍后...')

        ToastUtil.delayClose(autoCloseDelay)
    }

    static success(message, autoCloseDelay = 2000) {
        toast.update(ToastUtil.toastId, {
            render: message,
            type: 'success',
            isLoading: false,
        })
        if (ToastUtil.interval) {
            clearTimeout(ToastUtil.interval)
        }

        ToastUtil.delayClose(autoCloseDelay)
    }

    static error(message, autoCloseDelay = 2000) {
        toast.update(ToastUtil.toastId, {
            render: message,
            type: 'error',
            isLoading: false,
        })
        if (ToastUtil.interval) {
            clearTimeout(ToastUtil.interval)
        }

        ToastUtil.delayClose(autoCloseDelay)
    }

    static info(message, autoCloseDelay = 2000) {
        toast.update(ToastUtil.toastId, {
            render: message,
            type: 'info',
            isLoading: false,
        })
        if (ToastUtil.interval) {
            clearTimeout(ToastUtil.interval)
        }

        ToastUtil.delayClose(autoCloseDelay)
    }

    static delayClose(autoCloseDelay) {
        if (ToastUtil.interval) {
            clearTimeout(ToastUtil.interval)
        }
        ToastUtil.interval = setTimeout(() => {
            ToastUtil.toastInstance.done(ToastUtil.toastId)
        }, autoCloseDelay)
    }
}

const goToLoginUrl = () => {
    openAcUrl(`${process.env.EXTENSION_PAGE}/module/setting?channel=chrome`)
}

const goToBindUrl = () => {
    openAcUrl(BindExtensionUrl)
}

export { ToastUtil, goToLoginUrl, goToBindUrl }
