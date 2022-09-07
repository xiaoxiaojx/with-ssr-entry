## 问题简述
近期时常有其他团队同学询问运行 Next.js 项目遇见的如下报错, 考虑到这块资料较少, 所以本次就简单记录一下。
```bash
# 错误信息1

> Build error occurred
{ /xxx/node_modules/pkg/index.scss:1
$color: #4c9ffe;
                      ^

SyntaxError: Invalid or unexpected token
    at Module._compile (internal/modules/cjs/loader.js:723:23)
```
```bash
# 错误信息2

error - ./node_modules/pkg/index.scss:1
Global CSS cannot be imported from within node_modules.
```

## 问题原因
***错误信息1*** 的原因是 Node 环境进行时发现 node_modules 中有 js 文件 require 了 *.scss 文件, 因为 Node 默认只能解析 .js, .mjs, .json, .node 后缀文件。
> 注意 SSR 项目会打包出两份文件, 一份是正常的客户端渲染时在浏览器端运行, 一份是服务端渲染时 Node 端运行。Node 端运行的这份代码通常会把 node_modules 的包设置为 [externals](https://webpack.js.org/configuration/externals/), 这样能有效避免 node_modules 中某个包如果不 externals 会存在一个引用在 bundle.js, 一个引用在 node_modules 中。externals 后如 react 就仅 node_modules 中一个实例。
```js
// node_modules/pkg/index.js

require("./index.scss")
```
如何扩展 Node 可识别的文件类型了, 了解过 [ts-node](https://github.com/TypeStrong/ts-node) 实现就比较清楚了。 如下代码即可设置 Node 对于 .scss 文件的处理函数。这里我们无需真实转换, 设置一个空函数忽略即可。
```js
require.extensions['.scss'] = () => {}
```
> 作为对照, 可以看下如下 Node 处理 .json 文件的逻辑
```js
// lib/internal/modules/cjs/loader.js

// Native extension for .json
Module._extensions['.json'] = function(module, filename) {
  const content = fs.readFileSync(filename, 'utf8');

  if (policy?.manifest) {
    const moduleURL = pathToFileURL(filename);
    policy.manifest.assertIntegrity(moduleURL, content);
  }

  try {
    module.exports = JSONParse(stripBOM(content));
  } catch (err) {
    err.message = filename + ': ' + err.message;
    throw err;
  }
};
```

综上所述, next.config.js 加入如下代码, next dev 就解决 ***报错1*** 了。为什么 next export / next build 命令还会有问题了? 原因是 next 进行 [SSG](https://nextjs.org/docs/advanced-features/static-html-export) 时, 是按照每个页面一个单独的线程并行进行的任务, 如下的赋值语句子线程不能生效。
```js
require.extensions['.scss'] = () => {}
require.extensions['.sass'] = () => {}
require.extensions['.less'] = () => {}
require.extensions['.css'] = () => {}
```
那么我们可以在每个页面运行加上上面的代码就能解决了。不过我们要加入的是如下的代码, 因为 require 关键字会被 webpack 给编译, webpack 会提供 [require](https://webpack.js.org/api/module-methods/#requirecontext) 相关的 api, 编译后 require 将不复存在。故 webpack 提供了 [__non_webpack_require__ ](https://webpack.js.org/api/module-variables/#__non_webpack_require__-webpack-specific) 使得编译后能够保留 require 关键字, 即 __non_webpack_require__ (编译前) => require (编译后)。
```js
__non_webpack_require__.extensions['.scss'] = () => {}
__non_webpack_require__.extensions['.sass'] = () => {}
__non_webpack_require__.extensions['.less'] = () => {}
__non_webpack_require__.extensions['.css'] = () => {}
```
***错误信息2*** 是打包给客户端渲染时的代码遇见了发现 node_modules 中有 js 文件 require 了 *.css 等文件的校验报错。即不给这样的代码放行。

解决的办法就是遍历 webpackConfig 剔除校验的 error-loader。

```js
if (item.use && item.use.loader === "error-loader") {
   return false;
}
```

Next.js v12 已经内置了 .scss, .css 文件的支持, 但是不会处理 node_modules 中的 js 文件 require 的 *.css。

解决的办法就是遍历 webpackConfig 篡改 issuer.not 的配置使得能够支持。
```js
if (
  item.issuer &&
  Array.isArray(item.issuer.not) &&
  item.issuer.not.find((i) => i.toString() === "/node_modules/")
) {
  item.issuer.not = item.issuer.not.filter(
    (i) => i.toString() !== "/node_modules/"
  );
}
```

## 问题解决
这块解决的代码 2年写到这个包中, 本次也是适配了 Next.js v12, 有需要或者想查阅完整的代码可以点击 [xiaoxiaojx/with-ssr-entry](https://github.com/xiaoxiaojx/with-ssr-entry)
```js
// next.config.js

const withSsrEntry = require('with-ssr-entry')
module.exports = withSsrEntry() // like withCss, withSass
```
> 以上介绍的都是如何逃避 Next.js 的检查, 适用于推动不了第三包去修改代码。如果你是这些包的负责人, 则可以像 antd 这样书写正确推荐的代码。即对于 antd 组件来说 date-picker.js 内部不引入 .css 文件, 转而由业务项目 src 下的代码去引入所需的 css。
```js
// my-app/src/**

// 引入 js
import { DatePicker } from 'antd';
// 一次性引入全部的 css 或者按需引入当前组件的 css
// import 'antd/es/date-picker/style/css'
import 'antd/dist/antd.css'

ReactDOM.render(<DatePicker />, mountNode);
```