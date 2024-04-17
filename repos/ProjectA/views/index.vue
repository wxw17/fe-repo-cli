<template>
    <div class="content">
        <a-card class="g-card">
            <q-form class="g-mt" @register="register"></q-form>
        </a-card>
        <a-card class="g-card g-mt">
            <p class="g-mb g-flex-between">
                <a-button type="primary" class="g-mb" v-permission="111" @click="handle_create">新增</a-button>
                <a-button @click="customColumnModal.modalVisible = true">自定义列</a-button>
            </p>
            <a-table
                v-bind="get_table_attrs()"
                :columns="getFilterColumns"
                :data-source="data.tableData.list"
                @change="changeTableSort"
                @resizeColumn="setResizeColumn"
            >
                <template #bodyCell="{ column, record }">
                    <template v-if="column.dataIndex === 'action'">
                        <q-table-action :actions="create_actions(record)"></q-table-action>
                    </template>
                </template>
            </a-table>
        </a-card>
        <a-card class="g-card g-mt" v-if="data.pageOption.total">
            <q-table-pagination :pageOption="create_page_option()"></q-table-pagination>
        </a-card>

        <!-- 新增/编辑 -->
        <edit @register="registerDrawer" @ok="get_list_data()"></edit>

        <!-- 自定义列 -->
        <q-custom-column-modal
            v-model:visible="customColumnModal.modalVisible"
            v-model:value="customColumnModal.value"
            :data="customColumnModal.data"
        ></q-custom-column-modal>
    </div>
</template>

<script lang='ts' setup>
import { reactive, computed, onMounted } from 'vue';
import { QCustomColumnModal, IColumnModalProps, useCustomColumn } from '@qmfront-ad/vue3-antd-ui';
import { PaginationProps, QTablePagination, useForm, QForm, ActionItem, useDrawer, QTableAction, FormSchema } from '@q-front-npm/vue3-antd-pc-ui';
import { api_xxx_select, api_xxx_list, api_xxx_delete } from '@/http/api/xxx';
import { IXxxListRes, IXxxListReq, IXxxSelect } from '@/http/api/xxx/interface';
import { get_table_header_columns, get_table_attrs } from '@/assets/ts/tools';
import { useGlobalStore } from '@/store/modules/global';
import { useAntdStore } from '@/store/modules/antd';
import { useMessage, useOriginTableSort } from '@q-front-npm/hooks/vue';
import { useResizeColumn } from '@qmfront-ad/hooks/vue';
import { useDrawerClose } from '@/hooks/specific/use-drawer-close';
import { usePermission } from '@/hooks/settings/use-permission';
import Edit from './edit.vue';

const globalStore = useGlobalStore();
const antdStore = useAntdStore();
const { createMessage } = useMessage();
const { hasPermission } = usePermission();
const { getResizeColumn, setResizeColumn } = useResizeColumn();
const { getColumnsHeader, getColumnsConfig } = useCustomColumn();
const { changeTableSort, sortData } = useOriginTableSort(get_list_data);
const [registerDrawer, { openDrawer, setDrawerProps, closeDrawer, getVisible }] = useDrawer();
useDrawerClose({ closeDrawer, getVisible });

interface IDataProps {
    selectObj: IXxxSelect;
    tableData: ITableData<IXxxListRes>;
    pageOption: IPageOption;
}

const data: IDataProps = reactive({
    selectObj: {},
    tableData: {
        header: [],
        list: []
    },
    pageOption: {
        current: 1,
        pageSize: 10,
        total: 0
    }
});
// 自定义列弹框
const customColumnModal: IColumnModalProps = reactive({
    modalVisible: false,
    value: [],
    data: {
        rawColumns: [],
        defaultColumnsValues: computed(() => data.tableData.header.map(item => item.key as string))
    }
});

// 自定义列过滤后的列表columns
const getFilterColumns = computed(() => {
    return getColumnsHeader(data.tableData.header, customColumnModal.value);
});

// 条件筛选项
const schemas = computed<FormSchema<IXxxListReq>[]>(() => [{
    label: '账户ID/名称',
    component: 'Input',
    field: 'keyword',
    componentProps: {
        placeholder: '账户ID/名称'
    }
}]);

const [register, { getFieldsValue }] = useForm({
    schemas,
    layout: 'inline',
    labelCol: {
        style: {
            width: 'auto'
        }
    },
    wrapperCol: {
        style: {
            minWidth: antdStore.defaultWrapperWidth
        }
    },
    actionColOptions: {
        style: {
            width: 'auto'
        }
    },
    autoSubmitOnEnter: true,
    submitFunc: () => option_change(1)
});

// 初始化分页
function create_page_option():PaginationProps {
    return {
        ...data.pageOption,
        onChange: option_change
    };
}

// 分页数据改变
function option_change(val:number, size?:number):void {
    data.pageOption.current = val;
    if (size) {
        data.pageOption.pageSize = size;
    }
    get_list_data();
}

// 初始化操作列
function create_actions(record: IXxxListRes):ActionItem[] {
    return [{
        label: '修改',
        disabled: !hasPermission(111),
        onClick: () => {
            openDrawer(true, {
                pageStatus: 'edit',
                id: record.id,
                selectObj: data.selectObj
            });
            setDrawerProps({
                title: '修改',
                isDetail: true
            });
        }
    }, {
        label: '删除',
        disabled: !hasPermission(111),
        popConfirm: {
            title: '确认删除？',
            placement: 'topRight',
            confirm: () => {
                handle_delete(record);
            }
        }
    }];
}

// 新增操作
function handle_create():void {
    openDrawer(true, {
        pageStatus: 'add',
        selectObj: data.selectObj
    });
    setDrawerProps({
        title: '新增',
        isDetail: true
    });
}

// 删除操作
async function handle_delete(record: IXxxListRes):Promise<void> {
    globalStore.pageLoading = true;
    const _req = {
        id: record.id
    };
    const _res = await api_xxx_delete(_req);
    if (_res.code === 200) {
        createMessage.success('删除成功');
        get_list_data();
    }
}

// 获取下拉框数据
async function get_select_list():Promise<void> {
    const _res = await api_xxx_select();
    if (_res.code === 200) {
        data.selectObj = _res.data;
    }
}

// 获取列表数据
async function get_list_data():Promise<void> {
    const _values = getFieldsValue();
    const _req = {
        ...sortData,
        ..._values,
        page: data.pageOption.current,
        page_size: data.pageOption.pageSize
    };
    globalStore.pageLoading = true;
    const _res = await api_xxx_list(_req);
    if (_res.code === 200) {
        data.tableData.header = get_table_header_columns({
            ..._res.data.header,
            action: '操作'
        }, {
            widthData: {
                action: 80,
                ...(await getResizeColumn())
            },
            sortData: ['id']
        });
        customColumnModal.data.rawColumns = getColumnsConfig(data.tableData.header);
        data.tableData.list = _res.data?.list || [];
        data.pageOption.total = _res.data.pagination?.count || 0;
    }
}

onMounted(() => {
    get_select_list();
    get_list_data();
});

</script>

<style lang='scss' scoped>
</style>
