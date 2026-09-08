/**
 * 生成一套模拟时序数据
 * 时间范围：07‑23 12:00 ~ 07‑30 12:00，每2小时一个时间点
 * @param {number} deviceCount - 设备数量
 * @param {number} min - 随机最小值
 * @param {number} max - 随机最大值
 * @returns {{dateList:string[], dataList:Array<{name:string,list:number[]}>, tempList:Array<{name:string,value:number,status:string,type:string}>}}
 */
export function generateMockData(deviceCount = 5, min = 15, max = 80) {
    const dateList = [];
    let current = new Date('2026-07-23 12:00:00');
    const end = new Date('2026-07-30 12:00:00');

    while (current.getTime() <= end.getTime()) {
        const m = String(current.getMonth() + 1).padStart(2, '0');
        const d = String(current.getDate()).padStart(2, '0');
        const h = String(current.getHours()).padStart(2, '0');
        const mi = String(current.getMinutes()).padStart(2, '0');
        dateList.push(`${m}-${d} ${h}:${mi}`);
        current.setHours(current.getHours() + 2);
    }

    const dataList = [];
    for (let i = 1; i <= deviceCount; i++) {
        const sn = String(i).padStart(3, '0');
        const name = `4Y03_MT${sn}`;
        const list = dateList.map(() => {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        });
        dataList.push({ name, list });
    }

    const tempList = dataList.map(item => {
        const lastVal = item.list[item.list.length - 1];
        return {
            name: item.name,
            value: lastVal,
            status: 'green',
            type: '温度'
        };
    });

    return {
        dateList,
        dataList,
        tempList
    };
}


/**
 * 批量生成N套数据集
 * @param {number} batchNum 需要生成多少套
 * @param {number} deviceCount 每套里面设备数量
 * @param {number} min
 * @param {number} max
 * @returns Array<{dateList,dataList,tempList}>
 */
export function generateBatchMockData(batchNum, deviceCount = 5, min = 15, max = 80) {
    const result = [];
    for (let i = 0; i < batchNum; i++) {
        const oneSet = generateMockData(deviceCount, min, max);
        result.push(oneSet);
    }
    return result;
}