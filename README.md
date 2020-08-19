# Dendrobium 

**文档待完善**

依托私有业务组件物料仓库，用于安装和更新业务组件的 VSCode 插件。

## 特性

支持符合规则的任何私有仓库接入，提供在 VSCode 中选择组件，下载依赖并在工作区插入组件代码的功能。

## 依赖

组件库的关联和更新需要依赖 git 环境

## 插件配置

* `dendrobium.materielWarehouse`: 关联你的私有物料仓库

```
{
    "name": "scf-blocks",           — 组件库名称
    "downloadUrl": "",              — git 物料仓库地址
    "type": "gitlab",               — 物料仓库类型，目前仅支持 gitlab/github
    "branch": "master",             — 物料仓库分支
    "path": "scf-block.json"        — 物料列表 json 文件路径
}
```

## 仓库搭建

物料应当可以通过 import 直接应用

物料列表 json 需要遵循特定的格式

```
{
    "blocks": [
        {
            "title": "button按钮类型",           - 物料名称
            "value": "button-basic",
            "key": "button-basic",          
            "description": "",                  - 物料描述
            "url": "",
            "downloadUrl": "",                  - npm 下载地址
            "type": "block",
            "path": "button-basic",
            "isPage": false,
            "defaultPath": "ButtonBasic",       - 默认安装文件夹名称
            "img": "",                          - 预览图片地址
            "tags": ["通用"],
            "name": "button-按钮类型",
            "previewUrl": "",                   - 预览地址
            "features": ["antd"],
            "branch": "master",
            "framework": "React"
        }
    ]
}

```