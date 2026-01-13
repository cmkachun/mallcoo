/**
 * 猫酷多账号 Token 抓取 - cmkachun
 */
const headerToken = $request.headers['Token'] || $request.headers['token'];
const body = JSON.parse($request.body || "{}");
const mallId = body.MallID;
const bodyToken = body.Header ? body.Header.Token : null;
const token = headerToken || bodyToken;

if (token && mallId) {
    let mallData = $persistentStore.read("mallcoo_multi_data");
    mallData = mallData ? JSON.parse(mallData) : {};
    
    // 更新数据，以 MallID 为 Key 存储 Token
    mallData[mallId] = token;
    
    const success = $persistentStore.write(JSON.stringify(mallData), "mallcoo_multi_data");
    
    if (success) {
        $notification.post("猫酷脚本", `✅ 账号 [${mallId}] 获取成功`, "Token 已自动更新，支持多商场运行");
        console.log(`💎 商场 ${mallId} Token 获取成功: ${token}`);
    }
}
$done({});
