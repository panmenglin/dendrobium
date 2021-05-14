<p align="center">
    <img width="160" src="https://user-images.githubusercontent.com/12044749/118221230-cad27a00-b4af-11eb-9d74-9120041180a6.png">
</p>

<h1 align="center">Dendrobium</h1>

English | [简体中文](../README.md)

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
* `dendrobium.language` : The language used to configure plug-in reminders and some operations. "zh-cn" or "en" can be set. The default is Chinese

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

* `dendrobium.statistics`: Used to configure the statistical interfaces required for private warehouses

When reporting data, the corresponding template variable will be replaced with the actual value

$TYPE         operation type
$MESSAGE      log information
$WAREHOUSE    warehouse git address
$BLOCKNAME    block name
$BLOCKKEY     block key

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
        }
    ]
}

```

## The Origin Of Name
The plugin is named after Dendrobium Gundam which one of the earliest weapon depot systems in Gundam.

![avatar](https://user-images.githubusercontent.com/12044749/118221259-d7ef6900-b4af-11eb-8393-8020d6cde9cd.jpg)


## Other

Look forward to your use and feedback. [Rating & Review](https://marketplace.visualstudio.com/items?itemName=panmenglin.dendrobium&ssr=false#review-details)



