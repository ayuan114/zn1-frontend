declare namespace API {
  type ArticleCreateRequest = {
    authorId?: number
    blocks?: ContentBlockDTO[]
    categoryId?: number
    tags?: string[]
    title?: string
  }

  type ArticleResponse = {
    authorId?: number
    blocks?: ContentBlockResponse[]
    category?: CategoryInfo
    createTime?: string
    id?: number
    tags?: string[]
    title?: string
  }

  type CategoryInfo = {
    id?: number
    name?: string
  }

  type ContentBlockDTO = {
    content?: string
    imageId?: string
    sortOrder?: number
    type?: 'TEXT' | 'IMAGE'
  }

  type ContentBlockResponse = {
    content?: string
    fileName?: string
    imageId?: string
    type?: string
  }

  type getArticleUsingGETParams = {
    /** id */
    id: number
    /** includeContent */
    includeContent?: boolean
  }

  type ImageUploadResponse = {
    imageId?: string
    placeholder?: string
    url?: string
  }

  type uploadImageUsingPOSTParams = {
    /** articleId */
    articleId: number
  }
}
