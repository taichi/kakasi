import { inject, injectable } from 'inversify';

import { DatabaseProvider, doTransaction, TYPES } from '../sqliteutil';

export type KudosModel = {
    userid: string;
    quantity: number;
    timestamp: string;
};

export type KudosRankingModel = {
    username: string;
    quantity: number;
};

export interface IKudosService {
    findKudosById(userid: string): Promise<KudosModel | undefined>;

    getRanking(order: 'desc' | 'asc'): Promise<KudosRankingModel[]>;

    saveKudos(fromuserid: string, touserid: string, amount: number): Promise<number>;
}

@injectable()
export class SqliteKudosService implements IKudosService {

    private provider: DatabaseProvider;

    constructor( @inject(TYPES.DatabaseProvider) provider: DatabaseProvider) {
        this.provider = provider;
    }

    public async findKudosById(userid: string): Promise<KudosModel | undefined> {
        const db = await this.provider();
        return db.get<KudosModel>('select userid, quantity, timestamp from kudos where userid = ?', userid);
    }

    public async getRanking(order: 'desc' | 'asc'): Promise<KudosRankingModel[]> {
        const db = await this.provider();

        const sql = `select user.name, kudos.quantity
        from kudos inner join user on user.userid = kudos.userid
        order by kudos.quantity ${order} limit 10`;

        const ranks = db.all<KudosRankingModel>(sql);
        return ranks ? ranks : [];
    }

    public async saveKudos(fromuserid: string, touserid: string, amount: number): Promise<number> {
        const db = await this.provider();
        return doTransaction(db, async () => {
            await db.run('insert into kudos_history (userid_from, userid_to, op) values (?,?,?)', fromuserid, touserid, amount);

            const quantity = await this.findKudosById(touserid);
            if (quantity) {
                const current = quantity.quantity + amount;
                await db.run('update kudos set quantity = ? where userid = ?', current, touserid);
                return current;
            } else {
                await db.run('insert into kudos (userid, quantity) values (?, ?)', touserid, amount);
                return amount;
            }
        });
    }
}
