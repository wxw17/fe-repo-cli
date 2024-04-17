<template>
    <q-drawer @register="registerDrawer" @ok="edit_save" @close="edit_cancel">
        <q-form @register="registerForm">
            <template #slotRatio="{ model, field }"></template>
        </q-form>
    </q-drawer>
</template>

<script lang='ts' setup>
import { reactive, computed } from 'vue';
import { api_xxx_info, api_xxx_create, api_xxx_update} from '@/http/api/xxx';
import { IXxxInfoRes } from '@/http/api/xxx/interface';
import { QDrawer, useDrawerInner, QForm, FormSchema, useForm } from '@q-front-npm/vue3-antd-pc-ui';
import { useMessage } from '@q-front-npm/hooks/vue';

const emits = defineEmits(['ok', 'register']);

interface IDataProps {
    id: number; // 主键id
    pageStatus: IPageStatus; // 页面状态
}
const data: IDataProps = reactive({
    id: 0,
    pageStatus: 'add'
});

const { createMessage } = useMessage();
const [registerDrawer, { closeDrawer, changeLoading }] = useDrawerInner(({ pageStatus, id }) => {
    data.pageStatus = pageStatus;
    if (id) {
        data.id = id;
        get_detail();
    }
});

const schemas = computed<FormSchema<IXxxInfoRes>[]>(() => [
    {
        label: '账户名称',
        field: 'account_name',
        component: 'Input',
        componentProps: {
            placeholder: '账户名称'
        },
        rules: [{
            required: true,
            trigger: 'blur'
        }]
    },
    {
        label: '账户类型',
        field: 'account_type',
        component: 'RadioButtonGroup',
        componentProps: ({ formModel }) => {
            return {
                buttonStyle: 'outline',
                options: [
                    { label: '广告主', value: 1 },
                    { label: '代理商', value: 2 }
                ],
                onChange: () => {
                    formModel.account_name = '';
                    clearValidate('account_name');
                }
            };
        },
        defaultValue: 1
    }
]);

const [registerForm, { getFieldsValue, setFieldsValue, validate, clearValidate, resetFields }] = useForm({
    schemas,
    labelWidth: 150,
    baseColProps: { span: 24 },
    wrapperCol: { span: 6 },
    showActionButtonGroup: false
});

// 获取详情数据
async function get_detail() {
    changeLoading(true);
    const _res = await api_xxx_info({ id: data.id });
    changeLoading(false);
    if (_res.code === 200) {
        setFieldsValue({
            ..._res.data
        });
    }
}

// 保存操作
async function edit_save() {
    await validate();
    const _values = getFieldsValue();
    if (data.pageStatus === 'edit') _values.id = data.id;
    const _apiUrl = data.pageStatus === 'add' ? api_xxx_create : api_xxx_update;
    changeLoading(true);
    const _res = await _apiUrl(_values);
    changeLoading(false);
    if (_res.code === 200) {
        createMessage.success(data.pageStatus === 'add' ? '新增成功' : '保存成功');
        emits('ok');
        resetFields();
        closeDrawer();
    }
}

// 清空数据
function edit_cancel() {
    resetFields();
}
</script>

<style lang='scss' scoped>
</style>
