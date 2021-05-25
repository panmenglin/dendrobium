/**
 * types
 */
export interface LibraryConfig {
    name: string,
    code: string,
    path: string
}

export interface ComponentConfig {
    title: string;
    description: string;
    tags: string[];
    previewImg?: string;
    code: string;
    name: string;
    groupName?: string,
    doc: string,
    snippets?: string,
    parentCode: string,
    author: string,
    docKeys?: string,
}


export interface StatisticsMessage {
    type: string;
    message: string;
    user?: { name?: string, email?: string };
    block: ComponentConfig
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
