export const createFancyTag = function (data) {
  let fancytag = document.createElement('span')
  fancytag.setAttribute('class', 'fancytag')
  fancytag.dataset[data.username] = data[data.username]
  fancytag.appendChild(document.createTextNode(data.username))

  fancytagsObserver.observe(fancytag.firstChild, { characterData: true })

  return fancytag
}

// Observing the fancytags for characterData mutation allows the inserted
// user name text to be treated as a unit rather than individual characters
// in the contenteditable div and deleted rather than becoming corrupted.
const fancytagsObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.target.parentNode.className === 'usertag') {
      input.removeChild(mutation.target.parentNode)
    }
  })
})
