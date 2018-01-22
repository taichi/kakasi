import { Container } from 'inversify';
import * as sqlite from 'sqlite';

import { TYPES } from '../../src/service';
import { SqliteUserService } from '../../src/service/user';
import { TYPES as DB } from '../../src/sqliteutil';

import { dummy, initialize } from '../testutil';

describe('user', () => {
    const container = new Container();
    const db = initialize(container, 'test/service/user.sqlite', 'src/service/user.sqlite.sql', 'test/command/user.sqlite.test.sql');
    beforeEach(db.setup);
    afterEach(db.teardown);

    let user: SqliteUserService;
    beforeAll(async () => {
        container.bind(TYPES.User).to(SqliteUserService);
    });
    beforeEach(() => {
        user = container.get(TYPES.User);
    });

    test('listUser', async () => {
        const users = await user.listUser();

        expect(users).toBeTruthy();
    });
});
