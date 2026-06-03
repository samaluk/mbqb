import type { Access } from 'payload'

import { isStaff } from '@/access/roles'

export const publishedOrStaff: Access = (args) => {
  if (isStaff(args)) {
    return true
  }

  return {
    _status: {
      equals: 'published',
    },
  }
}
