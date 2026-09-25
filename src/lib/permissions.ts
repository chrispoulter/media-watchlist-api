import { createAccessControl } from 'better-auth/plugins/access';
import {
    adminAc,
    defaultStatements,
    userAc,
} from 'better-auth/plugins/admin/access';

// Keep in sync with media-watchlist-web/src/lib/permissions.ts
export const ac = createAccessControl(defaultStatements);

export const user = ac.newRole({ ...userAc.statements });

export const moderator = ac.newRole({
    user: ['list', 'get', 'update', 'ban'],
});

export const admin = ac.newRole({ ...adminAc.statements });

export const roles = { user, moderator, admin };
