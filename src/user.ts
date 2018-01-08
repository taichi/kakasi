
export interface IUser {
    readonly id: string;
    readonly displayName: string;
    readonly email: string;
}

export function dummy(): IUser {
    return {
        id: 'xxx',
        displayName: 'John Doe',
        email: 'john@example.com',
    };
}
