import fs from 'fs'

import { describe, expect } from '@jest/globals'

import { get } from '../helpers/e2etest.js'
import {
  SURROGATE_ENUMS,
  makeLanguageSurrogateKey,
} from '../../middleware/set-fastly-surrogate-key.js'

describe('anchor-redirect middleware', () => {
  const clientSideRedirects = JSON.parse(
    fs.readFileSync('./lib/redirects/static/client-side-rest-api-redirects.json', 'utf-8')
  )

  test('returns correct redirect to url', async () => {
    // test the first entry
    const [key, value] = Object.entries(clientSideRedirects)[0]
    const [path, hash] = key.split('#')
    const sp = new URLSearchParams()
    sp.set('path', path)
    sp.set('hash', hash)
    const res = await get('/anchor-redirect?' + sp)
    expect(res.statusCode).toBe(200)
    const { to } = JSON.parse(res.text)
    expect(to).toBe(value)
  })
  test('errors when path is not passed', async () => {
    // test the first entry
    const key = Object.keys(clientSideRedirects)[0]
    const hash = key.split('#')[1]
    const sp = new URLSearchParams()
    sp.set('hash', hash)
    const res = await get('/anchor-redirect?' + sp)
    expect(res.statusCode).toBe(400)
  })
  test('errors when path is not passed', async () => {
    // test the first entry
    const key = Object.keys(clientSideRedirects)[0]
    const path = key.split('#')[0]
    const sp = new URLSearchParams()
    sp.set('path', path)
    const res = await get('/anchor-redirect?' + sp)
    expect(res.statusCode).toBe(400)
  })
  test('unfound redirect returns undefined', async () => {
    const sp = new URLSearchParams()
    sp.set('path', 'foo')
    sp.set('hash', 'bar')
    const res = await get('/anchor-redirect?' + sp)
    const { to } = JSON.parse(res.text)
    expect(to).toBe(undefined)
  })
  test('reasonably aggressive cache-control headers', async () => {
    const sp = new URLSearchParams()
    sp.set('path', 'foo')
    sp.set('hash', 'bar')
    const res = await get('/anchor-redirect?' + sp)
    expect(res.headers['cache-control']).toContain('public')
    expect(res.headers['cache-control']).toMatch(/max-age=[1-9]/)
    expect(res.headers['surrogate-control']).toContain('public')
    expect(res.headers['surrogate-control']).toMatch(/max-age=[1-9]/)
    const surrogateKeySplit = res.headers['surrogate-key'].split(/\s/g)
    expect(surrogateKeySplit.includes(SURROGATE_ENUMS.DEFAULT)).toBeTruthy()
    expect(surrogateKeySplit.includes(makeLanguageSurrogateKey())).toBeTruthy()
  })
})
