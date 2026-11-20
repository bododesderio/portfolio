// Renders the PNG logo and social icons used in emails (mail clients block SVG).
// Run: node scripts/build-email-assets.mjs   (writes public/identity/email/)
import { mkdir, readFile } from 'node:fs/promises'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import sharp from 'sharp'
import * as fa from 'react-icons/fa6'

const out = 'public/identity/email'
await mkdir(out, { recursive: true })

const icons = {
  facebook: fa.FaFacebookF,
  instagram: fa.FaInstagram,
  x: fa.FaXTwitter,
  youtube: fa.FaYoutube,
  linkedin: fa.FaLinkedinIn,
  github: fa.FaGithub,
  medium: fa.FaMedium,
}
for (const [name, Icon] of Object.entries(icons)) {
  const glyph = renderToStaticMarkup(createElement(Icon, { size: 40, color: '#ffffff' })).replace('<svg ', '<svg x="20" y="20" ')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><circle cx="40" cy="40" r="40" fill="#14221a"/>${glyph}</svg>`
  await sharp(Buffer.from(svg)).png().toFile(`${out}/${name}.png`)
}

const mark = await readFile('public/identity/bodo-mark.svg', 'utf8')
await sharp(Buffer.from(mark), { density: 600 }).resize(128, 128).png().toFile(`${out}/logo.png`)
console.log(`Wrote ${Object.keys(icons).length} icons and logo.png to ${out}`)
