import { jest } from '@jest/globals'
import { getDOM } from '../helpers/e2etest.js'
import { allVersions } from '../../lib/all-versions.js'
import { getWebhooks } from '../../lib/webhooks/index.js'

describe('webhooks events and payloads', () => {
  jest.setTimeout(300 * 1000)

  test('loads webhook schema data for all versions', async () => {
    for (const version in allVersions) {
      const webhooks = await getWebhooks(version)
      const webhookNames = Object.keys(webhooks)
      const $ = await getDOM(
        `/en/${version}/developers/webhooks-and-events/webhooks/webhook-events-and-payloads`
      )
      const domH2Ids = $('h2')
        .map((i, h2) => $(h2).attr('id'))
        .get()

      webhookNames.forEach((webhookName) => {
        expect(domH2Ids.includes(webhookName))
      })
    }
  })

  test('Non-GHES versions do not load GHES only webhook', async () => {
    // available since 3.4, only in GHES (technically also GHAE which is based
    // off of GHES)
    const ghesOnlyWebhook = 'cache_sync'

    for (const version in allVersions) {
      if (!version.includes('enterprise-server') && !version.includes('github-ae')) {
        const $ = await getDOM(
          `/en/${version}/developers/webhooks-and-events/webhooks/webhook-events-and-payloads`
        )
        const domH2Ids = $('h2')
          .map((i, h2) => $(h2).attr('id'))
          .get()

        expect(domH2Ids.length).toBeGreaterThan(0)
        expect(domH2Ids.includes(ghesOnlyWebhook)).toBe(false)
      }
    }
  })

  test('Webhooks events and payloads page has DOM markers needed for extracting search content', async () => {
    const $ = await getDOM(
      '/en/developers/webhooks-and-events/webhooks/webhook-events-and-payloads'
    )
    const rootSelector = '[data-search=article-body]'
    const $root = $(rootSelector)
    expect($root.length).toBe(1)

    // on the webhooks page the lead is separate from the article body (unlike
    // the REST pages for example)
    const leadSelector = '[data-search=lead] p'
    const $lead = $(leadSelector)
    expect($lead.length).toBe(1)
  })

  // All webhook types don't yet have examples in the schema.
  describe.skip('rendering', () => {
    test('every webhook event has at least one payload example', async () => {
      const versions = Object.values(allVersions).map((value) => value.version)

      // For all versions, check that the webhook events and payloads page
      // has at least one payload example for each event. Payload examples
      // start with the id `webhook-payload-example` and have a sibling div
      // with the class `height-constrained-code-block`. The sibling is
      // usually but not always the next sibling element, which is why
      // `nextUntil` is used.
      for (const version of versions) {
        const page = `/${version}/developers/webhooks-and-events/webhooks/webhook-events-and-payloads`
        const $ = await getDOM(page)
        const payloadExampleElem = $('[id^=webhook-payload-example]')

        payloadExampleElem.each((i, elem) => {
          const siblings = $(elem)
            .nextUntil('[id^=webhook-payload-example]')
            .filter((i, elem) => $(elem).hasClass('height-constrained-code-block'))
          expect(siblings.length).toBeGreaterThan(0)
        })
      }
    })
  })
})
