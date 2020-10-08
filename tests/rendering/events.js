const request = require('supertest')
const Airtable = require('airtable')
const nock = require('nock')
const app = require('../../server')

jest.mock('airtable')
Airtable.mockImplementation(function () {
  this.base = () => () => ({
    create: () => [{ getId: () => 'TESTID' }],
    update: () => true
  })
})

describe('POST /events', () => {
  jest.setTimeout(60 * 1000)

  let csrfToken = ''
  let agent

  beforeEach(async () => {
    process.env.AIRTABLE_API_KEY = '$AIRTABLE_API_KEY$'
    process.env.AIRTABLE_BASE_KEY = '$AIRTABLE_BASE_KEY$'
    process.env.HYDRO_SECRET = '$HYDRO_SECRET$'
    process.env.HYDRO_ENDPOINT = 'http://example.com/hydro'
    agent = request.agent(app)
    const csrfRes = await agent.get('/csrf')
    csrfToken = csrfRes.body.token
    nock('http://example.com')
      .post('/hydro')
      .reply(200, {})
  })

  afterEach(() => {
    delete process.env.AIRTABLE_API_KEY
    delete process.env.AIRTABLE_BASE_KEY
    delete process.env.HYDRO_SECRET
    delete process.env.HYDRO_ENDPOINT
    csrfToken = ''
  })

  async function checkEvent (data, code) {
    return agent
      .post('/events')
      .send(data)
      .set('Accept', 'application/json')
      .set('csrf-token', csrfToken)
      .expect(code)
  }

  describe('HELPFULNESS', () => {
    const example = {
      type: 'HELPFULNESS',
      url: 'https://example.com',
      vote: 'Yes',
      email: 'test@example.com',
      comment: 'This is the best page ever',
      category: 'Other'
    }

    it('should accept a valid object', () =>
      checkEvent(example, 201)
    )

    it('should reject extra properties', () =>
      checkEvent({ ...example, toothpaste: false }, 400)
    )

    it('should not accept if type is missing', () =>
      checkEvent({ ...example, type: undefined }, 400)
    )

    it('should not accept if url is missing', () =>
      checkEvent({ ...example, url: undefined }, 400)
    )

    it('should not accept if url is misformatted', () =>
      checkEvent({ ...example, url: 'examplecom' }, 400)
    )

    it('should not accept if vote is missing', () =>
      checkEvent({ ...example, vote: undefined }, 400)
    )

    it('should not accept if vote is not boolean', () =>
      checkEvent({ ...example, vote: 'true' }, 400)
    )

    it('should not accept if email is misformatted', () =>
      checkEvent({ ...example, email: 'testexample.com' }, 400)
    )

    it('should not accept if comment is not string', () =>
      checkEvent({ ...example, comment: [] }, 400)
    )

    it('should not accept if category is not an option', () =>
      checkEvent({ ...example, category: 'Fabulous' }, 400)
    )
  })

  describe('EXPERIMENT', () => {
    const example = {
      type: 'EXPERIMENT',
      user: 'ef17cf45-ba3c-4de0-9140-84eb85f0797d',
      test: 'my-example-test',
      group: 'control',
      success: 'yes'
    }

    it('should accept a valid object', () =>
      checkEvent(example, 201)
    )

    it('should reject extra fields', () =>
      checkEvent({ ...example, toothpaste: false }, 400)
    )

    it('should require a long unique user-id', () =>
      checkEvent({ ...example, 'user-id': 'short' }, 400)
    )

    it('should require a test', () =>
      checkEvent({ ...example, test: undefined }, 400)
    )

    it('should require a valid group', () =>
      checkEvent({ ...example, group: 'revolution' }, 400)
    )

    it('should default the success field', () =>
      checkEvent({ ...example, success: undefined }, 201)
    )
  })

  const baseExample = {
    context: {
      // Primitives
      event_id: 'a35d7f88-3f48-4f36-ad89-5e3c8ebc3df7',
      user: '703d32a8-ed0f-45f9-8d78-a913d4dc6f19',
      version: '1.0.0',
      created: '2020-10-02T17:12:18.620Z',

      // Content information
      path: '/github/docs/issues',
      referrer: 'https://github.com/github/docs',
      search: '?q=is%3Aissue+is%3Aopen+example+',
      href: 'https://github.com/github/docs/issues?q=is%3Aissue+is%3Aopen+example+',
      site_language: 'en',

      // Device information
      os: 'linux',
      os_version: '18.04',
      browser: 'chrome',
      browser_version: '85.0.4183.121',
      viewport_width: 1418,
      viewport_height: 501,

      // Location information
      timezone: -7,
      user_language: 'en-US'
    }
  }

  describe('page', () => {
    const pageExample = { ...baseExample, type: 'page' }

    it('should record a page event', () =>
      checkEvent(pageExample, 201)
    )

    it('should require a type', () =>
      checkEvent(baseExample, 400)
    )

    it('should require an event_id in uuid', () =>
      checkEvent({
        ...pageExample,
        context: {
          ...pageExample.context,
          event_id: 'asdfghjkl'
        }
      }, 400)
    )

    it('should require a user in uuid', () =>
      checkEvent({
        ...pageExample,
        context: {
          ...pageExample.context,
          user: 'asdfghjkl'
        }
      }, 400)
    )

    it('should require a version', () =>
      checkEvent({
        ...pageExample,
        context: {
          ...pageExample.context,
          version: undefined
        }
      }, 400)
    )

    it('should require created timestamp', () =>
      checkEvent({
        ...pageExample,
        context: {
          ...pageExample.context,
          timestamp: 1234
        }
      }, 400)
    )

    it('should not allow a honeypot token', () =>
      checkEvent({
        ...pageExample,
        context: {
          ...pageExample.context,
          token: 'zxcv'
        }
      }, 400)
    )

    it('should path be uri-reference', () =>
      checkEvent({
        ...pageExample,
        context: {
          ...pageExample.context,
          path: ' '
        }
      }, 400)
    )

    it('should referrer be uri-reference', () =>
      checkEvent({
        ...pageExample,
        context: {
          ...pageExample.context,
          referrer: ' '
        }
      }, 400)
    )

    it('should search a string', () =>
      checkEvent({
        ...pageExample,
        context: {
          ...pageExample.context,
          search: 1234
        }
      }, 400)
    )

    it('should href be uri', () =>
      checkEvent({
        ...pageExample,
        context: {
          ...pageExample.context,
          href: '/example'
        }
      }, 400)
    )

    it('should site_language is a valid option', () =>
      checkEvent({
        ...pageExample,
        context: {
          ...pageExample.context,
          site_language: 'nl'
        }
      }, 400)
    )

    it('should a valid os option', () =>
      checkEvent({
        ...pageExample,
        context: {
          ...pageExample.context,
          os: 'ubuntu'
        }
      }, 400)
    )

    it('should os_version a string', () =>
      checkEvent({
        ...pageExample,
        context: {
          ...pageExample.context,
          os_version: 25
        }
      }, 400)
    )

    it('should browser a valid option', () =>
      checkEvent({
        ...pageExample,
        context: {
          ...pageExample.context,
          browser: 'opera'
        }
      }, 400)
    )

    it('should browser_version a string', () =>
      checkEvent({
        ...pageExample,
        context: {
          ...pageExample.context,
          browser_version: 25
        }
      }, 400)
    )

    it('should viewport_width a number', () =>
      checkEvent({
        ...pageExample,
        context: {
          ...pageExample.context,
          viewport_width: -500
        }
      }, 400)
    )

    it('should viewport_height a number', () =>
      checkEvent({
        ...pageExample,
        context: {
          ...pageExample.context,
          viewport_height: '53px'
        }
      }, 400)
    )

    it('should timezone in number', () =>
      checkEvent({
        ...pageExample,
        context: {
          ...pageExample.context,
          timezone: 'GMT-0700'
        }
      }, 400)
    )

    it('should user_language is a string', () =>
      checkEvent({
        ...pageExample,
        context: {
          ...pageExample.context,
          user_language: true
        }
      }, 400)
    )

    it('should page_render_duration is a positive number', () =>
      checkEvent({
        ...pageExample,
        page_render_duration: -0.5
      }, 400)
    )
  })

  describe('exit', () => {
    const exitExample = {
      ...baseExample,
      type: 'exit',
      exit_page_id: 'c93c2d16-8e07-43d5-bc3c-eacc999c184d',
      exit_first_paint: 0.1,
      exit_dom_interactive: 0.2,
      exit_dom_complete: 0.3,
      exit_visit_duration: 5,
      exit_scroll_length: 0.5
    }

    it('should record an exit event', () =>
      checkEvent(exitExample, 201)
    )

    it('should require exit_page_id', () =>
      checkEvent({ ...exitExample, exit_page_id: undefined }, 400)
    )

    it('should require exit_page_id is a uuid', () =>
      checkEvent({ ...exitExample, exit_page_id: 'afjdskalj' }, 400)
    )

    it('exit_first_paint is a number', () =>
      checkEvent({ ...exitExample, exit_first_paint: 'afjdkl' }, 400)
    )

    it('exit_dom_interactive is a number', () =>
      checkEvent({ ...exitExample, exit_dom_interactive: '202' }, 400)
    )

    it('exit_visit_duration is a number', () =>
      checkEvent({ ...exitExample, exit_visit_duration: '75' }, 400)
    )

    it('exit_scroll_length is a number between 0 and 1', () =>
      checkEvent({ ...exitExample, exit_scroll_length: 1.1 }, 400)
    )
  })

  describe('link', () => {
    const linkExample = {
      ...baseExample,
      type: 'link',
      link_url: 'https://example.com'
    }

    it('should send a link event', () =>
      checkEvent(linkExample, 201)
    )

    it('link_url is a required uri formatted string', () =>
      checkEvent({ ...linkExample, link_url: 'foo' }, 400)
    )
  })

  describe('search', () => {
    const searchExample = {
      ...baseExample,
      type: 'search',
      search_query: 'github private instances',
      search_context: 'private'
    }

    it('should record a search event', () =>
      checkEvent(searchExample, 201)
    )

    it('search_query is required string', () =>
      checkEvent({ ...searchExample, search_query: undefined }, 400)
    )

    it('search_context is optional string', () =>
      checkEvent({ ...searchExample, search_context: undefined }, 201)
    )
  })

  describe('navigate', () => {
    const navigateExample = {
      ...baseExample,
      type: 'navigate',
      navigate_label: 'drop down'
    }

    it('should record a navigate event', () =>
      checkEvent(navigateExample, 201)
    )

    it('navigate_label is optional string', () =>
      checkEvent({ ...navigateExample, navigate_label: undefined }, 201)
    )
  })

  describe('survey', () => {
    const surveyExample = {
      ...baseExample,
      type: 'survey',
      survey_vote: true,
      survey_comment: 'I love this site.',
      survey_email: 'daisy@example.com'
    }

    it('should record a survey event', () =>
      checkEvent(surveyExample, 201)
    )

    it('survey_vote is boolean', () =>
      checkEvent({ ...surveyExample, survey_vote: undefined }, 400)
    )

    it('survey_comment is string', () => {
      checkEvent({ ...surveyExample, survey_comment: 1234 }, 400)
    })

    it('survey_email is email', () => {
      checkEvent({ ...surveyExample, survey_email: 'daisy' }, 400)
    })
  })

  describe('experiment', () => {
    const experimentExample = {
      ...baseExample,
      type: 'experiment',
      experiment_name: 'change-button-copy',
      experiment_variation: 'treatment',
      experiment_success: true
    }

    it('should record an experiment event', () =>
      checkEvent(experimentExample, 201)
    )

    it('experiment_name is required string', () =>
      checkEvent({ ...experimentExample, experiment_name: undefined }, 400)
    )

    it('experiment_variation is required string', () =>
      checkEvent({ ...experimentExample, experiment_variation: undefined }, 400)
    )

    it('experiment_success is optional boolean', () =>
      checkEvent({ ...experimentExample, experiment_success: undefined }, 201)
    )
  })
})

describe('PUT /events/:id', () => {
  jest.setTimeout(60 * 1000)

  let csrfToken = ''
  let agent

  beforeEach(async () => {
    process.env.AIRTABLE_API_KEY = '$AIRTABLE_API_KEY$'
    process.env.AIRTABLE_BASE_KEY = '$AIRTABLE_BASE_KEY$'
    agent = request.agent(app)
    const csrfRes = await agent.get('/csrf')
    csrfToken = csrfRes.body.token
  })

  afterEach(() => {
    delete process.env.AIRTABLE_API_KEY
    delete process.env.AIRTABLE_BASE_KEY
    csrfToken = ''
  })

  const example = {
    type: 'HELPFULNESS',
    url: 'https://example.com',
    vote: 'Yes',
    email: 'test@example.com',
    comment: 'This is the best page ever',
    category: 'Other'
  }

  it('should update an existing HELPFULNESS event', () =>
    agent
      .put('/events/TESTID')
      .send(example)
      .set('Accept', 'application/json')
      .set('csrf-token', csrfToken)
      .expect(200)
  )
})
