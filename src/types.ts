/**
 * types
 */

export interface Author {
    id: number;
    name: string;
    username: string;
    state: string;
    avatarUrl: string;
    webUrl: string;
}

export interface MaterialConfig {
    name: string;
    downloadUrl: string;
    type: string;
    branch: string;
    path: string;
}

export interface BlockConfig {
    title: string;
    value: string;
    key: string;
    description: string;
    url: string;
    downloadUrl: string;
    type: string;
    path: string;
    isPage: boolean;
    defaultPath: string;
    img: string;
    tags: [string];
    name: string;
    previewUrl: string;
    features: [string];
    branch: string;
    framework: string;
}
  

export interface StatisticsMessage {
    type: string;
    message: string;
    user?: {name?: string, email?: string};
}