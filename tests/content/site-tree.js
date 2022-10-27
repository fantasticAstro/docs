import revalidator from 'revalidator'
import schema from '../helpers/schemas/site-tree-schema.js'
import EnterpriseServerReleases from '../../lib/enterprise-server-releases.js'
import { loadSiteTree } from '../../lib/page-data.js'
import nonEnterpriseDefaultVersion from '../../lib/non-enterprise-default-version.js'
import { jest } from '@jest/globals'

const latestEnterpriseRelease = EnterpriseServerReleases.latest

describe('siteTree', () => {
  jest.setTimeout(3 * 60 * 1000)

  let siteTree
  beforeAll(async () => {
    siteTree = await loadSiteTree()
  })

  test('has language codes as top-level keys', () => {
    expect('en' in siteTree).toBe(true)
  })

  test('object order and structure', () => {
    expect(siteTree.en[nonEnterpriseDefaultVersion].childPages[1].href).toBe('/en/get-started')
    expect(siteTree.en[nonEnterpriseDefaultVersion].childPages[1].childPages[0].href).toBe(
      '/en/get-started/quickstart'
    )
  })

  describe('localized titles', () => {
    test('articles that include site data in liquid templating', async () => {
      const ghesLatest = `enterprise-server@${latestEnterpriseRelease}`
      const ghesSiteTree = siteTree.en[ghesLatest]

      // Find a page in the tree that we know contains Liquid
      // TODO: use new findPageInSiteTree helper when it's available
      const pageWithDynamicTitle = ghesSiteTree.childPages
        .find((child) => child.href === `/en/${ghesLatest}/admin`)
        .childPages.find((child) => child.href === `/en/${ghesLatest}/admin/installation`)

      // Confirm the raw title contains Liquid
      expect(pageWithDynamicTitle.page.title).toEqual(
        'Installing {% data variables.product.prodname_enterprise %}'
      )
    })
  })

  test('object validation', () => {
    const childPages = siteTree.en[nonEnterpriseDefaultVersion].childPages
    expect(childPages.length).toBeGreaterThan(0)

    validate(siteTree.en[nonEnterpriseDefaultVersion])
  })
})

function validate(currentPage) {
  ;(currentPage.childPages || []).forEach((childPage) => {
    const { valid, errors } = revalidator.validate(childPage, schema.childPage)
    const expectation = JSON.stringify(errors, null, 2)
    expect(valid, expectation).toBe(true)

    // Run recurisvely until we run out of child pages
    validate(childPage)
  })
}
