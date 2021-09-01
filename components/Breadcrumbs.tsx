import cx from 'classnames'
import { useRouter } from 'next/router'
import { useMainContext } from './context/MainContext'
import { Link } from 'components/Link'

export type BreadcrumbT = {
  title: string
  documentType?: string
  href?: string
}

export const Breadcrumbs = () => {
  const router = useRouter()
  const pathWithLocale = `/${router.locale}${router.asPath.split('?')[0]}` // remove query string
  const { breadcrumbs } = useMainContext()

  return (
    /*
      NOTE: The breadcrumbs class and the nav tag are used by the 
      LUNR search scripts. The a tag generated by the Link is also used.
      If these change, please also change
      updating script/search/parse-page-sections-into-records.js.
    */
    <nav data-testid="breadcrumbs" className="f5 breadcrumbs" aria-label="Breadcrumb">
      {Object.values(breadcrumbs).map((breadcrumb, i, arr) => {
        if (!breadcrumb) {
          return null
        }

        const title = `${breadcrumb.documentType}: ${breadcrumb.title}`
        return [
          !breadcrumb.href ? (
            <span data-testid="breadcrumb-title" key={title} title={title} className="px-2">
              {breadcrumb.title}
            </span>
          ) : (
            <Link
              key={title}
              data-testid="breadcrumb-link"
              href={breadcrumb.href}
              title={title}
              className={cx(
                'd-inline-block px-2',
                pathWithLocale === breadcrumb.href && 'color-text-tertiary'
              )}
            >
              {breadcrumb.title}
            </Link>
          ),
          i !== arr.length - 1 ? (
            <span className="color-text-tertiary" key={`${i}-slash`}>
              /
            </span>
          ) : null,
        ]
      })}
    </nav>
  )
}
