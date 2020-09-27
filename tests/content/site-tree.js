require('../../lib/feature-flags')
const revalidator = require('revalidator')
const schema = require('../../lib/site-tree-schema')
const latestEnterpriseRelease = require('../../lib/enterprise-server-releases').latest
const { getJSON } = require('../helpers')
const flat = require('flat')
const japaneseCharacters = require('japanese-characters')
const nonEnterpriseDefaultVersion = require('../../lib/non-enterprise-default-version')

const testFeatureNewVersions = process.env.FEATURE_NEW_VERSIONS ? test : test.skip
const testFeatureOldVersions = process.env.FEATURE_NEW_VERSIONS ? test.skip : test

describe('siteTree', () => {
  jest.setTimeout(3 * 60 * 1000)

  let siteTree, flatTree
  beforeAll(async (done) => {
    siteTree = await getJSON('/en?json=siteTree')
    flatTree = flat(siteTree)
    done()
  })

  test('has language codes as top-level keys', () => {
    expect('en' in siteTree).toBe(true)
    expect('ja' in siteTree).toBe(true)
  })

  testFeatureNewVersions('object order', () => {
    expect(Object.keys(siteTree)[0]).toBe('en')
    expect(Object.keys(siteTree.en)[0]).toBe(nonEnterpriseDefaultVersion)
    expect(Object.keys(siteTree.en[nonEnterpriseDefaultVersion].products.github.categories)[0]).toBe(`/${nonEnterpriseDefaultVersion}/github/getting-started-with-github`)
  })

  testFeatureOldVersions('object order', () => {
    expect(Object.keys(siteTree)[0]).toBe('en')
    expect(Object.keys(siteTree.en)[0]).toBe('dotcom')
    expect(Object.keys(siteTree.en.dotcom.products.github.categories)[0]).toBe('/github/getting-started-with-github')
  })

  testFeatureNewVersions('object structure', () => {
    expect(nonEnterpriseDefaultVersion in siteTree.en).toBe(true)
    expect(`enterprise-server@${latestEnterpriseRelease}` in siteTree.en).toBe(true)
    expect(flatTree[`en.${nonEnterpriseDefaultVersion}.products.github.href`]).toBe(`/${nonEnterpriseDefaultVersion}/github`)
    expect(flatTree[`en.${nonEnterpriseDefaultVersion}.products.github.categories./${nonEnterpriseDefaultVersion}/github/getting-started-with-github.href`]).toBe(`/${nonEnterpriseDefaultVersion}/github/getting-started-with-github`)
  })

  testFeatureOldVersions('object structure', () => {
    expect('dotcom' in siteTree.en).toBe(true)
    expect(latestEnterpriseRelease in siteTree.en).toBe(true)
    expect(flatTree['en.dotcom.products.github.href']).toBe('/github')
    expect(flatTree['en.dotcom.products.github.categories./github/getting-started-with-github.href']).toBe('/github/getting-started-with-github')
  })

  describe('localized titles', () => {
    testFeatureNewVersions('titles for categories', () => {
      const japaneseTitle = flatTree[`ja.${nonEnterpriseDefaultVersion}.products.github.categories./${nonEnterpriseDefaultVersion}/github/getting-started-with-github.title`]
      expect(typeof japaneseTitle).toBe('string')
      expect(japaneseCharacters.presentIn(japaneseTitle)).toBe(true)

      const englishTitle = flatTree[`en.${nonEnterpriseDefaultVersion}.products.github.categories./${nonEnterpriseDefaultVersion}/github/getting-started-with-github.title`]
      expect(typeof englishTitle).toBe('string')
      expect(japaneseCharacters.presentIn(englishTitle)).toBe(false)
    })

    testFeatureOldVersions('titles for categories', () => {
      const japaneseTitle = flatTree['ja.dotcom.products.github.categories./github/getting-started-with-github.title']
      expect(typeof japaneseTitle).toBe('string')
      expect(japaneseCharacters.presentIn(japaneseTitle)).toBe(true)

      const englishTitle = flatTree['en.dotcom.products.github.categories./github/getting-started-with-github.title']
      expect(typeof englishTitle).toBe('string')
      expect(japaneseCharacters.presentIn(englishTitle)).toBe(false)
    })

    test.todo('titles for maptopics')

    test.todo('titles for articles')

    testFeatureNewVersions('articles that include site data in liquid templating', () => {
      const pageWithDynamicTitle = siteTree.en[`enterprise-server@${latestEnterpriseRelease}`]
        .products.admin
        .categories[`/enterprise-server@${latestEnterpriseRelease}/admin/enterprise-support`]
      // Source frontmatter from article:
      // title: 'Working with {{ site.data.variables.contact.github_support }}'
      expect(pageWithDynamicTitle.title).toEqual('Working with GitHub Support')
    })

    testFeatureOldVersions('articles that include site data in liquid templating', () => {
      const pageWithDynamicTitle = siteTree.en[latestEnterpriseRelease]
        .products.enterpriseServer
        .categories[`/enterprise/${latestEnterpriseRelease}/admin/enterprise-support`]
      // Source frontmatter from article:
      // title: 'Working with {{ site.data.variables.contact.github_support }}'
      expect(pageWithDynamicTitle.title).toEqual('Working with GitHub Support')
    })
  })

  testFeatureNewVersions('object validation', () => {
    const products = Object.values(siteTree.en[nonEnterpriseDefaultVersion].products)
    expect(products.length).toBeGreaterThan(0)

    products.forEach(product => {
      const { valid, errors } = revalidator.validate(product, schema.product)
      const expectation = JSON.stringify(errors, null, 2)
      expect(valid, expectation).toBe(true)

      Object.values(product.categories || {}).forEach(category => {
        const { valid, errors } = revalidator.validate(category, schema.category)
        const expectation = JSON.stringify(errors, null, 2)
        expect(valid, expectation).toBe(true)

        Object.values(category.maptopics || {}).forEach(maptopic => {
          const { valid, errors } = revalidator.validate(maptopic, schema.maptopic)
          const expectation = JSON.stringify(errors, null, 2)
          expect(valid, expectation).toBe(true)
        })
      })
    })
  })

  testFeatureOldVersions('object validation', () => {
    const products = Object.values(siteTree.en.dotcom.products)
    expect(products.length).toBeGreaterThan(0)

    products.forEach(product => {
      const { valid, errors } = revalidator.validate(product, schema.product)
      const expectation = JSON.stringify(errors, null, 2)
      expect(valid, expectation).toBe(true)

      Object.values(product.categories || {}).forEach(category => {
        const { valid, errors } = revalidator.validate(category, schema.category)
        const expectation = JSON.stringify(errors, null, 2)
        expect(valid, expectation).toBe(true)

        Object.values(category.maptopics || {}).forEach(maptopic => {
          const { valid, errors } = revalidator.validate(maptopic, schema.maptopic)
          const expectation = JSON.stringify(errors, null, 2)
          expect(valid, expectation).toBe(true)
        })
      })
    })
  })
})
