/*
  getCaretCharacterOffsetWithin written by Tim Down
  See http://stackoverflow.com/questions/4811822/get-a-ranges-start-and-end-offsets-relative-to-its-parent-container/4812022#4812022
*/
export const getCaretCharacterOffsetWithin = function (element) {
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


// recursively traverse starting at node to build an array of text nodes
// INVESTIGATE: using NodeIterator or TreeWalker
export const getTextNodes = function (node) {
  let textNodes = []
  if (node.nodeType === 3) {
    textNodes.push(node)
  } else {
    node.childNodes.forEach((child) => {
      textNodes.push.apply(textNodes, getTextNodes(child))
    })
  }
  return textNodes
}


export const createRangeInElement = function (element, start, end) {
  if (document.createRange && window.getSelection) {

    let range = document.createRange()
    range.selectNodeContents(element)

    let textNodes = getTextNodes(element)
    let charCount = 0
    let endCharCount
    let foundStart = false

    // INVESTIGATE: using NodeFilter and NodeIterator or TreeWalker
    for (let textNode of textNodes) {
      endCharCount = charCount + textNode.length
      if (!foundStart && start >= charCount && start <= endCharCount) {
        range.setStart(textNode, start - charCount)
        foundStart = true
      } else if (end <= endCharCount) {
        range.setEnd(textNode, end - charCount)
        break
      }
      charCount = endCharCount
    }
    return range
  }
}


export const replaceSelectionWith = function (replacementRange, html) {
  if (typeof window.getSelection !== 'undefined') {
    // set the selection to the range created for the text we want completed
    let selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(replacementRange)

    if (selection.getRangeAt && selection.rangeCount > 0) {
      let range = selection.getRangeAt(0)
      range.deleteContents()

      let fragment = document.createDocumentFragment()

      // in order to add arbitrary elements to a document fragment
      // create a template element to temporarily hold the elements
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
