import { after, before, describe, test } from 'mocha'
import { initClient, createTestSpace } from '../helpers'
import { expect } from 'chai'

describe('Webhook Api', function () {
  let space

  before(async () => {
    space = await createTestSpace(initClient(), 'Webhook')
  })

  after(async () => {
    if (space) {
      return space.delete()
    }
  })

  test('Gets webhooks', async () => {
    return space.getWebhooks().then((response) => {
      expect(response.sys, 'sys').ok
      expect(response.items, 'fields').ok
    })
  })

  // does not work in our API ¯\_(ツ)_/¯
  /*
  t.test('Create webhook with id', async () => {
    const id = generateRandomId('webhook')
    return space.createWebhookWithId(id, {
      name: 'testwebhook',
      url: 'https://example.com',
      topics: ['Entry.publish']
    })
      .then((webhook) => {
        t.equals(webhook.sys.id, id, 'id')
        return webhook.getCalls()
          .then((calls) => {
            t.ok(calls.items, 'gets list of calls')
            return webhook.getHealth()
              .then((health) => {
                t.ok(health.calls, 'gets webhook health')
                return webhook.delete()
              })
          })
      })
  })
  */

  test('Create webhook', async () => {
    return space
      .createWebhook({
        name: 'testname',
        url: 'https://example.com',
        topics: ['Entry.publish'],
      })
      .then((webhook) => {
        expect(webhook.name).equals('testname', 'name')
        expect(webhook.url, 'url').ok
        webhook.name = 'updatedname'
        return webhook.update().then((updatedWebhook) => {
          expect(updatedWebhook.name).equals('updatedname', 'name')
          return updatedWebhook.delete()
        })
      })
  })

  test('Create disabled webhook', async () => {
    return space
      .createWebhook({
        name: 'testname',
        url: 'https://example.com',
        topics: ['Entry.publish'],
        active: false,
      })
      .then((webhook) => {
        expect(webhook.active).equals(false, 'active')
        expect(webhook.url, 'url').ok
        webhook.active = true
        return webhook.update().then((updatedWebhook) => {
          expect(updatedWebhook.active).equals(true, 'active')
          return updatedWebhook.delete()
        })
      })
  })

  // TODO: enable (and debug) these tests once this is not in EAP and feature flagged since space IDs are not stable
  describe.skip('TODO: webhook retry policies', () => {
    let retryPolicy

    describe('given no webhook retry policy', () => {
      test('Get webhook retry policy', async () => {
        return space.getWebhookRetryPolicy().then((retry_policy) => {
          expect(retry_policy).equals(undefined)
        })
      })
    })

    describe('given a webhook retry policy', () => {
      before(async () => {
        retryPolicy = space.upsertWebhookRetryPolicy({
          maxRetries: 15,
        })
      })

      test('Get webhook retry policy', async () => {
        return space.getWebhookRetryPolicy().then((retry_policy) => {
          expect(retry_policy.maxRetries).equals(retryPolicy.maxRetries)
        })
      })
    })

    test('Upsert webhook retry policy', async () => {
      before(async () => {
        retryPolicy = space
          .upsertWebhookRetryPolicy({
            maxRetries: 15,
          })
          .then((retry_policy) => {
            expect(retry_policy.maxRetries).equals(15)
          })
      })

      return space
        .upsertWebhookRetryPolicy({
          maxRetries: 19,
        })
        .then((retry_policy) => {
          expect(retry_policy.maxRetries).equals(19)
        })
    })

    test('Delete webhook retry policy', async () => {
      space.deleteWebhookRetryPolicy()

      return space.getWebhookRetryPolicy().then((retry_policy) => {
        expect(retry_policy).equals(undefined)
      })
    })
  })
})
