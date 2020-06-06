## with-ssr-entry
```
// Fix the wthat appears below

> Build error occurred
{ /xxx/node_modules/pkg/index.scss:1
$color: #4c9ffe;
                      ^

SyntaxError: Invalid or unexpected token
    at Module._compile (internal/modules/cjs/loader.js:723:23)
```

## install

```
$ yarn add with-ssr-entry
```

## example
```
// next.config.js

const withSsrEntry = require('with-ssr-entry')
module.exports = withSsrEntry() // like withCss, withSass

```