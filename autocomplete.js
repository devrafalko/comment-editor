const Autocomplete = function (options) {
  /*
    configuration options:
      dataUrl:  local or remote url of the data used for completions
      delay:    miliseconds to delay before suggesting completions
      input:    DOMElement or Element selector of the input field
      limit:    limits the number of suggestions displayed
      minChar:  minimum number of characters to input before suggesting
      trigger:  character to type to trigger suggestions
  */
  let config = {
    dataUrl: './data/completions.json',
    delay: 120,
    input: 'input[type=text]',
    limit: null,
    minChars: 2,
    trigger: '@'
  }
  config = Object.assign(config, options)

  let completions = []
  let delayId = null
  let inputText = ''
  let suggest = false


  // load data for autocomplete suggestions
  let request = new XMLHttpRequest()
  request.addEventListener('load', function() {
    completions = JSON.parse(this.responseText)
  })
  request.open('GET', config.dataUrl, true)
  request.send()


  // add event listeners on input element
  const input = typeof config.input === 'object' ?
    config.input : document.querySelector(config.input)

  input.addEventListener('input', function() { watchInput() })


  // append elements to display autocomplete suggestions
  const suggestionsList =
    input.parentNode.insertBefore(document.createElement('ul'), input.nextSibling)
  suggestionsList.classList.add('autocomplete-suggestions')


  // setup keyhandlers for selecting suggestions
  const DOWN  = 40
  const UP    = 38
  const ENTER = 13
  const ESC   = 27
  const SPACE = 32
  const TAB   = 9

  const keydownHandler = function (event) {
    let key = event.keyCode
    if (suggestionsList.display != 'none' && (key === DOWN || key === UP)) {
      let selected = suggestionsList.querySelector('li.selected')
      if (selected) {
        selected.classList.remove('selected')
        if (key === DOWN) {
          selected = selected.nextSibling || suggestionsList.firstChild
        }
        if (key === UP) {
          selected = selected.previousSibling || suggestionsList.lastChild
        }
      } else {
        if (key === DOWN) {
          selected = suggestionsList.firstChild
        }
        if (key === UP) {
          selected = suggestionsList.lastChild
        }
      }
      selected.classList.add('selected')
    }
  }
  window.addEventListener('keydown', function(event) { keydownHandler(event) })


  const keyupHander = function (event) {
    let key = event.keyCode

    if (suggestionsList.display != 'none' && (key === ENTER || key === TAB)) {
      let selected = suggestionsList.querySelector('li.selected')
      if (selected) {
        insertCompletion(selected.dataset.username)
        setTimeout(clearSuggestions, 100)
      }
    }

    if (suggestionsList.display != 'none' && key === ESC) {
      setTimeout(clearSuggestions, 10)
    }
  }
  window.addEventListener('keyup', function(event) { keyupHander(event) })


  const filterCompletions = function (text) {
    // split text to build a pattern that matches non-consecutive characters
    let regex = new RegExp(text.split('').join('.*'), 'i')
    return completions.filter(function(datum) {
      if (datum.name.match(regex) || datum.username.match(regex)) return datum
    })
  }

  const insertCompletion = function (completion) {
    input.value = input.value.replace(config.trigger + inputText, completion)
  }


  const getSuggestions = function (text) {
    renderSuggestions(filterCompletions(text))
  }

  const renderSuggestions = function (suggestions) {
    if (config.limit) {
      // limit number of suggestions displayed
      suggestions = suggestions.slice(0,config.limit-1)
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

      suggestionsList.appendChild(item)
    })

    input.style['border-bottom-right-radius'] = 0
    input.style['border-bottom-left-radius'] = 0

    suggestionsList.style.display = 'block'
  }

  const clearSuggestions = function () {
    suggestionsList.style.display = 'none'
    input.style['border-bottom-right-radius'] = '4px'
    input.style['border-bottom-left-radius'] = '4px'
    while (suggestionsList.lastChild) {
      suggestionsList.lastChild.remove()
    }
  }


  const watchInput = function () {
    let cursor = input.selectionStart
    let i = cursor - 1
    let j = cursor

    inputText = ''

    while (i >= 0) {
      let char = input.value.charAt(i)
      if (char.match(/\w/)) {
        inputText = char.concat(inputText)
        --i
      } else break
    }

    if (input.value.charAt(i) === config.trigger) {
      suggest = true
    } else {
      suggest = false
    }

    // iterate forward when it is not at end of input
    while (j <= input.value.length) {
      let char = input.value.charAt(j)
      if (char.match(/\w/)) {
        inputText = inputText.concat(char)
        ++j
      } else break
    }

    clearSuggestions()

    if (suggest && inputText.length >= config.minChars) {
      delayId = setTimeout(function(){ getSuggestions(inputText) }, config.delay)
    }
  }


  this.cleanup = function () {
    input.removeEventListener('input', watchInput)
    input.parentNode.removeChild(suggestionsList)
    clearTimeout(delayId)
  }

  return this
}
