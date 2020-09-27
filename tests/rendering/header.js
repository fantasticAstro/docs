require('../../lib/feature-flags')
const { getDOM } = require('../helpers')
const { oldestSupported, latest } = require('../../lib/enterprise-server-releases')
const nonEnterpriseDefaultVersion = require('../../lib/non-enterprise-default-version')

const testFeatureNewVersions = process.env.FEATURE_NEW_VERSIONS ? test : test.skip
const testFeatureOldVersions = process.env.FEATURE_NEW_VERSIONS ? test.skip : test

describe('header', () => {
  jest.setTimeout(5 * 60 * 1000)

  test('includes localized meta tags', async () => {
    const $ = await getDOM('/en')
    expect($('meta[name="site.data.ui.search.placeholder"]').length).toBe(1)
  })

  test('includes a link to the homepage (in the current page\'s language)', async () => {
    let $ = await getDOM('/en')
    expect($('#github-logo a[href="/en"]').length).toBe(2)

    $ = await getDOM('/ja')
    expect($('#github-logo a[href="/ja"]').length).toBe(2)
    expect($('#github-logo a[href="/en"]').length).toBe(0)
  })

  describe('language links', () => {
    testFeatureNewVersions('lead to the same page in a different language', async () => {
      const $ = await getDOM('/en/github/administering-a-repository/enabling-required-status-checks')
      expect($(`#languages-selector a[href="/ja/${nonEnterpriseDefaultVersion}/github/administering-a-repository/enabling-required-status-checks"]`).length).toBe(1)
    })

    testFeatureOldVersions('lead to the same page in a different language', async () => {
      const $ = await getDOM('/en/github/administering-a-repository/enabling-required-status-checks')
      expect($('#languages-selector a[href="/ja/github/administering-a-repository/enabling-required-status-checks"]').length).toBe(1)
    })

    test('display the native name and the English name for each translated language', async () => {
      const $ = await getDOM('/en')
      expect($('#languages-selector a[href="/en"]').text().trim()).toBe('English')
      expect($('#languages-selector a[href="/cn"]').text().trim()).toBe('简体中文 (Simplified Chinese)')
      expect($('#languages-selector a[href="/ja"]').text().trim()).toBe('日本語 (Japanese)')
    })

    test('emphasize the current language', async () => {
      const $ = await getDOM('/en')
      expect($('#languages-selector a.active[href="/en"]').length).toBe(1)
      expect($('#languages-selector a[href="/ja"]').length).toBe(1)
    })
  })

  describe('notices', () => {
    test('displays a "localization in progress" notice for WIP languages', async () => {
      const $ = await getDOM('/de')
      expect($('.header-notifications.localization_in_progress').length).toBe(1)
      expect($('.localization_complete').length).toBe(0)
      expect($('.header-notifications a[href="/en"]').length).toBe(1)
    })

    test('displays "complete" notice for non-WIP non-English languages', async () => {
      const $ = await getDOM('/ja')
      expect($('.header-notifications.localization_complete').length).toBe(1)
      expect($('.localization_in_progress').length).toBe(0)
      expect($('.header-notifications a[href="/en"]').length).toBe(1)
      expect($('.header-notifications a[href*="github.com/contact"]').length).toBe(1)
    })

    test.skip('does not display any notices for English', async () => {
      const $ = await getDOM('/en')
      expect($('.header-notifications').length).toBe(0)
    })

    test('displays translation disclaimer notice on localized site-policy pages', async () => {
      const $ = await getDOM('/ja/github/site-policy/github-logo-policy')
      expect($('.header-notifications.translation_policy a[href="https://github.com/github/site-policy/issues"]').length).toBe(1)
    })
  })

  describe('mobile-only product dropdown links', () => {
    testFeatureNewVersions('include github and admin, and emphasize the current product', async () => {
      const $ = await getDOM('/en/articles/enabling-required-status-checks')

      const github = $(`#homepages a.active[href="/en/${nonEnterpriseDefaultVersion}/github"]`)
      expect(github.length).toBe(1)
      expect(github.text().trim()).toBe('GitHub.com')
      expect(github.attr('class').includes('active')).toBe(true)

      const ghe = $(`#homepages a[href="/en/enterprise-server@${latest}/admin"]`)
      expect(ghe.length).toBe(1)
      expect(ghe.text().trim()).toBe('Enterprise Administrators')
      expect(ghe.attr('class').includes('active')).toBe(false)
    })

    testFeatureOldVersions('include dotcom and enterprise homepage, and emphasize the current product', async () => {
      const $ = await getDOM('/en/articles/enabling-required-status-checks')

      const dotcom = $('#homepages a.active[href="/en/github"]')
      expect(dotcom.length).toBe(1)
      expect(dotcom.text().trim()).toBe('GitHub.com')
      expect(dotcom.attr('class').includes('active')).toBe(true)

      const ghe = $('#homepages a[href="/en/enterprise/admin"]')
      expect(ghe.length).toBe(1)
      expect(ghe.text().trim()).toBe('Enterprise Server')
      expect(ghe.attr('class').includes('active')).toBe(false)
    })

    testFeatureNewVersions('point to homepages in the current page\'s language', async () => {
      const $ = await getDOM('/ja/articles/enabling-required-status-checks')

      expect($(`#homepages a.active[href="/ja/${nonEnterpriseDefaultVersion}/github"]`).length).toBe(1)
      expect($(`#homepages a[href="/ja/enterprise-server@${latest}/admin"]`).length).toBe(1)
    })

    testFeatureOldVersions('point to homepages in the current page\'s language', async () => {
      const $ = await getDOM('/ja/articles/enabling-required-status-checks')

      expect($('#homepages a.active[href="/ja/github"]').length).toBe(1)
      expect($('#homepages a[href="/ja/enterprise/admin"]').length).toBe(1)
    })

    testFeatureNewVersions('emphasizes the product that corresponds to the current page', async () => {
      const $ = await getDOM(`/en/enterprise/${oldestSupported}/user/github/setting-up-and-managing-your-github-user-account/setting-your-commit-email-address`)
      expect($(`#homepages a.active[href="/en/enterprise-server@${latest}/admin"]`).length).toBe(0)
      expect($(`#homepages a[href="/en/${nonEnterpriseDefaultVersion}/github"]`).length).toBe(1)
      expect($(`#homepages a.active[href="/en/${nonEnterpriseDefaultVersion}/github"]`).length).toBe(1)
    })

    testFeatureOldVersions('emphasizes the product that corresponds to the current page', async () => {
      const $ = await getDOM(`/en/enterprise/${oldestSupported}/user/github/setting-up-and-managing-your-github-user-account/setting-your-commit-email-address`)
      expect($('#homepages a.active[href="/en/enterprise/admin"]').length).toBe(0)
      expect($('#homepages a[href="/en/github"]').length).toBe(1)
      expect($('#homepages a.active[href="/en/github"]').length).toBe(1)
    })
  })
})
