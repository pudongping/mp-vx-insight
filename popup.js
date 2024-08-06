console.log("MP-VX-Insight ==> loading popup.js")
const alertCVMSG = "Copy successfully! You can use Ctrl+v or Command+V to do so!"

function getUriParams(url) {
    const params = {}
    const queryString = url.split("?")[1]
    const bizPrefix = "__biz"

    if (queryString) {
        const keyValuePairs = queryString.split("&")
        keyValuePairs.forEach(keyValue => {
            let [key, value] = keyValue.split("=")
            if (keyValue.startsWith(bizPrefix)) {
                key = bizPrefix
                value = keyValue.substring(bizPrefix.length + 1)
            }
            params[key] = decodeURIComponent(value)
        })
    }

    return params
}

function toggleLoading(button) {
    button.disabled = !button.disabled // 切换按钮禁用状态
    button.classList.toggle("loading") // 切换加载状态样式

    const spinner = button.querySelector(".spinner") || document.createElement("div")
    if (!button.contains(spinner)) {
        spinner.classList.add("spinner")
        button.appendChild(spinner)
    } else {
        button.removeChild(spinner)
    }
}

function copyImageUrl() {
    const imageUrl = document.getElementById("articleCoverImage").src
    if (!imageUrl) {
        alert("Can't get the link address for the cover art!")
        return
    }

    navigator.clipboard.writeText(imageUrl).then(() => {
        alert(alertCVMSG)
        console.log("MP-VX-Insight ==> Image URL copied to clipboard: " + imageUrl)
    }).catch(err => {
        console.error("MP-VX-Insight ==> Failed to copy: ", err)
    })
}

function openImageUrl() {
    const imageUrl = document.getElementById("articleCoverImage").src
    if (!imageUrl) {
        alert("Can't get the link address for the cover art!")
        return
    }

    window.open(imageUrl)
}

function downloadCoverImage() {
    const imageUrl = document.getElementById("articleCoverImage").src
    if (!imageUrl) {
        alert("Can't get the link address for the cover art!")
        return
    }

    const downloadCoverImageBtn = document.getElementById("downloadCoverImage")
    toggleLoading(downloadCoverImageBtn)

    fetch(imageUrl)
        .then(response => response.blob())
        .then(blob => {
            const blobUrl = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = blobUrl
            a.download = "cover_image.png"
            document.body.appendChild(a)
            a.click()
            // 下载完成后，从文档中移除创建的链接元素
            document.body.removeChild(a)
            // 释放之前通过 createObjectURL 创建的 URL 关联的 Blob 对象所占用的内存
            window.URL.revokeObjectURL(blobUrl)
        })
        .catch(err => console.error("MP-VX-Insight ==> downloadCoverImage Error: ", err))

    toggleLoading(downloadCoverImageBtn)
}

function copyArticleHistoryUrl() {
    const articleUrl = document.getElementById("articleUrlContent").textContent
    if (!articleUrl) {
        alert("Can't get the article url!")
        return
    }

    const params = getUriParams(articleUrl)
    // https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MzIzMDE2MzA3NQ==
    const historyUrl = `https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=${encodeURIComponent(params.__biz)}`

    navigator.clipboard.writeText(historyUrl).then(() => {
        alert(alertCVMSG)
        console.log("MP-VX-Insight ==> VX Home URL copied to clipboard: " + historyUrl)
    }).catch(err => {
        console.error("MP-VX-Insight ==> Failed to copy: ", err)
    })
}

function noticeTitle() {
    const src = document.getElementById("articleCoverImage").src
    if (src.endsWith("icon128.png")) {
        alert("请刷新当前页面之后，再打开此插件！")
        return null
    }
    // initializeData()
}

function coverData(data) {
    document.getElementById("articleCoverImage").src = data.cover_image
    document.getElementById("titleContent").textContent = data.title
    document.getElementById("authorContent").textContent = data.author
    document.getElementById("descriptionContent").textContent = data.description
    document.getElementById("articleUrlContent").textContent = data.url
}

async function pickArticleContent() {
    const articleUrl = document.getElementById("articleUrlContent").textContent
    if (!articleUrl) {
        alert("Can't get the article url!")
        return
    }
    const pickArticleContentBtn = document.getElementById("pickArticleContent")
    toggleLoading(pickArticleContentBtn)

    const url = "https://r.jina.ai/" + articleUrl
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
            }
        })

        if (!response.ok) {
            alert("Network response was not ok")
            return
        }
        const text = await response.text()
        if (!text) {
            alert("No text to copy")
            return
        }
        await navigator.clipboard.writeText(text)
        alert(alertCVMSG)
    } catch (err) {
        console.error("MP-VX-Insight ==> Failed to copy: ", err)
        alert("采集出现错误：" + err.message || err)
    } finally {
        toggleLoading(pickArticleContentBtn)
    }

}

function registerButtonListener(btnID, func) {
    document.getElementById(btnID).addEventListener("click", () => {
        func()
    })
}

function updateCopyrightYear() {
    const currentYear = new Date().getFullYear();
    document.getElementById("copyright").innerHTML =
        `&copy; ${currentYear} <a href="https://github.com/pudongping/mp-vx-insight" target="_blank">pudongping@GitHub</a>`;
}

function initializeData() {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, (tabs) => {

        if (tabs.length > 0) {
            const currentUrl = tabs[0].url
            const parsedUrl = new URL(currentUrl)
            const currentDomain = parsedUrl.hostname
            if ("mp.weixin.qq.com" !== currentDomain) {
                alert("此插件仅适用于微信公众号文章页 mp.weixin.qq.com")
                window.close()
                return null
            }

            const req = {
                type: "popup2content",
                action: "initData",
                info: "初始化 popup.html 页面数据"
            }
            chrome.tabs.sendMessage(tabs[0].id, req, res => {
                console.log("MP-VX-Insight ==> popup2content then res -> ", res)
            })
        }

    })
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("MP-VX-Insight ==> Start!")

    registerButtonListener("copyImageUrl", copyImageUrl)
    registerButtonListener("copyArticleHistoryUrl", copyArticleHistoryUrl)
    registerButtonListener("openImageUrl", openImageUrl)
    registerButtonListener("downloadCoverImage", downloadCoverImage)
    registerButtonListener("noticeTitle", noticeTitle)
    registerButtonListener("pickArticleContent", pickArticleContent)

    updateCopyrightYear()
    initializeData()
})


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("MP-VX-Insight ==> popup.js ==> receive from content2popup msg -> ", message)

    if ("afterFetchData" === message.action) {
        coverData(message.params)
    }

    sendResponse("MP-VX-Insight ==> popup.js 收到来自 content.js 的消息")
})