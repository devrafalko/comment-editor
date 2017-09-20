import {
  createRangeInElement,
  getCaretCharacterOffsetWithin,
  replaceSelectionWith
} from './selectionRangeHelpers'

const autocomplete = function (options) {
  /*
    configuration options:
      apiUrl:   The endpoint to which comments are posted on save
      dataUrl:  local or remote url of the data used for completions
      delay:    miliseconds to delay before suggesting completions
      input:    DOM element or element selector of the input field
      limit:    limits the number of suggestions displayed
      minChar:  minimum number of characters to input before suggesting
      trigger:  character to type to trigger suggestions
  */
  let config = {
    apiUrl: '',
    dataUrl: './data/completions.json',
    delay: 120,
    input: 'div[contenteditable=true]',
    limit: null,
    minChars: 2,
    trigger: '@'
  }
  config = Object.assign(config, options)

  let completions = []
  let delayId = null
  let suggest = false
  let text = ''
  let textCompletionRange = document.createRange()

  // load data for autocomplete suggestions
  let request = new XMLHttpRequest()
  request.addEventListener('load', function() {
    completions = JSON.parse(this.responseText)
  })
  request.open('GET', config.dataUrl, true)
  request.send()


  const input = typeof config.input === 'object' ?
    config.input : document.querySelector(config.input)
  input.addEventListener('input', function() { watchInput() })

  const saveButton =
    input.parentNode.insertBefore(document.createElement('button'), input.nextSibling)
  saveButton.setAttribute('class', 'save')
  saveButton.appendChild(document.createTextNode('Save Comment'))
  saveButton.addEventListener('click', function() { saveComment() })

  // append elements to display autocomplete suggestions
  const suggestionsList =
    input.parentNode.insertBefore(document.createElement('ul'), input.nextSibling)
  suggestionsList.setAttribute('class', 'autocomplete-suggestions')


  const blurHandler = function () { clearSuggestions() }
  input.addEventListener('blur', blurHandler, true)


  // setup keyhandlers for selecting suggestions
  const DOWN  = 40
  const UP    = 38
  const ENTER = 13
  const ESC   = 27
  const TAB   = 9

  const keydownHandler = function (event) {
    let key = event.keyCode
    if (suggestionsList.style.display !== 'none') {
      if (key === DOWN || key === UP) {
        event.preventDefault()
        let selected = suggestionsList.querySelector('.selected')
        if (!selected) {
          if (key === DOWN) {
            selected = suggestionsList.firstChild
          } else if (key === UP) {
            selected = suggestionsList.lastChild
          }
        } else {
          // remove style class from current selection
          selected.classList.remove('selected')
          // determine next item in list and set it as selected
          if (key === DOWN) {
            selected = selected.nextSibling || suggestionsList.firstChild
          } else if (key === UP) {
            selected = selected.previousSibling || suggestionsList.lastChild
          }
        }
        // add style class to the newly selected item
        if (selected) selected.classList.add('selected')
      }
      else if (key === ENTER || key === TAB) {
        let selected = suggestionsList.querySelector('li.selected')
        if (selected) {
          selectSuggestion(selected)
          // prevent new line from being inserted or input losing focus
          event.preventDefault()
        }
      }
    }
  }
  window.addEventListener('keydown', (event) => keydownHandler(event))


  const keyupHander = function (event) {
    let key = event.keyCode
    if (suggestionsList.style.display !== 'none' && key === ESC) {
      setTimeout(clearSuggestions, 10)
    }
  }
  window.addEventListener('keyup', (event) => keyupHander(event))


  const filterCompletions = function (text) {
    // split text to build a pattern that matches non-consecutive characters
    let regex = new RegExp(text.split('').join('.*'), 'i')
    return completions.filter(function(datum) {
      if (datum.name.match(regex) || datum.username.match(regex)) return datum
    })
  }

  // Observing the usertags for characterData mutation allows the inserted
  // user name text to be treated as a unit rather than individual characters
  // in the contenteditable div and deleted rather than becoming corrupted.
  const usertagsObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.target.parentNode.className === 'usertag') {
        input.removeChild(mutation.target.parentNode)
      }
    })
  })


  const insertCompletion = function (completion) {
    if (input.nodeName === 'INPUT') {

    } else {
      // let usertag = document.createElement('span')
      // usertag.setAttribute('class', 'usertag')
      // usertag.dataset['username'] = completion
      // usertag.appendChild(document.createTextNode(completion))

      // TODO: refactor the insert method to accept the actual element
      // or a document fragement rather than an HTML string...
      replaceSelectionWith(textCompletionRange,
        `<span class="usertag" data-username="${completion}">${completion}</span>`)

      let tag = document.querySelector('.usertag')
      usertagsObserver.observe(tag.firstChild, { characterData: true })
    }
  }


  const getSuggestions = function (text) {
    renderSuggestions(filterCompletions(text))
  }

  const renderSuggestions = function (suggestions) {
    if (config.limit) {
      // limit number of suggestions displayed
      suggestions = suggestions.slice(0, config.limit - 1)
    }
    suggestions.forEach(function(suggestion) {
      let item = document.createElement('li')
      item.dataset['username'] = suggestion.username

      let image = document.createElement('img')
      image.setAttribute('class', 'avatar')
      image.setAttribute('src', suggestion.avatar_url)
      image.dataset['username'] = suggestion.username
      item.appendChild(image)

      let text = `${suggestion.name} (${suggestion.username})`
      item.appendChild(document.createTextNode(text))

      item.addEventListener('mousedown', (event) => selectSuggestion(this))

      item.addEventListener('mouseover', (event) => {
        let selected = suggestionsList.querySelector('.selected')
        if (selected) selected.classList.remove('selected')
        this.classList.add('selected')
      })

      suggestionsList.appendChild(item)
    })

    // Display a message when no user mataches are found
    // if (suggestions.length == 0) {
    //   messagesContainer.innerHTML = `No user names match input text "${text}"`
    // }
    saveButton.style.display = 'none'
    suggestionsList.style.display = 'block'
  }

  const selectSuggestion = function (selected) {
    insertCompletion(selected.dataset.username)
    setTimeout(clearSuggestions, 100)
  }

  const clearSuggestions = function () {
    suggestionsList.style.display = 'none'
    saveButton.style.display = 'block'
    while (suggestionsList.lastChild) {
      suggestionsList.lastChild.remove()
    }
  }


  const watchInput = function () {
    // cursor position and text of input element depend on the element type
    let cursor = (input.nodeName === 'INPUT') ?
      input.selectionStart : getCaretCharacterOffsetWithin(input)
    let inputText = (input.nodeName === 'INPUT') ? input.value : input.textContent
    let i = cursor - 1
    let j = cursor
    text = '' //string of text to be completed

    while (i >= 0) {
      let char = inputText.charAt(i)
      if (char.match(/\w/)) {
        text = char.concat(text)
        --i
      } else break
    }

    if (inputText.charAt(i) === config.trigger) {
      suggest = true
    } else {
      suggest = false
    }

    // iterate forward when cursor is not at end of input
    while (j <= inputText.length) {
      let char = inputText.charAt(j)
      if (char.match(/\w/)) {
        text = text.concat(char)
        ++j
      } else break
    }

    clearSuggestions()

    if (suggest && text.length >= config.minChars) {
      // select the text we want to replace
      textCompletionRange = createRangeInElement(input, i, j)
      delayId = setTimeout(function() { getSuggestions(text) }, config.delay)
    }
  }

  const cleanup = function () {
    input.contentEditable = false
    input.removeEventListener('input', watchInput)
    input.parentNode.removeChild(saveButton)
    input.parentNode.removeChild(suggestionsList)
    clearTimeout(delayId)
    usertagsObserver.disconnect()
  }

  const saveComment = function() {
    let comment = { html: input.innerHTML, plainText: input.textContent }

    let request = new XMLHttpRequest()
    request.addEventListener('readystatechange', function() {
      if (request.readyState === 4 && request.status === 200) {
        // console.log(request.responseText)
      }
    })
    request.open('POST', config.apiUrl, true)
    request.setRequestHeader('Content-type', 'application/json')
    request.send(JSON.stringify(comment))

    cleanup()
  }

  return {
    cleanup: cleanup,
    save: saveComment
  }
}

export default autocomplete
