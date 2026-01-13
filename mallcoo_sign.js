/**
 * 猫酷多账号批量签到 - cmkachun
 */
let mallData = $persistentStore.read("mallcoo_multi_data");

if (!mallData) {
    $notification.post("猫酷签到", "❌ 失败", "未找到任何账号数据，请先进入各个小程序手动签到一次");
    $done();
} else {
    const accounts = JSON.parse(mallData);
    const mallIds = Object.keys(accounts);
    let completed = 0;
    let summary = "";

    console.log(`开始执行 ${mallIds.length} 个商场的批量签到...`);

    for (const id of mallIds) {
        const currentToken = accounts[id];
        const myRequest = {
            url: `https://m.mallcoo.cn/api/user/User/CheckinV2`,
            method: `POST`,
            headers: {
                'Content-Type': `application/json`,
                'User-Agent': `Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.50`
            },
            body: JSON.stringify({
                "MallID": Number(id),
                "Header": { "Token": currentToken, "systemInfo": { "model": "iPhone", "system": "iOS 18.0" } },
                "Longitude": 0, "Latitude": 0, "InMall": 0
            })
        };

        $httpClient.post(myRequest, (error, response, data) => {
            completed++;
            let resultName = `商场[${id}]`;
            
            if (error) {
                summary += `❌ ${resultName}: 网络错误\n`;
            } else {
                try {
                    const res = JSON.parse(data);
                    if (res.s === 1 || res.v === true) {
                        summary += `✅ ${resultName}: 成功 ${res.d || ""}\n`;
                    } else if (res.m === 2054 || (res.e && res.e.indexOf("已签到") !== -1)) {
                        summary += `ℹ️ ${resultName}: 今日已签\n`;
                    } else {
                        summary += `⚠️ ${resultName}: 失败(${res.e || res.m})\n`;
                    }
                } catch (e) {
                    summary += `❌ ${resultName}: 解析失败\n`;
                }
            }

            // 检查是否全部完成
            if (completed === mallIds.length) {
                $notification.post("猫酷批量签到报告", `共执行 ${mallIds.length} 个账号`, summary);
                $done();
            }
        });
    }
}
