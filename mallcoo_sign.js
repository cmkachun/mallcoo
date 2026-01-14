/**
 * @fileoverview 猫酷多账号批量签到 (强制通知排版优化版)
 */

let mallData = $persistentStore.read("mallcoo_multi_data");

if (!mallData) {
    $notification.post("猫酷签到", "❌ 失败", "未找到任何账号数据，请先进入小程序手动签到一次");
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
            let mallName = `商场[${id}]`;
            
            if (error) {
                summary += `❌ ${mallName}: 网络错误\n`;
            } else {
                try {
                    const res = JSON.parse(data);
                    
                    // 1. 签到成功
                    if (res.s === 1 || res.v === true) {
                        const point = res.d || "未知";
                        summary += `✅ ${mallName}: 获得 ${point} 积分\n`;
                    } 
                    // 2. 今日已签到 (对应状态码 2054)
                    else if (res.m === 2054 || (res.e && res.e.indexOf("已签到") !== -1)) {
                        summary += `ℹ️ ${mallName}: 今日已签过\n`;
                    } 
                    // 3. Token 失效
                    else if (res.m === 2001 || (res.e && res.e.indexOf("登录") !== -1)) {
                        summary += `⚠️ ${mallName}: Token 失效\n`;
                    }
                    // 4. 其他错误
                    else {
                        summary += `❓ ${mallName}: ${res.e || res.m || "未知"}\n`;
                    }
                } catch (e) {
                    summary += `❌ ${mallName}: 解析失败\n`;
                }
            }

            // 检查是否全部完成
            if (completed === mallIds.length) {
                // 发送精美汇总通知
                const finalTitle = mallIds.length > 1 ? "猫酷批量签到报告" : "猫酷签到结果";
                $notification.post(finalTitle, `共处理 ${mallIds.length} 个商场账号`, summary);
                
                // 增加延时确保通知发出后再关闭
                setTimeout(() => {
                    $done();
                }, 500);
            }
        });
    }
}
