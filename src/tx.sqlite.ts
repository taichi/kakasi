import { Context } from './context';

import * as sqlite from 'sqlite';

export function transaction(contextkey: string, index: number = 0) {
    // tslint:disable-next-line:no-any
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        const originalMethod = descriptor.value;

        // tslint:disable-next-line:no-any
        descriptor.value = async function (...args: any[]) {
            const ctx: Context = args[index];
            const db: sqlite.Database = ctx.get(contextkey);
            await db.exec('begin transaction');
            try {
                // tslint:disable-next-line:no-invalid-this
                const result = await originalMethod.apply(this, args);
                await db.exec('commit');

                return result;
            } catch (e) {
                await db.exec('rollback');
                throw e;
            }
        };

        return descriptor;
    };
}

export async function doTransaction<T>(db: sqlite.Database, op: () => Promise<T>): Promise<T> {
    await db.exec('begin transaction');
    try {
        const r = await op();
        await db.exec('commit');

        return r;
    } catch (e) {
        await db.exec('rollback');
        throw e;
    }
}
