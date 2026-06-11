<template>
    <div class="avatar-area">
        <el-upload class="avatar-uploader" action="#" :show-file-list="false" name="file"
            :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload" :http-request="upload">
            <div v-if="props.modelValue" class="avatar">
                <img :src="props.modelValue" style="width: 100%;height: 100%;" />
                <div class="modal-mask">
                    <el-icon class="delete-icon" @click.stop="handleDel">
                        <Delete />
                    </el-icon>
                </div>
            </div>
            <el-icon v-else class="avatar-uploader-icon">
                <Plus />
            </el-icon>
        </el-upload>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import request from "@/utils/request"
const emits = defineEmits(['update:modelValue'])
const props = defineProps({
    modelValue: {
        type: String,
        default: ''
    },
    limit: {
        type: Number,
        default: 2 * 1024 * 1024  // 2Mb
    },
    accept: {
        type: Array,
        default() { return ['image/jpeg', 'image/png', 'image/gif'] }
    }
})

const handleAvatarSuccess = (response, uploadFile) => {
    props.modelValue = URL.createObjectURL(uploadFile.raw)
}
const upload = (options) => {
    request.post('/app/base/comm/upload', { file: options.file }, { headers: { 'Content-Type': 'multipart/form-data' } }).then(res => {
        console.log('>res>>>>', res);
        if (res.code == 1000) {
            emits('update:modelValue', res.data)
            ElMessage.success("上传成功")
        }
    })
}
const beforeAvatarUpload = (rawFile) => {
    if (!props.accept.includes(rawFile.type)) {
        ElMessage.error('头像仅支持jpg/png/gif格式!')
        return false
    } else if (rawFile.size > props.limit) {
        ElMessage.error('图片大小超过2M!')
        return false
    }
    return true
}
const handleDel = () => {
    emits('update:modelValue', '')
}
</script>
<style scoped lang='scss'>
.avatar-area {
    // width: 100px;
    // height: 100px;
}

.modal-mask {
    display: none;
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.3);
    justify-content: center;
    align-items: center;
    z-index: 11;
    cursor: default;
}

.avatar:hover {
    .modal-mask {
        display: flex;

    }
}

.avatar-uploader .avatar {
    width: 100px;
    height: 100px;
    display: block;
    position: relative;
}
</style>

<style>
.avatar-uploader .el-upload {
    border: 1px dashed var(--el-border-color);
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
    border-color: var(--el-color-primary);
}

.delete-icon {
    font-size: 22px;
    color: #fff;
    text-align: center;
    cursor: pointer;
}

.el-icon.avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 100px;
    height: 100px;
    text-align: center;
}
</style>