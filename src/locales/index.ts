import zhCN from './zh-cn';
import en from './en';

const localesMapping = {
    'zh-cn': zhCN,
    'en': en
};

export default function localize (type: 'zh-cn' | 'en') {
    const locales: any = localesMapping[type];

    return {
        get(key: string) {
            return locales[key];
        },
        getAll() {
            return locales;
        }
    };
}