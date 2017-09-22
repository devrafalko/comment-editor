Comment Editor with Autocompletion
==================================

Demo of a comment editor that enables autocompletion using user names as an example. Typing an `@` symbol in the editor will trigger the autocompleter to watch for user names completions and suggest these in a panel below the editor. A username can be selected using the mouse or UP and DOWN arrow keys; pressing either ENTER or TAB will insert a fancytag&#8482; into the editor, preserving data in the data-* attributes of the tag, in this case the username. The `Save Comment` button will attempt to send the comment html (preserving the fancytags) and plain text to remote url, and make the comment uneditable if successful.

### Use

See the example `index.html` included in this repository.


#### CommentEditor Configuration Options

```
autocomplete: An autocompleter component
input:        DOM element or element selector of the input field
savetoUrl:    The endpoint to which comments are posted on save
```


#### Autocompleter Configuration Options

```
dataObj:  expected key, value for objects in the array of completions
dataUrl:  URL of completions data
delay:    miliseconds to delay before suggesting completions
filter:   TODO: allow custom function to match completions to input text
input:    DOM element or element selector of the input field
limit:    limits the number of suggestions returned for each query
minChar:  minimum number of characters to input before suggesting
trigger:  character to type to trigger suggestions
```


<a name="example"></a>
## Demonstration Example

An example using the commentEditor with autocompletion using the included test data, `/data/users.json`, can be run using the development server (see below).


<a name="development-environment"></a>
### Development Environment

[npm](https://www.npmjs.com) is used to manage dependencies for this project. If you already have node and npm installed for your development environment make sure that they are up-to-date. Running `npm install` from within the project repository will install the development dependencies locally including, including the webpack-dev-server.


<a name="requirements"></a>
#### Requirements

- [Node.js](https://nodejs.org/) JavaScript runtime.
- [npm](https://www.npmjs.com) package manager for JavaScript.

<a name="setup"></a>
#### Setup

1. Install [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com). Using a [node version manager](#node-version-managers) is strongly recommended.

2. Clone the project repository:
    ```bash
    git clone https://github.com/mphstudios/comment-editor.git
    cd comment-editor
    ```

3. Install project dependencies:
    ```bash
    npm install
    ```

4. Start the local development server:
    ```bash
    npm run build
    npm run dev
    ```

5. Open [127.0.0.1:8080](http:127.0.0.1:8080) in a web-browser.


#### Testing

BUG: broken test harness, all tests FAIL! Tests are failing on DOM access becuase the karma-html framework does not properly load the #document element from `index.html`.

To run all tests once and exit, run the npm `test` script from within the repository:
```bash
npm run test
```

To run test on file changes, continuous integration and development, run the npm `karma` script from within the 
```bash
npm run karma
```

