
export interface IUser {
    readonly id: string;
    readonly displayName: string;
    readonly email: string;
    readonly birthday: string;
}

export function dummy(): IUser {
    return {
        id: 'xxx',
        displayName: 'John Doe',
        email: 'john@example.com',
        birthday: '03/21',
    };
}
