const browser = chrome;

function save () {
  let inputs = document.querySelectorAll('.options-wrapper input')
  inputs = Array.from(inputs || [])
  let emptyField = ''
  const options = inputs.reduce((acc, input) => {
    if (input) {
      acc[input.name] = input.value
      if (!input.value) emptyField = input.name
    }
    return acc
  }, {})
  if (emptyField) {
    // window.alert(`请检查你的输入项: ${emptyField}`)
    browser.runtime.sendMessage({ name: 'show-msg', msg: `请检查你的输入项: ${emptyField}` });
    return;
  }
  browser.runtime.sendMessage({ name: 'update-setting', options });
}

window.addEventListener('click', e => {
  if (e.target && e.target.className === 'save-btn') {
    console.log(e.target)
    save();
  }
})