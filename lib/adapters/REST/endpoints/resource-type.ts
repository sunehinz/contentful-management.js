import type { RawAxiosRequestHeaders } from 'axios'
import type { AxiosInstance } from 'contentful-sdk-core'
import * as raw from './raw'
import copy from 'fast-copy'
import type { CollectionProp } from '../../../common-types'
import { type GetResourceTypeParams } from '../../../common-types'
import type { RestEndpoint } from '../types'
import type { ResourceTypeProps, UpsertResourceTypeProps } from '../../../entities/resource-type'

const getBaseUrl = (
  params: GetResourceTypeParams | Omit<GetResourceTypeParams, 'resourceTypeId'>
) =>
  `/organizations/${params.organizationId}/app_definitions/${params.appDefinitionId}/resource_provider/resource_types`

const getEntityUrl = (params: GetResourceTypeParams) =>
  `${getBaseUrl(params)}/${params.resourceTypeId}`

export const get: RestEndpoint<'ResourceType', 'get'> = (
  http: AxiosInstance,
  params: GetResourceTypeParams
) => {
  return raw.get<ResourceTypeProps>(http, getEntityUrl(params))
}

export const upsert: RestEndpoint<'ResourceType', 'upsert'> = (
  http: AxiosInstance,
  params: GetResourceTypeParams,
  rawData: UpsertResourceTypeProps,
  headers?: RawAxiosRequestHeaders
) => {
  const data = copy(rawData)

  return raw.put<ResourceTypeProps>(http, getEntityUrl(params), data, { headers })
}

export const del: RestEndpoint<'ResourceType', 'delete'> = (
  http: AxiosInstance,
  params: GetResourceTypeParams
) => {
  return raw.del(http, getEntityUrl(params))
}

export const getMany: RestEndpoint<'ResourceType', 'getMany'> = (
  http: AxiosInstance,
  params: Omit<GetResourceTypeParams, 'resourceTypeId'>
) => {
  return raw.get<CollectionProp<ResourceTypeProps>>(http, getBaseUrl(params))
}
