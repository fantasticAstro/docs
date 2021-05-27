#!/usr/bin/env node

// [start-readme]
//
// Run this one time script to update headers for accessibility
// Changing H3 to H2, H4 to H3, H5 to H4, and H6 to H5
//
// [end-readme]

const fs = require('fs')
const path = require('path')
const walk = require('walk-sync')

const re = /^#.*\n/gm

async function updateMdHeaders (dir) {
  walk(dir, { includeBasePath: true, directories: false })
    .filter(file => !file.endsWith('README.md'))
    .forEach(file => {
      fs.readFile(file, 'utf8', (err, data) => {
        if (err) return console.error(err)
        const matchHeader = data.match(re)
        let firstHeader = (matchHeader) ? matchHeader[0].split(' ')[0] : null
        if (file.includes('data/reusables/')) {
          if (!file.endsWith('data/reusables/actions/actions-group-concurrency.md') && !file.endsWith('data/reusables/github-actions/actions-on-examples.md')) {
            firstHeader = 'reusable-' + firstHeader
          }
        }
        let result
        switch (firstHeader) {
          case '#':
            return
          case '##':
            return
          case '###':
            result = data
              .replace(/^### /gm, '## ')
              .replace(/^#### /gm, '### ')
              .replace(/^##### /gm, '#### ')
              .replace(/^###### /gm, '##### ')
            break
          case '####':
            result = data
              .replace(/^#### /gm, '## ')
              .replace(/^##### /gm, '### ')
              .replace(/^###### /gm, '#### ')
            break
          case 'reusable-####':
            result = data
              .replace(/^#### /gm, '### ')
              .replace(/^##### /gm, '#### ')
            break
          case 'reusable-#####':
            result = data
              .replace(/^##### /gm, '#### ')
            break
          case '#####':
            result = data
              .replace(/^##### /gm, '### ')
              .replace(/^###### /gm, '#### ')
            break
          default:
            return
        }
        fs.writeFile(file, result, 'utf8', function (err) {
          if (err) return console.log(err)
        })
      })
    })
}

async function main () {
  const mdDirPaths = [
    path.join(__dirname, '../../content'),
    path.join(__dirname, '../../data/reusables')
  ]

  for (const dir of mdDirPaths) {
    await updateMdHeaders(dir)
  }
}

main()
  .catch(console.error)
  .finally(() => console.log('Done'))
