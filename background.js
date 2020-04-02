let ignoreWhitespaces = false;

//-----------------------------------------------------------------------------
// Messaging API
//-----------------------------------------------------------------------------

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  switch (request.action) {
    case 'loadedRequest': {
      const checked = await isIgnoreWhitespaces()
      chrome.runtime.sendMessage({
        action: 'loadedResponse',
        checked,
      })
      break
    }
    case 'checked': {
      setLocal({ [request.key]: request.value })
      break
    }
    default: {
      console.error(`${request.action} is not supported. FIXIT`)
    }
  }
})

//-----------------------------------------------------------------------------
// Storage
//-----------------------------------------------------------------------------

async function isIgnoreWhitespaces() {
  const key = 'checkbox-ignore-whitespaces'
  const data = await getLocal(key)
  return data[key]
}

function getLocal(keys) {
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, (result) => {
      resolve(result)
    })
  })
}

function setLocal(items) {
  chrome.storage.local.set(items, () => { })
}

chrome.storage.onChanged.addListener((changes, namespace) => {
  for (let key in changes) {
    const storageChange = changes[key];
    console.log('Storage key "%s" in namespace "%s" changed. ' +
      'Old value was "%s", new value is "%s".',
      key,
      namespace,
      storageChange.oldValue,
      storageChange.newValue)

    if (key == 'checkbox-ignore-whitespaces') {
      ignoreWhitespaces = storageChange.newValue
    }
  }
})

//-----------------------------------------------------------------------------
// WebRequest
//-----------------------------------------------------------------------------

chrome.webRequest.onBeforeRequest.addListener((details) => {
  if (!ignoreWhitespaces) {
    return
  }

  const url = new URL(details.url)
  const ghFilesURL = /files?/
  if (!url.pathname.match(ghFilesURL)) {
    return
  }

  url.searchParams.has('w')
    ? url.searchParams.set('w', 1)
    : url.searchParams.append('w', 1)

  const redirectUrl = url.toString()
  console.log(`redirecting... ${details.url} -> ${redirectUrl}`)
  return { redirectUrl }
}, { urls: ['*://github.com/*'] }, ['blocking'])

//-----------------------------------------------------------------------------
// Lifecycle
//-----------------------------------------------------------------------------

chrome.runtime.onInstalled.addListener(async () => {
  console.log('[onInstalled]')

  ignoreWhitespaces = await isIgnoreWhitespaces()
})

chrome.runtime.onSuspend.addListener(() => {
  console.log('[onSuspended]')
})
