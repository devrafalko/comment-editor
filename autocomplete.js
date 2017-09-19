'use strict'

const Autocomplete = function (options) {
  /*
    configuration options:
      dataUrl:  local or remote url of the data used for completions
      delay:    miliseconds to delay before suggesting completions
      input:    DOM element or element selector of the input field
      limit:    limits the number of suggestions displayed
      minChar:  minimum number of characters to input before suggesting
      trigger:  character to type to trigger suggestions
  */
  let config = {
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


  // append elements to display autocomplete suggestions
  const suggestionsList =
    input.parentNode.insertBefore(document.createElement('ul'), input.nextSibling)
  suggestionsList.setAttribute('class', 'autocomplete-suggestions')

  // append a container for messages
  // const messagesContainer =
  //   input.parentNode.insertBefore(document.createElement('div'), input.nextSibling)
  // messagesContainer.setAttribute('class', 'autocomplete-messages')


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
  window.addEventListener('keydown', function(event) { keydownHandler(event) })


  const keyupHander = function (event) {
    let key = event.keyCode
    if (suggestionsList.style.display !== 'none' && key === ESC) {
      setTimeout(clearSuggestions, 10)
    }
  }
  window.addEventListener('keyup', function(event) { keyupHander(event) })


  const mousedownHandler = function (event) {
    selectSuggestion(this)
  }

  const mouseoverHandler = function (event) {
    let selected = suggestionsList.querySelector('.selected')
    if (selected) selected.classList.remove('selected')
    this.classList.add('selected')
  }

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
  const usertagsObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
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
      replaceSelectionWith(`<span class="usertag" data-username="${completion}">${completion}</span>`)

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

      item.addEventListener('mousedown', mousedownHandler)
      item.addEventListener('mouseover', mouseoverHandler)

      suggestionsList.appendChild(item)
    })

    // Display a message when no user mataches are found
    // if (suggestions.length == 0) {
    //   messagesContainer.innerHTML = `No user names match input text "${text}"`
    // }

    suggestionsList.style.display = 'block'
  }

  const selectSuggestion = function (selected) {
    insertCompletion(selected.dataset.username)
    setTimeout(clearSuggestions, 100)
  }

  const clearSuggestions = function () {
    suggestionsList.style.display = 'none'
    while (suggestionsList.lastChild) {
      suggestionsList.lastChild.remove()
    }
  }

  /*
    http://stackoverflow.com/questions/4811822/get-a-ranges-start-and-end-offsets-relative-to-its-parent-container/4812022#4812022
  */
  const getCaretCharacterOffsetWithin = function (element) {
    let caretOffset = 0
    let doc = element.ownerDocument || element.document
    let win = doc.defaultView || doc.parentWindow
    let range
    let preCaretRange
    if (typeof win.getSelection !== 'undefined' && win.getSelection().rangeCount > 0) {
      range = win.getSelection().getRangeAt(0)
      preCaretRange = range.cloneRange()
      preCaretRange.selectNodeContents(element)
      preCaretRange.setEnd(range.endContainer, range.endOffset)
      caretOffset = preCaretRange.toString().length
    }
    return caretOffset
  }


  const getTextNodes = function (node) {
    let textNodes = []
    if (node.nodeType === 3) {
      textNodes.push(node)
    } else {
      node.childNodes.forEach(function(child) {
        textNodes.push.apply(textNodes, getTextNodes(child))
      })
    }
    return textNodes
  }


  const setTextCompletionRange = function (element, start, end) {
    if (document.createRange && window.getSelection) {
      let range = document.createRange()
      range.selectNodeContents(element)
      let textNodes = getTextNodes(element)
      let charCount = 0
      let endCharCount
      let foundStart = false

      for (let textNode of textNodes) {
        endCharCount = charCount + textNode.length
        if (!foundStart && start >= charCount && start <= endCharCount) {
          range.setStart(textNode, start - charCount)
          foundStart = true
        }
        else if (end <= endCharCount) {
          range.setEnd(textNode, end - charCount)
          break
        }
        charCount = endCharCount
      }

      textCompletionRange = range
    }
  }


  const replaceSelectionWith = function (html) {
    if (typeof window.getSelection !== 'undefined') {

      // set the selection to the range created for the text we want completed
      let selection = window.getSelection()
      selection.removeAllRanges()
      selection.addRange(textCompletionRange)

      if (selection.getRangeAt && selection.rangeCount > 0) {
        let range = selection.getRangeAt(0)
        range.deleteContents()

        let fragment = document.createDocumentFragment()
        let element = document.createElement('div')
        element.innerHTML = html

        let lastNode, node

        while (node = element.firstChild) {
          lastNode = fragment.appendChild(node)
        }
        range.insertNode(fragment)

        // place cursor at end of selection
        if (lastNode) {
          // NOTE: setting contentEditable to false makes webkit place the caret
          // after the last element of the inserted fragment so that when a user
          // continues typing it is not in the text node of the inserted element
          lastNode.contentEditable = false

          // to move the caret:
          // replace selections with a range collapsed to a single position
          range = range.cloneRange()
          range.setStartAfter(lastNode)
          range.collapse(true)
          selection.removeAllRanges()
          selection.addRange(range)
        }
      }
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
      setTextCompletionRange(input, i, j)
      delayId = setTimeout(function() { getSuggestions(text) }, config.delay)
    }
  }


  this.cleanup = function () {
    input.removeEventListener('input', watchInput)
    input.parentNode.removeChild(suggestionsList)
    clearTimeout(delayId)
    usertagsObserver.disconnect()
  }

  return this
}
