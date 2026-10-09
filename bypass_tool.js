#!/usr/bin/env node
/**
 * ============================================================
 *   BYPASS ALL IN ONE - JAVASCRIPT EDITION
 *   Tác giả: Duyzoz
 *   Repo: https://github.com/duyzoz/BYPASS-ALL-IN-ONE
 * ============================================================
 */

const readline = require('readline');

// Polyfill prompt utility
function createInterface() {
    return readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
}

function ask(questionText) {
    const rl = createInterface();
    return new Promise((resolve) => {
        rl.question(questionText, (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

class BypassTool {
    constructor() {
        this.rod = Math.floor(100000 + Math.random() * 900000);
        this.rad = String(this.rod);
        this.unixTime = Math.floor(Date.now() / 1000);
    }

    banner() {
        console.clear();
        console.log("============================================================");
        console.log("       BYPASS SHORT LINK ALL-IN-ONE (JS EDITION)");
        console.log("       Tác giả: Duyzoz");
        console.log("       Repo: https://github.com/duyzoz/BYPASS-ALL-IN-ONE");
        console.log("============================================================");
        console.log("\nCác chế độ hỗ trợ:");
        console.log("  [1] YeuMoney  - Bypass nhiệm vụ YeuMoney / Traffic-User");
        console.log("  [2] Link4M    - Bypass link traffic Link4M (What-on)");
        console.log("  [3] FunLink   - Bypass link FunLink.io");
        console.log("  [4] LinkTot   - Bypass link LinkTot.net (XOR Decrypt)");
        console.log("  [5] Link4Sub  - Bypass link Link4Sub.com (Instant)");
        console.log("  [6] LaymaNet  - Bypass link LayMa.net");
        console.log("  [0] Thoát");
        console.log("============================================================\n");
    }

    /**
     * [1] YEUMONEY BYPASS
     */
    async yeumoneyBypass() {
        console.log("\n=== [1] YEUMONEY BYPASS ===");
        console.log("Đang chuẩn bị gửi request...");

        const taskTypes = {
            'm88': { url: 'https://bet88ec.com/cach-danh-bai-sam-loc', domain: 'https://bet88ec.com/', code: 'taodeptrai' },
            'fb88': { url: 'https://fb88dq.com/cach-choi-ca-cuoc-golf', domain: 'https://fb88dq.com/', code: 'taodeptrai' },
            '188bet': { url: 'https://88betag.com/cach-choi-game-bai-pok-deng', domain: 'https://88betag.com/', code: 'taodeptrailamnhe' },
            'w88': { url: 'https://165.22.63.250/soi-keo-tottenham-vs-crystal-palace-02-03-2024', domain: 'https://165.22.63.250/', code: 'taodeptrai' },
            'v9bet': { url: 'https://v9betho.com/ca-cuoc-bong-ro-ao', domain: 'https://v9betho.com/', code: 'taodeptrai' },
            'vn88': { url: 'https://vn88sv.com/cach-choi-bai-gao-gae', domain: 'https://vn88sv.com/', code: 'bomaydeptrai' },
            'bk8': { url: 'https://bk8ze.com/cach-choi-bai-catte', domain: 'https://bk8ze.com/', code: 'taodeptrai' },
            'w88xlm': { url: 'https://w88xlm.com/cach-choi-bai-solitaire', domain: 'https://w88xlm.com/', code: 'taodeptrai' }
        };

        const directTypes = {
            '88betag': { url: 'https://88betag.com/keo-chau-a-la-gi', domain: 'https://88betag.com/', code: 'bomaylavua' },
            'w88abc': { url: 'https://w88abc.com/cach-choi-ca-cuoc-lien-quan-mobile', domain: 'https://w88abc.com/', code: 'bomaylavua' },
            'v9betlg': { url: 'https://v9betlg.com/phuong-phap-cuoc-flat-betting', domain: 'https://v9betlg.com/', code: 'bomaylavua' },
            'bk8xo': { url: 'https://bk8xo.com/lo-ba-cang-la-gi', domain: 'https://bk8xo.com/', code: 'bomaylavua' },
            'vn88ie': { url: 'https://vn88ie.com/cach-nuoi-lo-khung', domain: 'https://vn88ie.com/', code: 'bomaylavua' }
        };

        console.log("Danh sách loại nhiệm vụ:");
        const allKeys = [...Object.keys(taskTypes), ...Object.keys(directTypes)];
        console.log(allKeys.map(k => ` - ${k}`).join("\n"));

        const taskType = (await ask("\nNhập loại nhiệm vụ: ")).toLowerCase();
        let config = null;
        let endpoint = "";
        let paramName = "codexn";

        if (taskTypes[taskType]) {
            config = taskTypes[taskType];
            endpoint = 'https://traffic-user.net/GET_MA.php';
            paramName = 'codexn';
        } else if (directTypes[taskType]) {
            config = directTypes[taskType];
            endpoint = 'https://traffic-user.net/GET_MD.php';
            paramName = 'codexnd';
        } else {
            console.log("❌ Lựa chọn không hợp lệ!");
            return;
        }

        try {
            const reqUrl = `${endpoint}?${paramName}=${encodeURIComponent(config.code)}&url=${encodeURIComponent(config.url)}&loai_traffic=${encodeURIComponent(config.domain)}&clk=1000`;
            console.log(`Đang gửi request tới: ${endpoint}`);
            
            const res = await fetch(reqUrl, { method: 'POST' });
            if (!res.ok) {
                console.log(`❌ Lỗi HTTP: ${res.status}`);
                return;
            }

            const html = await res.text();
            const patterns = [
                /<span id="layma_me_vuatraffic"[^>]*>\s*(\d+)\s*<\/span>/i,
                /<span id="layma_me_tfudirect"[^>]*>\s*(\d+)\s*<\/span>/i,
                /layma_me_[a-zA-Z0-9]+[^>]*>\s*(\d+)\s*</i,
                /(\d{4,8})/
            ];

            let codeMatch = null;
            for (const p of patterns) {
                const match = html.match(p);
                if (match) {
                    codeMatch = match[1];
                    break;
                }
            }

            if (codeMatch) {
                console.log(`\n🎉 THÀNH CÔNG! Mã xác nhận: \x1b[32m${codeMatch}\x1b[0m`);
            } else {
                console.log("❌ Không tìm thấy mã trong phản hồi. Máy chủ có thể đã đổi định dạng.");
            }
        } catch (err) {
            console.log(`❌ Lỗi kết nối: ${err.message}`);
        }
    }

    /**
     * [2] LINK4M BYPASS
     */
    async link4mBypass() {
        console.log("\n=== [2] LINK4M BYPASS ===");
        const urlConfigs = {
            'https://soikeo.uk.com/': { key: 'u0cLg', path: '/', service: 'https://s1.what-on.com/widget/service.js' },
            'https://xosodientu.com/': { key: 'sdgQhQny', path: '/', service: 'https://s1.what-on.com/widget/service.js' },
            'https://hutbephotvietphat.vn/hut-be-phot-tai-hoa-binh-uy-tin-gia-re-0947-888-198-bid21.html': { key: 'U8022T1', path: '/hut-be-phot-tai-hoa-binh-uy-tin-gia-re-0947-888-198-bid21.html', service: 'https://s1.what-on.com/widget/service.js' },
            'https://fitting.us.com/': { key: 'gLaiBZ', path: '/', service: 'https://s1.what-on.com/widget/service.js' },
            'https://www.bape-shirt.us.com/': { key: 'UfeQFHhb', path: '/', service: 'https://s1.what-on.com/widget/service.js' },
            'https://dienlanh61.com/': { key: 'YjQKK7', path: '/', service: 'https://s1.what-on.com/widget/service-v2.js' },
            'https://88aas.com/': { key: 'fJn539c7', path: '/', service: 'https://s1.what-on.com/widget/service.js' }
        };

        const inputUrl = await ask("Nhập URL nhiệm vụ: ");
        let config = null;
        let testUrl = "";

        for (const target of Object.keys(urlConfigs)) {
            if (inputUrl.includes(new URL(target).hostname)) {
                config = urlConfigs[target];
                testUrl = target;
                break;
            }
        }

        if (!config) {
            console.log("❌ URL không nằm trong danh sách hỗ trợ!");
            return;
        }

        const headers = {
            'accept': '*/*',
            'referer': testUrl,
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        };

        try {
            console.log("Đang tải JS widget để lấy session...");
            const res = await fetch(`${config.service}?key=${encodeURIComponent(config.key)}`, { headers });
            const js = await res.text();

            const parseVar = (varName) => {
                const reg = new RegExp(`var\\s+${varName}\\s*=\\s*["']([^"']+)["']`, 'i');
                const m = js.match(reg);
                return m ? m[1] : null;
            };

            const trafficId = parseVar('traffic_id');
            const trafficSession = parseVar('traffic_session');

            if (!trafficId || !trafficSession) {
                console.log("❌ Không thể lấy traffic_id hoặc traffic_session từ widget!");
                return;
            }

            console.log(`Đã lấy session: ${trafficSession}. Đang chờ 90 giây an toàn...`);
            for (let i = 90; i > 0; i--) {
                process.stdout.write(`\rĐang chờ: ${i}s... `);
                await sleep(1000);
            }
            console.log("\nĐang gửi request nhận mã...");

            const getCodeUrl = new URL('https://s1.what-on.com/widget/get_code.html');
            getCodeUrl.search = new URLSearchParams({
                code: trafficId,
                traffic_session: trafficSession,
                screen: '1920 x 1080',
                browser: 'Chrome',
                browserVersion: '120',
                mobile: 'false',
                os: 'Windows',
                osVersion: '10',
                client_id: trafficSession,
                pathname: config.path,
                href: testUrl,
                hostname: testUrl
            }).toString();

            const finalRes = await fetch(getCodeUrl.toString(), { headers });
            const data = await finalRes.json();
            console.log("🎉 Kết quả:", data);
        } catch (err) {
            console.log(`❌ Lỗi: ${err.message}`);
        }
    }

    /**
     * [3] FUNLINK BYPASS
     */
    async funlinkBypass() {
        console.log("\n=== [3] FUNLINK BYPASS ===");
        const inputUrl = await ask("Nhập URL FunLink (vd: https://funlink.io/ABC123): ");
        const match = inputUrl.match(/funlink\.io\/([A-Za-z0-9]+)/);
        if (!match) {
            console.log("❌ URL không hợp lệ!");
            return;
        }

        const id = match[1];
        const headers = {
            'accept': 'application/json',
            'origin': 'https://funlink.io',
            'referer': 'https://funlink.io/',
            'rid': this.rad,
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        };

        try {
            console.log("Đang khởi tạo key...");
            const res = await fetch(`https://public.funlink.io/api/code/renew-key?id=${id}&ignoreId=${this.rad}`, { headers });
            const dt = await res.json();

            if (!dt || !dt.data_keyword) {
                console.log("❌ Không thể tạo session!");
                return;
            }

            const destination = dt.data_keyword.url_destination;
            const keyId = dt.data_keyword.id;
            const keywordText = dt.data_keyword.keyword_text;

            console.log(`Web nhiệm vụ: ${destination}`);
            console.log("Đang bắt đầu đếm ngược 60 giây an toàn...");
            for (let i = 60; i > 0; i--) {
                process.stdout.write(`\rCòn lại: ${i}s... `);
                await sleep(1000);
            }

            console.log("\nĐang lấy mã nhiệm vụ...");
            const codeRes = await fetch('https://public.funlink.io/api/code/code', {
                method: 'POST',
                headers: { ...headers, 'content-type': 'application/json' },
                body: JSON.stringify({
                    screen: '1920 x 1080',
                    browser_name: 'Chrome',
                    browser_version: '120.0.0.0',
                    is_mobile: false,
                    os_name: 'Windows',
                    os_version: '10',
                    href: `${destination}404`,
                    hostname: destination
                })
            });

            const codeJson = await codeRes.json();
            if (!codeJson || !codeJson.code) {
                console.log("❌ Không thể lấy mã từ FunLink!");
                return;
            }

            console.log("Đang lấy link gốc cuối cùng...");
            const trackRes = await fetch('https://public.funlink.io/api/url/tracking-url', {
                method: 'POST',
                headers: { ...headers, 'content-type': 'application/json' },
                body: JSON.stringify({
                    keyword_answer: codeJson.code,
                    link_shorten_id: id,
                    keyword: keywordText,
                    keyword_id: keyId,
                    device_name: 'desktop'
                })
            });

            const trackJson = await trackRes.json();
            if (trackJson && trackJson.data_link && trackJson.data_link.url) {
                console.log(`\n🎉 LINK ĐÍCH: \x1b[32m${trackJson.data_link.url}\x1b[0m`);
            } else {
                console.log("❌ Lỗi khi lấy link đích:", trackJson);
            }
        } catch (err) {
            console.log(`❌ Lỗi: ${err.message}`);
        }
    }

    /**
     * [4] LINKTOT BYPASS (XOR DECRYPT)
     */
    async linktotBypass() {
        console.log("\n=== [4] LINKTOT BYPASS ===");
        const questUrl = await ask("Nhập quest URL: ");
        const questType = (await ask("Nhập quest type (normal/backlink): ")).toLowerCase() || 'normal';

        const endpoint = questType === 'backlink' 
            ? 'https://linktot.net/ping_backlink.php' 
            : 'https://linktot.net/ping.php';

        const headers = {
            'origin': questUrl,
            'referer': questUrl,
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        };

        try {
            console.log("Gửi ping kích hoạt...");
            await fetch(endpoint, { method: 'OPTIONS', headers });

            console.log("Đang chờ 80 giây an toàn...");
            for (let i = 80; i > 0; i--) {
                process.stdout.write(`\rCòn lại: ${i}s... `);
                await sleep(1000);
            }

            console.log("\nĐang lấy mã và giải mã XOR...");
            const res = await fetch('https://linktot.net/get-code.php', {
                method: 'POST',
                headers: { ...headers, 'content-type': 'application/json' },
                body: JSON.stringify({ href: questUrl, hostname: questUrl })
            });

            const data = await res.json();
            if (!data || !data.code) {
                console.log("❌ Không nhận được mã!");
                return;
            }

            // Thuật toán XOR Giải mã
            const encryptedBase64 = data.code;
            const decodedBase64 = Buffer.from(encryptedBase64, 'base64').toString('utf-8');
            const key = "1ThDrStTr";
            let decrypted = "";
            for (let i = 0; i < decodedBase64.length; i++) {
                decrypted += String.fromCharCode(decodedBase64.charCodeAt(i) ^ key.charCodeAt(i % key.length));
            }

            console.log(`\n🎉 MÃ ĐÃ GIẢI MÃ: \x1b[32m${decrypted}\x1b[0m`);
        } catch (err) {
            console.log(`❌ Lỗi: ${err.message}`);
        }
    }

    /**
     * [5] LINK4SUB BYPASS (INSTANT)
     */
    async link4subBypass() {
        console.log("\n=== [5] LINK4SUB BYPASS ===");
        const inputUrl = await ask("Nhập URL Link4Sub (vd: https://link4sub.com/abc123): ");
        const match = inputUrl.match(/link4sub\.com\/([\w\-]+)/);
        if (!match) {
            console.log("❌ URL không hợp lệ!");
            return;
        }

        const scode = match[1];
        try {
            console.log("Đang lấy dữ liệu trực tiếp...");
            const res = await fetch(`https://link4sub.com/stu/${scode}/fetch-data`);
            if (!res.ok) {
                console.log(`❌ Lỗi HTTP: ${res.status}`);
                return;
            }

            const data = await res.json();
            const encodedUrl = data?.data?.data?.lnk?.lnk1?.url;
            if (!encodedUrl) {
                console.log("❌ Không tìm thấy trường link đích!");
                return;
            }

            // Base64 decode + URL unquote
            const decoded = decodeURIComponent(Buffer.from(encodedUrl, 'base64').toString('utf-8'));
            console.log(`\n🎉 LINK ĐÍCH: \x1b[32m${decoded}\x1b[0m`);
        } catch (err) {
            console.log(`❌ Lỗi: ${err.message}`);
        }
    }

    /**
     * [6] LAYMANET BYPASS
     */
    async laymanetBypass() {
        console.log("\n=== [6] LAYMANET BYPASS ===");
        let inputUrl = await ask("Nhập URL nhiệm vụ / domain đích (vd: https://idelec.com.co/): ");
        if (!inputUrl.startsWith('http://') && !inputUrl.startsWith('https://')) {
            inputUrl = 'https://' + inputUrl;
        }

        let keyToken = await ask("Nhập KeyToken (để trống để tự động quét từ URL): ");
        if (!keyToken) {
            console.log(`[*] Đang quét KeyToken từ ${inputUrl}...`);
            try {
                const pageRes = await fetch(inputUrl, {
                    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
                });
                const pageText = await pageRes.text();
                const m = pageText.match(/Traffic\/Index\/([a-zA-Z0-9_-]+)/i) || 
                          pageText.match(/keytoken=([a-zA-Z0-9_-]+)/i) ||
                          pageText.match(/layma\.net\/Traffic\/Index\/([a-zA-Z0-9_-]+)/i);
                if (m) {
                    keyToken = m[1];
                    console.log(`[+] Tìm thấy KeyToken: ${keyToken}`);
                } else {
                    keyToken = await ask("[-] Không tìm thấy tự động. Nhập KeyToken thủ công: ");
                }
            } catch (err) {
                keyToken = await ask(`[-] Lỗi khi tải URL (${err.message}). Nhập KeyToken thủ công: `);
            }
        }

        if (!keyToken) {
            console.log("❌ Không có KeyToken, hủy thao tác.");
            return;
        }

        const platformChoice = await ask("Nhập platform (1: google, 2: tructiep [default: 2]): ");
        const platform = platformChoice === '1' ? 'google' : 'tructiep';

        try {
            console.log("[*] Khởi tạo Traffic Session...");
            const sessRes = await fetch('https://api.layma.net/api/traffic/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keyToken: keyToken })
            });
            const sessData = await sessRes.json();
            const sessionToken = sessData?.sessionToken || sessData?.SessionToken;
            if (!sessionToken) {
                console.log("❌ Lỗi lấy Session Token!");
                return;
            }
            console.log(`[+] Session Token: ${sessionToken.substring(0, 20)}...`);

            console.log("[*] Đang lấy thông tin chiến dịch (Campaign)...");
            const campRes = await fetch(`https://api.layma.net/api/admin/campain?keytoken=${keyToken}&flatform=${platform}&waitMode=1&requiredPageVisits=1`, {
                headers: {
                    'X-Traffic-Session': sessionToken,
                    'Origin': inputUrl,
                    'Referer': inputUrl
                }
            });
            const campData = await campRes.json();
            const trafficId = campData?.id || '';
            const waitSeconds = Math.max(85, campData?.requiredWaitSeconds || 85);
            console.log(`[+] Traffic ID: ${trafficId} | Wait Time: ${waitSeconds}s`);

            console.log(`[*] Đếm ngược ${waitSeconds} giây theo quy định LayMa...`);
            for (let remaining = waitSeconds; remaining > 0; remaining--) {
                process.stdout.write(`\r[->] Thời gian còn lại: ${remaining}s... `);
                await sleep(1000);
            }
            console.log("\n[+] Hoàn tất chờ!");

            console.log("[*] Đang gửi yêu cầu nhận mã tới /api/traffic/getcode...");
            const codeRes = await fetch('https://api.layma.net/api/traffic/getcode', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Traffic-Session': sessionToken,
                    'Origin': inputUrl,
                    'Referer': inputUrl
                },
                body: JSON.stringify({
                    uuid: String(Math.floor(100000 + Math.random() * 900000)),
                    browser: 'Chrome',
                    browserVersion: '120',
                    browserMajorVersion: 120,
                    cookies: true,
                    mobile: false,
                    os: 'Windows',
                    osVersion: '10',
                    screen: '1920 x 1080',
                    referrer: inputUrl,
                    trafficId: trafficId,
                    trafficSessionToken: sessionToken,
                    solution: 1
                })
            });

            const codeData = await codeRes.json();
            const rawCode = codeData?.html || codeData?.code || codeData?.data || '';
            const m = String(rawCode).match(/[a-zA-Z0-9]{4,10}/);
            const finalCode = m ? m[0] : String(rawCode).trim();

            if (finalCode) {
                console.log(`\n========================================`);
                console.log(`   🎉 BYPASS LAYMA THÀNH CÔNG!`);
                console.log(`   MÃ NHẬN ĐƯỢC:  \x1b[32m${finalCode}\x1b[0m`);
                console.log(`========================================\n`);
            } else {
                console.log("❌ Không trích xuất được mã:", codeData);
            }
        } catch (err) {
            console.log(`❌ Lỗi: ${err.message}`);
        }
    }

    async run() {
        while (true) {
            this.banner();
            const choice = await ask("Chọn chức năng (0-6): ");
            switch (choice) {
                case '1': await this.yeumoneyBypass(); break;
                case '2': await this.link4mBypass(); break;
                case '3': await this.funlinkBypass(); break;
                case '4': await this.linktotBypass(); break;
                case '5': await this.link4subBypass(); break;
                case '6': await this.laymanetBypass(); break;
                case '0':
                    console.log("\nCảm ơn bạn đã sử dụng Bypass Tool by Duyzoz!");
                    process.exit(0);
                default:
                    console.log("Lựa chọn không hợp lệ!");
            }

            const cont = await ask("\nBạn có muốn tiếp tục? (y/n): ");
            if (!['y', 'yes', 'có', 'c'].includes(cont.toLowerCase())) {
                console.log("\nTạm biệt!");
                break;
            }
        }
    }
}

if (require.main === module) {
    const tool = new BypassTool();
    tool.run().catch(console.error);
}

module.exports = BypassTool;
