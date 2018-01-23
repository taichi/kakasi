export const TYPES = {
    Dict: Symbol.for('DictService'),
    User: Symbol.for('UserService'),
};

export { IUserService, UserAliasModel, UserModel } from './user';
export { IDictService } from './dict';
