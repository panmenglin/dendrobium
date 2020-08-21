/**
 * store
 */

import { Memento } from 'vscode';

export default function store<T>(
    type: 'hosts' | 'lastUseHost',
    select: (item: T) => any,
    state: Memento
) {

    const get = (uniqueKey?: string) => {
        const existing = (state.get(type) || []) as T[];
        if (uniqueKey) {
            return existing.filter((item) => select(item) === uniqueKey);
        }

        return existing.filter((item) => !!select(item));
    };

    const set = (item: T) => {
        const existing = get();
        const uniqueKey = select(item);

        return state.update(type, [
            item,
            ...existing.filter((item) => select(item) !== uniqueKey),
        ]);
    };

    const remove = (item: T) => {
        const uniqueKey = select(item);
        return state.update(
            type,
            get().filter((item) => select(item) !== uniqueKey)
        );
    };

    return {
        set,
        get,
        remove,
    };
}
