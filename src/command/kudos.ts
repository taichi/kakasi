import { inject, injectable } from 'inversify';

import { Context } from '../context';
import { KudosService, TYPES } from '../service';
import { KudosHistoryModel, KudosRankingModel, KudosSenderRankingModel, ReactionModel } from '../service/kudos';
import { UserModel, UserService } from '../service/user';
import { AbstractCommand } from './base';

// tslint:disable-next-line:no-multiline-string
const HELP = `
kudos [++|--|show|ranking|sender_ranking|history|reaction|help]
    [++|add|increment] ユーザ名
        指定したユーザのkudosを増加します。
    [--|remove|decrement] ユーザ名
        指定したユーザのkudosを減少します。
    [info|show] ユーザ名?
        指定したユーザのkudosを表示します。
        ユーザ名を省略した場合、自分のkudosを表示します。
    [ranking|rank]
        現在のkudosが最も多いユーザと最も少ないユーザをそれぞれ10人ずつ表示します。
    [sender_ranking|sender_rank]
        送信回数が多い上位10人を表示します。
    history
        直近10件の送信履歴を表示します。
    reaction [add|put|push|register] アイコン 値?
        発言者のkudosを 値 の数だけ増減するリアクションアイコンを登録します。
        値 を省略した場合、+1 が指定されたものみなします。
    reaction [remove|delete|rm|del] アイコン
        kudosを増減するリアクションアイコンの登録を削除します。
    reaction list
        kudosを増減するリアクションアイコンの一覧を表示します。
    [help|?]
        このヘルプを表示します。

コマンド例:
    kudos ++ john
        johnのkudosを増やします。
    kudos -- john
        johnのkudosを減らします。
    kudos show
        コマンドを実行したユーザのkudosを表示します。
    kudos show john
        johnのkudos量を表示します。
    kudos reaction add :+1:
        :+1: アイコンが付いたメッセージの発言者のkudosを増加させます。
    kudos reaction add :-1: -1
        :-1: アイコンが付いたメッセージの発言者のkudosを減少させます。
    kudos reaction rm :+1:
        :+1: アイコンのリアクションによるkudosの増減を無くします。
`;

@injectable()
export class Kudos extends AbstractCommand {
    private user: UserService;
    private kudos: KudosService;

    constructor( @inject(TYPES.User) user: UserService, @inject(TYPES.Kudos) kudos: KudosService) {
        super();
        this.user = user;
        this.kudos = kudos;
    }

    public execute(context: Context): Promise<string> {
        if (this.args.length < 1) {
            return Promise.reject('kudos コマンドは引数が一つ以上必要です。');
        }

        const subcmd = this.args[0];
        switch (subcmd.toLowerCase()) {
            case 'add':
            case 'increment':
            case '++':
                return this.increment(context);
            case 'remove':
            case 'decrement':
            case '--':
                return this.decrement(context);
            case 'info':
            case 'show':
                return this.info(context);
            case 'ranking':
            case 'rank':
                return this.rank(context);
            case 'sender_ranking':
            case 'sender_rank':
                return this.sender_rank(context);
            case 'history':
                return this.history(context);
            case 'reaction':
                return this.reaction(context);
            case 'help':
            case '?':
            default:
                return this.help(context);
        }
    }

    public help(context: Context): Promise<string> {
        return Promise.resolve(HELP);
    }

    public async increment(context: Context): Promise<string> {
        return this.updateKudos(context, 1);
    }

    public async decrement(context: Context): Promise<string> {
        return this.updateKudos(context, -1);
    }

    public async info(context: Context): Promise<string> {
        const subargs = this.args.slice(1);

        const uinfo = await this.fillUerInfo(context.user.id, subargs[0]);

        const quantity = await this.kudos.findKudosById(uinfo.userid);
        const current = quantity ? quantity.quantity : 0;

        return `${uinfo.username}:${current} pt`;
    }

    public async rank(context: Context): Promise<string> {
        return `kudos トップ10
${await this.formatRanks('desc')}

kudos ワースト10
${await this.formatRanks('asc')}
`;
    }

    public async sender_rank(context: Context): Promise<string> {
        const ranks = await this.kudos.listSenderRanking();
        const str = ranks.map((v: KudosSenderRankingModel, i: number) => {
            const s = `${i + 1}`.padStart(2);
            const name = v.username.padEnd(15);
            const times = v.times.toString().padStart(6);
            const inc = v.increment.toString().padStart(6);
            const dec = v.decrement.toString().padStart(6);
            return `${s}位: ${name} (${times}回 ${inc} pt / ${dec} pt)`;
        }).join('\n');
        return `kudos利用者トップ10 (合計回数 インクリメント/デクリメント)\n${str}`;
    }

    public async history(context: Context): Promise<string> {
        const list = await this.kudos.listHistory();
        const str = list.map((v: KudosHistoryModel) => {
            const padname = (s: string) => s.padEnd(15);
            return `${padname(v.sendername)} ${padname(v.receivername)} ${v.amount.toString().padStart(5)} ${v.timestamp}`;
        }).join('\n');
        return `送信者 受信者 操作 日付\n${str}`;
    }

    public async reaction(context: Context): Promise<string> {
        const subargs = this.args.slice(1);
        if (subargs.length < 1) {
            return Promise.reject(`kudosコマンドの ${this.args[0]} サブコマンドには 一つ以上の引数が必要です。`);
        }

        switch (subargs[0]) {
            case 'add':
            case 'put':
            case 'push':
                return this.reaction_add(context);
            case 'delete':
            case 'remove':
            case 'del':
            case 'rm':
                return this.reaction_remove(context);
            case 'list':
                return this.reaction_list(context);
            default:
                return HELP;
        }
    }

    public async reaction_add(context: Context): Promise<string> {
        const subargs = this.args.slice(2);
        if (subargs.length < 1) {
            return Promise.reject(`kudos reaction ${this.args[1]} ${this.args[2]} コマンドでは、 登録対象となるアイコン が必要です。`);
        }
        const icon = subargs[0];
        let op = 1;
        if (1 < subargs.length) {
            const n = Number(subargs[1]);
            if (Number.isNaN(n) === false) {
                op = n;
            }
        }
        await this.kudos.saveReaction(context.user.id, icon, op);
        return `${icon} がリアクションされた時、そのメッセージをポストしたユーザの Kudos が ${op} だけ変わるようになりました。`;
    }

    private async reaction_remove(context: Context): Promise<string> {
        const subargs = this.args.slice(2);
        if (subargs.length < 1) {
            return Promise.reject(`kudos reaction ${this.args[1]} ${this.args[2]} コマンドでは、 削除対象となるアイコン が必要です。`);
        }

        const icon = subargs[0];
        await this.kudos.deleteReaction(icon);

        return `${icon} を削除しました。`;
    }

    private async reaction_list(context: Context): Promise<string> {
        const list = await this.kudos.listReaction();
        const str = list.map((v: ReactionModel) => {
            const name = v.username.padEnd(15);
            const icon = v.icon.padEnd(8);
            const op = v.op.toString().padStart(3);
            return `${icon} ${op} ${name} ${v.timestamp}`;
        }).join('\n');
        return `アイコン 操作 登録者 日付\n${str}`;
    }

    private async formatRanks(order: string): Promise<string> {
        const ranks = await this.kudos.listRanking('desc');
        return ranks.map((v: KudosRankingModel, i: number) => {
            const s = `${i + 1}`.padStart(2);
            return `${s}位: ${v.username} (${v.quantity} pt)`;
        }).join('\n');
    }

    private async updateKudos(context: Context, amount: number) {
        const subargs = this.args.slice(1);
        if (subargs.length < 1) {
            return Promise.reject(`kudos コマンドの ${this.args[0]} サブコマンドには対象となるユーザ名が必要です。`);
        }
        const username = subargs[0];
        const uinfo = await this.findUserByName(username);
        await this.findUserById(context.user.id);

        const current = await this.kudos.saveKudos(context.user.id, uinfo.userid, amount);

        return Promise.resolve(`${username}:${current} pt`);
    }

    private async fillUerInfo(uid: string, un: string): Promise<{ userid: string, username: string }> {
        if (un) {
            const uidm = await this.findUserByName(un);
            return {
                userid: uidm.userid,
                username: un,
            };
        }

        const unm = await this.findUserById(uid);
        return {
            userid: uid,
            username: unm.name,
        };
    }

    private async findUserByName(username: string): Promise<UserModel> {
        const uinfo = await this.user.findUserByName(username);
        if (!uinfo || !uinfo.userid) {
            return Promise.reject(`${username} はユーザとして登録されていません。`);
        }
        return uinfo;
    }

    private async findUserById(userid: string): Promise<UserModel> {
        const uinfo = await this.user.findUserById(userid);
        if (!uinfo || !uinfo.userid) {
            return Promise.reject('あなたはユーザとして登録されていません。user add me コマンドを実行するとユーザ登録できます。');
        }
        return uinfo;
    }
}
