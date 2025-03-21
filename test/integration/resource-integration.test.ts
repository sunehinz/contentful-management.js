import { describe, it, beforeAll, afterAll, expect } from 'vitest'
import { readFileSync } from 'fs'
import {
  getTestOrganization,
  initPlainClient,
  getDefaultSpace,
  timeoutToCalmRateLimiting,
} from '../helpers'
import type { Organization } from '../../lib/entities/organization'
import type { AppDefinition } from '../../lib/entities/app-definition'
import type { AppUpload } from '../../lib/entities/app-upload'
import type { AppBundle } from '../../lib/entities/app-bundle'
import type {
  AppInstallation,
  Environment,
  ResourceProvider,
  ResourceType,
} from '../../lib/export-types'
import { TestDefaults } from '../defaults'

describe('Resource API', () => {
  const resourceTypeId = 'TMDB:Movie'
  const functionManifest = {
    id: 'tmdbMockFunction',
    name: 'Mocked TMDB lookup function',
    description: 'This is a mocked example to help test Apps with ERL.',
    path: 'functions/index.js',
    allowNetworks: ['api.themoviedb.org'],
    accepts: ['resources.lookup', 'resources.search'],
  }

  let organization: Organization
  let appDefinition: AppDefinition
  let appUpload: AppUpload
  let appBundle: AppBundle
  let appInstallation: AppInstallation
  let resourceProvider: ResourceProvider
  let resourceType: ResourceType
  let env: Environment

  beforeAll(async () => {
    organization = await getTestOrganization()
    appDefinition = await organization.createAppDefinition({
      name: 'Test',
      src: 'http://localhost:2222',
      locations: [{ location: 'app-config' }],
      parameters: {
        installation: [
          {
            id: 'tmdbAccessToken',
            name: 'TMDB Read token',
            type: 'Symbol',
            required: true,
            default: 'Test',
          },
        ],
      },
    })

    appUpload = await organization.createAppUpload(readFileSync(`${__dirname}/fixtures/build.zip`))
    appBundle = await appDefinition.createAppBundle({
      appUploadId: appUpload.sys.id,
      comment: 'Testing ResourceTypeCreation',
      functions: [functionManifest],
    })

    appDefinition.bundle = { sys: { id: appBundle.sys.id, type: 'Link', linkType: 'AppBundle' } }
    appDefinition.src = undefined

    appDefinition = await appDefinition.update()

    resourceProvider = await appDefinition.upsertResourceProvider({
      sys: { id: 'TMDB' },
      type: 'function',
      function: { sys: { id: functionManifest.id, type: 'Link', linkType: 'Function' } },
    })

    resourceType = await resourceProvider.upsertResourceType(resourceTypeId, {
      name: 'Movie',
      defaultFieldMapping: {
        title: 'title',
      },
    })

    const space = await getDefaultSpace()
    env = await space.getEnvironment('master')
    appInstallation = await env.createAppInstallation(
      appDefinition.sys.id,
      {
        parameters: {
          tmdbAccessToken: 'test',
        },
      },
      { acceptAllTerms: true }
    )
  })

  afterAll(async () => {
    if (appInstallation) {
      await appInstallation.delete()
    }
    if (resourceType) {
      await resourceType.delete()
    }
    if (resourceProvider) {
      await resourceProvider.delete()
    }
    if (appUpload) {
      await appUpload.delete()
    }
    if (appDefinition) {
      await appDefinition.delete()
    }
    await timeoutToCalmRateLimiting()
  })

  it('get Resources with search params', async () => {
    const resources = await env.getResourcesForResourceType(resourceTypeId, {
      query: '',
      limit: 1,
    })

    expect(resources.items.length).toBe(10)
  })

  it('get Resources with lookup params', async () => {
    const resources = await env.getResourcesForResourceType(resourceTypeId, {
      'sys.urn[in]': '1022789,945961',
    })

    expect(resources.items.length).toBe(2)
  })

  describe('PlainClient', () => {
    const plainClient = initPlainClient()

    it('get Resources with search params', async () => {
      const resources = await plainClient.resource.getMany({
        spaceId: TestDefaults.spaceId,
        environmentId: 'master',
        resourceTypeId,
        query: {
          query: 'in',
          limit: 1,
        },
      })

      expect(resources.items.length).toBe(1)
    })

    it('get Resources with lookup params', async () => {
      const resources = await plainClient.resource.getMany({
        spaceId: TestDefaults.spaceId,
        environmentId: 'master',
        resourceTypeId,
        query: {
          'sys.urn[in]': '1022789,945961',
        },
      })

      expect(resources.items.length).toBe(2)
    })
  })
})
