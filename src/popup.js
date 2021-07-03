import { seti18n } from './utils/i18n.js';

const browser = chrome;

window.addEventListener('click', e => {
  const { target } = e;
  if (target && (target.className === 'bs-btn')) {
    clickItem(target.getAttribute('name'));
  }
})

function clickItem (name) {
  browser.runtime.sendMessage({ name });
}

seti18n();