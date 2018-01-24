insert into user (userid, name, birthday) values ("aaa", "bbb", "0220");
insert into user (userid, name, birthday) values ("xxx", "ddd", "1222");
insert into user (userid, name, birthday) values ("eee", "fff", "0410");
insert into user (userid, name, birthday) values ("ggg", "hhh", "0410");
insert into user (userid, name, birthday) values ("iii", "jjj", "0410");
insert into user (userid, name, birthday) values ("kkk", "lll", "0410");

insert into kudos (userid, quantity) values ('xxx', 17);
insert into kudos (userid, quantity) values ('ggg', 13);
insert into kudos (userid, quantity) values ('iii', 7);
insert into kudos (userid, quantity) values ('kkk', 11);

insert into kudos_history (userid_from, userid_to, op) values ('aaa', 'xxx', 1);
insert into kudos_history (userid_from, userid_to, op) values ('aaa', 'eee', -1);
insert into kudos_history (userid_from, userid_to, op) values ('aaa', 'xxx', 1);
insert into kudos_history (userid_from, userid_to, op) values ('aaa', 'iii', -1);
insert into kudos_history (userid_from, userid_to, op) values ('aaa', 'xxx', 1);
insert into kudos_history (userid_from, userid_to, op) values ('kkk', 'xxx', 1);
insert into kudos_history (userid_from, userid_to, op) values ('kkk', 'eee', -1);
insert into kudos_history (userid_from, userid_to, op) values ('kkk', 'xxx', 1);
insert into kudos_history (userid_from, userid_to, op) values ('kkk', 'eee', -1);
insert into kudos_history (userid_from, userid_to, op) values ('kkk', 'xxx', 1);
insert into kudos_history (userid_from, userid_to, op) values ('kkk', 'iii', -1);
insert into kudos_history (userid_from, userid_to, op) values ('kkk', 'xxx', 1);

insert into kudos_reaction (userid, icon) values ('aaa', ':+1:');
insert into kudos_reaction (userid, icon) values ('aaa', ':-1:');
