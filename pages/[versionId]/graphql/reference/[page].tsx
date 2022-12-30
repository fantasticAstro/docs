import { GetServerSideProps } from 'next'
import React from 'react'

import { GraphqlPage } from 'components/graphql/GraphqlPage'
import { getGraphqlSchema, getMiniToc } from 'lib/graphql/index.js'
import { MainContextT, MainContext, getMainContext } from 'components/context/MainContext'
import type { ObjectT, GraphqlT } from 'components/graphql/types'
import { AutomatedPage } from 'components/article/AutomatedPage'
import {
  AutomatedPageContext,
  AutomatedPageContextT,
  getAutomatedPageContextFromRequest,
} from 'components/context/AutomatedPageContext'

type Props = {
  mainContext: MainContextT
  automatedPageContext: AutomatedPageContextT
  schema: Object
  language: string
  graphqlPageName: string
  objects?: ObjectT[]
}

export default function GraphqlReferencePage({
  mainContext,
  automatedPageContext,
  schema,
  graphqlPageName,
  objects,
}: Props) {
  const content = (
    <GraphqlPage schema={schema} pageName={graphqlPageName} objects={objects || undefined} />
  )
  return (
    <MainContext.Provider value={mainContext}>
      <AutomatedPageContext.Provider value={automatedPageContext}>
        <AutomatedPage>{content}</AutomatedPage>
      </AutomatedPageContext.Provider>
    </MainContext.Provider>
  )
}

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const req = context.req as any
  const res = context.res as any
  const language = req.context.currentLanguage as string
  const currentVersion = req.context.currentVersion as string
  const page = context.query.page as string
  const graphqlPageName = page === 'input-objects' ? 'inputObjects' : page

  const schema = getGraphqlSchema(currentVersion, graphqlPageName)
  // When the page is 'interfaces', we need to make another call to
  // get the objects page properties too.
  const objects =
    graphqlPageName === 'interfaces' ? getGraphqlSchema(currentVersion, 'objects') : null

  // Gets the miniTocItems in the article context. At this point it will only
  // include miniTocItems that exist in Markdown pages in
  // content/graphql/reference/*
  const automatedPageContext = getAutomatedPageContextFromRequest(req)

  const items = schema.map((item: GraphqlT) => item.name)
  const graphqlMiniTocItems = await getMiniToc(req.context, graphqlPageName, items)
  // Update the existing context to include the miniTocItems from GraphQL
  automatedPageContext.miniTocItems.push(...graphqlMiniTocItems)

  return {
    props: {
      mainContext: await getMainContext(req, res),
      automatedPageContext,
      schema,
      language,
      graphqlPageName,
      objects,
    },
  }
}
