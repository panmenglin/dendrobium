<p align="center">
    <img width="160" src="https://github.com/panmenglin/dendrobium/raw/master/dendrobium.png">
</p>

<h1 align="center">Dendrobium</h1>

English | [简体中文](./docs/README.zh-CN.md)

**Improving**

Depending on private material warehouse, it‘s a VSCode plugin which used to install and update your business components.

## Inspiration Source

[umi-ui](https://github.com/umijs/umi-ui)

## Features


Private Warehouse:
It supports the access of any private warehouse that conforms to the rules, and provides the function of selecting components in vscode, downloading dependencies and inserting component codes in the workspace.

Version Manage:
When updating a component, a merge record will be generated automatically. If there is a conflict between the old and new component files, you will be prompted to merge manually to ensure the accuracy of the code

Dependency:
Projects and components are automatically merged when components are installed or updated package.json After merging, you will be prompted to confirm and decide whether to perform the installation

Statistical Interface：
Through the configuration of statistical interface information, the user can report data when adding or updating components, so as to facilitate the statistics of private warehouse usage

Create A New Component：
Help you initialize the component template


## Dependence

The association and update of component library depends on git environment


## Setting

* `dendrobium.materialWarehouse`: It is associated with your private material warehouse and supports the maintenance of multiple warehouses



```
[{
    "name": "scf-blocks",           — name
    "downloadUrl": "",              — git path
    "type": "gitlab",               — warehouse type, example: gitlab or github
    "branch": "master",             — git branch
    "path": "scf-block.json"        — ths json file path of materirl list
}]
```

## Warehouse

Materials should be able to be directly applied through 'import'

Material list JSON needs to follow a specific format:

```
{
    "blocks": [
        {
            "title": "button",                  - display title
            "value": "button-basic",
            "key": "button-basic",          
            "description": "",                  - block description
            "url": "",
            "downloadUrl": "",                  - npm download url
            "type": "component",                - component or snippet or npm
            "path": "button-basic",
            "isPage": false,
            "defaultPath": "ButtonBasic",       - default install block folder name
            "img": "",                          - preview image url
            "tags": ["normal"],
            "name": "button",
            "previewUrl": "",                   - preview url
            "features": ["],
            "branch": "master",
            "framework": "React"
        }
    ]
}

```

## The Origin Of Name
The plugin is named after Dendrobium Gundam which one of the earliest weapon depot systems in Gundam.

![avatar](https://github.com/panmenglin/dendrobium/raw/master/docs/image/GP03-DENDROBIUM-GUNDAM.jpg)







