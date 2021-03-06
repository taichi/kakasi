import * as sqlite from 'sqlite';

export type DatabaseProvider = () => Promise<sqlite.Database>;

export const TYPES = {
    DatabaseProvider: Symbol.for('DatabaseProvider'),
};

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
