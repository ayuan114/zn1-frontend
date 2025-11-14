// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** queryCategoryData POST /api/blog/article/categorys */
export async function queryCategoryDataUsingPost(options?: { [key: string]: any }) {
  return request<API.BaseResponseListCategory_>('/api/blog/article/categorys', {
    method: 'POST',
    ...(options || {}),
  })
}

/** createBlogArticle POST /api/blog/article/create */
export async function createBlogArticleUsingPost(
  body: API.BlogArticleDTO,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseString_>('/api/blog/article/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** download GET /api/blog/article/download/${param0} */
export async function downloadUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.downloadUsingGETParams,
  options?: { [key: string]: any }
) {
  const { fileName: param0, ...queryParams } = params
  return request<API.InputStreamResource>(`/api/blog/article/download/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  })
}

/** queryArticleIdByDetail POST /api/blog/article/query/${param0} */
export async function queryArticleIdByDetailUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.queryArticleIdByDetailUsingPOSTParams,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params
  return request<API.BaseResponseBlogArticle_>(`/api/blog/article/query/${param0}`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  })
}

/** queryBlogArticleTitle POST /api/blog/article/query/title */
export async function queryBlogArticleTitleUsingPost(
  body: API.BlogArticleDTO,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageBlogArticle_>('/api/blog/article/query/title', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** queryTagData POST /api/blog/article/tags */
export async function queryTagDataUsingPost(options?: { [key: string]: any }) {
  return request<API.BaseResponseListTag_>('/api/blog/article/tags', {
    method: 'POST',
    ...(options || {}),
  })
}

/** upload POST /api/blog/article/upload */
export async function uploadUsingPost(body: {}, file?: File, options?: { [key: string]: any }) {
  const formData = new FormData()

  if (file) {
    formData.append('file', file)
  }

  Object.keys(body).forEach((ele) => {
    const item = (body as any)[ele]

    if (item !== undefined && item !== null) {
      if (typeof item === 'object' && !(item instanceof File)) {
        if (item instanceof Array) {
          item.forEach((f) => formData.append(ele, f || ''))
        } else {
          formData.append(ele, JSON.stringify(item))
        }
      } else {
        formData.append(ele, item)
      }
    }
  })

  return request<API.BaseResponseString_>('/api/blog/article/upload', {
    method: 'POST',
    data: formData,
    requestType: 'form',
    ...(options || {}),
  })
}
