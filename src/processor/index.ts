import { ContainerModule, interfaces } from 'inversify';

import { Context } from '../context';
import { BangedMessageProcessor } from './banged';
import { KudosMessageProcessor } from './kudos';

export const PROCESSOR = Symbol.for('processor');

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
        bind(PROCESSOR).to(BangedMessageProcessor);
        bind(PROCESSOR).to(KudosMessageProcessor);
    },
);
