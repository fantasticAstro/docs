import cx from 'classnames'

import { useMainContext } from 'components/context/MainContext'
import { SidebarProduct } from 'src/landings/components/SidebarProduct'
import { AllProductsLink } from './AllProductsLink'
import { ApiVersionPicker } from 'src/rest/components/ApiVersionPicker'
import { Link } from 'components/Link'

type Props = {
  variant?: 'full' | 'overlay'
}

export const SidebarNav = ({ variant = 'full' }: Props) => {
  const { currentProduct } = useMainContext()
  const isRestPage = currentProduct && currentProduct.id === 'rest'
  // we need to roughly account for the site header height plus the height of
  // the side nav header (which is taller when we show the API version picker)
  // so we don't cut off the bottom of the sidebar
  const sidebarPaddingBottom = isRestPage ? '250px' : '185px'

  return (
    <div
      className={cx(variant === 'full' ? 'position-sticky d-none border-right d-xl-block' : '')}
      style={{ width: 326, height: 'calc(100vh - 65px)', top: '65px' }}
    >
      {variant === 'full' && currentProduct && (
        <nav
          className={cx('d-none px-4 pb-3 border-bottom d-xl-block')}
          aria-labelledby="sidebar-header"
        >
          <AllProductsLink />
          {currentProduct && (
            <div className="mt-3" aria-label="sidebar-header">
              <Link
                data-testid="sidebar-product-xl"
                href={currentProduct.href}
                // Note the `_product-title` is used by the popover preview cards
                // when it needs this text for in-page links.
                className="d-block pl-1 mb-2 h3 color-fg-default no-underline _product-title"
              >
                {currentProduct.name}
              </Link>
            </div>
          )}
          {variant === 'full' && isRestPage && <ApiVersionPicker />}
        </nav>
      )}
      <div
        className={cx(
          variant === 'overlay' ? 'd-xl-none' : 'border-right d-none d-xl-block',
          'bg-primary overflow-y-auto flex-shrink-0',
        )}
        style={{ width: 326, height: 'calc(100vh - 175px)', paddingBottom: sidebarPaddingBottom }}
        role="banner"
      >
        <SidebarProduct />
      </div>
    </div>
  )
}
