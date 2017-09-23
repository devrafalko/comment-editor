/*
  createFancyTag expects a data object with the following format
    {
      name: 'username',
      value: 'flynn',
      text: 'Kevin Flynn'
    }

    and will return the following HTML element
    <span class="fancytag" data-username="flynn">Kevin Flynn</span>

 */
export const createFancyTag = function ({ name, value, text }) {
  let fancytag = document.createElement('span')
  fancytag.setAttribute('class', 'fancytag')
  fancytag.dataset[name] = value
  fancytag.appendChild(document.createTextNode(text))

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
