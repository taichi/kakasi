import { doTransaction } from '../tx.sqlite';

import * as moment from 'moment';
import * as sqlite from 'sqlite';

export type UserModel = {
    userid: string;
    name: string;
    birthday: string;
    timestamp: string;
};

export interface IUserService {

    findUserById(userid: string): Promise<UserModel | undefined>;

    findUserByName(name: string): Promise<UserModel | undefined>;

    countUserByName(name: string): Promise<Number>;

    saveUser(userid: string, name: string, birthday: string): Promise<void>;

    updateUserName(userid: string, newname: string): Promise<void>;

    updateBirthday(userid: string, birthday: string): Promise<void>;

    aliasUser(registerer: string, userid: string, newname: string): Promise<void>;

    findAliasById(name: string): Promise<string[]>;

    findAliasByName(name: string): Promise<string[]>;
}

// tslint:disable-next-line:no-multiline-string
const FIND_USER_BY_NAME = `
select u1.id, u1.userid, u1.name, u1.birthday, u1.timestamp
from user u1
where u1.name = ?
union
select u2.id, u2.userid, u2.name, u2.birthday, u2.timestamp
from user u2 inner join user_alias ua on u2.userid = ua.userid
where ua.name = ?
`;

// tslint:disable-next-line:no-multiline-string
const COUNT_USER_BY_NAME = `
select count(id) cnt
from (
    ${FIND_USER_BY_NAME}
)`;

export type DatabaseProvider = () => Promise<sqlite.Database>;

export class SqliteUserService implements IUserService {

    private provider: DatabaseProvider;

    constructor(provider: DatabaseProvider) {
        this.provider = provider;
    }

    public async findUserById(userid: string): Promise<UserModel | undefined> {
        const db = await this.provider();

        return db.get<UserModel>('select id, userid, name, birthday, timestamp from user where userid = ?', userid);
    }

    public async findUserByName(name: string): Promise<UserModel | undefined> {
        const db = await this.provider();

        return db.get(FIND_USER_BY_NAME, name, name);
    }

    public async countUserByName(name: string): Promise<Number> {
        const db = await this.provider();

        const row = await db.get<{ cnt: number }>(COUNT_USER_BY_NAME, name, name);
        if (row && row.cnt) {
            return row.cnt;
        }

        return 0;
    }

    public async saveUser(userid: string, name: string, birthday?: string): Promise<void> {
        const db = await this.provider();

        if (birthday && moment(birthday, 'MMDD').isValid() === false) {
            return Promise.reject(`${birthday} は正しくない日付です。 MMDD形式で指定して下さい。`);
        }

        return doTransaction(db, async () => {
            const um = await this.findUserById(userid);
            if (um) {
                return Promise.reject(`${name} は、${um.name} として既に登録済みです。`);
            }

            const un = await this.findUserByName(name);
            if (un && un.name) {
                return Promise.reject(`${un.name} は、既に利用中のユーザ名です。`);
            }

            const bd = birthday ? `\"${birthday}\"` : 'null';
            await db.run(`insert into user (userid, name, birthday) values (?,?,${bd})`, userid, name);
        });
    }

    public async updateUserName(userid: string, newname: string): Promise<void> {
        const db = await this.provider();

        return doTransaction(db, async () => {
            const n = await this.countUserByName(newname);
            if (0 < n) {
                return Promise.reject(`${newname} は、他のユーザが利用中のユーザ名です。`);
            }

            await db.run('update user set name = ? where userid = ?', newname, userid);
        });
    }

    public async updateBirthday(userid: string, birthday: string): Promise<void> {
        const db = await this.provider();
        if (moment(birthday, 'MMDD').isValid() === false) {
            return Promise.reject(`${birthday} は正しくない日付です。 MMDD形式で指定して下さい。`);
        }
        await db.run('update user set birthday = ? where userid = ?', birthday, userid);
    }

    public async aliasUser(registerer: string, userid: string, newname: string): Promise<void> {
        const db = await this.provider();

        return doTransaction(db, async () => {
            const n = await this.countUserByName(newname);
            if (0 < n) {
                return Promise.reject(`${newname} は、既に利用中のユーザ名です。`);
            }

            await db.run('insert into user_alias (userid, userid_register, name) values (?, ?, ?)', userid, registerer, newname);
        });
    }

    public async findAliasById(name: string): Promise<string[]> {
        const db = await this.provider();
        throw new Error('Method not implemented.');
    }

    public async findAliasByName(name: string): Promise<string[]> {
        const db = await this.provider();
        throw new Error('Method not implemented.');
    }
}
