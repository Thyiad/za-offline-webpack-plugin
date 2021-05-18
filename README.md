# dm-offline-webpack-plugin

把目录打包成离线缓存要求的目录结构

例如：

```js
const { DMOfflineWebpackPlugin } = require('../lib/index');

new DMOfflineWebpackPlugin({
    // 源目标，默认dist
    src: 'dist',
    // 目标文件名，默认offline，会生成一个offline.zip
    target: 'offline',
    // 当前项目所在域名，不需要schema，可有子路径，例如：dm.zhongan.com/m/run-app
    domain: 'dm.zhongan.com',
    // 子文件的mapping，可以是文件夹/文件
    mapping: [
        {
            src: 'assets/images',
            target: 'images',
            domain: 'static.zhongan.com/website/m/mible/activity/dm',
        },
        {
            src: 'assets/html',
            target: 'htmlxxx',
            domain: 'static.zhongan.com/website/m/mible/activity/dm',
        },
    ],
});
```
