import { Migration } from '@mikro-orm/migrations';

export class Migration20200903052535 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "member" drop constraint "member_email_unique";');
    this.addSql('alter table "member" drop column "email";');
  }

}
