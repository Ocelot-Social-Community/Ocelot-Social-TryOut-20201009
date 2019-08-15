import {
  applyMiddleware
} from 'graphql-middleware'
import CONFIG from './../config'

import activityPub from './activityPubMiddleware'
import softDelete from './softDeleteMiddleware'
import sluggify from './sluggifyMiddleware'
import excerpt from './excerptMiddleware'
import dateTime from './dateTimeMiddleware'
import xss from './xssMiddleware'
import permissions from './permissionsMiddleware'
import user from './userMiddleware'
import includedFields from './includedFieldsMiddleware'
import orderBy from './orderByMiddleware'
import validation from './validation/validationMiddleware'
import handleNotifications from './handleNotifications/handleNotifications'
import email from './email/emailMiddleware'

export default schema => {
  const middlewares = {
    permissions: permissions,
    activityPub: activityPub,
    dateTime: dateTime,
    validation: validation,
    sluggify: sluggify,
    excerpt: excerpt,
    handleNotifications: handleNotifications,
    xss: xss,
    softDelete: softDelete,
    user: user,
    includedFields: includedFields,
    orderBy: orderBy,
    email: email({
      isEnabled: CONFIG.SMTP_HOST && CONFIG.SMTP_PORT
    }),
  }

  let order = [
    'permissions',
    // 'activityPub', disabled temporarily
    'dateTime',
    'validation',
    'sluggify',
    'excerpt',
    'email',
    'handleNotifications',
    'xss',
    'softDelete',
    'user',
    'includedFields',
    'orderBy',
  ]

  // add permisions middleware at the first position (unless we're seeding)
  if (CONFIG.DISABLED_MIDDLEWARES) {
    const disabledMiddlewares = CONFIG.DISABLED_MIDDLEWARES.split(',')
    order = order.filter(key => {
      if (disabledMiddlewares.includes(key)) {
        /* eslint-disable-next-line no-console */
        console.log(`Warning: Disabled "${disabledMiddlewares}" middleware.`)
      }
      return !disabledMiddlewares.includes(key)
    })
  }

  const appliedMiddlewares = order.map(key => middlewares[key])
  return applyMiddleware(schema, ...appliedMiddlewares)
}