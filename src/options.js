import options from './utils/options.js';
import { showNotification } from './utils/notification.js';
import { get as i18nGet, replace as i18nReplace } from './utils/i18n.js';

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

async function updateOptions (opts) {
  await options.update(opts);
  showNotification(i18nGet('OPTIONS_UPDATED'));
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
    window.alert(`${i18nGet('CHECK_INPUT')}: ${emptyField}`);
    return;
  }
  updateOptions(options);
}

window.addEventListener('click', e => {
  if (e.target && e.target.className === 'save-btn') {
    save();
  }
});

i18nReplace();

(async function () {
  try {
    await options.fetch();
    setOptions(options.options);
  } catch (e) {
    window.alert(e.message);
  }
})();