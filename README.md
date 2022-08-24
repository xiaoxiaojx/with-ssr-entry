## with-ssr-entry
> https://github.com/xiaoxiaojx/blog/issues/40

```js
// Fix the following problem with the build in next.js

> Build error occurred
{ /xxx/node_modules/pkg/index.scss:1
$color: #4c9ffe;
                      ^

SyntaxError: Invalid or unexpected token
    at Module._compile (internal/modules/cjs/loader.js:723:23)
```

## install

```bash
yarn add with-ssr-entry
```

## example
```js
// next.config.js

const withSsrEntry = require('with-ssr-entry')
module.exports = withSsrEntry() // like withCss, withSass

```