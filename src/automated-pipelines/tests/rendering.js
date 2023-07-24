import { readFileSync } from 'fs'

import cheerio from 'cheerio'
import { jest, test } from '@jest/globals'

import { loadPages } from '../../../lib/page-data.js'
import { get } from '../../../tests/helpers/e2etest.js'

// Get a list of the autogenerated pages
const pageList = await loadPages(undefined, ['en'])

describe('autogenerated docs render', () => {
  jest.setTimeout(3 * 60 * 1000)

  const autogeneratedPages = pageList.filter((page) => page.autogenerated)

  test('all automated pages', async () => {
    // Each page should render with 200 OK. Also, check for duplicate
    // heading IDs on each page.
    const errors = (
      await Promise.all(
        autogeneratedPages.map(async (page) => {
          const url = page.permalinks[0].href
          // Some autogenerated pages can be very slow and might fail.
          // So we allow a few retries to avoid false positives.
          const res = await get(url, { retries: 3 })
          if (res.statusCode !== 200) {
            return `${res.statusCode} status error on ${url}`
          }
          // Using `xmlMode: true` is marginally faster
          const $ = cheerio.load(res.body, { xmlMode: true })
          const headingIDs = $('body')
            .find('h2, h3, h4, h5, h6')
            .map((_, el) => $(el).attr('id'))
            .get()
            .sort()
          const dupes = headingIDs.filter((item, index) => headingIDs.indexOf(item) !== index)
          if (dupes.length) {
            return `In ${url}, the following duplicate heading IDs were found: ${dupes.join(', ')}`
          }
        }),
      )
    ).filter(Boolean)
    expect(errors.length, errors.join('\n')).toBe(0)
  })

  const codeqlCliPath = JSON.parse(
    readFileSync('src/codeql-cli/lib/config.json', 'utf-8'),
  ).targetDirectory
  const restPath = JSON.parse(readFileSync('src/rest/lib/config.json', 'utf-8')).targetDirectory
  const ghappsPath = JSON.parse(
    readFileSync('src/github-apps/lib/config.json', 'utf-8'),
  ).targetDirectory
  // Right now only the rest and codeqlcli pages get their frontmatter updated automatically.
  // The apps pages do not get their frontmatter auto-updated since they apply to all versions and they are
  // single pages. The apps pages are also nested inside of the rest pages. So we want to filter out only
  // rest pages and the codeql cli pages for this test.
  const filesWithAutoUpdatedVersions = autogeneratedPages.filter(
    (page) =>
      (!page.fullPath.startsWith(ghappsPath) && page.fullPath.startsWith(restPath)) ||
      page.fullPath.startsWith(codeqlCliPath),
  )

  test.each(filesWithAutoUpdatedVersions)(
    'autogenerated page $fullPath does not use feature based versioning',
    (page) => {
      expect(page.versions.feature).toBe(undefined)
    },
  )
})
