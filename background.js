chrome.runtime.onInstalled.addListener(() => {
    console.log("MP-VX-Insight ==> Extension installed")

    // https://developer.chrome.com/docs/extensions/reference/api/declarativeContent?hl=zh-cn
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
        chrome.declarativeContent.onPageChanged.addRules([
            {
                conditions: [
                    new chrome.declarativeContent.PageStateMatcher({
                        pageUrl: {hostEquals: 'mp.weixin.qq.com'},
                    }),
                ],
                actions: [new chrome.declarativeContent.ShowAction()]
            }
        ])
    })

})

// chrome.action.setBadgeText({ text: "VX" })
// chrome.action.setBadgeBackgroundColor({color: "#ff9900"})