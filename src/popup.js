import { bookmarkManager } from './manager.js';
import { HOME_PAGE } from './utils/constant.js';
import { replace as i18nReplace } from './utils/i18n.js';

const browser = chrome;

window.addEventListener('click', e => {
  const { target } = e;
  if (target && (target.className === 'bs-btn')) {
    clickItem(target.getAttribute('name'));
  }
})

window.addEventListener('unhandledrejection', e => {
  console.log('UNHANDLED PROMISE REJECTION: ', e);
}, { capture: true });

window.onunhandledrejection = event => {
  console.log(`UNHANDLED PROMISE REJECTION: ${event.reason}`);
};

function clickItem (name) {
  switch (name) {
    case 'sync-from-remote':
      bookmarkManager.syncFromRemote();
      break;
    case 'sync-to-remote':
      bookmarkManager.syncToRemote();
      break;
    case 'clear-local':
      bookmarkManager.clearLocal();
      break;
    case 'show-options':
      browser.runtime.openOptionsPage();
      break;
    case 'help':
      window.open(HOME_PAGE);
      break;
  }
}

async function replaceIcon () {
  const imgs = document.querySelectorAll('.bs-btn img');
  for (const img of imgs) {
    try {
      const res = await fetch(img.src);
      const content = await res.text();
      const svg = document.createElement('svg');
      svg.innerHTML = content;
      img.replaceWith(svg);
    } catch (e) {
      console.log(e);
    }
  }
}

i18nReplace();
replaceIcon();
