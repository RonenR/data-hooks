# Easily hook html to js

## TL;DR
## `data-ws-onclick="foo"`

It hooks between HTML tags and attributes to js functions or events.

[See published npm package](https://www.npmjs.com/package/data-ws-hooks)

## Import:

- Web: `<script src="https://unpkg.com/data-ws-hooks/build/bundle.min.js"></script>`
- Node: `npm i data-ws-hooks`

## How to use?

**Important! This works if css defines class "hidden" as "display:none", as the hiding here works by toggling this class**

**- HTML**

| Attribute                    | Note                                                                                                                                                                                                                                                                                            | Example                                                                                                                                  |
|------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------|
| data-ws-onclick              | When element is clicked - it will trigger one of the 3, in that order of precedence: <br>- Fire an action, like hide all elements of class x. See list of actions later. <br>- Fire a window.wsGlobals function <br>- Fire a global window function. Supports nested functions by dot notation. | - `<button data-ws-onclick="hideClass:popup">Close popup</button>` <br> - `<button data-ws-onclick="signin">Sign In</button>`            |
| data-ws-tab                  | Combined with the classes: "tab-selector", "tab-selector selected", "tab-section", "tab-section hidden" it gives a tab functionality.  <br>**Important!** Allows a single set of tabs per page!                                                                                                 | `<div><span class="tab-selector selected" data-ws-tab="tab1">Tab1</span><span class="tab-selector" data-ws-tab="tab2">Tab2</span></div>` |
| data-ws-toggle-hidden-data   | Defines elements to be toggled 'hidden' class when a respective button is clicked.                                                                                                                                                                                                              | `<div data-ws-toggle-hidden-data='signin-dialog'>...</div>`                                                                              |
| data-ws-toggle-hidden-button | When clicked, toggle 'hidden' class on all elements that share the value in their "data-ws-toggle-hidden-data" attribute.                                                                                                                                                                       | `<button data-ws-toggle-hidden-button='signin-dialog'>Sign In</button>`                                                                  |


## Showcases

This is used on the following sites:
- [Speechnotes - Lightweight Speech Recognizing Notepad](https://speechnotes.co/)
- [TTSReader - Online Text To Speech Reader](https://ttsreader.com/)

## TODOs:

- It sometimes hides by styling directly and sometimes by toggling "hidden" class. Inconsistent...
- Allow more than a single set of tabs on page... Perhaps contain tabs in a parent... 

# How to contribute & publish updates to this package?
- This package is published both on GitHub and on npmjs.
- To publish an updated version - simply run `npm publish`, it will commit & push updates both to github and npm.

