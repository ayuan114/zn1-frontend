// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** createArticle POST /api/articles */
export async function createArticleUsingPost(
  body: API.ArticleCreateRequest,
  options?: { [key: string]: any }
) {
  return request<API.ArticleResponse>('/api/articles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** getArticle GET /api/articles/${param0} */
export async function getArticleUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getArticleUsingGETParams,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params
  return request<API.ArticleResponse>(`/api/articles/${param0}`, {
    method: 'GET',
    params: {
      ...queryParams,
    },
    ...(options || {}),
  })
}

/** uploadImage POST /api/articles/${param0}/images */
export async function uploadImageUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.uploadImageUsingPOSTParams,
  body: {},
  file?: File,
  options?: { [key: string]: any }
) {
  const { articleId: param0, ...queryParams } = params
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

  return request<API.ImageUploadResponse>(`/api/articles/${param0}/images`, {
    method: 'POST',
    params: { ...queryParams },
    data: formData,
    requestType: 'form',
    ...(options || {}),
  })
}
