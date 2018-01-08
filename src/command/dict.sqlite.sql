create table keyword (
    id        integer primary key autoincrement,
    title     text    not null unique,
    timestamp timestamp default current_timestamp
);

create table word_list (
    id           integer primary key autoincrement,
    id_keyword   integer not null,
    word text    not null,
    timestamp    timestamp default current_timestamp,
    unique(id_keyword, word)
);

create table key_alias (
    id              integer primary key autoincrement,
    id_keyword_from integer not null,
    id_keyword_to   integer not null,
    timestamp     timestamp default current_timestamp,
    unique(id_keyword_from, id_keyword_to)
)
