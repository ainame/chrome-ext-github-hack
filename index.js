const Const = {
  Name: {
    Checkbox: {
      IgnoreWhitespaces: 'checkbox-ignore-whitespaces'
    }
  }
}

function toggleCheckbox(name, checked) {
  const checkbox = document.querySelector(`input[name=${name}]`)
  checkbox.checked = checked
}

function listenCheckboxEvent(name) {
  const checkbox = document.querySelector(`input[name=${name}]`)
  checkbox.addEventListener('change', (event) => {
    const checked = event.target.checked

    chrome.runtime.sendMessage({
      action: 'checked',
      key: name,
      value: checked,
    })
  })
}

function listenEvents() {
  listenCheckboxEvent(Const.Name.Checkbox.IgnoreWhitespaces)
}

function requestStorage() {
  chrome.runtime.sendMessage({
    action: 'loadedRequest',
  })
}

function init() {
  listenEvents()
  requestStorage()
}

init()

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'loadedResponse': {
      console.log(request)
      toggleCheckbox(Const.Name.Checkbox.IgnoreWhitespaces, request.checked)
      break
    }
    default: {
      console.error(`${request.action} is not supported. FIXIT`)
    }
  }
})
