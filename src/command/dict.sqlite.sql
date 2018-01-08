create table keyword (
    id    integer primary key autoincrement,
    title text    not null unique
);

create table word_list (
    id           integer primary key autoincrement,
    id_keyword   integer not null,
    word text    not null,
    unique(id_keyword, word)
);

create table key_alias (
    id              integer primary key autoincrement,
    id_keyword_from integer not null,
    id_keyword_to   integer not null,
    unique(id_keyword_from, id_keyword_to)
)
