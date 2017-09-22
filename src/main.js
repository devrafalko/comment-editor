import autocompleter from './autocompleter'
import commentEditor from './commentEditor'

// components must wait for DOM to be loaded in order to refernce elements
document.addEventListener('DOMContentLoaded', function() {
  let autocomplete = autocompleter({
    dataUrl: '/data/users.json',
    dataObj: { key: 'username', value: 'name' }
  })
  let commentInput = commentEditor({ autocomplete: autocomplete })
})
