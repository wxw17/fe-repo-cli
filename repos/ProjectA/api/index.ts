import { defHttp } from '@/http/axios';
import { IXxxSelect, IXxxListReq, IXxxHeaderRes, IXxxListRes, IXxxCreateReq, IXxxInfoRes } from './interface';

enum Api {
    xxxSelect = '',
    xxxList = '',
    xxxInfo = '',
    xxxCreate = '',
    xxxUpdate = '',
    xxxDelete = ''
}

// 筛选框数据
export function api_xxx_select() {
    return defHttp.get<Result<IXxxSelect>>({
        url: Api.xxxSelect
    });
}

// 列表
export function api_xxx_list(params: IXxxListReq & IApiPageOption & ISortData) {
    return defHttp.get<Result<IApiTableData<IXxxHeaderRes, IXxxListRes>>>({
        url: Api.xxxList,
        params
    });
}

// 详情
export function api_xxx_info(params: Record<'id', number>) {
    return defHttp.get<Result<IXxxInfoRes>>({
        url: Api.xxxInfo,
        params
    });
}

// 创建
export function api_xxx_create(params: IXxxCreateReq) {
    return defHttp.post<Result>({
        url: Api.xxxCreate,
        params
    });
}

// 修改
export function api_xxx_update(params: IXxxCreateReq) {
    return defHttp.post<Result>({
        url: Api.xxxUpdate,
        params
    });
}

// 删除
export function api_xxx_delete(params: Record<'id', number>) {
    return defHttp.post<Result>({
        url: Api.xxxDelete,
        params
    });
}
