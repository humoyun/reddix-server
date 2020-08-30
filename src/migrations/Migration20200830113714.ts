import { Migration } from '@mikro-orm/migrations';

export class Migration20200830113714 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "post" ("id" serial primary key, "title" text not null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null);');

    this.addSql('create table "member" ("id" serial primary key, "username" varchar(255) not null, "email" varchar(255) not null, "password" text not null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null);');
    this.addSql('alter table "member" add constraint "member_username_unique" unique ("username");');
    this.addSql('alter table "member" add constraint "member_email_unique" unique ("email");');
  }

}
