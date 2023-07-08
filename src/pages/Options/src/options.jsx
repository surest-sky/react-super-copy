import React, { useEffect } from 'react'
import '../../../assets/styles/tailwind.css'
import '@arco-themes/react-kwhdot/css/arco.css'
import {
    Alert,
    Button,
    Checkbox,
    Input,
    Link,
    List,
    Message,
    Popover,
    Space,
    Typography,
} from '@arco-design/web-react'
import {
    IconCloseCircle,
    IconLock,
    IconPlusCircle, IconSend,
    IconSettings,
    IconUndo,
} from '@arco-design/web-react/icon'
import session from '../../utils/storage'
import { Divider } from '@arco-design/web-react/lib'

const { Title, Paragraph } = Typography

const Options = () => {
    const listKey = 'infiniteCopyList'
    const [isAllowCopy, setIsAllowCopy] = React.useState(false)
    const [hostList, setHostList] = React.useState([])
    const [host, setHost] = React.useState('')
    const [inputHost, setInputHost] = React.useState('')
    const [showHostList, setShowHostList] = React.useState([])

    const setLock = () => {
        const isCopy = !isAllowCopy
        setIsAllowCopy(isCopy)
        updateListKey(hostList, {
            host,
            isCopy: isCopy,
        })
    }

    // 获取本地的可用域名
    const initListKey = async () => {
        let list = []
        const _list = await session.get(listKey)
        if (_list) {
            list = JSON.parse(_list)
        }

        setHostList(list)
    }

    const updateListKey = async (hostList, currentItem) => {
        const _lists = [...hostList]
        const index = _lists.findIndex((item) => item.host === currentItem.host)

        if (index >= 0) {
            // 移除指定索引
            if (!currentItem.isCopy) {
                _lists.splice(index, 1)
            } else {
                _lists[index] = currentItem
            }
        } else {
            if (currentItem.isCopy) {
                _lists.unshift(currentItem)
            }
        }
        await session.set(listKey, JSON.stringify(_lists))
        setHostList([..._lists])

        if (currentItem.host === host) {
            setIsAllowCopy(currentItem.isCopy)
        }
    }

    const addHost = () => {
        console.log('initHost', inputHost)
        // 检查是否为一个链接
        let url
        try {
            url = new URL(inputHost)
        } catch (e) {
            Message.error('非法的域名')
            return
        }

        const _host = url.protocol + '//' + url.hostname
        const item = hostList.find((item) => item.host === _host)
        if (item) {
            Message.error('域名已存在')
            return
        }

        updateListKey(hostList, {
            host: _host,
            isCopy: true,
        })

        Message.success('添加成功')
    }

    useEffect(() => {
        initListKey()
    }, [])

    useEffect(() => {
        let _list = [...hostList].filter((item) => item.host !== host)
        _list.unshift({
            host,
            isCopy: isAllowCopy,
        })
        _list = _list.filter((item) => item.isCopy)
        setShowHostList(_list.splice(0, 3))
        console.log('_list', _list.splice(0, 3))
    }, [hostList])

    const Header = ({ host }) => {
        if (!host) {
            return (
                <div className={'flex justify-between'}>
                    <Input
                        allowClear
                        size={'small'}
                        value={inputHost}
                        onChange={setInputHost}
                        placeholder={'请输入添加的域名'}
                        className={'flex-1'}
                    ></Input>
                    <Button
                        onClick={addHost}
                        className={'ml-2'}
                        type={'primary'}
                        size={'small'}
                    >
                        <IconPlusCircle /> 添加
                    </Button>
                </div>
            )
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
                <div className={'flex justify-center'}>
                    {!isAllowCopy ? (
                        <Button
                            onClick={() => setLock()}
                            type={'primary'}
                            size={'small'}
                        >
                            <IconLock /> 解除复制
                        </Button>
                    ) : (
                        <Button
                            onClick={() => setLock()}
                            type={'primary'}
                            size={'small'}
                        >
                            <IconUndo /> 关闭解除复制
                        </Button>
                    )}
                </div>
            </>
        )
    }

    return (
        <div className={'p-2 mx-auto mt-10'} style={{maxWidth:600}}>
            <Title heading={4} className={'mb-5 flex justify-between'}>
                <div>全新万能复制</div>
            </Title>
            <Divider />

            <Header host={host} />

            <Divider orientation={'left'}>以下域名将自动开启网页万能复制</Divider>
            <List
                className={'mt-2'}
                size="small"
                dataSource={hostList}
                render={(item, index) => (
                    <List.Item key={index}>
                        <div className={'flex justify-between items-center'}>
                            <span>{item.host}</span>
                            <Popover content={'移除此域名'}>
                                <Button
                                    onClick={() => {
                                        updateListKey(hostList, {
                                            host: item.host,
                                            isCopy: false,
                                        })
                                    }}
                                    type={'primary'}
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

            <Link className={'mt-5'} href={'https://wj.qq.com/s2/12630919/2802/'} target={"_blank"}> <IconSend /> 问题反馈 </Link>
        </div>

    )
}

export default Options
