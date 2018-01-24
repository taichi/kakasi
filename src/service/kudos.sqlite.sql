create table kudos (
    id            integer primary key autoincrement,
    userid        text not null unique,
    quantity      integer not null default 0,
    timestamp     timestamp default current_timestamp
);

create table kudos_history (
    id            integer primary key autoincrement,
    userid_from   text not null,
    userid_to     text not null,
    op            integer not null,
    timestamp     timestamp default current_timestamp
);

create table kudos_reaction (
    id            integer primary key autoincrement,
    userid        text not null,
    icon          text not null unique,
    op            integer not null default 1,
    timestamp     timestamp default current_timestamp
)
