/**
 * types
 */
export interface LibraryConfig {
    name?: string,
    code: string,
    path?: string
}

export interface ComponentConfig {
    title?: string;
    description?: string;
    tags?: string[];
    previewImg?: string;
    code: string;
    name: string;
    doc?: string;
    snippets?: string;
    parentCode?: string;
    author?: string;
    docKeys?: string;
    library?: LibraryConfig;
    importName: string | string[];
    installBy?: 'package' | 'download' | 'script';
    installMethod?: any;
    docFile?: string;
}


export interface StatisticsMessage {
    component: ComponentConfig;
    library?: LibraryConfig;
    type: 'view' | 'install' | 'docView' | 'snippetInsert';
}

export interface ReportVariable {
    userName: string;
    email: string;
    libraryName?: string;
    libraryCode?: string;
    componentName?: string;
    componentCode: string;
    component?: ComponentConfig;
    library?: LibraryConfig;
    type: number;
}

export interface ReportApi {
    url: string;
    method: "POST" | "GET";
    format?: {
        [propName: string]: string;
    }
}

export interface StatisticsConfig {
    reportApi?: ReportApi
}

export interface LibrarysConfig {
    rootPath: string;
    configPath: string;
}
