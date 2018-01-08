insert into keyword (title) values ('aaa');
insert into keyword (title) values ('bbb');
insert into keyword (title) values ('ccc');
insert into keyword (title) values ('ddd');
insert into keyword (title) values ('eee');
insert into keyword (title) values ('fff');

insert into word_list (id_keyword, word) values (1, 'zzz');
insert into word_list (id_keyword, word) values (1, 'yyy');
insert into word_list (id_keyword, word) values (1, 'xxx');
insert into word_list (id_keyword, word) values (2, 'www');

insert into key_alias (id_keyword_from, id_keyword_to) values (3, 1);
insert into key_alias (id_keyword_from, id_keyword_to) values (4, 1);
insert into key_alias (id_keyword_from, id_keyword_to) values (5, 2);
insert into key_alias (id_keyword_from, id_keyword_to) values (6, 2);
