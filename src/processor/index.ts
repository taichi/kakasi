import { ContainerModule, interfaces } from 'inversify';

import { Context } from '../context';
import { BangedMessageProcessor } from './banged';
import { KudosMessageProcessor } from './kudos';

export const TYPES = {
    MESSAGE_PROCESSOR: Symbol.for('processor/message'),
    REACTION_PROCESSOR: Symbol.for('processor/reaction'),
};

export interface Processor<T> {

    process(context: Context, message: T): Promise<string>;
}

export const SLACK_MODULE = new ContainerModule(
    (
        bind: interfaces.Bind,
        unbind: interfaces.Unbind,
        isBound: interfaces.IsBound,
        rebind: interfaces.Rebind,
    ) => {
        bind(TYPES.MESSAGE_PROCESSOR).to(BangedMessageProcessor);
        bind(TYPES.MESSAGE_PROCESSOR).to(KudosMessageProcessor);
    },
);
