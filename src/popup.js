const browser = chrome;

window.addEventListener('click', e => {
  if (e.target && e.target.className === 'bs-btn') {
    // console.log(e.target);
    clickItem(e.target.getAttribute('name'));
  }
})

function clickItem (name) {
  browser.runtime.sendMessage({ name });
}