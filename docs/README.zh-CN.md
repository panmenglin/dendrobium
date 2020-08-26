<p align="center">
    <img width="160" src="https://github.com/panmenglin/dendrobium/raw/master/dendrobium.png">
</p>

<h1 align="center">Dendrobium</h1>

[English](../README.md) | 简体中文

**文档完善中**

基于私有仓库的 VSCode 物料管理插件

## 特性

It supports the access of any private warehouse that conforms to the rules, and provides the function of selecting components in vscode, downloading dependencies and inserting component codes in the workspace.

支持通过插件设置关联私有物料仓库，并提供组件及代码片段的安装和更新


## 依赖

物料仓库的关联以及物料更新依赖 git 环境，并进行了版本管理。

## 插件设置

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
            "type": "component",                - 物料类型，component 或 snippet
            "path": "button-basic",
            "isPage": false,
            "defaultPath": "ButtonBasic",       - 默认安装的文件名和引用的名称
            "img": "",                          - 预览图片地址
            "tags": ["normal"],
            "name": "button",
            "previewUrl": "",                   - 预览地址
            "features": ["antd"],
            "branch": "master",
            "framework": "React"
        }
    ]
}

```

## 命名

Dendrobium（石斛兰）的命名来源于高达 0083 星尘的回忆，是高达中最早的武器库系统之一

![avatar](https://github.com/panmenglin/dendrobium/raw/master/docs/image/GP03-DENDROBIUM-GUNDAM.jpg)


## 待办

1、根据配置自动安装物料的依赖项

2、物料列表展示区分 vue 和 react



