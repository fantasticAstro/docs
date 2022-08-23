import Document, { DocumentContext, Html, Head, Main, NextScript } from 'next/document'
import { ServerStyleSheet } from 'styled-components'

import { defaultCSSTheme } from 'components/hooks/useTheme'

export default class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const sheet = new ServerStyleSheet()
    const originalRenderPage = ctx.renderPage

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) => sheet.collectStyles(<App {...props} />),
        })

      const initialProps = await Document.getInitialProps(ctx)
      return {
        ...initialProps,
        styles: (
          <>
            {initialProps.styles}
            {sheet.getStyleElement()}
          </>
        ),
      }
    } finally {
      sheet.seal()
    }
  }

  render() {
    return (
      <Html>
        <Head />
        <body
          // These values are always the SSR rendereding defaults.
          // The will get updated later in a useEffect hook, in the client,
          // in the MyApp component.
          data-color-mode={defaultCSSTheme.colorMode}
          data-light-theme={defaultCSSTheme.lightTheme}
          data-dark-theme={defaultCSSTheme.darkTheme}
        >
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
