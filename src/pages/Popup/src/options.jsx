import React, { useEffect } from 'react'
import '../../../assets/styles/tailwind.css'
import '@arco-themes/react-kwhdot/css/arco.css'
import {
    Alert,
    Button,
    Checkbox,
    Link,
    List,
    Popover,
    Typography,
} from '@arco-design/web-react'
import {
    IconCloseCircle,
    IconLock,
    IconSettings,
    IconUndo,
} from '@arco-design/web-react/icon'
import session from '../../utils/storage'
import { Divider } from '@arco-design/web-react/lib'

const { Title, Paragraph } = Typography

/**
 * 给content发送消息
 * @param flag string 发送的标识
 * @param action string 发送的动作
 * @param callback function 回调函数
 */
const sendContentMessage = (flag, data, callback) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { flag, data }, callback)
    })
}

/**
 * 打开options页面
 */
const openOptionsPage = () => {
    chrome.tabs.create({ url: 'options.html' })
}

const Options = () => {
    const listKey = 'infiniteCopyList'
    const [isAllowCopy, setIsAllowCopy] = React.useState(false)
    const [hostList, setHostList] = React.useState([])
    const [host, setHost] = React.useState('')
    const [keepCopy, setKeepCopy] = React.useState(false)

    const setLock = () => {
        const isCopy = !isAllowCopy
        if (isCopy === false) {
            setHostKeepCopy(false)
            sendContentMessage('closeInfiniteCopy')
        } else {
            sendContentMessage('openInfiniteCopy')
        }
        setIsAllowCopy(isCopy)
    }

    const showMessage = (isSuccess) => {
        sendContentMessage('showMessage', {
            isSuccess,
        })
    }

    const setHostKeepCopy = (_keepCopy) => {
        setKeepCopy(_keepCopy)
        if (_keepCopy) {
            addListItem(host)
        } else {
            removeListItem(host)
        }
    }

    // 获取本地的可用域名
    const initListKey = async () => {
        let list = []
        const _list = await session.get(listKey)
        if (_list) {
            list = JSON.parse(_list)
        }

        // 获取当前系统域名
        initHost(list)
    }

    const getHost = () => {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(
                { type: 'getActivePage' },
                function ({ url }) {
                    if (!url) {
                        resolve(false)
                        return
                    }
                    resolve(url)
                }
            )
        })
    }

    const setIsInfiniteCopy = async () => {
        return new Promise((resolve, reject) => {
            sendContentMessage('isInfiniteCopy', '', (res) => {
                if (res) setIsAllowCopy(true)
                resolve(true)
            })
        })
    }

    const initHost = async (hostList) => {
        setHostList([...hostList])

        const url = await getHost()
        const c_url = new URL(url)
        const rootUrl = c_url.protocol + '//' + c_url.hostname
        setHost(rootUrl)
        initHostCopy(hostList, rootUrl)
        await setIsInfiniteCopy()
    }

    const initHostCopy = (hostList, host) => {
        const item = hostList.find((item) => item.host === host)
        if (item) {
            setIsAllowCopy(item.isCopy)
            setKeepCopy(item.isCopy)
        }
    }

    const removeListItem = (_host) => {
        const index = hostList.findIndex((item) => item.host === _host)
        const _lists = [...hostList]
        _lists.splice(index, 1)
        setHostList(_lists)
        if (host === _host) {
            setKeepCopy(false)
        }
    }

    const saveList = async () => {
        await session.set(listKey, JSON.stringify(hostList))
    }

    const openHost = (host) => {
        chrome.tabs.create({ url: host })
    }

    const addListItem = (_host) => {
        const _lists = [...hostList]
        _lists.unshift({
            host: _host,
            isCopy: true,
        })
        setHostList(_lists)
    }

    useEffect(() => {
        initListKey()
    }, [])

    useEffect(() => {
        saveList()
    }, [hostList])

    const Header = ({ host }) => {
        if (!host) {
            return <p className={'font-bold text-center'}>无需破解</p>
        }

        return (
            <>
                {isAllowCopy ? (
                    <Alert
                        type="success"
                        content="已解除限制，尽情开始复制吧"
                    />
                ) : (
                    <Alert type="warning" content="点击按钮解除复制" />
                )}

                <div className={'flex justify-center mt-1'}>
                    <Link disabled={!isAllowCopy} className={'inline-block'}>
                        {host}
                    </Link>
                </div>
                <div className={'flex justify-center mt-1'}>
                    {!isAllowCopy ? (
                        <Button
                            onClick={() => {
                                setLock()
                                showMessage(true)
                            }}
                            type={'primary'}
                            size={'small'}
                        >
                            <IconLock /> 解除复制
                        </Button>
                    ) : (
                        <Button
                            onClick={() => {
                                setLock()
                                showMessage(false)
                            }}
                            type={'primary'}
                            size={'small'}
                        >
                            <IconUndo /> 关闭解除复制
                        </Button>
                    )}
                </div>

                <div className={'flex justify-center mt-2'}>
                    {isAllowCopy && (
                        <Popover content={'后续将自动开启网页万能复制'}>
                            <Checkbox
                                checked={keepCopy}
                                onChange={(v) => setHostKeepCopy(v)}
                            >
                                保持此状态
                            </Checkbox>
                        </Popover>
                    )}
                </div>
            </>
        )
    }

    return (
        <main className={'p-2 w-[300px]'}>
            <Title heading={6} className={'mb-3 flex justify-between'}>
                <div>全新万能复制</div>
            </Title>

            <Header host={host} />

            {hostList.length > 0 && (
                <>
                    <Divider orientation={'center'}>
                        <p className={'text-gray-700 text-xs'}>
                            以下域名将自动开启网页万能复制
                        </p>
                    </Divider>
                    <List
                        className={'mt-2'}
                        size="small"
                        dataSource={hostList}
                        render={(item, index) => (
                            <List.Item key={index}>
                                <div
                                    className={
                                        'flex justify-between items-center'
                                    }
                                >
                                    <Link
                                        onClick={() => openHost(item.host)}
                                        className={'w-[200] truncate'}
                                    >
                                        {item.host}
                                    </Link>
                                    <Popover content={'移除此域名'}>
                                        <Button
                                            onClick={() => {
                                                removeListItem(item.host)
                                            }}
                                            type={'text'}
                                            size={'small'}
                                            color={'danger'}
                                        >
                                            <IconCloseCircle />
                                        </Button>
                                    </Popover>
                                </div>
                            </List.Item>
                        )}
                    />
                </>
            )}

            <div className={'flex justify-center mt-2'}>.....</div>
            <div className={'flex justify-center mt-2'}>
                <Button
                    type={'text'}
                    size={'small'}
                    onClick={() => openOptionsPage()}
                >
                    <IconSettings /> 查看更多设置
                </Button>
            </div>
        </main>
    )
}

export default Options
