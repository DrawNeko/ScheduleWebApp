-- =============================================================================
-- scheduleWebApp/db/insertRecords.sql
-- =============================================================================

insert into colors (color_name, color_code_bg, color_code_text) values('色1','#FF4444','#000000');
insert into colors (color_name, color_code_bg, color_code_text) values('色2','#FF8833','#000000');
insert into colors (color_name, color_code_bg, color_code_text) values('色3','#FFFF00','#000000');
insert into colors (color_name, color_code_bg, color_code_text) values('色4','#FFFF88','#000000');
insert into colors (color_name, color_code_bg, color_code_text) values('色5','#00FF00','#000000');
insert into colors (color_name, color_code_bg, color_code_text) values('色6','#00FFAA','#000000');
insert into colors (color_name, color_code_bg, color_code_text) values('色7','#00FFFF','#000000');
insert into colors (color_name, color_code_bg, color_code_text) values('色8','#0000FF','#FFFFFF');
insert into colors (color_name, color_code_bg, color_code_text) values('色9','#FF00FF','#000000');
insert into colors (color_name, color_code_bg, color_code_text) values('色10','#777777','#000000');
insert into colors (color_name, color_code_bg, color_code_text) values('色11','#FFFFFF','#000000');
insert into colors (color_name, color_code_bg, color_code_text) values('色12','#000000','#FFFFFF');

insert into users (user_id, name, email, role, password, default_group_id) values('user1', 'ユーザ1', 'user1@gmail.com','ld','pass1', null);
insert into users (user_id, name, email, role, password, default_group_id) values('user2', 'ユーザ2', 'user2@gmail.com','ld','pass2', null);
insert into users (user_id, name, email, role, password, default_group_id) values('user3', 'ユーザ3', 'user3@gmail.com','','pass3', null);
insert into users (user_id, name, email, role, password, default_group_id) values('user4', 'ユーザ4', 'user4@gmail.com','','pass4', null);

insert into group_master (group_name, group_type, owner_user_id) values ('全体', 'PUBLIC', null);
insert into group_master (group_name, group_type, owner_user_id) values ('開発', 'PUBLIC', null);
insert into group_master (group_name, group_type, owner_user_id) values ('user1個人', 'PRIVATE', 'user1');

insert into group_management (group_id, user_id) values (1, 'user1');
insert into group_management (group_id, user_id) values (1, 'user2');
insert into group_management (group_id, user_id) values (1, 'user3');
insert into group_management (group_id, user_id) values (1, 'user4');

insert into group_management (group_id, user_id) values (2, 'user1');
insert into group_management (group_id, user_id) values (2, 'user2');

insert into group_management (group_id, user_id) values (3, 'user1');

update users set default_group_id = 1 where default_group_id is null;
