<p align="center">
    <img width="160" src="https://user-images.githubusercontent.com/12044749/118221230-cad27a00-b4af-11eb-9d74-9120041180a6.png">
</p>

<h1 align="center">Dendrobium</h1>

[English](./docs/README.en.md) | 简体中文

**文档完善中**

基于私有仓库的 VSCode 物料管理插件

## 灵感来源

[umi-ui](https://github.com/umijs/umi-ui)

## 特性


私有物料仓库：
插件支持通过设置关联任何符合规范的私有物料仓库，并提供组件及代码片段的安装和更新功能

版本管理：
更新组件时候会自动产生一条 merge 记录，如果新旧组件文件中产生冲突将会提示用户手动 merge 以保证代码的准确性

组件依赖：
在安装或更新组件时，会自动合并项目与组件 package.json 中的依赖，并以当前项目依赖配置为主，合并后将提示用户确认并决定是否执行安装

预留统计接口：
通过配置统计接口信息，在用户添加或更新组件时上报数据，方便私有仓库使用情况的统计

创建组件：
初始化组件模版


## 依赖

物料仓库的关联以及物料更新依赖 git 环境，并进行了版本管理。

## 插件设置

* `dendrobium.language` : 用于配置插件提醒及部分操作的语言，可设置 zh-cn 或 en，默认为中文

* `dendrobium.materialWarehouse`: 用于配置插件关联的物料仓库信息

```
[{
    "name": "scf-blocks",           — 名称
    "downloadUrl": "",              — 仓库 git 地址
    "type": "gitlab",               — 仓库类型, 例如: gitlab 或 github
    "branch": "master",             — 仓库分支
    "path": "scf-block.json"        — 物料列表 json 文件路径
}]
```

* `dendrobium.statistics`: 用于配置私有仓库所需的统计接口

在数据上报时，其中对应模版变量会被替换为实际值

$TYPE         操作类型
$MESSAGE      日志信息
$WAREHOUSE    仓库地址
$BLOCKNAME    区块名称
$BLOCKKEY     区块值

```
{
    "reportApi": {
        "url": "",
        "method": "POST",
        "format": {
            "type": "$TYPE",
            "message": "$MESSAGE",
            "wareHouse": "$WAREHOUSE",
            "blockName": "$BLOCKNAME",
            "blockKey": "$BLOCKKEY",
            "other": ""
        }
    }
}
```

## 物料仓库

### 开发需求

组件应当符合 es6 标准，支持通过 import 引入，例如

```javascript
import React from "react";
import styles from "./index.less";
import { Button } from "antd";

export default () => (
  <div className={styles.container}>
    <div id="components-button-demo-basic">
      <div>
        <Button type="primary">Primary</Button>
        <Button>Default</Button>
        <Button type="dashed">Dashed</Button>
        <Button type="link">Link</Button>
      </div>
    </div>
  </div>
);

```


代码片段文件维护在 snippet.bium 下，例如：

```javascript
// index.ts

export default {
  /**
   * 路由拍平
   * @param {*} arr
   */
  flat(arr) {
    return arr.reduce((prev, cur) => {
      return prev.concat(Array.isArray(cur) ? this.flat(cur) : cur);
    }, []);
  },
}

```


```javascript
// snippet.bium
LsTool.flat()
```

### 物料列表配置


物料列表 json 需要符合特定的格式:

```
{
    "blocks": [
        {
            "title": "button",                  - 展示名称
            "value": "button-basic",
            "key": "button-basic",          
            "description": "",                  - 描述
            "url": "",
            "downloadUrl": "",                  - npm 下载地址
            "type": "component",                - 物料类型，component 或 snippet 或 npm
            "path": "button-basic",
            "isPage": false,
            "defaultPath": "ButtonBasic",       - 默认安装的文件名和引用的名称
            "img": "",                          - 预览图片地址
            "tags": ["normal"],
            "name": "button",
            "previewUrl": "",                   - 预览地址
        }
    ]
}

```

## 命名

Dendrobium（石斛兰）的命名来源于高达 0083 星尘的回忆，是高达中最早的武器库系统之一

![avatar](https://user-images.githubusercontent.com/12044749/118221259-d7ef6900-b4af-11eb-8393-8020d6cde9cd.jpg)


## 其他

期待你的使用和反馈 [Rating & Review](https://marketplace.visualstudio.com/items?itemName=panmenglin.dendrobium&ssr=false#review-details)





