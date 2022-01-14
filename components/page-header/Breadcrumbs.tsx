import cx from 'classnames'
import { useRouter } from 'next/router'
import { useMainContext } from '../context/MainContext'
import { Link } from 'components/Link'
import styles from './Breadcrumbs.module.scss'

export type BreadcrumbT = {
  title: string
  documentType?: string
  href?: string
}

export const Breadcrumbs = () => {
  const router = useRouter()
  // remove query string and hash
  const pathWithLocale = `/${router.locale}${router.asPath.split('?')[0].split('#')[0]}`
  const { breadcrumbs } = useMainContext()

  return (
    /*
      NOTE: The breadcrumbs class and the nav tag are used by the
      Lunr search scripts. The a tag generated by the Link is also used.
      If these change, please also change
      updating script/search/parse-page-sections-into-records.js.
    */
    <nav
      data-testid="breadcrumbs"
      className={cx('f5 breadcrumbs', styles.breadcrumbs)}
      aria-label="Breadcrumb"
    >
      <ul>
        {Object.values(breadcrumbs)
          .filter(Boolean)
          .map((breadcrumb, i, arr) => {
            const title = `${breadcrumb.title}`
            return [
              !breadcrumb.href ? (
                <span data-testid="breadcrumb-title" key={title} title={title} className="px-2">
                  {breadcrumb.title}
                </span>
              ) : (
                <li className="d-inline-block" key={title}>
                  <Link
                    data-testid="breadcrumb-link"
                    href={breadcrumb.href}
                    title={title}
                    className={cx(
                      'pr-3',
                      // Always show first and last, show middle on XL size
                      i === 0 || i === arr.length - 1
                        ? 'd-inline-block'
                        : 'd-none d-xl-inline-block',
                      pathWithLocale === breadcrumb.href && 'color-fg-muted'
                    )}
                  >
                    {breadcrumb.title}
                    {i !== arr.length - 1 ? (
                      <span className="color-fg-muted pl-3" key={`${i}-slash`}>
                        /
                      </span>
                    ) : null}
                  </Link>
                </li>
              ),
            ]
          })}
      </ul>
    </nav>
  )
}
