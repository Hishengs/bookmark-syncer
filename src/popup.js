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

async function replaceIcon () {
  const imgs = document.querySelectorAll('.bs-btn img');
  for (const img of imgs) {
    try {
      const content = (await window.axios.get(img.src)).data;
      const svg = document.createElement('svg');
      svg.innerHTML = content;
      img.replaceWith(svg);
    } catch (e) {
      console.log(e);
    }
  }
}

seti18n();
replaceIcon();