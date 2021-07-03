const browser = chrome;

export function seti18n () {
  const els = document.querySelectorAll('[data-i18n]');
  Array.from(els).forEach(el => {
    el.innerText = browser.i18n.getMessage(el.getAttribute('data-i18n').replace(/-/g, '_'));
  });
}

export function get (key) {
  return browser.i18n.getMessage(key) || '';
}