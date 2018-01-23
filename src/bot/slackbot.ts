// tslint:disable:no-console

// tslint:disable-next-line:no-import-side-effect
import 'reflect-metadata';

// see. https://github.com/slackapi/node-slack-sdk/pull/329
import {
    CLIENT_EVENTS, FullUserResult, MessageEvent, RTM_EVENTS,
    RtmClient, RtmStartResult, UsersListResult, WebClient,
} from '@slack/client';
import { Container } from 'inversify';
import { Database, open } from 'sqlite';

import { CommandRepository, CORE_MODULE } from '../command';
import { Config, load } from '../config';
import { Context } from '../context';
import { SQLITE_MODULE } from '../service';
import { TYPES } from '../sqliteutil';
import { RuntimeUser } from '../user';

const config = load(process.argv[2]);

const rtm = new RtmClient(config.slack.access_token, {
    dataStore: false,
    useRtmConnect: true,
});

const web = new WebClient(config.slack.access_token);

const appData = {
    selfId: '',
    users: new Map<string, RuntimeUser>(),
};

let db: Database;
Promise.resolve(open(config.sqlite ? config.sqlite.filename : 'kakasi.sqlite'))
    .then((d: Database) => db = d);

const container = new Container();
container.bind(TYPES.DatabaseProvider)
    .toProvider<Database>(() => async () => db);
container.load(SQLITE_MODULE);
container.load(CORE_MODULE);

const repos = new CommandRepository(container);

//@ts-ignore
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (connectData: RtmStartResult) => {
    appData.selfId = connectData.self.id;
    console.log(`Logged in as ${appData.selfId} of team ${connectData.team.id}`);
});

rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, () => {
    console.log('Ready');
    web.users.list().then((users: UsersListResult) => {
        users.members
            .filter((m: FullUserResult): boolean => m.deleted === false && !m.is_bot && m.is_bot === false)
            .map((m: FullUserResult) => {
                return {
                    id: m.id,
                    displayName: m.name,
                    email: m.profile.email ? m.profile.email : '',
                };
            }).forEach((user: RuntimeUser) => {
                appData.users.set(user.id, user);
            });
        console.log('user list fetched');
    });
});

const removeBackspace = (m: string): string => {
    return m ? m.replace('\u0008', '') : '';
};

const bang = (m: string): boolean => {
    return !!m && 2 < m.length && m.startsWith('!');
};

rtm.on(RTM_EVENTS.MESSAGE, (msg: MessageEvent) => {
    if (msg.user === 'USLACKBOT' || msg.user === appData.selfId) {
        return;
    }

    const text = removeBackspace(msg.text.trim());
    if (bang(text) === false) {
        return;
    }

    const unbanged = text.slice(1);

    const u = appData.users.get(msg.user);
    const user = u ? u : {
        id: msg.user,
        displayName: '',
        email: '',
    };
    const context = new Context(user);
    context.evaluate(repos, unbanged)
        .then((result: string) => {
            rtm.sendMessage(`${result}`, msg.channel);
        }).catch((err: string) => {
            rtm.sendMessage(err, msg.channel);
        });
});

rtm.start();
