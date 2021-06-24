<p align="center">
    <img width="160" src="https://user-images.githubusercontent.com/12044749/118221230-cad27a00-b4af-11eb-9d74-9120041180a6.png">
</p>

<h1 align="center">Dendrobium</h1>

[English](./docs/README.en.md) | 简体中文

**文档完善中**

VSCode 前端组件库管理插件

## 特性

组件库管理：
关联并展示任何前端组件库或组件，并提供基于 npm 或其他包管理工具、下载本地、script 引入等方式的组件安装。


<img src="https://user-images.githubusercontent.com/12044749/123193425-5db2fb00-d4d7-11eb-85fd-8e21ccb6306e.png" width="360px">

代码片段：
组件安装时自动在工作区下生成代码片段，提供编辑时的自动补全，方便用户对组件的快速使用；
同时支持通过 VSCode 视图容器中点击插入组件的代码片段。

<img src="https://user-images.githubusercontent.com/12044749/123193424-5d1a6480-d4d7-11eb-82d3-5c1398922306.png" width="360px">

文档：
组件标签悬浮提示组件 API 文档 或 在 VSCode 视图容器中查看组件文档。

<img src="https://user-images.githubusercontent.com/12044749/123193421-5b50a100-d4d7-11eb-906f-2164c51f3251.png" width="360px">

预留统计接口：
配置统计接口信息后，在用户添加、点赞组件时上报数据，方便进行私有仓库使用情况的统计。

## 依赖

组件的安装需要依赖包管理工具，例如：npm、yarn 或其他；
埋点功能可能会获取当前工作区内的 git 信息，例如：用户名、email，如需使用埋点功能需要依赖 git 环境。

## 插件设置

为方便团队管理，插件的配置提供了 从统一配置文件获取 和 本地配置 两种。

### 配置文件

在插件安装好后，编辑中右键选择 “安装组件”，第一次会弹出窗口请求输入配置文件地址，可以输入团队中已设置好的配置文件地址。

在 [dendrobium-library](https://github.com/panmenglin/dendrobium-library) 项目中提供了一个配置 `https://raw.githubusercontent.com/panmenglin/dendrobium-library/main/config.json`，其中配置了 Ant Design 组件库，可以直接使用，也可参考修改配置。

### 本地配置

- `dendrobium.language` : 用于配置插件提醒及部分操作的语言，可设置 zh-cn 或 en，默认为中文

```javascript
{
  ...

  "dendrobium.language": "zh-cn"

  ...
}
```

- `dendrobium.librarysConfig` : 获取组件库配置接口接口。
组件库配置信息也通过 `npm` 项目维护，这里配置 `unpkg` 文件地址即可。

| | |
| --| -- |
| configPath | 组件库配置文件地址 |


```javascript
{
  ...

  "dendrobium.librarysConfig": {
    "configPath": ""
  }

  ...
}
```

- `dendrobium.packageManagementTool`: 用于配置默认使用的包管理工具命令

```javascript
{
  ...

  "dendrobium.packageManagementTool": {
      "install": "npm install --save"
  }

  ...
}
```

- `dendrobium.statistics`: 用于配置插件中提交埋点信息所需的统计接口

在数据统计上报的主要字段包括：

| 字段 | 名称 | 值 |
| -- | -- | -- |
| userName | git 用户名 | 如果无法获取 git 信息则可能为空 |
| email | git Email | 如果无法获取 git 信息则可能为空 |
| libraryName | 组件库名称 | 只有安装埋点由该值 |
| libraryCode | 组件库编码 | |
| componentName | 组件名称 | 只有安装埋点由该值 |
| componentCode | 组件编码 | |
| type | 操作类型 | 0（访问组件库）、1（安装组件）、2（查看文档）、3（插入代码片段）等 |


```javascript
{
  ...

    "dendrobium.statistics": {
      "reportApi": {
          "url": "",
          "method": "POST"
      }
    }

    ...
}
```

## 组件库配置

#### 获取组件库配置接口返回格式和字段需求如下：

```javascript
{
    "library": [{
        "name": "组件库A",
        "code": "libraryA",
        "path": "" // 获取组件库A组件列表接口
    }, {
        "name": "组件库B",
        "code": "libraryB",
        "path": "" // 获取组件库A组件列表接口
    }]
}
```
#### 获取某个组件库组件列表接口返回格式和字段需求如下：

```javascript
{
  "components": [
    {
      "title": "组件A", // 组件名称
      "description": "", // 组件描述
      "tags": ["基础组件", "React", "Vue"], // 组件关联标签，可自定义
      "previewImg": "", // 组件预览图
      "code": "xxx", // 组件code，唯一值
      "importName": "xxx", // 引入时变量名称，import 时会使用该值，类型是 string ｜ string[]，当 importName 值是数组时，会使用解构引入
      "elementTag": "", // 标签名，用于悬浮提示
      "name": "@xx/xxx", // 组件名称，执行安装操作时会使用该名称
      "doc": "xxx", // 文档地址
      "docFile": "", // markdown 文档地址，用于抓去组件标签悬浮时需要显示的 api 提示，文档中需要有名为 API 的二级标题，及 ## API
      "snippets": "", // 获取该组件代码片段接口
      "parentCode": "", // 组件库code，唯一值
      "author": "", // 开发者
      "installMethod": { // 安装方式
        "package": "npm install --save", // 包管理工具，可以配置私有仓库安装方式
        "download": "", // 下载本地，此处为下载地址
        "script": "" // 直接插入 script 标签，例如：cdn 地址
      }
    }
  ]
}

```

#### 获取该组件代码片段接口返回格式和字段需求如下：

符合 VSCode 代码片段格式

```javascript
{
  ...

  "key": {
    "scope": "javascript,typescript", // 支持语言
    "prefix": "log", // 触发自动补全的前缀
    "body": [
      "console.log('$1');",
      "$2"
    ], // 代码片段内容
    "description": "" // 描述
  },

  ...
}
```


## 命名

Dendrobium（石斛兰）的命名来源于高达 0083 星尘的回忆，是高达中最早的武器库系统之一

<img src="https://user-images.githubusercontent.com/12044749/118221259-d7ef6900-b4af-11eb-8393-8020d6cde9cd.jpg" width="360px">

## 其他

期待你的使用和反馈 [Rating & Review](https://marketplace.visualstudio.com/items?itemName=panmenglin.dendrobium&ssr=false#review-details)
