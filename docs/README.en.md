<p align="center">
    <img width="160" src="https://user-images.githubusercontent.com/12044749/118221230-cad27a00-b4af-11eb-9d74-9120041180a6.png">
</p>

<h1 align="center">Dendrobium</h1>

English | [简体中文](./README.zh-CN.md)

**Improving**

VSCode front-end component library management plugin

## Features

Components Library Management:
manage any front-end component library or component through setting configuration, and install components by `npm`.

Code Snippets:

Automatically generate code snippets according to your configuration in the workspace  when the component is installed, it provides automatic completion during editing;
At the same time, it supports to insert the code snippets of the component by clicking in the VSCode view container.

Documentation:
Through configuration, you can view the component document in the VSCode view container.

Statistics:
By configuring the statistics interface information, the data is reported when users add and like components, which facilitates the statistics of the use of private warehouses.


## Dependence

The installation of components needs to rely on package management tools, such as: `npm`, `yarn` or others;
The burial function may obtain the git information in the current workspace, such as user name, email, and the burial function needs to rely on the git environment.


## Setting

- `dendrobium.language` : language of plugin reminders and some operations, you can set zh-cn or en, the default is Chinese.

```javascript
{
  ...

  "dendrobium.language": "zh-cn"

  ...
}
```

- `dendrobium.librarysConfig` : Get the component library configuration interface interface.

The component library configuration information is also maintained through the `npm` project, here you can configure the `unpkg` file address.

| | |
| --| -- |
| rootPath | the root path of configuration interface |
| configPath | the path of configuration file| 


```javascript
{
  ...

  "dendrobium.librarysConfig": {
    "rootPath": "",
    "configPath": ""
  }

  ...
}
```

- `dendrobium.packageManagementTool`: Configure package management tools and required commands.

```javascript
{
  ...

  "dendrobium.packageManagementTool": {
      "install": "npm install --save"
  }

  ...
}
```

- `dendrobium.statistics`: Configure the statistical interface required to submit buried point information in the plugin.

The main fields reported in data statistics include:

| key | name | value |
| -- | -- | -- |
| userName | git user name | It may be null if git information cannot be obtained |
| email | git email | It may be null if git information cannot be obtained |
| libraryName | library name | Only the installation type is determined by this value |
| libraryCode | library code | |
| componentName | component name | Only the installation type is determined by this value |
| componentCode | component code | |
| type | 操作类型 | 0（view library）、1（install component）、2（view document）、3（insert snippet） |


```javascript
{
  ...

    "dendrobium.statistics": {
      "reportApi": {
          "url": "",
          "method": "POST",
      }
    }

    ...
}
```

## Components library configuration

#### The return format and segmentation requirements of the component library configuration interface are as follows:

```javascript
{
    "library": [{
        "name": "LibraryA",
        "code": "libraryA",
        "path": "" // the path of component library A component list interface
    }, {
        "name": "LibraryB",
        "code": "libraryB",
        "path": "" // the path of component library B component list interface
    }]
}
```
#### The return format and field requirements of the interface to get a component library component list are as follows:

```javascript
{
  "components": [
    {
      "title": "ComponentA", // component name
      "description": "", // component description
      "tags": ["Base Component", "React", "Vue"], // component tags
      "previewImg": "", // the preview image url of component
      "code": "xxx", // component code，unique value
      "importName": "xxx", // The variable name when importing, the value will be used when importing, the type is string ｜ string[], when the importName value is an array, it will be imported using destructuring
      "name": "@xx/xxx", // component name, which will be used when performing the installation operation
      "doc": "xxx", // the doc url of componentA
      "snippets": "", // get the component code snippet interface
      "parentCode": "", // library code，unique value
      "author": "", // developer
    }
  ]
}

```

#### The return format and field requirements of the interface to obtain the code snippet of this component are as follows:

Compliant with VSCode code snippet format.

```javascript
{
  ...

  "key": {
    "scope": "javascript,typescript", // language
    "prefix": "log", // snippet prefix
    "body": [
      "console.log('$1');",
      "$2"
    ], // content
    "description": "" // description
  },

  ...
}
```

## The Origin Of Name
The plugin is named after Dendrobium Gundam which one of the earliest weapon depot systems in Gundam.

![avatar](https://user-images.githubusercontent.com/12044749/118221259-d7ef6900-b4af-11eb-8393-8020d6cde9cd.jpg)


## Other

Look forward to your use and feedback. [Rating & Review](https://marketplace.visualstudio.com/items?itemName=panmenglin.dendrobium&ssr=false#review-details)



