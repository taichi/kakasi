import { Config } from '../config';
import { Context } from '../context';
import { ICommand, STORAGE } from './index';

import { HELP } from './dict';

import * as sqlite from 'sqlite';

// tslint:disable-next-line:no-multiline-string
const BASE_WORDS = `
select word
from (
    select word_list.word
    from word_list inner join keyword on word_list.id_keyword = keyword.id
    where keyword.title = ?
    union
    select word_list.word
    from word_list inner join keyword on word_list.id_keyword = keyword.id
    where keyword.id = (
            select key_alias.id_keyword_to
            from keyword inner join key_alias on keyword.id = key_alias.id_keyword_from
            where keyword.title = ?
          )
)
`;
// tslint:disable-next-line:no-multiline-string
const WORDS = `${BASE_WORDS}
order by word
`;

// tslint:disable-next-line:no-multiline-string
const ONE_WORD = `${BASE_WORDS}
order by random()
limit 1;
`;

// tslint:disable-next-line:no-multiline-string
const EXISTS_WORD = `
select word_list.id_keyword, word_list.id
from word_list inner join keyword on word_list.id_keyword = keyword.id
where keyword.title = ? and word_list.word = ?
union
select word_list.id_keyword, word_list.id
from word_list inner join keyword on word_list.id_keyword = keyword.id
where keyword.id = (
        select key_alias.id_keyword_to
        from keyword inner join key_alias on keyword.id = key_alias.id_keyword_from
        where keyword.title = ? and word_list.word = ?
      )
`;

// tslint:disable-next-line:no-multiline-string
const COUNT_NEW_WORD = `
select count(id) as cnt
from (
    select word_list.id
    from word_list inner join keyword on word_list.id_keyword = keyword.id
    where keyword.title = ?
    union
    select word_list.id
    from word_list inner join keyword on word_list.id_keyword = keyword.id
    where keyword.id = (
            select key_alias.id_keyword_to
            from keyword inner join key_alias on keyword.id = key_alias.id_keyword_from
            where keyword.title = ?
        )
)
`;

// tslint:disable-next-line:no-multiline-string
const COUNT_EXISTS_WORD = `
select count(word_list.id) as cnt
from word_list inner join keyword on word_list.id_keyword = keyword.id
where keyword.title = ?
`;

export class SqliteDict implements ICommand {
    private args: string[];
    constructor(cmd: string[]) {
        this.args = cmd;
    }

    public execute(context: Context): Promise<string> {
        if (this.args.length < 1) {
            return Promise.reject('dict コマンドは引数が一つ以上必要です。');
        }

        const db: sqlite.Database = context.get(STORAGE);
        if (!db) {
            return Promise.reject('データベースがセットアップされていません。');
        }

        const key = this.args[0];

        return db.get(ONE_WORD, key, key)
            .then((row: { word: string }) => row ? row.word : key);
    }
}

const getOrCreateKeyword = async (db: sqlite.Database, key: string): Promise<number> => {
    const idrow = await db.get<{ id: number }>('select id from keyword where title = ?', key);
    if (idrow) {
        return idrow.id;
    }
    const stmt = await db.run('insert into keyword (title) values (?)', key);

    return stmt.lastID;
};

export class SqliteDictEditor implements ICommand {
    private args: string[];
    constructor(cmd: string[]) {
        this.args = cmd;
    }

    public execute(context: Context): Promise<string> {
        if (this.args.length < 1) {
            return Promise.reject('dict コマンドは引数が一つ以上必要です。');
        }

        const db: sqlite.Database = context.get(STORAGE);
        if (!db) {
            return Promise.reject('データベースがセットアップされていません。');
        }

        const subcmd = this.args[0];
        switch (subcmd.toLowerCase()) {
            case 'help':
            case '?':
                return this.help(context);
            case 'list':
            case 'ls':
                return this.list(context);
            case 'add':
            case 'put':
            case 'push':
                return this.add(context);
            case 'delete':
            case 'remove':
            case 'del':
            case 'rm':
                return this.remove(context);
            case 'alias':
            case 'ln':
                return this.alias(context);
            default:
                return this.help(context);
        }
    }

    public help(context: Context): Promise<string> {
        return Promise.resolve(HELP);
    }

    public list(context: Context): Promise<string> {
        const subargs = this.args.slice(1);
        if (0 < subargs.length) {
            const db: sqlite.Database = context.get(STORAGE);
            const key = subargs[0];

            return db.all(WORDS, key, key).then((rows: { word: string }[]) => {
                if (rows) {
                    return rows.map((r: { word: string }): string => r.word)
                        .join('\n');
                } else {
                    return Promise.resolve(`${key} にはまだ何も登録されていません。`);
                }
            });
        }

        return Promise.reject(`dictコマンドの ${this.args[0]} サブコマンドには 列挙対象を指定するための引数が 1 つ必要です。`);
    }

    public async add(context: Context): Promise<string> {
        const subargs = this.args.slice(1);
        if (subargs.length < 2) {
            return Promise.reject(`dictコマンドの ${this.args[0]} サブコマンドには 登録対象の辞書及び登録する語の 2 つの引数が必要です。`);
        }

        const db: sqlite.Database = context.get(STORAGE);
        const [key, newone] = subargs;

        const id = await getOrCreateKeyword(db, key);
        const wdrow = await db.get('select id from word_list where id_keyword = ? and word = ?', id, newone);
        if (wdrow) {
            return Promise.reject(`${key} に ${newone} は登録済みです。`);
        }

        await db.run('insert into word_list (id_keyword, word) values (?, ?)', id, newone);

        return Promise.resolve(`${key} に ${newone} を登録しました。`);
    }

    public async remove(context: Context): Promise<string> {
        const subargs = this.args.slice(1);
        if (subargs.length < 2) {
            return Promise.reject(`dictコマンドの ${this.args[0]} サブコマンドには 削除対象の辞書及び削除する語の 2 つの引数が必要です。`);
        }

        const db: sqlite.Database = context.get(STORAGE);
        const [key, exists] = subargs;

        const wdrow = await db.get(EXISTS_WORD, key, exists, key, exists);
        if (!wdrow) {
            return Promise.reject(`${key} という辞書が無いか、それに登録された語がありません。`);
        }

        await db.run('delete from word_list where id_keyword = ? and id = ?', wdrow.id_keyword, wdrow.id);

        return Promise.resolve(`${key} から ${exists} を削除しました。`);
    }

    public async alias(context: Context): Promise<string> {
        const subargs = this.args.slice(1);
        if (subargs.length < 2) {
            return Promise.reject(`dictコマンドの ${this.args[0]} サブコマンドには 新しい辞書名と既存の辞書名の 2 つの引数が必要です。`);
        }
        const db: sqlite.Database = context.get(STORAGE);
        const [newone, exists] = subargs;
        const newrow = await db.get<{ cnt: number }>(COUNT_NEW_WORD, newone);
        if (newrow && 0 < newrow.cnt) {
            return Promise.reject(`${newone} には語が登録済みです。語が登録されていない辞書のみを指定できます。`);
        }

        const existsrow = await db.get<{ cnt: number }>(COUNT_EXISTS_WORD, exists);
        if (!existsrow || existsrow.cnt < 1) {
            return Promise.reject(`${exists} には語が登録されていません。語が登録されておりエイリアスでない辞書のみを指定できます。`);
        }

        const fromid = await getOrCreateKeyword(db, newone);
        const toid = await getOrCreateKeyword(db, exists);

        await db.run('insert into key_alias (id_keyword_from, id_keyword_to) values (?, ?)', fromid, toid);

        return Promise.resolve(`${newone} を ${exists} としても使えるようになりました。`);
    }
}
