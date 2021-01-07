const cheerio = require('cheerio')
const { union, uniq } = require('lodash')
const fs = require('fs')
const path = require('path')

const patterns = require('../../lib/patterns')
const { deprecated } = require('../../lib/enterprise-server-releases')
const rest = require('../../middleware/contextualizers/rest')
const graphql = require('../../middleware/contextualizers/graphql')
const contextualize = require('../../middleware/context')
const releaseNotes = require('../../middleware/contextualizers/enterprise-release-notes')
const versionSatisfiesRange = require('../../lib/version-satisfies-range')

class LinksChecker {
  constructor (opts = { languageCode: 'en', internalHrefPrefixes: ['/', '#'] }) {
    Object.assign(this, { ...opts })

    // Some caching mechanism so we do not load pages unnecessarily,
    // nor check links that have been checked
    this.pageCache = new Map()
    this.checkedLinksCache = new Set()

    // stores images to check all at once in a Map:
    // imageSrc => {
    //   "usedBy": [version:path, ...]
    // }
    this.imagesToCheck = new Map()

    // Stores broken images in a Map, formatted the same way as imagesToCheck
    this.brokenImages = new Map()

    // Stores broken links in a Map in the format of:
    //     link => {
    //       linkedFrom: [ version:filePath, ... ]
    //     }, ...
    this.brokenLinks = new Map()

    // stores anchor links to check all at once in a Map:
    // version:filePath => {
    //   '#anchor-link' : {
    //     linkedFrom: ['url1', 'url2']
    //   },
    //   '#anchor-link2': {...}
    // }
    this.anchorLinksToCheck = new Map()

    // Stores broken anchors in a Map, formatted the same way as anchorLinksToCheck
    this.brokenAnchors = new Map()
  }

  async setRenderedPageObj (pathCacheKey, context, reRender = false) {
    if (this.pageCache.has(pathCacheKey) && !reRender) return
    let pageHTML = await context.page.render(context)

    // handle special pre-rendered snowflake
    if (context.page.relativePath.endsWith('graphql/reference/objects.md')) {
      pageHTML += context.graphql.prerenderedObjectsForCurrentVersion.html
    }

    const pageObj = cheerio.load(pageHTML, { xmlMode: true })
    this.pageCache.set(pathCacheKey, pageObj)
  }

  async getRenderedPageObj (pathCacheKey, context) {
    if (!this.pageCache.has(pathCacheKey)) {
      if (context) {
        await this.setRenderedPageObj(pathCacheKey, context)
      } else {
        console.error('cannot find pre-rendered page, and does not have enough context to render one.')
      }
    }
    return this.pageCache.get(pathCacheKey)
  }

  addAnchorForLater (pagePath, anchor, linkedFrom) {
    const anchorsInPath = this.anchorLinksToCheck.get(pagePath) || {}
    const anchorLink = anchorsInPath[anchor] || { linkedFrom: [] }
    anchorLink.linkedFrom = union(anchorLink.linkedFrom, [linkedFrom])
    anchorsInPath[anchor] = anchorLink
    this.anchorLinksToCheck.set(pagePath, anchorsInPath)
  }

  addImagesForLater (images, pagePath) {
    uniq(images).forEach(imageSrc => {
      const imageUsage = this.imagesToCheck.get(imageSrc) || { usedBy: [] }
      imageUsage.usedBy = union(imageUsage.usedBy, [pagePath])
      this.imagesToCheck.set(imageSrc, imageUsage)
    })
  }

  async checkPage (context, checkExternalAnchors) {
    const path = context.relativePath
    const version = context.currentVersion

    const pathCacheKey = `${version}:${path}`
    const $ = await this.getRenderedPageObj(pathCacheKey, context)

    const imageSrcs = $('img[src^="/assets"]').map((i, el) => $(el).attr('src')).toArray()

    this.addImagesForLater(imageSrcs, pathCacheKey)

    for (const href of this.internalHrefPrefixes) {
      const internalLinks = $(`a[href^="${href}"]`).get()

      for (const internalLink of internalLinks) {
        const href = $(internalLink).attr('href')

        let [link, anchor] = href.split('#')
        // remove trailing slash
        link = link.replace(patterns.trailingSlash, '$1')

        // if it's an external link and has been checked before, skip
        if (link && this.checkedLinksCache.has(link)) {
          // if it's been determined this link is broken, add to the linkedFrom field
          if (this.brokenLinks.has(link)) {
            const brokenLink = this.brokenLinks.get(link)
            brokenLink.linkedFrom = union(brokenLink.linkedFrom, [pathCacheKey])
            this.brokenLinks.set(link, brokenLink)
          }
          if (!anchor) continue
        }

        // if it's an internal anchor (e.g., #foo), save for later
        if (anchor && !link) {
          // ignore anchors that are autogenerated from headings
          if (anchor === $(internalLink).parent().attr('id')) continue
          this.addAnchorForLater(pathCacheKey, anchor, 'same page')
          continue
        }

        // ------ BEGIN ONEOFF EXCLUSIONS -------///
        // skip GraphQL public schema paths (these are checked by separate tests)
        if (link.startsWith('/public/') && link.endsWith('.graphql')) continue

        // skip links that start with /assets/images, as these are not in the pages collection
        // and /assets/images paths should be checked during the image check
        if (link.startsWith('/assets/images')) continue

        // skip rare hardcoded links to old GHE versions
        // these paths will always be in the old versioned format
        // example: /enterprise/11.10.340/admin/articles/upgrading-to-the-latest-release
        const gheVersionInLink = link.match(patterns.getEnterpriseVersionNumber)
        if (gheVersionInLink && deprecated.includes(gheVersionInLink[1])) continue
        // ------ END ONEOFF EXCLUSIONS -------///

        // look for linked page
        const linkedPage = context.pages[link] || context.pages[context.redirects[link]]
        this.checkedLinksCache.add(link)

        if (!linkedPage) {
          this.brokenLinks.set(link, { linkedFrom: [pathCacheKey] })
          continue
        }

        // if we're not checking external anchors, we're done
        if (!checkExternalAnchors) {
          continue
        }

        // find the permalink for the current version
        const linkedPagePermalink = linkedPage.permalinks.find(permalink => permalink.pageVersion === version)

        if (linkedPagePermalink) {
          const linkedPageContext = await buildPathContext(context, linkedPage, linkedPagePermalink)

          if (anchor) {
            await this.setRenderedPageObj(`${version}:${linkedPage.relativePath}`, linkedPageContext)
            this.addAnchorForLater(`${version}:${linkedPage.relativePath}`, anchor, pathCacheKey)
          }
        }
      }
    }
  }

  async checkAnchors () {
    for await (const [pathCacheKey, anchors] of this.anchorLinksToCheck) {
      const $ = await this.getRenderedPageObj(pathCacheKey)
      for (const anchorText in anchors) {
        const matchingHeadings = $(`[id="${anchorText}"], [name="${anchorText}"]`)
        if (matchingHeadings.length === 0) {
          const brokenAnchorPath = this.brokenAnchors.get(pathCacheKey) || {}
          brokenAnchorPath[anchorText] = anchors[anchorText]
          this.brokenAnchors.set(pathCacheKey, brokenAnchorPath)
        }
      }
    }
  }

  getBrokenLinks () {
    return this.brokenLinks
  }

  async getBrokenAnchors () {
    await this.checkAnchors()
    return this.brokenAnchors
  }

  async getBrokenImages () {
    for await (const [imageSrc, imageUsage] of this.imagesToCheck) {
      try {
        await fs.promises.access(path.join(process.cwd(), imageSrc))
      } catch (e) {
        this.brokenImages.set(imageSrc, imageUsage)
      }
    }
    return this.brokenImages
  }
}

// this function is async because the middleware functions are likely async
async function applyMiddleware (middleware, req) {
  return middleware(req, null, () => {})
}

async function buildInitialContext () {
  const req = {
    path: '/en',
    language: 'en',
    query: {}
  }
  await applyMiddleware(contextualize, req)
  return req.context
}

async function buildPathContext (initialContext, page, permalink) {
  // Create a new object with path-specific properties.
  // Note this is cherry-picking properties currently only needed by the middlware below;
  // See middleware/context.js for the rest of the properties we are NOT refreshing per page.
  // If we find this causes problems for link checking, we can call `contextualize` on
  // every page. For now, this cherry-picking approach is intended to improve performance so
  // we don't have to build the expensive `pages`, `redirects`, etc. data on every page we check.
  const pathContext = {
    page,
    currentVersion: permalink.pageVersion,
    relativePath: permalink.relativePath,
    currentPath: permalink.href
  }

  // Combine it with the initial context object that has pages, redirects, etc.
  const combinedContext = Object.assign({}, initialContext, pathContext)

  // Create a new req object using the combined context
  const req = {
    path: permalink.href,
    context: combinedContext,
    language: 'en',
    query: {}
  }

  // Pass the req to the contextualizing middlewares
  await applyMiddleware(rest, req)
  await applyMiddleware(graphql, req)
  // Release notes are available on docs site starting with GHES 3.0
  if (versionSatisfiesRange(permalink.pageVersion, '>=3.0')) {
    await applyMiddleware(releaseNotes, req)
  }

  // Return the resulting context object with REST, GraphQL, and release notes data now attached
  return req.context
}

module.exports = {
  LinksChecker,
  buildPathContext,
  buildInitialContext
}
