import type { CollectionConfig } from 'payload'
import { isStaffRole } from '../lib/auth/roles'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    description: 'Manage editorial staff and registered readers.',
  },
  auth: {
    useSessions: true,
    tokenExpiration: 60 * 60 * 24 * 7,
    maxLoginAttempts: 5,
    lockTime: 600 * 1000,
  },
  access: {
    admin: ({ req: { user } }) => isStaffRole(user?.role),
    create: () => true,
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      return { id: { equals: user.id } }
    },
    update: ({ req: { user }, id }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      return user.id === id
    },
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  hooks: {
    beforeChange: [
      ({ req, operation, data }) => {
        if (operation === 'create' && req.user?.role !== 'admin') {
          data.role = 'reader'
        }

        if (operation === 'update' && req.user?.role !== 'admin') {
          delete data.role
        }

        return data
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      admin: {
        description: 'Display name for article bylines and reader profiles.',
      },
    },
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Author', value: 'author' },
        { label: 'Reader', value: 'reader' },
      ],
      defaultValue: 'reader',
      saveToJWT: true,
      admin: {
        position: 'sidebar',
      },
      access: {
        update: ({ req: { user } }) => user?.role === 'admin',
      },
    },
    {
      name: 'bio',
      type: 'textarea',
      admin: {
        description: 'Short author biography.',
        condition: (data) => isStaffRole(data?.role),
      },
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
      admin: {
        position: 'sidebar',
        description: 'Profile photo.',
      },
    },
    {
      name: 'savedArticles',
      type: 'relationship',
      relationTo: 'articles',
      hasMany: true,
      admin: {
        description: 'Articles saved by this user from the frontend.',
      },
    },
    {
      name: 'preferences',
      type: 'group',
      admin: {
        condition: (data) => data?.role === 'reader',
      },
      fields: [
        {
          name: 'morningBrief',
          type: 'checkbox',
          defaultValue: false,
          label: 'Morning Brief emails',
        },
        {
          name: 'articleAlerts',
          type: 'checkbox',
          defaultValue: false,
          label: 'Breaking news alerts',
        },
      ],
    },
  ],
}
