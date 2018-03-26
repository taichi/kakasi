import { inject, injectable } from 'inversify';
import * as sqlite from 'sqlite';

import { DatabaseProvider, doTransaction, TYPES } from '../sqliteutil';

export interface DictService {
    getWordRandomly(title: string): Promise<string | undefined>;

    listWords(title: string): Promise<string[]>;

    saveWord(title: string, word: string): Promise<void>;

    deleteWord(title: string, word: string): Promise<void>;

    aliasTitle(newone: string, exists: string): Promise<void>;
}

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

@injectable()
export class SqliteDictService implements DictService {
    private provider: DatabaseProvider;

    constructor(@inject(TYPES.DatabaseProvider) provider: DatabaseProvider) {
        this.provider = provider;
    }

    public async getWordRandomly(title: string): Promise<string | undefined> {
        const db = await this.provider();
        const row = await db.get<{ word: string }>(ONE_WORD, title, title);
        return row ? row.word : undefined;
    }

    public async listWords(title: string): Promise<string[]> {
        const db = await this.provider();

        return db.all(WORDS, title, title).then((rows: { word: string }[]) => {
            if (rows) {
                return rows.map((r: { word: string }): string => r.word);
            } else {
                return [];
            }
        });
    }

    public async saveWord(title: string, word: string): Promise<void> {
        const db = await this.provider();

        return doTransaction(db, async () => {
            const id = await this.getOrCreateKeyword(db, title);
            const row = await db.get('select id from word_list where id_keyword = ? and word = ?', id, word);
            if (row) {
                return Promise.reject(`${title} に ${word} は登録済みです。`);
            }

            await db.run('insert into word_list (id_keyword, word) values (?, ?)', id, word);
        });
    }

    public async deleteWord(title: string, word: string): Promise<void> {
        const db = await this.provider();

        return doTransaction(db, async () => {
            const row = await db.get<{ id: number; id_keyword: string }>(EXISTS_WORD, title, word, title, word);
            if (!row) {
                return Promise.reject(`${title} という辞書が無いか、それに登録された語がありません。`);
            }
            await db.run('delete from word_list where id_keyword = ? and id = ?', row.id_keyword, row.id);
        });
    }

    public async aliasTitle(newone: string, exists: string): Promise<void> {
        const db = await this.provider();

        return doTransaction(db, async () => {
            const newrow = await db.get<{ cnt: number }>(COUNT_NEW_WORD, newone);
            if (newrow && 0 < newrow.cnt) {
                return Promise.reject(`${newone} には語が登録済みです。語が登録されていない辞書のみを指定できます。`);
            }

            const existsrow = await db.get<{ cnt: number }>(COUNT_EXISTS_WORD, exists);
            if (!existsrow || existsrow.cnt < 1) {
                return Promise.reject(`${exists} には語が登録されていません。語が登録されておりエイリアスでない辞書のみを指定できます。`);
            }

            const fromid = await this.getOrCreateKeyword(db, newone);
            const toid = await this.getOrCreateKeyword(db, exists);

            await db.run('insert into key_alias (id_keyword_from, id_keyword_to) values (?, ?)', fromid, toid);
        });
    }

    private getOrCreateKeyword = async (db: sqlite.Database, key: string): Promise<number> => {
        const idrow = await db.get<{ id: number }>('select id from keyword where title = ?', key);
        if (idrow) {
            return idrow.id;
        }
        const stmt = await db.run('insert into keyword (title) values (?)', key);

        return stmt.lastID;
    }
}
