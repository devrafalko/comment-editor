import { createFancyTag } from './fancytags'
import { replaceSelectionWith } from './selectionRangeHelpers'
import SuggestionsList from './suggestionsList'

const commentEditor = function (options) {
  /*
    component configuration options:
      autocomplete: An autocomplete component
      input:        DOM element or element selector of the input field
      savetoUrl:    The endpoint to which comments are posted on save
  */
  const autocomplete = options.autocomplete || null
  const savetoUrl = options.saveToUrl || 'dev/null'

  const getInputElement = function () {
    if (!options.input) {
      return document.querySelector('div[contenteditable=true]')
    } else {
      return (typeof options.input === 'object' ?
              options.input : document.querySelector(options.input))
    }
  }
  const input = getInputElement()
  const suggestionsView = new SuggestionsList(input.parentNode)

  // range for replacement used when a completion suggestion is selected
  let autocompleteRange = document.createRange()

  const suggestCompletions = function () {
    let { suggestions, textRange } = autocomplete(input)
    autocompleteRange = textRange
    suggestionsView.clear()
    // only render view when there are suggestions!
    if (suggestions && suggestions.length) {
      suggestionsView.render(suggestions)
    }
  }

  input.addEventListener('input', suggestCompletions, true)
  input.addEventListener('blur', suggestionsView.clear, true)

  // TODO: refactor so that we do not need to access the
  // suggestion list DOM element from this compnent...
  document.querySelector('ul.autocomplete-suggestions')
          .addEventListener('selected', (event) => {
    if (input.nodeName === 'INPUT') {
      // TODO: reimplement replacement in input and textarea elements
    } else {
      let tagData = JSON.parse(event.detail)
      replaceSelectionWith(autocompleteRange, createFancyTag(tagData))
    }
  }, true)

  const cleanup = function () {
    // make comment uneditable and remove editing UI
    input.contentEditable = false
    input.removeEventListener('input', suggestCompletions)
    input.removeEventListener('blur', suggestionsView.clear)
    input.parentNode.removeChild(saveButton)
    suggestionsView.cleanup()
  }


  const saveComment = function () {
    let comment = { html: input.innerHTML, plainText: input.textContent }
    let request = new XMLHttpRequest()
    request.addEventListener('readystatechange', function() {
      if (request.readyState === 4 && request.status === 200) {
        cleanup()
        // TODO: display message "Comment Saved!"
      } else {
        // TODO: display error message "Unable to save comment!"
      }
    })
    request.open('POST', savetoUrl, true)
    request.setRequestHeader('Content-type', 'application/json')
    request.send(JSON.stringify(comment))
  }


  const saveButton = input.parentNode.insertBefore(
    document.createElement('button'), suggestionsView.nextSibling)
  saveButton.setAttribute('class', 'save')
  saveButton.appendChild(document.createTextNode('Save Comment'))
  saveButton.addEventListener('click', saveComment, true)


  return {
    cleanup: cleanup,
    save: saveComment
  }
}

export default commentEditor
