import 'karma-html'
import { customMatchers } from 'jasmine-dom-custom-matchers'

describe('karma setup', function() {
  beforeAll(function(done) {
    jasmine.addMatchers(customMatchers)

    karmaHTML.index.onstatechange = function(ready) {
      if (ready) done() //if the #Document is ready, fire tests!
    }
    karmaHTML.index.open()
  })

  it('should load a real Document object', function() {
    let iframeDocument = karmaHTML.index.document
    console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
    console.log('karmaHTML.index:', karmaHTML.index.document)
    console.log('document_0:', window.document_0)
    console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
    expect(iframeDocument.constructor.name).toEqual('HTMLDocument')
  })
})
