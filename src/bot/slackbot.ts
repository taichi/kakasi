// tslint:disable:no-console

// tslint:disable-next-line:no-import-side-effect
import 'reflect-metadata';

import { RTMClient, WebClient, WebAPICallResult } from '@slack/client';
import { Container } from 'inversify';
import { Database, open } from 'sqlite';

import { ContainerCommandRepository, CORE_MODULE, TYPES as COMMAND_TYPES } from '../command';
import { Config, load } from '../config';
import { Context } from '../context';
import { SQLITE_MODULE } from '../service';
import { TYPES } from '../sqliteutil';
import { RuntimeUser } from '../user';
import { SLACK_MODULE, TYPES as PROS_TYPES, Processor } from '../processor';

const config = load(process.argv[2]);

const rtm = new RTMClient(config.slack.access_token, {
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
const repos = new ContainerCommandRepository(container);
container.bind(COMMAND_TYPES.REPOSITORY).toConstantValue(repos);

container.bind(TYPES.DatabaseProvider)
    .toProvider<Database>(() => async () => db);
container.load(SQLITE_MODULE);
container.load(CORE_MODULE);
container.load(SLACK_MODULE);

//@ts-ignore
rtm.on('authenticated', (connectData) => {
    appData.selfId = connectData.self.id;
    console.log(`Logged in as ${appData.selfId} of team ${connectData.team.id}`);
});

rtm.on('connected', () => {
    console.log('Ready');
    web.users.list().then((users: WebAPICallResult) => {
        if (users.ok) {
            //@ts-ignore
            users.members
                .filter((m: { deleted: boolean; is_bot: boolean; }): boolean => m.deleted === false && !m.is_bot && m.is_bot === false)
                .map((m: { id: string; name: string; profile: { email: string; } }) => {
                    return {
                        id: m.id,
                        displayName: m.name,
                        email: m.profile.email ? m.profile.email : '',
                    };
                }).forEach((user: RuntimeUser) => {
                    appData.users.set(user.id, user);
                });
            console.log('user list fetched');
        } else {
            console.log('user list fetch failed');
        }
    });
});

const removeBackspace = (m: string): string => {
    return m ? m.replace('\u0008', '') : '';
};

rtm.on('message', (msg) => {
    if (msg.user === 'USLACKBOT' || msg.user === appData.selfId) {
        return;
    }

    const text = removeBackspace(msg.text.trim());
    const u = appData.users.get(msg.user);
    const user = u ? u : {
        id: msg.user,
        displayName: '',
        email: '',
    };
    const context = new Context(user);
    const pros = container.getAll<Processor<string>>(PROS_TYPES.MESSAGE_PROCESSOR);

    for (let p of pros) {
        p.process(context, text).then((result: string) => {
            if (result && 0 < result.trim().length) {
                rtm.sendMessage(`${result}`, msg.channel);
            }
            // tslint:disable-next-line:no-any
        }).catch((err: any) => {
            if (err instanceof Error) {
                rtm.sendMessage(err.message, msg.channel);
            } else {
                rtm.sendMessage(err, msg.channel);
            }
        });
    }
});

rtm.start({});
