import UserListItem from './userListItem'

const SuggestionsList = function (inputElement) {
  let selected = null

  // append elements to display autocomplete suggestions
  const listElement = document.createElement('ul')
  listElement.setAttribute('class', 'autocomplete-suggestions')

  // insert the list element directly after inputElement
  inputElement.parentNode.insertBefore(listElement, inputElement.nextSibling)

  // setup keyhandlers for selecting suggestions
  const DOWN  = 40
  const UP    = 38
  const ENTER = 13
  const ESC   = 27
  const TAB   = 9

  const keydownHandler = function (event) {
    let key = event.keyCode
    if (listElement.style.display !== 'none') {
      if (key === DOWN || key === UP) {
        event.preventDefault()
        let selected = listElement.querySelector('.selected')
        if (!selected) {
          if (key === DOWN) {
            selected = listElement.firstChild
          } else if (key === UP) {
            selected = listElement.lastChild
          }
        } else {
          // remove style class from current selection
          selected.classList.remove('selected')
          // determine next item in list and set it as selected
          if (key === DOWN) {
            selected = selected.nextSibling || listElement.firstChild
          } else if (key === UP) {
            selected = selected.previousSibling || listElement.lastChild
          }
        }
        // add style class to the newly selected item and scroll into view
        if (selected) {
          selected.classList.add('selected')
          selected.scrollIntoView()
        }
      } else if (key === ENTER || key === TAB) {
        let selected = listElement.querySelector('li.selected')
        if (selected) {
          selectSuggestion(selected)
          // prevent new line from being inserted or input losing focus
          event.preventDefault()
        }
      }
    }
  }
  listElement.parentNode
    .addEventListener('keydown', (event) => keydownHandler(event), true)


  const keyupHander = function (event) {
    let key = event.keyCode
    if (listElement.style.display !== 'none' && key === ESC) {
      setTimeout(clearSuggestions, 10)
    }
  }
  listElement.parentNode
    .addEventListener('keyup', (event) => keyupHander(event), true)


  const renderSuggestions = function (suggestions) {
    if (suggestions) {
      suggestions.forEach((suggestion) => {
        let item = new UserListItem(suggestion)
        item.addEventListener('mousedown', (event) => {
          selectSuggestion(event.target)
        })
        item.addEventListener('mouseover', (event) => {
          let selected = listElement.querySelector('.selected')
          if (selected) selected.classList.remove('selected')
          event.target.classList.add('selected')
        })
        listElement.appendChild(item)
      })
      listElement.style.display = 'block'
    }
  }

  const selectSuggestion = function (selected) {
    // create and dispatch a custom event
    let event = new CustomEvent('selected', {
      detail: JSON.stringify(selected.dataset)
    })
    selected.dispatchEvent(event)
    setTimeout(clearSuggestions, 100)
  }

  const clearSuggestions = function () {
    listElement.style.display = 'none'
    while (listElement.lastChild) {
      listElement.lastChild.remove()
    }
  }

  const cleanup = function () {
    listElement.parentNode.removeChild(listElement)
  }

  return {
    cleanup: cleanup,
    clear: clearSuggestions,
    render: renderSuggestions
  }
}

export default SuggestionsList
