import { ContainerModule, interfaces } from 'inversify';

import { SqliteDictService } from './dict';
import { SqliteKudosService } from './kudos';
import { SqliteUserService } from './user';

export const TYPES = {
    Dict: Symbol.for('DictService'),
    User: Symbol.for('UserService'),
    Kudos: Symbol.for('KudosService'),
};

export { UserService, UserAliasModel, UserModel } from './user';
export { DictService } from './dict';
export { KudosService } from './kudos';

export const SQLITE_MODULE = new ContainerModule(
    (
        bind: interfaces.Bind,
        unbind: interfaces.Unbind,
        isBound: interfaces.IsBound,
        rebind: interfaces.Rebind,
    ) => {
        bind(TYPES.Dict).to(SqliteDictService);
        bind(TYPES.User).to(SqliteUserService);
        bind(TYPES.Kudos).to(SqliteKudosService);
    },
);
