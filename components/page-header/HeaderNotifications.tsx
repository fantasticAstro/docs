import { useRouter } from 'next/router'
import cx from 'classnames'

import { useMainContext } from 'components/context/MainContext'
import { useTranslation } from 'components/hooks/useTranslation'
import { ExcludesNull } from 'components/lib/ExcludesNull'
import { useVersion } from 'components/hooks/useVersion'
import { useSession } from 'components/lib/get-session'
import styles from './HeaderNotifications.module.scss'

enum NotificationType {
  RELEASE = 'RELEASE',
  TRANSLATION = 'TRANSLATION',
  EARLY_ACCESS = 'EARLY_ACCESS',
}

type Notif = {
  content: string
  type: NotificationType
}
export const HeaderNotifications = () => {
  const router = useRouter()
  const { currentVersion } = useVersion()
  const { relativePath, allVersions, data, currentPathWithoutLanguage, page } = useMainContext()
  const session = useSession()
  const userLanguage = session?.userLanguage
  const languages = session?.languages || {}

  const { t } = useTranslation('header')

  const translationNotices: Array<Notif> = []
  if (router.locale === 'en') {
    if (userLanguage && userLanguage !== 'en' && languages[userLanguage]?.wip === false) {
      translationNotices.push({
        type: NotificationType.TRANSLATION,
        content: `This article is also available in <a href="/${userLanguage}${currentPathWithoutLanguage}">${languages[userLanguage]?.name}</a>.`,
      })
    }
  } else {
    if (relativePath?.includes('/site-policy')) {
      translationNotices.push({
        type: NotificationType.TRANSLATION,
        content: data.reusables.policies.translation,
      })
    } else if (router.locale && languages[router.locale]?.wip !== true) {
      translationNotices.push({
        type: NotificationType.TRANSLATION,
        content: t('notices.localization_complete'),
      })
    } else if (router.locale && languages[router.locale]?.wip) {
      translationNotices.push({
        type: NotificationType.TRANSLATION,
        content: t('notices.localization_in_progress'),
      })
    }
  }
  const releaseNotices: Array<Notif> = []
  if (currentVersion === 'github-ae@latest') {
    releaseNotices.push({
      type: NotificationType.RELEASE,
      content: t('notices.ghae_silent_launch'),
    })
  } else if (currentVersion === data.variables.release_candidate.version) {
    releaseNotices.push({
      type: NotificationType.RELEASE,
      content: `${allVersions[currentVersion].versionTitle}${t('notices.release_candidate')}`,
    })
  }

  const allNotifications: Array<Notif> = [
    ...translationNotices,
    ...releaseNotices,
    // ONEOFF EARLY ACCESS NOTICE
    (relativePath || '').includes('early-access/') && !page.noEarlyAccessBanner
      ? {
          type: NotificationType.EARLY_ACCESS,
          content: t('notices.early_access'),
        }
      : null,
  ].filter(ExcludesNull)

  return (
    <div>
      {allNotifications.map(({ type, content }, i) => {
        const isLast = i === allNotifications.length - 1
        return (
          <div
            key={content}
            data-testid="header-notification"
            data-type={type}
            className={cx(
              'flash flash-banner',
              styles.container,
              'text-center f5 color-fg-default py-4 px-6',
              type === NotificationType.TRANSLATION && 'color-bg-accent',
              type === NotificationType.RELEASE && 'color-bg-accent',
              type === NotificationType.EARLY_ACCESS && 'color-bg-danger',
              !isLast && 'border-bottom color-border-default'
            )}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )
      })}
    </div>
  )
}
