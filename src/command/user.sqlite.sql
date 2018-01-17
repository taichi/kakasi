create table user (
    id        integer primary key autoincrement,
    userid    text not null unique,
    name      text not null unique,
    birthday  text,
    timestamp timestamp default current_timestamp
);

create table user_alias (
    id              integer primary key autoincrement,
    userid          text not null,
    userid_register text not null,
    name            text not null unique,
    timestamp       timestamp default current_timestamp
);
