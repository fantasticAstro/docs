// This is an AllowList of GitHub Actions that are approved for use in this project.
// If a new or existing workflow file is updated to use an action or action version not listed here,
// CI will fail and the action will need to be audited by the docs engineering team before it
// can be added it this list.

module.exports = [
  'actions/cache@v1',
  'actions/cache@v2',
  'actions/checkout@v2',
  'actions/github-script@0.9.0',
  'actions/github-script@v2.0.0',
  'actions/github-script@v2',
  'actions/github-script@v3',
  'actions/labeler@v2',
  'actions/setup-node@v1',
  'actions/setup-ruby@v1',
  'actions/stale@v3',
  'crowdin/github-action@1.0.10',
  'dawidd6/action-delete-branch@v3',
  'docker://chinthakagodawita/autoupdate-action:v1',
  'fkirc/skip-duplicate-actions@a12175f6209d4805b5a163d723270be2a0dc7b36',
  'github/codeql-action/analyze@v1',
  'github/codeql-action/init@v1',
  'ianwalter/puppeteer@3.0.0',
  'juliangruber/approve-pull-request-action@v1',
  'juliangruber/find-pull-request-action@v1',
  'juliangruber/read-file-action@v1',
  'pascalgn/automerge-action@c9bd182',
  'peter-evans/create-issue-from-file@v2',
  'peter-evans/create-pull-request@v2',
  'rachmari/actions-add-new-issue-to-column@v1.1.1',
  'rachmari/labeler@v1.0.4',
  'repo-sync/github-sync@v2',
  'repo-sync/pull-request@v2',
  'rtCamp/action-slack-notify@master',
  'rtCamp/action-slack-notify@v2.1.0',
  'tjenkinson/gh-action-auto-merge-dependency-updates@cee2ac0'
]
