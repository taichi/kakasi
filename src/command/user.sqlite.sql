create table user (
    id        integer primary key autoincrement,
    userid    text not null unique,
    name      text not null unique,
    birthday  text,
    timestamp timestamp default current_timestamp
);
