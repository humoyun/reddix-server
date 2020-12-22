const Roles = require('./roles');
const roles = Roles.values;

/**
 * List of Permissions and the Roles allowed of using them.
 */
class Permissions {
  static get values() {
    return {
      subreddixEdit: {
        id: 'subreddixEdit',
        allowedRoles: [
          roles.superadmin,
          roles.owner
        ],
        allowedStorageFolders: ['user'],
      },
      subreddixRead: {
        id: 'subreddixSeePosts',
        allowedRoles: [
          roles.superadmin,
          roles.owner,
          roles.moderator,
          roles.member
        ],
      },
      subreddixDestroy: {
        id: 'subreddixDestroy',
        allowedRoles: [
          roles.superadmin
        ],
      },
      // auditLogRead: {
      //   id: 'auditLogRead',
      //   allowedRoles: [roles.owner, roles.auditLogViewer, roles.viewer],
      // },
      // settingsEdit: {
      //   id: 'settingsEdit',
      //   allowedRoles: [roles.owner],
      // },
      postCreateInSubreddix: {
        id: 'postCreateInSubreddix',
        allowedRoles: [
          roles.owner,
          roles.editor,
          roles.entityEditor,
          roles.productEditor,
        ],
      },
      postUpdateInSubreddix: {
        id: 'postUpdateInSubreddix',
        allowedRoles: [
          roles.owner,
          roles.d,
          roles.d,
          roles.d,
        ],
        allowedStorageFolders: ['product'],
      },
      commentCreateInSubreddix: {
        id: 'commentCreateInSubreddix',
        allowedRoles: [
          roles.admin,
          roles.owner,
          roles.moderator,
          roles.member
        ],
      },
    };
  }

  static get asArray() {
    return Object.keys(this.values).map((value: any) => {
      return this.values[value];
    });
  }
}

export default Permissions;
