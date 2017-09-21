import {
  createRangeInElement,
  getCaretCharacterOffsetWithin,
  replaceSelectionWith
} from './selectionRangeHelpers'

const autocompleter = function (options) {
  /*
    configuration options:
      dataObj:  expected key, value for objects in the array of completions
      dataUrl:  URL of completions data
      delay:    miliseconds to delay before suggesting completions
      filter:   TODO: allow custom function to match completions to input text
      input:    DOM element or element selector of the input field
      limit:    limits the number of suggestions returned for each query
      minChar:  minimum number of characters to input before suggesting
      trigger:  character to type to trigger suggestions
  */
  let config = {
    dataObj: { key: 'name', value: 'value' },
    dataUrl: '/data/completions.json',
    delay: 120,
    filter: null,
    input: 'div[contenteditable=true]',
    limit: null,
    minChars: 2,
    trigger: '@'
  }
  // override configuration with options
  config = Object.assign(config, options)

  let completions = []
  let delayId = null
  let shouldSuggest = false

  // load data for autocomplete suggestions
  let request = new XMLHttpRequest()
  request.addEventListener('load', function() {
    if (this.status === 200) {
      completions = JSON.parse(this.responseText)
    }
  })
  request.open('GET', config.dataUrl, true)
  request.send()


  const filterCompletions = function (text) {
    // split text to build a pattern that matches non-consecutive characters
    let regex = new RegExp(text.split('').join('.*'), 'i')
    return completions.filter((datum) => {
      // attempt to fine a completion match in either name or value properties
      if (datum[config.dataObj.key].match(regex) ||
          datum[config.dataObj.value].match(regex)) {
        return datum
      }
    })
  }


  const parseInput = function (element) {
    // cursor position and text of input element depend on the element type
    let cursor = (element.nodeName === 'INPUT') ?
      element.selectionStart : getCaretCharacterOffsetWithin(element)
    let inputText = (element.nodeName === 'INPUT') ? element.value : element.textContent
    let i = cursor - 1
    let j = cursor
    let suggestions = []
    let text = '' //string of text to be completed
    let textRange = document.createRange()

    while (i >= 0) {
      let char = inputText.charAt(i)
      if (char.match(/\w/)) {
        text = char.concat(text)
        --i
      } else break
    }

    if (inputText.charAt(i) === config.trigger) {
      shouldSuggest = true
    } else {
      shouldSuggest = false
    }

    // iterate forward when cursor is not at end of input
    while (j <= inputText.length) {
      let char = inputText.charAt(j)
      if (char.match(/\w/)) {
        text = text.concat(char)
        ++j
      } else break
    }

    if (shouldSuggest && text.length >= config.minChars) {
      // select the text we want to replace
      textRange = createRangeInElement(element, i, j)
      // delayId = setTimeout(() => {
        suggestions = filterCompletions(text)
      // }, config.delay)
    }

    // limit number of suggestions returned
    if (config.limit) {
      suggestions = suggestions.slice(0, config.limit - 1)
    }

    return {
      suggestions: suggestions,
      textRange: textRange
    }
  }

  return (element) => parseInput(element)
}

export default autocompleter
