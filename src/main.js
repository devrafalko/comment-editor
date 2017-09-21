import autocompleter from './autocompleter'
import commentEditor from './commentEditor'

document.addEventListener('DOMContentLoaded', function() {
  let autocomplete = autocompleter({
    dataUrl: '/data/users.json',
    dataObj: { key: 'username', value: 'name' }
  })
  let commentInput = commentEditor({ autocomplete: autocomplete })
})
