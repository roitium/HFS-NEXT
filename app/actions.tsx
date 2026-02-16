'use server'
import { fillTemplate } from '@/utils/string'
import { HFS_APIs } from './constants'

// 当 ok 为 true 时，payload 有值
type FetchHFSApiResponse<T> =
  | {
      payload: T
      ok: true
    }
  | {
      ok: false
      errMsg: string
    }

export async function fetchHFSApiFromServer<T>(
  url: string,
  init: {
    token: string
    method: 'POST' | 'GET'
    // Post请求需要发送的json数据
    postBody?: Record<string, string>
    // Get请求需要的param，会预先解析并填充到url中
    getParams?: Record<string, string | number>
  },
): Promise<FetchHFSApiResponse<T>> {
  try {
    let parsedUrl = fillTemplate(url, init.getParams)
    // 处理查询参数
    if (init.getParams && !url.includes('${')) {
      // 如果 URL 中没有模板占位符，则将 getParams 作为查询参数
      const searchParams = new URLSearchParams()
      for (const [key, value] of Object.entries(init.getParams)) {
        searchParams.append(key, String(value))
      }
      const queryString = searchParams.toString()
      if (queryString) {
        parsedUrl += (parsedUrl.includes('?') ? '&' : '?') + queryString
      }
    }
    const headers = {
      'Content-Type': 'application/json',
      'Hfs-token': init.token,
    }
    const options: RequestInit = {
      headers,
      method: init.method,
    }
    if (init.postBody) {
      options.body = JSON.stringify(init.postBody)
    }

    const res = await fetch(parsedUrl, options)
    if (!res.ok) {
      return { errMsg: res.statusText, ok: false }
    }

    const json_data = await res.json()
    if (url === HFS_APIs.lastExamOverview && json_data.code === 1) {
      // 处理特殊情况：最近考试概览接口返回 code 为 1 时，表示没有考试
      return { payload: json_data.data, ok: true }
    }
    if (json_data.code === 0) {
      return { payload: json_data.data, ok: true }
    }
    return { ok: false, errMsg: json_data.msg }
  } catch (e) {
    return { ok: false, errMsg: String(e) }
  }
}

export async function sendGotifyMessage(message: string, title: string) {
  try {
    if (!process.env.GOTIFY_URL || !process.env.GOTIFY_KEY) {
      return { ok: false, errMsg: '未配置 GOTIFY_URL 或 GOTIFY_KEY' }
    }
    const res = await fetch(process.env.GOTIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Gotify-Key': process.env.GOTIFY_KEY,
      },
      body: JSON.stringify({
        message: message,
        priority: 10,
        title: title,
      }),
    })
    if (!res.ok) {
      return { ok: false, errMsg: '发送消息失败' }
    }
    return { ok: true, errMsg: '' }
  } catch (e) {
    return { ok: false, errMsg: String(e) }
  }
}
