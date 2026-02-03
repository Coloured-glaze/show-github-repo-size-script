// ==UserScript==
// @name        显示 Github 仓库大小
// @namespace   Violentmonkey Scripts
// @match       https://github.com/*
// @grant       none
// @version     0.0.5
// @author      bling-yshs
// @description 一个简单的油猴脚本，可以显示当前 Github 仓库的大小（暂不支持私人仓库）
// @icon         https://github.githubassets.com/pinned-octocat.svg
// @license     MIT
// @homepageURL https://greasyfork.org/zh-CN/scripts/493368-%E6%98%BE%E7%A4%BA-github-%E4%BB%93%E5%BA%93%E5%A4%A7%E5%B0%8F
// @downloadURL https://update.greasyfork.org/scripts/493368/%E6%98%BE%E7%A4%BA%20Github%20%E4%BB%93%E5%BA%93%E5%A4%A7%E5%B0%8F.user.js
// @updateURL https://update.greasyfork.org/scripts/493368/%E6%98%BE%E7%A4%BA%20Github%20%E4%BB%93%E5%BA%93%E5%A4%A7%E5%B0%8F.meta.js
// ==/UserScript==

// 开源地址：https://github.com/bling-yshs/show-github-repo-size-script，欢迎反馈

let currentRepoSize = 0;

async function main() {
  if (!window.location.href.match(/github\.com\/[^\/]+\/[^\/]+/)) {
    console.log('不在仓库页面，跳过执行');
    return;
  }
  
  console.log('开始等待导航栏元素...');
  await waitForElement('ul.prc-components-UnderlineItemList-xKlKC');
  
  const repoSize = await getRepoSize();
  if (repoSize === 0) {
    return;
  }
  currentRepoSize = repoSize;
  
  addSizeDisplay();
  observeChanges();
}

function addSizeDisplay() {
  const mbSize = (currentRepoSize / 1024).toFixed(2);
  
  let ul = document.querySelector('ul.prc-components-UnderlineItemList-xKlKC');
  
  if (!ul) {
    console.log('尝试备用选择器...');
    ul = document.querySelector('ul.UnderlineNav-body');
  }
  
  if (!ul) {
    console.log('未找到导航栏元素，可能不在仓库页面');
    console.log('当前 URL:', window.location.href);
    return;
  }
  
  const existingSizeItem = document.querySelector('li[data-repo-size="true"]');
  if (existingSizeItem) {
    console.log('大小显示已存在，跳过添加');
    return;
  }
  
  console.log('找到导航栏元素，准备添加大小显示');
  
  const liHtml = `<li class="prc-UnderlineNav-UnderlineNavItem-syRjR" data-repo-size="true">
  <a href="#" class="prc-components-UnderlineItem-7fP-n">
    <span data-component="icon">
      <svg aria-hidden="true" focusable="false" class="octicon octicon-database" viewBox="0 0 16 16" width="16" height="16" fill="currentColor" display="inline-block" overflow="visible" style="vertical-align:text-bottom">
        <path d="M8 1c2.2 0 4.1.6 5.4 1.6C14.7 3.6 15.5 4.8 15.5 6s-.8 2.4-2.1 3.4C12.1 10.4 10.2 11 8 11s-4.1-.6-5.4-1.6C1.3 8.4.5 7.2.5 6s.8-2.4 2.1-3.4C3.9 1.6 5.8 1 8 1ZM1.5 6c0 .8.6 1.6 1.7 2.3C4.4 9.2 6.1 9.7 8 9.7s3.6-.5 4.8-1.4c1.1-.7 1.7-1.5 1.7-2.3s-.6-1.6-1.7-2.3C11.6 2.8 9.9 2.3 8 2.3s-3.6.5-4.8 1.4C2.1 4.4 1.5 5.2 1.5 6Zm0 4v3c0 .8.6 1.6 1.7 2.3 1.2.9 2.9 1.4 4.8 1.4s3.6-.5 4.8-1.4c1.1-.7 1.7-1.5 1.7-2.3v-3c-.6.6-1.4 1.1-2.3 1.5-1.5.6-3.3 1-5.2 1s-3.7-.4-5.2-1C2.9 11.1 2.1 10.6 1.5 10Zm0 4v3c0 .8.6 1.6 1.7 2.3 1.2.9 2.9 1.4 4.8 1.4s3.6-.5 4.8-1.4c1.1-.7 1.7-1.5 1.7-2.3v-3c-.6.6-1.4 1.1-2.3 1.5-1.5.6-3.3 1-5.2 1s-3.7-.4-5.2-1C2.9 15.1 2.1 14.6 1.5 14Z"></path>
      </svg>
    </span>
    <span data-component="text" data-content="Size">${mbSize}MB</span>
  </a>
</li>`;
  
  ul.insertAdjacentHTML('beforeend', liHtml);
  console.log('仓库大小显示已添加');
}

function observeChanges() {
  const observer = new MutationObserver((mutations) => {
    const existingSizeItem = document.querySelector('li[data-repo-size="true"]');
    if (!existingSizeItem && currentRepoSize > 0) {
      console.log('检测到导航栏更新，重新添加大小显示');
      addSizeDisplay();
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

function waitForElement(selector, timeout = 5000) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(selector)) {
      console.log(`元素已存在: ${selector}`);
      return resolve();
    }
    
    console.log(`等待元素出现: ${selector}`);
    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        console.log(`元素已找到: ${selector}`);
        observer.disconnect();
        resolve();
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    setTimeout(() => {
      observer.disconnect();
      console.log(`等待超时: ${selector}`);
      resolve();
    }, timeout);
  });
}


async function getRepoSize() {
  // 获取当前页面的URL，保存为currentUrl
  const currentUrl = window.location.href;
  // 正则提取
  const regex = /github\.com\/([^\/]+\/[^\/]+)/;
  const match = currentUrl.match(regex);
  let usernameAndRepo = '';
  if (match) {
    usernameAndRepo = match[1];
  }
  if (!usernameAndRepo) {
    return 0;
  }
  console.log(`当前存储库：${usernameAndRepo}`)
  // 发送请求到，例如：https://api.github.com/repos/bling-yshs/ys-image-host
  let response;
  response = await fetch(`https://api.github.com/repos/${usernameAndRepo}`);
  let data = await response.json();
  console.log(data);
  let size = data.size;
  if (!size) {
    return 0;
  }
  return size;
}

main()
