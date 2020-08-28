/**
 * request
 */

import fetch from 'node-fetch';

export default function requestSingleton() {

    const headers = {
        "Content-Type": "application/json",
    };

    function request(url: string, options?: any) {

        if (options && options.method === 'POST' && options.body) {
            options.body = JSON.stringify(options.body);
        }

        return fetch(url, {
            ...options,
            headers
        })
            .then((res) => {
                if (options && options.dataType === 'text') {
                    return res.text();
                }

                return res.json();
            });
    }

    return request;
}