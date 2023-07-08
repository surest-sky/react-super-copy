import session from './storage.js'

const baseUrl = process.env.EXTENSION_BASE_API

const fetchAccount = (params) =>
    request('post', `${baseUrl}/user/get_account_info`, params)

const fetchDetail = async (dataid) => {
    return request('get', `v1/data/show_one_data/${dataid}`)
}

const fetchUser = async (idkey) => {
    return request('POST', `v1/user/get_account_uid`, {
        idkey: idkey,
    })
}

const request = async (method, url, params) => {
    const token = await session.get('sign')
    const response = await fetch(`${baseUrl}/${url}`, {
        method: method || 'POST',
        body: JSON.stringify(params),
        headers: new Headers({
            'Content-Type': 'application/json',
            token: token,
        }),
    })
    const { code, msg, data } = await response.json()
    return { code, message: msg, data }
}

export { fetchUser }
