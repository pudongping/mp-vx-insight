console.log("MP-VX-Insight ==> loading content.js")

function getContent() {
    const safeContent = (v) => {
        return v && typeof v === 'object' ? String(v.content) : ''
    }

    const title = document.querySelector('meta[property="og:title"]')
    const author = document.querySelector('meta[property="og:article:author"]')
    const url = document.querySelector('meta[property="og:url"]')
    const cover_image = document.querySelector('meta[property="og:image"]')
    const description = document.querySelector('meta[property="og:description"]')

    return {
        title: safeContent(title),
        author: safeContent(author),
        url: safeContent(url),
        cover_image: safeContent(cover_image),
        description: safeContent(description)
    }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("MP-VX-Insight ==> content.js ==> receive from popup2content msg -> ", message)
    let req = {
        type: "content2popup",
    }

    if ("initData" === message.action) {
        const fetchData = getContent()
        console.log("MP-VX-Insight ==> 微信小助手获取到的数据：", fetchData)
        req.action = "afterFetchData"
        req.params = fetchData
        req.info = "抓取了页面上的数据"
    }

    chrome.runtime.sendMessage(req, res => {
        console.log("MP-VX-Insight ==> content2popup then res -> ", res)
    })

    sendResponse("MP-VX-Insight ==> content.js 收到来自 popup.js 的消息")
})