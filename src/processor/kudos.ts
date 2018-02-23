import { inject, injectable } from 'inversify';

import { Context } from '../context';
import {
    KudosHistoryModel, KudosRankingModel, KudosSenderRankingModel, KudosService,
    ReactionModel, TYPES, UserModel, UserService,
} from '../service';
import { Processor } from './';

const KUDOS = /(\+\+|--|＋＋|−−)?([^\s()（）「」＊＋−\*\+\-][^\s]*?)(\+\+|--|＋＋|−−)?($|[\s]+)/;

@injectable()
export class KudosMessageProcessor implements Processor<string> {
    private user: UserService;
    private kudos: KudosService;

    constructor( @inject(TYPES.User) user: UserService, @inject(TYPES.Kudos) kudos: KudosService) {
        this.user = user;
        this.kudos = kudos;
    }

    public supports(message: string): boolean {
        const matcher = KUDOS.exec(message);
        return !!matcher && (!!matcher[1] || !!matcher[3]);
    }

    public async process(context: Context, message: string): Promise<string> {
        const matcher = KUDOS.exec(message);
        if (matcher) {
            const target = matcher[2];
            const um = await this.user.findUserByName(target);
            if (um) {
                const op = matcher[1] || matcher[3];
                const amount = -1 < ['++', '＋＋'].indexOf(op) ? 1 : -1;
                const current = await this.kudos.saveKudos(context.user.id, um.userid, amount);
                return `${target}:${current} pt`;
            }
        }
        return '';
    }
}
