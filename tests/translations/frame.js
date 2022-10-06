import { languageKeys } from '../../lib/languages.js'
import { blockIndex } from '../../middleware/block-robots.js'
import { getDOM } from '../helpers/e2etest.js'

const langs = languageKeys.filter((lang) => lang !== 'en')

describe('frame', () => {
  test.each(langs)('allows crawling of %s pages', async (lang) => {
    expect(blockIndex(`/${lang}/articles/verifying-your-email-address`)).toBe(false)
  })

  test.each(langs)('breadcrumbs link to %s pages', async (lang) => {
    const $ = await getDOM(`/${lang}/get-started/learning-about-github`)
    const $breadcrumbs = $('[data-testid=breadcrumbs] a')
    expect($breadcrumbs[0].attribs.href).toBe(`/${lang}/get-started`)
  })

  test.each(langs)('homepage links go to %s pages', async (lang) => {
    const $ = await getDOM(`/${lang}`)
    const $links = $('[data-testid=bump-link]')
    $links.each((i, el) => {
      const linkUrl = $(el).attr('href')
      expect(linkUrl.startsWith(`/${lang}/`)).toBe(true)
    })
  })

  test.each(langs)('includes homepage hreflang to %s', async (lang) => {
    const $ = await getDOM('/en')
    expect($(`link[rel="alternate"][href="https://docs.github.com/${lang}"]`).length).toBe(1)
  })

  test.each(langs)('sets `lang` attribute on <html> attribute in %s', async (lang) => {
    const $ = await getDOM(`/${lang}`)
    expect($('html').attr('lang')).toBe(lang)
  })

  // Docs Engineering issue: 2096
  test.skip.each(langs)('autogenerated heading IDs on %s are in english', async (lang) => {
    const $ = await getDOM(`/${lang}/site-policy/github-terms/github-terms-of-service`)
    expect($('h2 a[href="#summary"]').length).toBe(1)
  })

  test.each(langs)('loads the side bar via site tree in %s', async (lang) => {
    const $en = await getDOM(`/en/get-started`)
    const $ = await getDOM(`/${lang}/get-started`)
    expect($(`a[href="/${lang}/get-started"]`).text()).not.toEqual(
      $en(`a[href="/${lang}/get-started"]`).text()
    )
  })

  test.each(langs)('loads the survey via site data in %s', async (lang) => {
    const $en = await getDOM(`/en`)
    const $ = await getDOM(`/${lang}`)
    expect($('[data-testid="survey-form"] h2').text()).not.toEqual(
      $en('[data-testid="survey-form"] h2').text()
    )
  })
})
