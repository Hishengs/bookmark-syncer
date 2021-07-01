const browser = chrome;

function save () {
  let inputs = document.querySelectorAll('.options-wrapper input')
  inputs = Array.from(inputs || [])
  const options = inputs.reduce((acc, input) => {
    if (input) {
      acc[input.name] = input.value
    }
    return acc
  }, {})
  browser.runtime.sendMessage({ name: 'update-setting', options });
}

window.addEventListener('click', e => {
  if (e.target && e.target.className === 'save-btn') {
    console.log(e.target)
    save();
  }
})