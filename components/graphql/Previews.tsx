import React from 'react'
import GithubSlugger from 'github-slugger'
import cx from 'classnames'

import { HeadingLink } from 'components/article/HeadingLink'
import { useTranslation } from 'components/hooks/useTranslation'
import { PreviewT } from 'components/graphql/types'
import styles from 'components/ui/MarkdownContent/MarkdownContent.module.scss'

type Props = {
  schema: PreviewT[]
}

export function Previews({ schema }: Props) {
  const previews = schema.map((item) => {
    const slugger = new GithubSlugger()
    const slug = slugger.slug(item.title)
    const { t } = useTranslation('products')

    return (
      <div className={cx(styles.markdownBody)} key={slug}>
        <HeadingLink as="h2" slug={slug}>
          {item.title}
        </HeadingLink>
        <p>{item.description}</p>
        <p>{t('graphql.overview.preview_header')}</p>
        <pre>
          <code>{item.accept_header}</code>
        </pre>
        <p>{t('graphql.overview.preview_schema_members')}:</p>
        <ul>
          {item.toggled_on.map((change) => (
            <li key={change + slug}>
              <code>{change}</code>
            </li>
          ))}
        </ul>
        {item.announcement && (
          <p>
            <b>{t('graphql.overview.announced')}: </b>
            <a href={item.announcement.url}>{item.announcement.date}</a>
          </p>
        )}
        {item.updates && (
          <p>
            <b>{t('graphql.overview.updates')}: </b>
            <a href={item.updates.url}>{item.updates.date}</a>
          </p>
        )}
      </div>
    )
  })

  return <div>{previews}</div>
}
