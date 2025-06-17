declare namespace API {
  type BaseResponseBlogArticle_ = {
    code?: number
    data?: BlogArticle
    message?: string
  }

  type BaseResponseListBlogArticle_ = {
    code?: number
    data?: BlogArticle[]
    message?: string
  }

  type BaseResponseListCategory_ = {
    code?: number
    data?: Category[]
    message?: string
  }

  type BaseResponseListTag_ = {
    code?: number
    data?: Tag[]
    message?: string
  }

  type BaseResponseString_ = {
    code?: number
    data?: string
    message?: string
  }

  type BlogArticle = {
    author_id?: number
    category_id?: number
    content?: string
    create_time?: string
    id?: number
    status?: Record<string, any>
    tags?: string
    title?: string
    update_time?: string
  }

  type BlogArticleDTO = {
    author_id?: number
    category_id?: number
    content?: string
    status?: string
    tags?: string
    title?: string
  }

  type Category = {
    id?: number
    level?: number
    name?: string
    parentId?: number
    sortOrder?: number
  }

  type downloadUsingGETParams = {
    /** fileName */
    fileName: string
  }

  type File = {
    absolute?: boolean
    absoluteFile?: File
    absolutePath?: string
    canonicalFile?: File
    canonicalPath?: string
    directory?: boolean
    file?: boolean
    freeSpace?: number
    hidden?: boolean
    name?: string
    parent?: string
    parentFile?: File
    path?: string
    totalSpace?: number
    usableSpace?: number
  }

  type InputStream = true

  type InputStreamResource = {
    description?: string
    file?: File
    filename?: string
    inputStream?: InputStream
    open?: boolean
    readable?: boolean
    uri?: URI
    url?: URL
  }

  type queryArticleIdByDetailUsingPOSTParams = {
    /** id */
    id: number
  }

  type Tag = {
    createTime?: string
    id?: number
    name?: string
  }

  type URI = {
    absolute?: boolean
    authority?: string
    fragment?: string
    host?: string
    opaque?: boolean
    path?: string
    port?: number
    query?: string
    rawAuthority?: string
    rawFragment?: string
    rawPath?: string
    rawQuery?: string
    rawSchemeSpecificPart?: string
    rawUserInfo?: string
    scheme?: string
    schemeSpecificPart?: string
    userInfo?: string
  }

  type URL = {
    authority?: string
    content?: Record<string, any>
    defaultPort?: number
    file?: string
    host?: string
    path?: string
    port?: number
    protocol?: string
    query?: string
    ref?: string
    userInfo?: string
  }
}
