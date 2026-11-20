import { describe, it, expect, vi } from 'vitest'

vi.mock('../lib/data/content', () => ({
  getSiteSettings: vi.fn(async () => ({
    'social.linkedin': 'https://www.linkedin.com/in/bododesderio',
    'social.github': 'https://github.com/bododesderio',
  })),
}))

import { renderContactAutoReply } from '../lib/emails'

describe('email layout', () => {
  it('carries the logo and links to the configured social profiles', async () => {
    const html = await renderContactAutoReply('Ada')
    expect(html).toContain('/identity/email/logo.png')
    expect(html).toContain('href="https://www.linkedin.com/in/bododesderio"')
    expect(html).toContain('/identity/email/linkedin.png')
    expect(html).toContain('href="https://github.com/bododesderio"')
    expect(html).not.toContain('Kampala')
  })
})
