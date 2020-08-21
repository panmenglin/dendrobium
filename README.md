# Dendrobium 

**Improving**

Depending on private material warehouse, it‘s a VSCode plugin which used to install and update your business components.


## Features

It supports the access of any private warehouse that conforms to the rules, and provides the function of selecting components in vscode, downloading dependencies and inserting component codes in the workspace.


## Dependence

The association and update of component library depends on git environment


## Setting

* `dendrobium.materielWarehouse`: It is associated with your private material warehouse and supports the maintenance of multiple warehouses



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
            "title": "button",           - display title
            "value": "button-basic",
            "key": "button-basic",          
            "description": "",                  - block description
            "url": "",
            "downloadUrl": "",                  - npm download url
            "type": "block",
            "path": "button-basic",
            "isPage": false,
            "defaultPath": "ButtonBasic",       - default install block folder name
            "img": "",                          - preview image url
            "tags": ["normal"],
            "name": "button",
            "previewUrl": "",                   - preview url
            "features": ["antd"],
            "branch": "master",
            "framework": "React"
        }
    ]
}

```

## The Origin Of Name
The plugin is named after Dendrobium Gundam which one of the earliest weapon depot systems in Gundam.

![avatar](./doc/image/GP03-DENDROBIUM-GUNDAM.jpg)