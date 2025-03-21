import copy from 'fast-copy'
import { freezeSys, toPlainObject } from 'contentful-sdk-core'
import enhanceWithMethods from '../enhance-with-methods'
import { wrapCollection } from '../common-utils'
import type { DefaultElements, BasicMetaSysProps, SysLink, MakeRequest } from '../common-types'

export type ActionType =
  | 'read'
  | 'create'
  | 'update'
  | 'delete'
  | 'publish'
  | 'unpublish'
  | 'archive'
  | 'unarchive'
  | 'access'

type ConditionType = 'and' | 'or' | 'not' | 'equals'
export type ConstraintType = {
  [key in ConditionType]?: ConstraintType[] | any
}

export type RoleProps = {
  sys: BasicMetaSysProps & { space: SysLink }
  name: string
  description?: string
  /**
   * Permissions for application sections
   */
  permissions: {
    ContentDelivery: string[] | string
    ContentModel: string[]
    EnvironmentAliases: string[] | string
    Environments: string[] | string
    Settings: string[] | string
    Tags: string[] | string
  }
  policies: {
    effect: string
    actions: ActionType[] | 'all'
    constraint: ConstraintType
  }[]
}

export type CreateRoleProps = Omit<RoleProps, 'sys'>

export interface Role extends RoleProps, DefaultElements<RoleProps> {
  /**
   * Deletes this object on the server.
   * @memberof Role
   * @func delete
   * @return {Promise} Promise for the deletion. It contains no data, but the Promise error case should be handled.
   * @example ```javascript
   * const contentful = require('contentful-management')
   *
   * const client = contentful.createClient({
   *   accessToken: '<content_management_api_key>'
   * })
   *
   * client.getSpace('<space_id>')
   * .then((space) => space.getRole('<role_id>'))
   * .then((role) => role.delete())
   * .then((role) => console.log(`role deleted.`))
   * .catch(console.error)
   * ```
   */
  delete(): Promise<void>
  /**
   * Sends an update to the server with any changes made to the object's properties
   * @return Object returned from the server with updated changes.
   * @example ```javascript
   * const contentful = require('contentful-management')
   *
   * const client = contentful.createClient({
   *   accessToken: '<content_management_api_key>'
   * })
   *
   * client.getSpace('<space_id>')
   * .then((space) => space.getRole('<roles_id>'))
   * .then((roles) => {
   *   roles.name = 'New role name'
   *   return roles.update()
   * })
   * .then((roles) => console.log(`roles ${roles.sys.id} updated.`))
   * .catch(console.error)
   * ```
   */
  update(): Promise<Role>
}

/**
 * @private
 */
function createRoleApi(makeRequest: MakeRequest) {
  const getParams = (data: RoleProps) => ({
    spaceId: data.sys.space.sys.id,
    roleId: data.sys.id,
  })

  return {
    update: function update() {
      const data = this.toPlainObject() as RoleProps
      return makeRequest({
        entityType: 'Role',
        action: 'update',
        params: getParams(data),
        payload: data,
      }).then((data) => wrapRole(makeRequest, data))
    },
    delete: function del() {
      const data = this.toPlainObject() as RoleProps
      return makeRequest({
        entityType: 'Role',
        action: 'delete',
        params: getParams(data),
      })
    },
  }
}

/**
 * @private
 * @param makeRequest - function to make requests via an adapter
 * @param data - Raw role data
 * @return Wrapped role data
 */
export function wrapRole(makeRequest: MakeRequest, data: RoleProps): Role {
  const role = toPlainObject(copy(data))
  const roleWithMethods = enhanceWithMethods(role, createRoleApi(makeRequest))
  return freezeSys(roleWithMethods)
}

/**
 * @private
 */
export const wrapRoleCollection = wrapCollection(wrapRole)
