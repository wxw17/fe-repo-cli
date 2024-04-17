// 筛选项
export type IXxxSelect = Partial<ISelectList<'status'>>

// 列表请求参数
export interface IXxxListReq {
    keyword?: string;
}

// 列表表头
export interface IXxxHeaderRes {
    account_name: string;
}

// 表格体
export interface IXxxListRes extends IXxxHeaderRes {
    id: number;
}

// 创建请求参数
export interface IXxxCreateReq {
    account_name?: string;
    account_type?: number;
}

// 详情
export interface IXxxInfoRes extends IXxxCreateReq {
    id?: number;
}
