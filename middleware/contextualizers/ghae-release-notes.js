import { formatReleases, renderPatchNotes } from '../../lib/release-notes-utils.js'
import { getDeepDataByLanguage } from '../../lib/get-data.js'
import { allVersions } from '../../lib/all-versions.js'

export default async function ghaeReleaseNotesContext(req, res, next) {
  if (!(req.pagePath.endsWith('/release-notes') || req.pagePath.endsWith('/admin'))) return next()
  if (
    !allVersions[req.context.currentVersion] ||
    req.context.currentVersion.split('@')[0] !== 'github-ae'
  )
    return next()

  let ghaeReleaseNotes = getDeepDataByLanguage('release-notes.github-ae', req.language)
  if ((!ghaeReleaseNotes || Object.keys(ghaeReleaseNotes).length === 0) && req.language !== 'en') {
    ghaeReleaseNotes = getDeepDataByLanguage('release-notes.github-ae', 'en')
  }

  // internalLatestRelease is set in lib/all-versions, e.g., '3.5' but UI still displays '@latest'.
  let requestedRelease = req.context.currentVersionObj.internalLatestRelease

  // The internalLatestRelease may not necessarily correspond to an existing release notes number,
  // so just fall back to the latest existing release note number.
  if (!Object.keys(ghaeReleaseNotes).includes(requestedRelease.replace(/\./, '-'))) {
    requestedRelease = Object.keys(ghaeReleaseNotes)[0].replace(/-/, '.')
  }

  // Returns [{version, patches: [ {version, patchVersion, intro, date, sections: { features: [], bugs: []...}} ] }]
  req.context.ghaeReleases = formatReleases(ghaeReleaseNotes)

  // Run _all_ the GHAE patches through the markdown rendering pipeline.
  // This is different from req.context.ghesReleaseNotes, which renders one release at a time.
  // Returns all patches: [{version, patchVersion, intro, date, sections}]
  req.context.ghaeReleaseNotes = (
    await Promise.all(
      req.context.ghaeReleases.map(
        async (release) => await renderPatchNotes(release.patches, req.context)
      )
    )
  ).flat()

  return next()
}
