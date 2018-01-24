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

export type KudosSenderRankingModel = {
    username: string;
    times: number;
    increment: number;
    decrement: number;
};

export type KudosHistoryModel = {
    sendername: string;
    receivername: string;
    amount: number;
    timestamp: string;
};

export type ReactionModel = {
    id: number;
    username: string;
    icon: string;
    op: number;
    timestamp: string;
};

export interface IKudosService {
    findKudosById(userid: string): Promise<KudosModel | undefined>;

    listRanking(order: 'desc' | 'asc'): Promise<KudosRankingModel[]>;

    listSenderRanking(): Promise<KudosSenderRankingModel[]>;

    listHistory(): Promise<KudosHistoryModel[]>;

    saveKudos(fromuserid: string, touserid: string, amount: number): Promise<number>;

    saveReaction(userid: string, icon: string, op: number): Promise<void>;

    deleteReaction(icon: string): Promise<void>;

    listReaction(): Promise<ReactionModel[]>;

    findReaction(icon: string): Promise<ReactionModel | undefined>;
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

    public async listRanking(order: 'desc' | 'asc'): Promise<KudosRankingModel[]> {
        const db = await this.provider();

        const sql = `select user.name, kudos.quantity
        from kudos inner join user on user.userid = kudos.userid
        order by kudos.quantity ${order} limit 10`;

        const ranks = db.all<KudosRankingModel>(sql);
        return ranks ? ranks : [];
    }

    public async listSenderRanking(): Promise<KudosSenderRankingModel[]> {
        const db = await this.provider();

        // tslint:disable-next-line:no-multiline-string
        const sql = `select u.name username, count(kh.userid_from) times,
        sum(case when kh.op > 0 then kh.op else 0 end) increment,
        sum(case when kh.op < 0 then kh.op else 0 end) decrement
        from kudos_history kh inner join user u on kh.userid_from = u.userid
        group by u.userid
        order by times desc
        limit 10`;
        const ranks = await db.all<KudosSenderRankingModel>(sql);
        return ranks ? ranks : [];
    }

    public async listHistory(): Promise<KudosHistoryModel[]> {
        const db = await this.provider();

        // tslint:disable-next-line:no-multiline-string
        const sql = `select u1.name sendername, u2.name receivername, kh.op amount, kh.timestamp
        from kudos_history kh inner join user u1 on kh.userid_from = u1.userid,
        kudos_history kh2 inner join user u2 on kh.userid_to = u2.userid
        order by kh.timestamp desc
        limit 10`;
        const history = await db.all(sql);
        return history ? history : [];
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

    public async saveReaction(userid: string, icon: string, op: number): Promise<void> {
        const db = await this.provider();
        return doTransaction(db, async () => {
            const row = await db.get('select id from kudos_reaction where icon = ?', icon);
            if (row && row.id) {
                const sql = 'update kudos_reaction set userid = ?, icon = ?, op = ?, timestamp = current_timestamp where id = ?';
                await db.run(sql, userid, icon, op, row.id);
            } else {
                await db.run('insert into kudos_reaction (userid, icon, op) values (?, ?, ?)', userid, icon, op);
            }
        });
    }

    public async deleteReaction(icon: string): Promise<void> {
        const db = await this.provider();
        return doTransaction(db, async () => {
            await db.run('delete from kudos_reaction where icon = ?', icon);
        });
    }

    public async listReaction(): Promise<ReactionModel[]> {
        const db = await this.provider();
        // tslint:disable-next-line:no-multiline-string
        const list = await db.all<ReactionModel>(`select u.name username, kr.icon, kr.op, kr.timestamp
        from kudos_reaction kr inner join user u on kr.userid = u.userid`);
        return list ? list : [];
    }

    public async findReaction(icon: string): Promise<ReactionModel | undefined> {
        const db = await this.provider();

        // tslint:disable-next-line:no-multiline-string
        const sql = `select kr.id, u.name username, kr.icon, kr.op, kr.timestamp
        from kudos_reaction kr inner join user u on kh.userid_from = u.userid
        where kr.icon = ?`;
        return await db.get<ReactionModel>(sql, icon);
    }
}
