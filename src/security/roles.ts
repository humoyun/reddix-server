/**
 * List of Roles available for the Users.
 */
class roles {
  static get values() {
    return {
      admin: 'admin',
      owner: 'owner',
      moderator: 'moderator',
      member: 'member'
    };
  }
}

export default roles;
