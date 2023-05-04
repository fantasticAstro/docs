import { beforeAll } from '@jest/globals'

import { get } from '../../../tests/helpers/e2etest.js'
import { SURROGATE_ENUMS } from '../../../middleware/set-fastly-surrogate-key.js'
import { latest } from '../../../lib/enterprise-server-releases.js'

const makeURL = (pathname) => `/api/pageinfo/v1?${new URLSearchParams({ pathname })}`

describe('pageinfo api', () => {
  beforeAll(() => {
    // If you didn't set the `ROOT` variable, the tests will fail rather
    // cryptically. So as a warning for engineers running these tests,
    // alert in case it was accidentally forgotten.
    if (!process.env.ROOT) {
      console.warn(
        'WARNING: The pageinfo tests require the ROOT environment variable to be set to the fixture root'
      )
    }
  })

  test('redirects without version suffix', async () => {
    const res = await get('/api/pageinfo')
    expect(res.statusCode).toBe(307)
    expect(res.headers.location).toBe('/api/pageinfo/v1')
  })

  test('happy path', async () => {
    const res = await get(makeURL('/en/get-started/quickstart'))
    expect(res.statusCode).toBe(200)
    const { info } = JSON.parse(res.body)
    expect(info.product).toBe('Get started')
    expect(info.title).toBe('Quickstart')
    expect(info.intro).toBe(
      'Get started using GitHub to manage Git repositories and collaborate with others.'
    )
    // Check that it can be cached at the CDN
    expect(res.headers['set-cookie']).toBeUndefined()
    expect(res.headers['cache-control']).toContain('public')
    expect(res.headers['cache-control']).toMatch(/max-age=[1-9]/)
    expect(res.headers['surrogate-control']).toContain('public')
    expect(res.headers['surrogate-control']).toMatch(/max-age=[1-9]/)
    expect(res.headers['surrogate-key']).toBe(`${SURROGATE_ENUMS.DEFAULT} language:en`)
  })

  test('a pathname that does not exist', async () => {
    const res = await get(makeURL('/en/never/heard/of'))
    expect(res.statusCode).toBe(400)
    const { error } = JSON.parse(res.body)
    expect(error).toBe("No page found for '/en/never/heard/of'")
  })

  test("no 'pathname' query string at all", async () => {
    const res = await get('/api/pageinfo/v1')
    expect(res.statusCode).toBe(400)
    const { error } = JSON.parse(res.body)
    expect(error).toBe("No 'pathname' query")
  })

  test("empty 'pathname' query string", async () => {
    const res = await get('/api/pageinfo/v1?pathname=%20')
    expect(res.statusCode).toBe(400)
    const { error } = JSON.parse(res.body)
    expect(error).toBe("'pathname' query empty")
  })

  test('redirects correct the URL', async () => {
    // Regular redirect from `redirect_from`
    {
      const res = await get(makeURL('/en/olden-days'))
      expect(res.statusCode).toBe(200)
      const { info } = JSON.parse(res.body)
      expect(info.title).toBe('GitHub.com Fixture Documentation')
    }
    // Trailing slashes are always removed
    {
      const res = await get(makeURL('/en/olden-days/'))
      expect(res.statusCode).toBe(200)
      const { info } = JSON.parse(res.body)
      expect(info.title).toBe('GitHub.com Fixture Documentation')
    }
    // Short code for latest version
    {
      const res = await get(makeURL('/en/enterprise-server@latest/get-started/liquid/ifversion'))
      expect(res.statusCode).toBe(200)
      const { info } = JSON.parse(res.body)
      expect(info.intro).toMatch(/\(not on fpt\)/)
    }
    // A URL that doesn't have fpt as an available version
    {
      const res = await get(makeURL('/en/get-started/versioning/only-ghec-and-ghes'))
      expect(res.statusCode).toBe(200)
      const { info } = JSON.parse(res.body)
      expect(info.title).toBe('Only in Enterprise Cloud and Enterprise Server')
    }
  })

  test('a page that uses non-trivial Liquid to render', async () => {
    // This page uses `{% ifversion not fpt %}` in the intro.

    // First on the fpt version
    {
      const res = await get(makeURL('/en/get-started/liquid/ifversion'))
      expect(res.statusCode).toBe(200)
      const { info } = JSON.parse(res.body)
      expect(info.intro).toMatch(/\(on fpt\)/)
    }
    // Second on any other version
    {
      const res = await get(makeURL('/en/enterprise-server@latest/get-started/liquid/ifversion'))
      expect(res.statusCode).toBe(200)
      const { info } = JSON.parse(res.body)
      expect(info.intro).toMatch(/\(not on fpt\)/)
    }
  })

  test('home pages', async () => {
    // The home page with language specified
    {
      const res = await get(makeURL('/en'))
      expect(res.statusCode).toBe(200)
      const { info } = JSON.parse(res.body)
      expect(info.title).toMatch('GitHub.com Fixture Documentation')
    }
    // enterprise-server with language specified
    // This is important because it tests that we check for a page
    // before we bothering to see if it can be a redirect.
    // That's how our middleware and Next router works. First we look
    // for a page, if it can't be found, then we check if it's a redirect.
    // This test proves something that caused a bug in production.
    {
      const res = await get(makeURL(`/en/enterprise-server@${latest}`))
      expect(res.statusCode).toBe(200)
      const { info } = JSON.parse(res.body)
      expect(info.title).toMatch('GitHub Enterprise Server Fixture Documentation')
    }
  })

  test('home pages (with redirects)', async () => {
    // The home page for the default language *not* specified
    {
      const res = await get(makeURL('/'))
      expect(res.statusCode).toBe(200)
      const { info } = JSON.parse(res.body)
      expect(info.title).toMatch('GitHub.com Fixture Documentation')
    }
    // enterprise-server without language specified
    {
      const res = await get(makeURL('/enterprise-server@latest'))
      expect(res.statusCode).toBe(200)
      const { info } = JSON.parse(res.body)
      expect(info.title).toMatch('GitHub Enterprise Server Fixture Documentation')
    }
  })
})
