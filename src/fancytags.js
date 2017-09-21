const createFancyTag = function (data) {
  // let fancytag = document.createElement('span')
  // fancytag.setAttribute('class', 'fancytag')
  // REFACTOR: iterate over keys in data to generate data-*
  // fancytag.dataset['name'] = value
  // fancytag.appendChild(document.createTextNode(value))

  // fancytagsObserver.observe(fancytag.firstChild, { characterData: true })

  let fancytag =
    `<span class="fancytag" data-username="${data.username}">${data.username}</span>`
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

export default createFancyTag
