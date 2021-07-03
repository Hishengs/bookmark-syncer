import { seti18n } from './utils/i18n.js';

const browser = chrome;

function init () {
  browser.runtime.sendMessage({ name: 'get-options' }, setOptions);
}

function setOptions (options = {}) {
  const opts = Object.assign({}, options);
  let inputs = document.querySelectorAll('#options-wrapper input');
  inputs = Array.from(inputs || []);
  inputs.forEach(input => {
    if (input.type === 'radio') {
      input.checked = input.value === opts[input.name];
      return;
    }
    input.value = opts[input.name] || '';
  });
}

function save () {
  const form = document.getElementById('options-wrapper');
  const formData = new FormData(form);
  const entries = formData.entries();
  let emptyField = '';
  const options = Array.from(entries).reduce((acc, [name, value]) => {
    if (!value) {
      emptyField = name;
      return acc;
    }
    acc[name] = value;
    return acc;
  }, {});
  if (emptyField) {
    browser.runtime.sendMessage({ name: 'show-msg', msg: `请检查你的输入项: ${emptyField}` });
    return;
  }
  browser.runtime.sendMessage({ name: 'update-options', options });
}

init();

window.addEventListener('click', e => {
  if (e.target && e.target.className === 'save-btn') {
    save();
  }
});

seti18n();