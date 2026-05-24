import { PrismaClient } from '@prisma/client'
import path from 'path'

const prisma = new PrismaClient()
const DEFAULT_ADMIN_EMAIL = 'derricklamarh@gmail.com'
const DEFAULT_ADMIN_PASSWORD_HASH = '$2b$12$tAF9wpNPwdx9z2kdCvYqreeZFJBlGZq0Zjh9U1gTh6q7Kaip2.YbG'

async function main() {
  console.log('🌱 Starting seed...')

  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH || DEFAULT_ADMIN_PASSWORD_HASH
  const adminEmail = (process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).trim().toLowerCase()

  const forceReseed = process.env.FORCE_RESEED === 'true'
  const existingRows = await Promise.all([
    prisma.adminUser.count(),
    prisma.siteContent.count(),
    prisma.siteSettings.count(),
    prisma.seoSettings.count(),
    prisma.blogPost.count(),
    prisma.service.count(),
    prisma.client.count(),
    prisma.media.count(),
    prisma.galleryItem.count(),
    prisma.heroImage.count(),
    prisma.pressItem.count(),
    prisma.testimonial.count(),
    prisma.pageEmbed.count(),
    prisma.banner.count(),
    prisma.project.count(),
    prisma.projectImage.count(),
    prisma.subscriber.count(),
    prisma.message.count(),
    prisma.newsletterCampaign.count(),
    prisma.emailLog.count(),
    prisma.emailEvent.count(),
    prisma.appConfig.count(),
  ])

  if (existingRows.some(count => count > 0) && !forceReseed) {
    console.log('✅ Existing data detected. Skipping seed. Set FORCE_RESEED=true to replace demo data.')
    return
  }

  if (forceReseed) {
    // Clear existing data only when explicitly requested.
    console.log('🗑️  FORCE_RESEED=true: clearing existing data...')
    await prisma.emailEvent.deleteMany()
    await prisma.emailLog.deleteMany()
    await prisma.projectImage.deleteMany()
    await prisma.project.deleteMany()
    await prisma.banner.deleteMany()
    await prisma.heroImage.deleteMany()
    await prisma.pageEmbed.deleteMany()
    await prisma.galleryItem.deleteMany()
    await prisma.testimonial.deleteMany()
    await prisma.blogPost.deleteMany()
    await prisma.service.deleteMany()
    await prisma.client.deleteMany()
    await prisma.media.deleteMany()
    await prisma.pressItem.deleteMany()
    await prisma.siteContent.deleteMany()
    await prisma.siteSettings.deleteMany()
    await prisma.seoSettings.deleteMany()
    await prisma.subscriber.deleteMany()
    await prisma.message.deleteMany()
    await prisma.newsletterCampaign.deleteMany()
    await prisma.appConfig.deleteMany()
    await prisma.adminUser.deleteMany()
  }

  // ==================== SITE CONTENT ====================
  console.log('📝 Creating site content...')

  // Helper to create content rows
  const contentRows = [
    // HOME PAGE - HERO
    { page: 'home', section: 'hero', fieldKey: 'pretitle', value: 'Founder. Leader. Builder.', fieldType: 'text' },
    { page: 'home', section: 'hero', fieldKey: 'headline', value: 'Bodo Desderio', fieldType: 'text' },
    { page: 'home', section: 'hero', fieldKey: 'tagline', value: 'Building companies, communities, and technology that move people forward.', fieldType: 'text' },
    { page: 'home', section: 'hero', fieldKey: 'cta_primary_label', value: "Let's work together", fieldType: 'text' },
    { page: 'home', section: 'hero', fieldKey: 'cta_primary_url', value: '/contact', fieldType: 'text' },
    { page: 'home', section: 'hero', fieldKey: 'cta_secondary_label', value: 'See my work', fieldType: 'text' },
    { page: 'home', section: 'hero', fieldKey: 'cta_secondary_url', value: '/services', fieldType: 'text' },
    { page: 'home', section: 'hero', fieldKey: 'photo', value: '/images/hero/portrait-home.png', fieldType: 'image' },
    { page: 'home', section: 'hero', fieldKey: 'background_image', value: '/images/hero/bg-pattern.svg', fieldType: 'image' },

    // HOME PAGE - STATS BAR
  // HOME PAGE - STATS BAR
    { page: 'home', section: 'stats', fieldKey: 'items', value: JSON.stringify([
      { value: '8', suffix: '+', label: 'Clients served' },
      { value: '5', suffix: '+', label: 'Years building' },
      { value: '1', suffix: '', label: 'Company founded' },
      { value: '2', suffix: 'yrs', label: 'AYC President' },
      { value: '3', suffix: '+', label: 'Countries reached' },
    ]), fieldType: 'json' },

    // HOME PAGE - ABOUT SNIPPET
    { page: 'home', section: 'about', fieldKey: 'pretitle', value: 'About Bodo', fieldType: 'text' },
    { page: 'home', section: 'about', fieldKey: 'heading', value: 'More than a developer.', fieldType: 'text' },
    { page: 'home', section: 'about', fieldKey: 'paragraph_1', value: "I'm Bodo Desderio — a Ugandan entrepreneur, software engineer, and community leader building at the intersection of technology, business, and social impact.", fieldType: 'html' },
    { page: 'home', section: 'about', fieldKey: 'paragraph_2', value: "I founded Rooibok Technologies Limited to create software and digital solutions that solve real problems for African businesses and communities. I also serve as a Software Engineer at Kakebe Technologies Limited, where I head the software department.", fieldType: 'html' },
    { page: 'home', section: 'about', fieldKey: 'paragraph_3', value: "From 2023 to 2024, I served as President of the African Youth Congress, Uganda Chapter — organising tech camps, school outreaches, and hackathons that brought technology closer to the next generation.", fieldType: 'html' },
    { page: 'home', section: 'about', fieldKey: 'cta_label', value: 'Read my full story', fieldType: 'text' },
    { page: 'home', section: 'about', fieldKey: 'cta_url', value: '/about', fieldType: 'text' },

    // HOME PAGE - BIO
    { page: 'home', section: 'bio', fieldKey: 'heading', value: 'The story so far.', fieldType: 'text' },
    { page: 'home', section: 'bio', fieldKey: 'body', value: `<p>Bodo Desderio is a Ugandan entrepreneur, technologist, writer, and youth leader whose work spans company building, software engineering, and community development. He writes occasionally on <a href="https://medium.com/@bodo_desderio" target="_blank" rel="noopener">Medium</a> about technology, leadership, and the things that matter to him.</p>

<p>He is the Founder and CEO of <strong>Rooibok Technologies Limited</strong>, a technology company focused on building software solutions, digital products, and tech infrastructure for businesses across Africa. Rooibok sits at the heart of his entrepreneurial vision — a belief that African founders should be building the tools that serve African markets, not waiting for them to arrive from elsewhere.</p>

<p>In his engineering career, Bodo heads the Software Department at <strong>Kakebe Technologies Limited</strong>, where he leads a team of developers building scalable digital products. His technical depth spans full-stack web development, mobile applications, SEO strategy, and system architecture — but he is quick to say that technology is the means, not the mission.</p>

<p>Between 2023 and 2024, Bodo served as President of the <strong>African Youth Congress, Uganda Chapter</strong> — one of the continent's most active youth-led networks. During his tenure he championed STEM education, organised tech camps, led school outreaches across Uganda, and mentored young people entering the technology industry. He also founded <strong>"For Us"</strong>, a mental health support platform for young Ugandans, and has been an active participant in the <strong>MentorMe360</strong> mentorship initiative.</p>

<p>Away from the keyboard, Bodo is a voracious reader — self-help, educational texts, novels — always hungry to learn something new. He has a deep fascination with space and the cosmos: satellites, planets, galaxies, black holes, relativity, the speed of light, and the tantalising question of whether faster-than-light travel will ever leave the pages of science fiction. He is equally drawn to the philosophical questions that keep humanity up at night — free will, why humans behave the way we do, and whether we are alone in the universe. These aren't idle curiosities; they shape how he thinks about building, about purpose, and about the kind of future worth engineering.</p>

<p>He studied at Kampala International University and is based in Kampala, Uganda.</p>`, fieldType: 'html' },
    { page: 'home', section: 'bio', fieldKey: 'pullquote', value: 'Technology is the means, not the mission.', fieldType: 'text' },
    { page: 'home', section: 'bio', fieldKey: 'roles', value: JSON.stringify([
      { title: 'Founder & CEO', org: 'Rooibok Technologies Limited', period: 'Present' },
      { title: 'Software Engineer & Head of Software', org: 'Kakebe Technologies Limited', period: 'Present' },
      { title: 'President', org: 'African Youth Congress — Uganda Chapter', period: '2023 – 2024' },
      { title: 'Writer', org: 'Medium (@bodo_desderio)', period: 'Ongoing' },
    ]), fieldType: 'json' },

    // HOME PAGE - EXPERTISE
    { page: 'home', section: 'expertise', fieldKey: 'pretitle', value: 'What I do', fieldType: 'text' },
    { page: 'home', section: 'expertise', fieldKey: 'heading', value: 'How I create value.', fieldType: 'text' },
    { page: 'home', section: 'expertise', fieldKey: 'lead', value: 'I build across disciplines — from founding and running companies, to engineering software, to leading communities. Here\'s where I focus my energy.', fieldType: 'text' },
    { page: 'home', section: 'expertise', fieldKey: 'cta_label', value: 'View all services', fieldType: 'text' },

    // HOME PAGE - COMMUNITY
    { page: 'home', section: 'community', fieldKey: 'pretitle', value: 'Community', fieldType: 'text' },
    { page: 'home', section: 'community', fieldKey: 'heading', value: 'Building Uganda\'s tech generation.', fieldType: 'text' },
    { page: 'home', section: 'community', fieldKey: 'body', value: 'As President of the African Youth Congress Uganda Chapter, I ran tech camps, school outreaches, and hackathons across the country. I believe the most powerful thing you can build isn\'t a product — it\'s the people around you.', fieldType: 'text' },
    { page: 'home', section: 'community', fieldKey: 'cta_label', value: 'See the gallery', fieldType: 'text' },
    { page: 'home', section: 'community', fieldKey: 'cta_url', value: '/gallery', fieldType: 'text' },

    // HOME PAGE - PROCESS
    { page: 'home', section: 'process', fieldKey: 'pretitle', value: 'How I work', fieldType: 'text' },
    { page: 'home', section: 'process', fieldKey: 'heading', value: 'From idea to impact.', fieldType: 'text' },
    { page: 'home', section: 'process', fieldKey: 'steps', value: JSON.stringify([
      { icon: 'search', title: 'Understand', desc: 'I start by deeply understanding the problem, the people it affects, and what success actually looks like.' },
      { icon: 'map', title: 'Strategise', desc: 'I build a clear plan — whether that\'s a product roadmap, a business model, or a community programme.' },
      { icon: 'code', title: 'Build', desc: 'I execute with precision. Fast, iterative, and always focused on outcomes over output.' },
      { icon: 'trending-up', title: 'Sustain', desc: 'I don\'t just deliver and disappear. I help systems, teams, and businesses grow after launch.' },
    ]), fieldType: 'json' },

    // HOME PAGE - CLIENTS
    { page: 'home', section: 'clients', fieldKey: 'pretitle', value: 'Partners & clients', fieldType: 'text' },
    { page: 'home', section: 'clients', fieldKey: 'heading', value: 'Organisations I\'ve built with and for.', fieldType: 'text' },
    { page: 'home', section: 'clients', fieldKey: 'lead', value: 'From youth-led startups to established universities — every partnership has shaped how I think about technology and its role in society.', fieldType: 'text' },

    // HOME PAGE - CTA BANNER
    { page: 'home', section: 'cta', fieldKey: 'heading', value: "Let's build something that matters.", fieldType: 'text' },
    { page: 'home', section: 'cta', fieldKey: 'lead', value: 'Whether you need a technology partner, a strategic consultant, or a collaborator on something bigger — I\'m open to conversations that lead somewhere real.', fieldType: 'text' },
    { page: 'home', section: 'cta', fieldKey: 'button_label', value: 'Start a conversation', fieldType: 'text' },
    { page: 'home', section: 'cta', fieldKey: 'button_url', value: '/contact', fieldType: 'text' },

    // HOME PAGE - BLOG
    { page: 'home', section: 'blog', fieldKey: 'pretitle', value: 'Writing', fieldType: 'text' },
    { page: 'home', section: 'blog', fieldKey: 'heading', value: 'Thoughts on tech, business & building in Africa.', fieldType: 'text' },
    { page: 'home', section: 'blog', fieldKey: 'post_count', value: '6', fieldType: 'text' },
    { page: 'home', section: 'blog', fieldKey: 'cta_label', value: 'Read all posts', fieldType: 'text' },

    // HOME PAGE - AVAILABILITY
    { page: 'home', section: 'availability', fieldKey: 'status', value: 'available', fieldType: 'text' },
    { page: 'home', section: 'availability', fieldKey: 'label', value: 'Open to consulting & partnerships', fieldType: 'text' },
    { page: 'home', section: 'availability', fieldKey: 'note', value: 'Based in Kampala, Uganda. Working with clients across East Africa and beyond.', fieldType: 'text' },
    { page: 'home', section: 'availability', fieldKey: 'cta_label', value: 'Get in touch', fieldType: 'text' },
    { page: 'home', section: 'availability', fieldKey: 'cta_url', value: '/contact', fieldType: 'text' },

    // GLOBAL FOOTER
    { page: 'global', section: 'footer', fieldKey: 'about_heading', value: 'About Bodo Desderio', fieldType: 'text' },
    { page: 'global', section: 'footer', fieldKey: 'about_text', value: 'Founder, engineer, and community leader based in Kampala, Uganda. Building technology that moves people forward.', fieldType: 'text' },
    { page: 'global', section: 'footer', fieldKey: 'newsletter_heading', value: 'Stay in the loop', fieldType: 'text' },
    { page: 'global', section: 'footer', fieldKey: 'newsletter_text', value: 'Updates on what I\'m building, thinking, and doing — delivered to your inbox.', fieldType: 'text' },
    { page: 'global', section: 'footer', fieldKey: 'copyright', value: '© {year} Bodo Desderio. All rights reserved.', fieldType: 'text' },

    // About page content is seeded in the dedicated aboutContentRows block below

    // SERVICES PAGE
    { page: 'services', section: 'hero', fieldKey: 'heading', value: 'Services', fieldType: 'text' },
    { page: 'services', section: 'hero', fieldKey: 'subtitle', value: 'Five disciplines, one philosophy — build systems that outlast the hype cycle.', fieldType: 'text' },
    { page: 'services', section: 'hero', fieldKey: 'image', value: '/images/stock/services-hero.svg', fieldType: 'image' },
    { page: 'services', section: 'cta', fieldKey: 'heading', value: 'Ready to start a project?', fieldType: 'text' },
    { page: 'services', section: 'cta', fieldKey: 'lead', value: 'Book a strategy call and we\'ll scope out what a collaboration could look like.', fieldType: 'text' },
    { page: 'services', section: 'cta', fieldKey: 'button_label', value: 'Book a consultation', fieldType: 'text' },
    { page: 'services', section: 'cta', fieldKey: 'button_url', value: 'https://calendly.com/derricklamarh/strategy-consultation-call-with-desderio', fieldType: 'text' },

    // GALLERY PAGE
    { page: 'gallery', section: 'hero', fieldKey: 'heading', value: 'Gallery', fieldType: 'text' },
    { page: 'gallery', section: 'hero', fieldKey: 'subtitle', value: 'Moments from the work — tech camps, community events, and the behind-the-scenes of building in public.', fieldType: 'text' },
    { page: 'gallery', section: 'hero', fieldKey: 'image', value: '/images/stock/gallery-hero.svg', fieldType: 'image' },

    // BLOG PAGE
    { page: 'blog', section: 'hero', fieldKey: 'heading', value: 'Writing', fieldType: 'text' },
    { page: 'blog', section: 'hero', fieldKey: 'subtitle', value: 'Thoughts on tech, business, and building in Africa. No hot takes — just what I\'ve learned along the way.', fieldType: 'text' },
    { page: 'blog', section: 'hero', fieldKey: 'image', value: '/images/stock/blog-hero.svg', fieldType: 'image' },

    // CONTACT PAGE
    { page: 'contact', section: 'hero', fieldKey: 'heading', value: 'Get in touch', fieldType: 'text' },
    { page: 'contact', section: 'hero', fieldKey: 'subtitle', value: 'Whether it\'s a product, a partnership, or just a conversation — I read every message.', fieldType: 'text' },
    { page: 'contact', section: 'hero', fieldKey: 'image', value: '/images/stock/contact-hero.svg', fieldType: 'image' },

    // ─── Privacy Policy ───
    { page: 'privacy', section: 'hero', fieldKey: 'title', value: 'Privacy Policy', fieldType: 'text' },
    { page: 'privacy', section: 'hero', fieldKey: 'updated', value: 'May 2026', fieldType: 'text' },
    { page: 'privacy', section: 'body', fieldKey: 'html', value: `<h2>1. Information We Collect</h2>
<p>When you visit bododesderio.com, we may collect:</p>
<ul>
  <li><strong>Contact form submissions</strong> — your name, email, subject, and message when you reach out through our contact form.</li>
  <li><strong>Newsletter subscriptions</strong> — your email address and optional name when you subscribe to updates.</li>
  <li><strong>Analytics data</strong> — anonymized page views, referrer URLs, and country (derived from request headers). We do not use cookies for analytics, and we hash user agent strings to prevent identification.</li>
</ul>

<h2>2. How We Use Your Information</h2>
<ul>
  <li>To respond to your messages and inquiries.</li>
  <li>To send newsletter updates you've opted into.</li>
  <li>To understand how visitors use the site and improve content.</li>
</ul>

<h2>3. Data Sharing</h2>
<p>We do not sell, trade, or share your personal information with third parties, except:</p>
<ul>
  <li><strong>Email delivery</strong> — we use a self-hosted mail server to send emails. Your email address is processed solely for delivery purposes.</li>
  <li><strong>Legal obligations</strong> — if required by law or court order.</li>
</ul>

<h2>4. Cookies</h2>
<p>This site uses minimal cookies:</p>
<ul>
  <li><strong>Authentication cookie</strong> — used only for the admin panel (not for visitors).</li>
  <li><strong>Theme preference</strong> — stored locally to remember your dark/light mode choice.</li>
  <li><strong>Cookie consent</strong> — stored locally to remember your consent preference.</li>
</ul>
<p>We do not use third-party tracking cookies, advertising cookies, or analytics cookies.</p>

<h2>5. Your Rights</h2>
<p>You have the right to:</p>
<ul>
  <li>Request access to your personal data.</li>
  <li>Request deletion of your data.</li>
  <li>Unsubscribe from the newsletter at any time via the unsubscribe link in every email.</li>
  <li>Opt out of analytics by enabling Do Not Track (DNT) in your browser — we respect it.</li>
</ul>

<h2>6. Data Retention</h2>
<p>Contact messages are retained indefinitely unless you request deletion. Newsletter subscribers can unsubscribe at any time. Analytics data is periodically pruned (older than 90 days).</p>

<h2>7. Contact</h2>
<p>For privacy-related inquiries, contact us at <a href="mailto:hello@bododesderio.com">hello@bododesderio.com</a>.</p>`, fieldType: 'html' },

    // ─── Terms & Conditions ───
    { page: 'terms', section: 'hero', fieldKey: 'title', value: 'Terms & Conditions', fieldType: 'text' },
    { page: 'terms', section: 'hero', fieldKey: 'updated', value: 'May 2026', fieldType: 'text' },
    { page: 'terms', section: 'body', fieldKey: 'html', value: `<h2>1. Acceptance of Terms</h2>
<p>By accessing and using bododesderio.com, you agree to be bound by these terms and conditions. If you do not agree, please do not use this website.</p>

<h2>2. Intellectual Property</h2>
<p>All content on this website — including text, images, design, code, and branding — is the property of Bodo Desderio unless otherwise stated. You may not reproduce, distribute, or create derivative works without prior written permission.</p>

<h2>3. User Content</h2>
<p>When submitting content through the contact form or newsletter signup, you grant us permission to store and process that information as described in our <a href="/privacy">Privacy Policy</a>.</p>

<h2>4. Blog Content</h2>
<p>Blog posts and essays represent personal views and opinions. While we strive for accuracy, we make no guarantees about the completeness or reliability of any content. External links are provided for convenience and do not imply endorsement.</p>

<h2>5. Services</h2>
<p>Information about services provided through this website is for informational purposes. Specific engagement terms will be agreed upon separately through formal contracts or agreements.</p>

<h2>6. Limitation of Liability</h2>
<p>This website is provided "as is" without warranties of any kind. Bodo Desderio shall not be liable for any damages arising from the use or inability to use this website.</p>

<h2>7. Changes to Terms</h2>
<p>We reserve the right to update these terms at any time. Continued use of the website after changes constitutes acceptance of the revised terms.</p>

<h2>8. Governing Law</h2>
<p>These terms are governed by and construed in accordance with the laws of the Republic of Uganda.</p>

<h2>9. Contact</h2>
<p>For questions about these terms, contact us at <a href="mailto:hello@bododesderio.com">hello@bododesderio.com</a>.</p>`, fieldType: 'html' },
  ]

  for (const row of contentRows) {
    await prisma.siteContent.upsert({
      where: { page_section_fieldKey: { page: row.page, section: row.section, fieldKey: row.fieldKey } },
      update: { value: row.value, fieldType: row.fieldType },
      create: row,
    })
  }
  console.log(`  ✓ Upserted ${contentRows.length} site content rows`)

  // ==================== SITE SETTINGS ====================
  console.log('⚙️  Creating site settings...')
  const settingsRows = [
    { key: 'social.facebook', value: 'https://www.facebook.com/bododesderio1/' },
    { key: 'social.twitter', value: 'https://x.com/bodo_desderio/' },
    { key: 'social.instagram', value: 'https://www.instagram.com/bodo_desderio/' },
    { key: 'social.linkedin', value: 'https://www.linkedin.com/in/bododesderio/' },
    { key: 'social.github', value: 'https://github.com/bododesderio/' },
    { key: 'social.medium', value: 'https://medium.com/@bodo_desderio' },
    { key: 'site.name', value: 'Bodo Desderio' },
    { key: 'site.tagline', value: 'Founder. Leader. Builder.' },
    { key: 'site.email', value: 'info@bododesderio.com' },
    { key: 'site.location', value: 'Kampala, Uganda' },
    { key: 'site.calendly_url', value: 'https://calendly.com/derricklamarh/strategy-consultation-call-with-desderio' },
    { key: 'site.resume_url', value: '/docs/bodo-desderio-resume.pdf' },
    { key: 'theme.brand_color', value: '#C9A84C' },
    { key: 'login_background_url', value: '/images/gallery/IMG_5544.jpg' },
    { key: 'login_card_image', value: '/images/hero/portrait-home.png' },
    { key: 'login_heading', value: 'Welcome Back' },
    { key: 'login_subtitle', value: 'Sign in to your admin account' },
    { key: 'login_overlay_title', value: 'Bodo Desderio' },
    { key: 'login_overlay_subtitle', value: 'Building companies, communities, and technology that move people forward.' },
  ]

  for (const row of settingsRows) {
    await prisma.siteSettings.create({ data: row })
  }
  console.log(`  ✓ Created ${settingsRows.length} site settings`)

  // ==================== SERVICES ====================
  console.log('🛠️  Creating services...')
  const services = [
    {
      title: 'Company Building',
      description: 'I help founders and organisations build companies from the ground up — from idea validation to team structure, product strategy, and go-to-market.',
      icon: 'building',
      homeFeatured: true,
      order: 0,
      visible: true,
    },
    {
      title: 'Software Engineering',
      description: 'Full-stack development across web and mobile. I build fast, secure, and scalable applications using modern JavaScript ecosystems.',
      icon: 'code',
      homeFeatured: true,
      order: 1,
      visible: true,
    },
    {
      title: 'SEO & Digital Strategy',
      description: 'End-to-end SEO strategy and digital growth. I\'ve helped organisations across East Africa grow their online presence and organic reach.',
      icon: 'trending-up',
      homeFeatured: true,
      order: 2,
      visible: true,
    },
    {
      title: 'Technical Consulting',
      description: 'Strategic technology guidance for organisations navigating digital transformation — from architecture decisions to team capability building.',
      icon: 'lightbulb',
      homeFeatured: true,
      order: 3,
      visible: true,
    },
    {
      title: 'Community & Programmes',
      description: 'I design and run technology education programmes, workshops, and community events. Built on my experience leading the African Youth Congress Uganda Chapter.',
      icon: 'users',
      homeFeatured: true,
      order: 4,
      visible: true,
    },
  ]

  for (const service of services) {
    await prisma.service.create({ data: service })
  }
  console.log(`  ✓ Created ${services.length} services`)

  // ==================== CLIENTS ====================
  console.log('🤝 Creating clients...')
  const clients = [
    { name: 'Forus Foundation', website: 'https://www.forusfoundation.com', order: 0, visible: true },
    { name: 'Kakebe Technologies Limited', website: 'https://www.kakebe.tech', order: 1, visible: true },
    { name: 'Keri Naturals', website: 'https://www.kerinaturals.com', order: 2, visible: true },
    { name: 'BetterLife International', website: 'https://www.betterlifeint.org', order: 3, visible: true },
    { name: 'Lira University', website: 'https://www.lirauni.ac.ug', order: 4, visible: true },
    { name: 'Jerusalem Heritage School', website: 'http://www.jerusalemheritageschool.ac.ug/', order: 5, visible: true },
    { name: 'Jerusalem Institute Lira', website: 'http://jerusaleminstitutelira.ac.ug/', order: 6, visible: true },
    { name: 'Gloford Limited', website: 'https://www.gloford.com', order: 7, visible: true },
  ]

  for (const client of clients) {
    await prisma.client.create({ data: client })
  }
  console.log(`  ✓ Created ${clients.length} clients`)

  // ==================== MEDIA (CLIENT LOGOS) ====================
  console.log('🖼️  Creating media records...')
  const clientLogos = [
    { filename: 'abetterlife.avif', folder: 'clients', url: '/images/clients/abetterlife.avif' },
    { filename: 'IMG_0959.JPG', folder: 'clients', url: '/images/clients/IMG_0959.JPG' },
    { filename: 'jerusalem-institute.png', folder: 'clients', url: '/images/clients/jerusalem-institute.png' },
    { filename: 'jerusalem.png', folder: 'clients', url: '/images/clients/jerusalem.png' },
    { filename: 'kakebe.jpg', folder: 'clients', url: '/images/clients/kakebe.jpg' },
    { filename: 'keri.png', folder: 'clients', url: '/images/clients/keri.png' },
    { filename: 'lira-university.png', folder: 'clients', url: '/images/clients/lira-university.png' },
    { filename: 'tuy.jpg', folder: 'clients', url: '/images/clients/tuy.jpg' },
  ]

  const mediaMap = new Map<string, string>() // filename -> id

  for (const img of clientLogos) {
    const media = await prisma.media.create({
      data: {
        filename: img.filename,
        url: img.url,
        storageId: `local/${img.folder}/${path.parse(img.filename).name}`,
        type: 'image',
        size: 0,
        altText: img.filename,
        tags: [img.folder],
      },
    })
    mediaMap.set(img.filename, media.id)
  }
  console.log(`  ✓ Created ${clientLogos.length} media records for client logos`)

  // ==================== TESTIMONIALS ====================
  console.log('💬 Creating testimonials...')
  const testimonials = [
    {
      body: "From day one, Desderio understood our ethos of sustainability. His e-commerce solution reflected our brand's purity — intuitive, transparent, and scalable. A partner who aligns technology with values.",
      author: 'Immy Immaculate',
      role: 'Founder',
      company: 'Keri Naturals',
      photoMediaId: mediaMap.get('keri.png'),
      pages: ['home', 'services', 'contact'],
      visible: true,
      order: 0,
    },
    {
      body: 'Your technical expertise elevated our global outreach. He built systems that connected communities across borders, always with a focus on human-centered design. A rare blend of skill and empathy.',
      author: 'Denise Ayebare',
      role: 'Program Lead',
      company: 'BetterLife International',
      photoMediaId: mediaMap.get('abetterlife.avif'),
      pages: ['home', 'about', 'contact'],
      visible: true,
      order: 1,
    },
    {
      body: "Working with Bodo was a game-changer. He didn't just build a platform — he amplified our mission to empower youth. His strategic thinking and attention to detail made our digital presence as dynamic as our community.",
      author: 'Otolo Sedrick',
      role: 'Team Lead',
      company: 'Forus Foundation',
      photoMediaId: mediaMap.get('IMG_0959.JPG'),
      pages: ['home', 'services'],
      visible: true,
      order: 2,
    },
    {
      body: "Desderio's work modernised our institution's digital footprint. He listened to our needs as educators and delivered tools that enhanced learning accessibility.",
      author: 'Director of IT',
      role: 'IT Director',
      company: 'Lira University',
      photoMediaId: null,
      pages: ['home', 'about'],
      visible: true,
      order: 3,
    },
  ]

  for (const t of testimonials) {
    await prisma.testimonial.create({ data: t })
  }
  console.log(`  ✓ Created ${testimonials.length} testimonials`)

  // ==================== BLOG POSTS ====================
  console.log('📚 Creating blog posts...')
  const blogPosts = [
    {
      title: 'Sustainable Web Development: Reducing Digital Carbon Footprints',
      slug: 'sustainable-web-development-reducing-digital-carbon-footprints',
      body: '<p>As developers, we have a responsibility to consider the environmental impact of our digital creations. The internet consumes massive amounts of energy, and every website we build contributes to that footprint.</p><h2>The Scale of the Problem</h2><p>The ICT sector accounts for roughly 2-3% of global carbon emissions — comparable to the airline industry. A single page load on a media-heavy website can generate 1.76g of CO2. Multiply that by millions of users and the numbers become staggering.</p><h2>What Developers Can Do</h2><p>Sustainable web development is not about building less — it is about building smarter. Here are practical steps every developer can take:</p><ul><li><strong>Optimise images and media.</strong> Use modern formats like WebP and AVIF. Implement lazy loading. Serve responsive sizes instead of one-size-fits-all.</li><li><strong>Minimise JavaScript bundles.</strong> Tree-shake unused code. Use code splitting. Consider whether that 200kb library is really necessary.</li><li><strong>Choose green hosting.</strong> Providers like GreenGeeks and Cloudflare run on renewable energy. Your hosting choice matters.</li><li><strong>Cache aggressively.</strong> Every request that hits your server costs energy. CDNs, service workers, and smart caching headers reduce the load.</li></ul><h2>The African Context</h2><p>In markets like Uganda, where many users access the web on lower-end devices over mobile data, sustainable development is not just environmental — it is practical. Lighter, faster websites reach more people. Efficiency is accessibility.</p><p>The web we build today shapes the web that serves the next billion users. Let us make sure it is worth inheriting.</p>',
      excerpt: 'Exploring how sustainable practices in web development can reduce our digital carbon footprint.',
      status: 'published',
      category: 'Green Tech',
      tags: ['sustainability', 'web dev', 'carbon footprint'],
      publishedAt: new Date('2025-01-15'),
    },
    {
      title: 'Responsible AI Development: Balancing Innovation and Ethics',
      slug: 'responsible-ai-development-balancing-innovation-and-ethics',
      body: '<p>Artificial Intelligence is transforming industries at an unprecedented pace. But with great power comes great responsibility — especially in Africa, where AI systems built elsewhere are being deployed without sufficient consideration for local contexts.</p><h2>The Promise</h2><p>AI can revolutionise healthcare diagnostics, improve agricultural yields, and democratise access to education. In East Africa, startups are already using machine learning for crop disease detection and mobile money fraud prevention.</p><h2>The Risks</h2><p>But the risks are equally real:</p><ul><li><strong>Bias in training data.</strong> Models trained on Western datasets can produce dangerously inaccurate results when applied to African populations.</li><li><strong>Privacy concerns.</strong> Many AI applications require vast amounts of personal data. In countries with weak data protection laws, this creates vulnerability.</li><li><strong>Job displacement.</strong> Automation threatens sectors that employ millions across the continent — from call centres to data entry.</li></ul><h2>A Framework for Responsible Development</h2><p>We need AI development that is:</p><ol><li><strong>Locally informed.</strong> Training data should represent the populations it will serve.</li><li><strong>Transparent.</strong> Users should understand when they are interacting with AI and how decisions are being made.</li><li><strong>Accountable.</strong> There must be clear lines of responsibility when AI systems cause harm.</li><li><strong>Inclusive.</strong> The benefits of AI should reach beyond the tech elite to the communities that need them most.</li></ol><p>As African technologists, we have the opportunity to shape AI development in ways that centre our own needs, values, and realities. Let us not cede that opportunity to others.</p>',
      excerpt: 'Examining the ethical considerations that must guide AI development in Africa and beyond.',
      status: 'published',
      category: 'AI Ethics',
      tags: ['AI', 'ethics', 'responsible innovation'],
      publishedAt: new Date('2025-02-10'),
    },
    {
      title: 'Closing the Gender Gap in Computer Science Education',
      slug: 'closing-gender-gap-computer-science-education',
      body: '<p>The technology sector has long struggled with gender diversity. In Uganda and across Africa, we need intentional efforts to bring more women into tech — not as an afterthought, but as a strategic priority.</p><h2>The Numbers</h2><p>Globally, women hold only 25% of computing jobs. In Sub-Saharan Africa, the number is even lower. At Kampala International University, where I studied, the computer science cohort was overwhelmingly male. The few women who enrolled often faced subtle and not-so-subtle discouragement.</p><h2>Root Causes</h2><p>The gap starts long before university:</p><ul><li><strong>Early socialisation.</strong> Girls are often steered away from STEM subjects in secondary school.</li><li><strong>Lack of role models.</strong> When young women cannot see themselves in technology, they are less likely to pursue it.</li><li><strong>Hostile environments.</strong> Even when women enter tech, workplace cultures can push them out.</li></ul><h2>What Works</h2><p>Through my work with the African Youth Congress, I have seen what changes the equation:</p><blockquote><p>"When you put a laptop in front of a 14-year-old girl and show her she can build something real — the spark is immediate. The problem was never ability. It was access."</p></blockquote><p>Mentorship programmes, coding bootcamps designed for women, and visible female tech leaders all make a measurable difference. But the most important thing is <strong>starting early</strong> — normalising technology for girls before society tells them it is not for them.</p><p>The future of African tech depends on unlocking the full talent pool. That means everyone.</p>',
      excerpt: 'Strategies for increasing female participation in computer science and technology fields.',
      status: 'published',
      category: 'STEM Education',
      tags: ['gender gap', 'STEM', 'education'],
      publishedAt: new Date('2025-03-05'),
    },
    {
      title: 'Quantum Computing Breakthroughs and Practical Applications',
      slug: 'quantum-computing-breakthroughs-practical-applications',
      body: '<p>Quantum computing promises to revolutionise everything from cryptography to drug discovery. While still in its early days, the breakthroughs are coming fast — and the implications for technology, business, and society are profound.</p><h2>How Quantum Computing Works</h2><p>Classical computers process information in bits — ones and zeros. Quantum computers use qubits, which can exist in multiple states simultaneously through a phenomenon called superposition. This allows them to process certain types of calculations exponentially faster.</p><h2>Recent Breakthroughs</h2><p>2024 saw several milestones:</p><ul><li><strong>Google\'s Willow chip</strong> demonstrated quantum error correction at scale for the first time.</li><li><strong>IBM\'s 1,000+ qubit processors</strong> are pushing the boundaries of what is computationally feasible.</li><li><strong>Quantum-resistant cryptography standards</strong> were finalised by NIST, preparing the world for a post-quantum security landscape.</li></ul><h2>Practical Applications</h2><p>Where will quantum computing make the biggest impact?</p><ol><li><strong>Drug discovery.</strong> Simulating molecular interactions that would take classical computers thousands of years.</li><li><strong>Financial modelling.</strong> Optimising portfolios and risk assessment in real time.</li><li><strong>Climate science.</strong> Modelling complex climate systems with unprecedented accuracy.</li><li><strong>Logistics.</strong> Solving optimisation problems across supply chains and transportation networks.</li></ol><h2>What It Means for Africa</h2><p>Quantum computing is still largely a first-world conversation, but it does not have to stay that way. African universities and research institutions should be investing now in quantum literacy — not to build quantum hardware, but to be ready to leverage quantum cloud services when they become commercially accessible.</p><p>The question is not whether quantum computing will change the world. It is whether we will be ready when it does.</p>',
      excerpt: 'A look at recent quantum computing advances and what they mean for practical applications.',
      status: 'published',
      category: 'Future Tech',
      tags: ['quantum', 'computing', 'research'],
      publishedAt: new Date('2025-03-28'),
    },
    {
      title: 'Innovative Approaches to Tech Recycling and Circular Economy',
      slug: 'innovative-approaches-tech-recycling-circular-economy',
      body: '<p>Electronic waste is a growing crisis in Africa. With over 50 million tonnes of e-waste generated globally each year, innovative recycling programmes and circular economy models offer a sustainable path forward — and an economic opportunity.</p><h2>The E-Waste Challenge in East Africa</h2><p>Uganda imports thousands of tonnes of electronic devices every year. When they reach end-of-life, most end up in informal dumpsites where they leach toxic materials into soil and groundwater. The formal recycling infrastructure barely exists.</p><h2>Circular Economy Principles</h2><p>A circular economy rethinks the entire lifecycle of technology:</p><ul><li><strong>Design for longevity.</strong> Products should be repairable, upgradeable, and modular.</li><li><strong>Refurbish and reuse.</strong> Before recycling, extend the life of devices through refurbishment programmes.</li><li><strong>Responsible recycling.</strong> When devices truly reach end-of-life, extract valuable materials safely and feed them back into manufacturing.</li></ul><h2>Innovations Worth Watching</h2><p>Several initiatives are making progress:</p><ul><li><strong>Closing the Loop</strong> — a social enterprise that collects scrap phones in Africa and feeds the materials back to European manufacturers.</li><li><strong>Repair cafes</strong> — community spaces where people learn to fix their own electronics, extending device lifespans.</li><li><strong>Urban mining</strong> — extracting precious metals from e-waste, which can be more efficient than traditional mining.</li></ul><p>For African technologists and entrepreneurs, e-waste is not just a problem to solve — it is a market to build. The companies that figure out efficient, local recycling infrastructure will create both environmental and economic value.</p>',
      excerpt: 'How tech recycling and circular economy principles can address e-waste challenges.',
      status: 'published',
      category: 'E-Waste',
      tags: ['e-waste', 'recycling', 'circular economy'],
      publishedAt: new Date('2025-04-12'),
    },
    {
      title: 'How Data Centers Are Transitioning to 100% Renewable Energy',
      slug: 'how-data-centers-transitioning-100-renewable-energy',
      body: '<p>Data centers are the backbone of our digital world, but they consume enormous amounts of electricity. The good news: the industry is making serious strides toward renewable energy, driven by both economics and environmental pressure.</p><h2>The Energy Footprint</h2><p>Data centers consume approximately 1-2% of global electricity — a figure that continues to grow as cloud computing, AI training, and streaming services expand. A single large data centre can consume as much electricity as a small city.</p><h2>The Transition</h2><p>Major tech companies are leading the charge:</p><ul><li><strong>Google</strong> has been carbon-neutral since 2007 and aims to run on 24/7 carbon-free energy by 2030.</li><li><strong>Microsoft</strong> has committed to being carbon-negative by 2030 and removing all historical emissions by 2050.</li><li><strong>Apple</strong> already powers all its facilities — including data centres — with 100% renewable energy.</li></ul><h2>Technologies Driving Change</h2><ol><li><strong>On-site solar and wind.</strong> Many new data centres are built with co-located renewable generation.</li><li><strong>Power Purchase Agreements (PPAs).</strong> Long-term contracts with renewable energy providers guarantee green electricity supply.</li><li><strong>Liquid cooling.</strong> Advanced cooling systems reduce the enormous energy overhead of keeping servers at optimal temperatures.</li><li><strong>AI-optimised operations.</strong> Machine learning is being used to dynamically adjust cooling and workload distribution for maximum efficiency.</li></ol><h2>Implications for Africa</h2><p>As Africa builds out its data centre infrastructure — with new facilities planned in Kenya, Nigeria, and South Africa — there is an opportunity to leapfrog the fossil-fuel-dependent model entirely. Africa has abundant solar and geothermal resources. The continent\'s data centres can be green from day one, if we plan accordingly.</p>',
      excerpt: 'Tracking the data center industry\'s move toward renewable energy sources.',
      status: 'published',
      category: 'Renewable Energy',
      tags: ['data centers', 'renewable energy', 'sustainability'],
      publishedAt: new Date('2025-04-25'),
    },
  ]

  for (const post of blogPosts) {
    await prisma.blogPost.create({
      data: {
        ...post,
        featuredImageUrl: '/images/stock/blog-hero.svg',
        featuredImageAlt: post.title,
      },
    })
  }
  console.log(`  ✓ Created ${blogPosts.length} blog posts`)

  // ==================== GALLERY MEDIA ====================
  console.log('🖼️  Creating gallery media records...')
  const galleryImages = [
    '85d3f15f-bbdb-4a25-bb62-a039a4ce3533.jpg',
    '89324abb-6cdb-4f3b-8506-5295a63108c7.jpg',
    'aa.jpg',
    'dd.jpg',
    'ffg.jpg',
    'IMG_2496.JPG',
    'IMG_5207.jpg',
    'IMG_5544.jpg',
    'IMG_7110.jpg',
    'IMG_7739.jpg',
    'og.jpg',
    'pp.jpg',
    'ss.jpg',
    'tt.JPG',
    'uvybu-i.jpg',
    'x10.jpg',
    'x4.jpg',
    'yxthn.jpg',
  ]

  for (const imgFile of galleryImages) {
    const media = await prisma.media.create({
      data: {
        filename: imgFile,
        url: `/images/gallery/${imgFile}`,
        storageId: `local/gallery/${path.parse(imgFile).name}`,
        type: 'image',
        size: 0,
        altText: `Gallery image: ${imgFile}`,
        tags: ['gallery'],
      },
    })
    mediaMap.set(`gallery_${imgFile}`, media.id)
  }
  console.log(`  ✓ Created ${galleryImages.length} gallery media records`)

  // ==================== GALLERY ITEMS ====================
  console.log('🗺️  Creating gallery items...')
  // Assign categories; based on image names we infer
  const categoryAssignments: Record<string, string> = {
    '85d3f15f-bbdb-4a25-bb62-a039a4ce3533.jpg': 'Tech & Work',
    '89324abb-6cdb-4f3b-8506-5295a63108c7.jpg': 'Personal',
    'aa.jpg': 'Community',
    'dd.jpg': 'Tech & Work',
    'ffg.jpg': 'Community',
    'IMG_2496.JPG': 'Community',
    'IMG_5207.jpg': 'Tech & Work',
    'IMG_5544.jpg': 'Personal',
    'IMG_7110.jpg': 'Community',
    'IMG_7739.jpg': 'Personal',
    'og.jpg': 'Tech & Work',
    'pp.jpg': 'Personal',
    'ss.jpg': 'Community',
    'tt.JPG': 'Tech & Work',
    'uvybu-i.jpg': 'Community',
    'x10.jpg': 'Tech & Work',
    'x4.jpg': 'Personal',
    'yxthn.jpg': 'Community',
  }

  let order = 0
  for (const imgFile of galleryImages) {
    const mediaId = mediaMap.get(`gallery_${imgFile}`)
    if (!mediaId) continue

    await prisma.galleryItem.create({
      data: {
        mediaId,
        caption: null,
        category: categoryAssignments[imgFile] || 'General',
        tags: ['gallery'],
        featured: false,
        order: order++,
      },
    })
  }
  console.log(`  ✓ Created ${galleryImages.length} gallery items`)

  // ==================== HERO IMAGES ====================
  console.log('🖼️ Creating hero images...')
  const heroGalleryImages = galleryImages.slice(0, 5)
  let heroOrder = 0
  for (const imgFile of heroGalleryImages) {
    const mediaId = mediaMap.get(`gallery_${imgFile}`)
    if (!mediaId) continue
    await prisma.heroImage.create({
      data: { mediaId, order: heroOrder++, active: true },
    })
  }
  console.log(`  ✓ Created ${heroGalleryImages.length} hero images`)

  // ==================== PRESS ITEMS ====================
  console.log('📰 Creating press items...')
  const pressItems = [
    {
      type: 'essay',
      title: "Corruption: The Rot That Has Infected Uganda\u2019s Health Sector.",
      description: "Selected contributor to the Virtual National Students\u2019 Anti-Corruption Challenge \u2014 a partnership with the Office of the Auditor General, State House Anti-Corruption Unit, Parliament of Uganda, and German Cooperation (GIZ). The essay explores the systemic corruption plaguing Uganda\u2019s health sector and proposes institutional reforms.",
      source: '@NDCUganda',
      sourceUrl: 'https://x.com/NDCUganda',
      imageUrl: '/images/press/vnsac234-essay.jpg',
      imageAlt: "Essay poster: Corruption \u2014 The Rot That Has Infected Uganda\u2019s Health Sector, by Bodo Desderio, Kampala International University.",
      externalUrl: 'https://x.com/NDCUganda/status/1790297774686191874',
      downloadUrl: '/images/press/vnsac234-essay.jpg',
      date: '2024',
      visible: true,
      order: 0,
    },
    {
      type: 'article',
      title: 'Desderio Bodo Takes Charge as the New President of African Youth Congress \u2014 Ugandan Chapter',
      description: 'Written by Sedrick Otolo: "At just 22, Derrick is a student at KIU pursuing Computer Science with a software engineering specialisation. His passion for technology is evident. Yet, his contributions extend far beyond academia." The article covers Bodo\u2019s appointment as AYC President, his founding of the mental health platform "For Us", and his work with MentorMe360 and Kakebe Technologies.',
      source: 'Sedrick Otolo',
      sourceUrl: 'https://www.sedrickotolo.com',
      imageUrl: 'https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=812,h=384,fit=crop/Yan2rE7P3wUkzKjM/whatsapp-image-2023-11-21-at-14.53.10-m7VMkey318h3GKJO.jpeg',
      imageAlt: 'Bodo Desderio at the African Youth Congress appointment ceremony, November 2023',
      externalUrl: 'https://www.sedrickotolo.com/desderio-new-african-youth-council-president',
      date: 'November 2023',
      visible: true,
      order: 1,
    },
    {
      type: 'article',
      title: 'Writing on Medium',
      description: 'Bodo writes on Medium about governance, mental health, climate action, and the questions that fascinate him. Recent pieces include "When Foreign Interests Trump Ugandan Welfare", "A Journey Through the Mind: Exploring Mental Health", and "Turning Off the Faucet: A Call to Action for Climate Change".',
      source: 'Medium',
      sourceUrl: 'https://medium.com/@bodo_desderio',
      externalUrl: 'https://medium.com/@bodo_desderio',
      date: 'Ongoing',
      visible: true,
      order: 2,
    },
  ]

  for (const item of pressItems) {
    await prisma.pressItem.create({ data: item })
  }
  console.log(`  ✓ Created ${pressItems.length} press items`)

  // ==================== LINK CLIENT LOGOS ====================
  console.log('🔗 Linking client logos to clients...')
  const clientLogoMap: Record<string, string> = {
    'Forus Foundation': 'IMG_0959.JPG',
    'Kakebe Technologies Limited': 'kakebe.jpg',
    'Keri Naturals': 'keri.png',
    'BetterLife International': 'abetterlife.avif',
    'Lira University': 'lira-university.png',
    'Jerusalem Heritage School': 'jerusalem.png',
    'Jerusalem Institute Lira': 'jerusalem-institute.png',
    'Gloford Limited': 'tuy.jpg',
  }
  for (const [clientName, logoFilename] of Object.entries(clientLogoMap)) {
    const logoId = mediaMap.get(logoFilename)
    if (logoId) {
      await prisma.client.updateMany({ where: { name: clientName }, data: { logoMediaId: logoId } })
    }
  }
  console.log('  ✓ Linked client logos')

  // ==================== SUBSCRIBERS ====================
  console.log('📧 Creating subscribers...')
  const subscribers = [
    { email: 'sarah.nakamya@gmail.com', name: 'Sarah Nakamya', confirmed: true, source: 'footer', subscribedAt: new Date('2025-02-12') },
    { email: 'james.otim@outlook.com', name: 'James Otim', confirmed: true, source: 'footer', subscribedAt: new Date('2025-02-20') },
    { email: 'grace.acan@yahoo.com', name: 'Grace Acan', confirmed: true, source: 'blog', subscribedAt: new Date('2025-03-01') },
    { email: 'peter.ssemakula@gmail.com', name: 'Peter Ssemakula', confirmed: true, source: 'footer', subscribedAt: new Date('2025-03-10') },
    { email: 'rachel.kwagala@protonmail.com', name: 'Rachel Kwagala', confirmed: true, source: 'contact', subscribedAt: new Date('2025-03-18') },
    { email: 'david.ochieng@gmail.com', name: 'David Ochieng', confirmed: true, source: 'footer', subscribedAt: new Date('2025-03-25') },
    { email: 'miriam.atim@hotmail.com', name: 'Miriam Atim', confirmed: true, source: 'blog', subscribedAt: new Date('2025-04-02') },
    { email: 'joseph.mugisha@gmail.com', name: 'Joseph Mugisha', confirmed: false, source: 'footer', subscribedAt: new Date('2025-04-10') },
    { email: 'angela.nassali@gmail.com', name: 'Angela Nassali', confirmed: true, source: 'footer', subscribedAt: new Date('2025-04-15') },
    { email: 'mark.tumwine@icloud.com', name: 'Mark Tumwine', confirmed: true, source: 'blog', subscribedAt: new Date('2025-04-20') },
  ]
  for (const sub of subscribers) {
    await prisma.subscriber.create({ data: sub })
  }
  console.log(`  ✓ Created ${subscribers.length} subscribers`)

  // ==================== MESSAGES ====================
  console.log('💌 Creating messages...')
  const messages = [
    {
      name: 'Harriet Auma',
      email: 'harriet.auma@forusfoundation.com',
      subject: 'Partnership opportunity — youth digital literacy',
      body: 'Hi Bodo,\n\nI lead the digital programmes team at Forus Foundation. We have been following your work with the African Youth Congress and the tech camps you ran last year.\n\nWe are planning a digital literacy initiative across Northern Uganda and would love to explore a partnership. The programme would run for 6 months starting in July and would involve building an LMS platform plus on-the-ground training workshops.\n\nWould you be open to a call next week to discuss?\n\nBest regards,\nHarriet',
      read: false,
      archived: false,
      receivedAt: new Date('2025-04-23T10:30:00'),
    },
    {
      name: 'Samuel Kiprotich',
      email: 'skiprotich@lirauni.ac.ug',
      subject: 'Guest lecture invitation — Computer Science Department',
      body: 'Dear Mr. Desderio,\n\nI am writing on behalf of the Computer Science Department at Lira University. We would be honoured to have you deliver a guest lecture to our final-year students on the topic of "Building Technology Companies in East Africa."\n\nThe proposed date is May 15th, 2025, and the session would be approximately 90 minutes with Q&A.\n\nPlease let me know if you would be available.\n\nKind regards,\nSamuel Kiprotich\nHead of Department, Computer Science',
      read: false,
      archived: false,
      receivedAt: new Date('2025-04-22T14:15:00'),
    },
    {
      name: 'Monica Nanyonga',
      email: 'monica.n@kerinaturals.com',
      subject: 'Website performance report request',
      body: 'Hi Bodo,\n\nHope you are doing well. The Keri Naturals e-commerce site has been performing brilliantly since your last round of updates — sales through the website have increased by 40% this quarter.\n\nWe would like to commission a performance audit and discuss adding a wholesale portal for our B2B customers. Could you send over a proposal?\n\nThanks,\nMonica',
      read: true,
      archived: false,
      receivedAt: new Date('2025-04-20T09:00:00'),
    },
    {
      name: 'Emmanuel Draku',
      email: 'edraku@startupug.org',
      subject: 'Speaking slot at Startup Uganda Summit 2025',
      body: 'Hi Bodo,\n\nWe are organising the Startup Uganda Summit 2025 and would love to have you as a speaker on the "Technology for Social Impact" panel.\n\nThe event is scheduled for June 12-13 at the Kampala Serena Hotel. We can cover travel and accommodation. The panel would be 45 minutes with three other founders.\n\nLet me know your thoughts!\n\nEmmanuel Draku\nExecutive Director, Startup Uganda',
      read: false,
      archived: false,
      receivedAt: new Date('2025-04-18T16:45:00'),
    },
    {
      name: 'Aisha Nakato',
      email: 'aisha.nakato@gmail.com',
      subject: 'Mentorship request — aspiring developer',
      body: 'Dear Bodo,\n\nMy name is Aisha and I am a second-year Computer Science student at Makerere University. I read your Medium articles on responsible AI development and they really inspired me.\n\nI am building my first web application and struggling with choosing the right tech stack. Would you be willing to offer some guidance? Even a 15-minute call would mean the world to me.\n\nThank you for everything you do for young developers in Uganda.\n\nAisha',
      read: true,
      archived: false,
      receivedAt: new Date('2025-04-15T11:20:00'),
    },
  ]
  for (const msg of messages) {
    await prisma.message.create({ data: msg })
  }
  console.log(`  ✓ Created ${messages.length} messages`)

  // ==================== NEWSLETTER CAMPAIGNS ====================
  console.log('📰 Creating newsletter campaigns...')
  const campaigns = [
    {
      subject: 'Building in Public — Q1 2025 Update',
      bodyHtml: '<h2>What I\'ve been building</h2><p>The first quarter of 2025 has been intense. Rooibok Technologies launched two new client projects, and I\'ve been deep in the weeds of Next.js, Prisma, and building resilient systems for East African markets.</p><h3>Highlights</h3><ul><li><strong>Keri Naturals e-commerce rebuild</strong> — 40% increase in online sales since launch</li><li><strong>Lira University digital platform</strong> — now serving 2,000+ students</li><li><strong>Three new blog posts</strong> on sustainable web development, AI ethics, and the gender gap in CS education</li></ul><h3>What\'s next</h3><p>Q2 is shaping up to be about community. I\'m planning a series of tech workshops in Northern Uganda with Forus Foundation, and there are some exciting partnership conversations happening that I\'ll share more about soon.</p><p>As always, if you\'re building something meaningful and need a thought partner — my inbox is open.</p><p>— Bodo</p>',
      status: 'sent',
      sentAt: new Date('2025-04-01'),
      recipientCount: 8,
    },
    {
      subject: 'New essay: Corruption in Uganda\'s Health Sector',
      bodyHtml: '<p>I was selected as a contributor to the Virtual National Students\' Anti-Corruption Challenge — a partnership with the Office of the Auditor General, Parliament of Uganda, and German Cooperation (GIZ).</p><p>The essay examines systemic corruption in Uganda\'s health sector and proposes institutional reforms. It was a deeply personal piece to write.</p><p><a href="/blog/responsible-ai-development-balancing-innovation-and-ethics">Read the full piece on my blog</a></p><p>I\'d love to hear your thoughts.</p><p>— Bodo</p>',
      status: 'sent',
      sentAt: new Date('2025-02-15'),
      recipientCount: 5,
    },
  ]
  for (const campaign of campaigns) {
    await prisma.newsletterCampaign.create({ data: campaign })
  }
  console.log(`  ✓ Created ${campaigns.length} newsletter campaigns`)

  // ==================== ADMIN USER ====================
  console.log('🔐 Creating admin user...')
  await prisma.adminUser.create({
    data: {
      email: adminEmail,
      passwordHash: adminPasswordHash,
    },
  })
  await prisma.appConfig.createMany({
    data: [
      { key: 'ADMIN_EMAIL', value: adminEmail },
      { key: 'ADMIN_PASSWORD_HASH', value: adminPasswordHash },
    ],
    skipDuplicates: true,
  })
  console.log('  ✓ Created admin user record')

  // ==================== ABOUT PAGE CONTENT ====================
  console.log('📄 Creating about page content...')
  const aboutContentRows = [
    { page: 'about', section: 'hero', fieldKey: 'heading', value: 'About Bodo', fieldType: 'text' },
    { page: 'about', section: 'hero', fieldKey: 'subtitle', value: 'Founder. Engineer. Community Builder.', fieldType: 'text' },
    { page: 'about', section: 'hero', fieldKey: 'image', value: '/images/hero/portrait-about.png', fieldType: 'image' },
    { page: 'about', section: 'mission', fieldKey: 'statement', value: 'Technology is the means, not the mission — the mission is people.', fieldType: 'text' },
    {
      page: 'about',
      section: 'story',
      fieldKey: 'items',
      fieldType: 'json',
      value: JSON.stringify([
        { year: 'Early years', title: 'A curiosity that wouldn\'t sit still', organization: 'Childhood', description: 'Long before I ever wrote a line of code, I was the kid buried in books — self-help, science, novels, anything that promised a new way of seeing the world. I had questions that wouldn\'t leave me alone: Why do we behave the way we do? Are we alone out here? What happens at the edge of a black hole? That restless hunger to understand things became the thread that connects everything I\'ve done since.', icon: 'calendar' },
        { year: '2018', title: 'Finding my lane at university', organization: 'Kampala International University', description: 'I enrolled at KIU to study computer science and business, and something clicked. For the first time, engineering and entrepreneurship stopped feeling like separate worlds. University wasn\'t just coursework — it was where the seed was planted that technology built by Africans could genuinely serve African markets.', icon: 'calendar' },
        { year: '2021', title: 'Becoming a software engineer', organization: 'Kakebe Technologies Limited', description: 'I joined Kakebe as a full-stack developer and quickly fell in love with the craft of building real products for real people. Before long I was leading the software department — managing a team, shipping digital products across East Africa, and learning that the hardest problems are never purely technical.', icon: 'briefcase' },
        { year: '2023', title: 'Leading a youth movement', organization: 'African Youth Congress — Uganda Chapter', description: 'Being elected president of the AYC Uganda Chapter changed me. I organised tech camps, ran school outreaches, and pulled together hackathons that brought technology within reach of young people who\'d never had the chance. It taught me that the most powerful thing you can build isn\'t a product — it\'s the people around you.', icon: 'award' },
        { year: '2024', title: 'A voice against corruption', organization: 'National Debate Council Uganda \u00b7 VNSAC234', description: 'I was selected to contribute to the Virtual National Students\' Anti-Corruption Challenge — a collaboration with the Auditor General, Parliament, and GIZ. Writing about the rot in Uganda\'s health sector felt personal. It reminded me why I build: not for the sake of technology, but for the sake of the people it should protect.', icon: 'award' },
        { year: '2024', title: 'Starting my own company', organization: 'Rooibok Technologies Limited', description: 'Founding Rooibok was the moment years of thinking and building crystallised into something of my own. The company exists to create software, digital products, and tech infrastructure for African businesses — born from a simple conviction that we should be building the tools that serve our own markets, not waiting for someone else to do it.', icon: 'briefcase' },
        { year: 'Present', title: 'Writing, wondering, building', organization: 'medium.com/@bodo_desderio', description: 'These days I split my time between running Rooibok, engineering at Kakebe, and writing on Medium about the things that keep me curious — technology, leadership, space, philosophy, and the question of what kind of future is actually worth building.', icon: 'calendar' },
      ]),
    },
    {
      page: 'about',
      section: 'values',
      fieldKey: 'items',
      fieldType: 'json',
      value: JSON.stringify([
        { title: 'People First', description: 'Every product, programme, and decision starts with the people it will affect. Technology serves people — not the other way around.', icon: 'heart' },
        { title: 'Build to Last', description: 'I build systems, teams, and organisations that outlast any single project. Sustainability and scalability are non-negotiable.', icon: 'lightbulb' },
        { title: 'Community as Infrastructure', description: 'The strongest foundation for any technology ecosystem is the community around it. I invest in people as much as in products.', icon: 'users' },
      ]),
    },
    {
      page: 'about',
      section: 'why',
      fieldKey: 'items',
      fieldType: 'json',
      value: JSON.stringify([
        { title: 'Multi-disciplinary thinking', description: 'I bring founder, engineer, and community leader perspectives to every engagement — not just technical execution.' },
        { title: 'African market expertise', description: 'I understand the nuances of building for African markets — the constraints, the opportunities, and the people.' },
        { title: 'Proven track record', description: 'From founding a company to leading a continent-wide youth organisation, I deliver results at scale.' },
        { title: 'Long-term partnership mindset', description: "I don't just deliver and disappear. I invest in the success of every client and collaborator I work with." },
      ]),
    },
    {
      page: 'about',
      section: 'faq',
      fieldKey: 'items',
      fieldType: 'json',
      value: JSON.stringify([
        { question: 'What kind of work does Bodo usually take on?', answer: 'Most engagements sit somewhere between product thinking, software delivery, and strategic problem-solving. That can mean building a digital product, shaping a technical roadmap, advising a founder, or helping a team move from scattered ideas to a clearer system.' },
        { question: 'Is he only available for software engineering work?', answer: 'No. Engineering is a big part of the work, but not the whole thing. Bodo also works on company building, technical consulting, digital strategy, and initiatives that combine technology with education, community, or public-interest work.' },
        { question: 'Does he work with organisations outside Uganda?', answer: 'Yes. He is based in Kampala, but collaborates with teams across East Africa and beyond. The work is shaped by African contexts first, while still being comfortable in cross-border product and partnership environments.' },
        { question: 'What is it like to work with him?', answer: 'Direct, thoughtful, and outcome-focused. Bodo tends to work best with people who value clarity, momentum, and honest collaboration. The goal is not just to ship something quickly, but to leave the work stronger, clearer, and more sustainable than it was before.' },
        { question: 'How do I get started?', answer: 'Head to the contact page and send a message. Describe what you are working on, what kind of help you need, and any timeline constraints. Bodo reads every message personally and will respond if there is a fit.' },
      ]),
    },
    { page: 'about', section: 'cta', fieldKey: 'heading', value: "Let's build something that matters.", fieldType: 'text' },
    { page: 'about', section: 'cta', fieldKey: 'lead', value: "Whether you need a technology partner, a strategic consultant, or a collaborator on something bigger — I'm open to conversations that lead somewhere real.", fieldType: 'text' },
    { page: 'about', section: 'cta', fieldKey: 'button_label', value: 'Start a conversation', fieldType: 'text' },
    { page: 'about', section: 'cta', fieldKey: 'button_url', value: '/contact', fieldType: 'text' },
  ]

  for (const row of aboutContentRows) {
    await prisma.siteContent.upsert({
      where: { page_section_fieldKey: { page: row.page, section: row.section, fieldKey: row.fieldKey } },
      update: { value: row.value, fieldType: row.fieldType },
      create: row,
    })
  }
  console.log(`  ✓ Upserted ${aboutContentRows.length} about page content rows`)

  // ==================== SEO SETTINGS ====================
  console.log('🔍 Creating SEO settings...')
  const seoRows = [
    {
      page: 'home',
      metaTitle: 'Bodo Desderio — Founder, Engineer & Community Leader | Kampala, Uganda',
      metaDesc: 'Bodo Desderio is a Ugandan entrepreneur, software engineer, and community leader. Founder & CEO of Rooibok Technologies. Former President, African Youth Congress Uganda.',
    },
    {
      page: 'about',
      metaTitle: 'About Bodo Desderio — Story, Values & Career',
      metaDesc: 'The story behind Bodo Desderio — Ugandan founder, software engineer, and former President of the African Youth Congress Uganda Chapter. Values, milestones, and the why behind the work.',
    },
    {
      page: 'services',
      metaTitle: 'Services — Bodo Desderio | Software, Strategy & Company Building',
      metaDesc: 'Services offered by Bodo Desderio: software engineering, SEO & digital strategy, technical consulting, company building, and community programmes. Based in Kampala, working across Africa.',
    },
    {
      page: 'gallery',
      metaTitle: 'Gallery — Bodo Desderio | Tech Camps, Community & Projects',
      metaDesc: 'Photos from tech camps, community events, school outreaches, and projects led by Bodo Desderio across Uganda and East Africa.',
    },
    {
      page: 'blog',
      metaTitle: 'Writing — Bodo Desderio | Tech, Business & Africa',
      metaDesc: 'Essays and articles on technology, entrepreneurship, and building in Africa by Bodo Desderio — founder, engineer, and community leader from Kampala.',
    },
    {
      page: 'contact',
      metaTitle: 'Contact Bodo Desderio — Start a Conversation',
      metaDesc: 'Get in touch with Bodo Desderio — founder, software engineer, and community builder in Kampala, Uganda. Open to consulting, partnerships, and speaking engagements.',
    },
  ]

  for (const seo of seoRows) {
    await prisma.seoSettings.create({ data: seo })
  }
  console.log(`  ✓ Created ${seoRows.length} SEO settings`)

  // ==================== BANNERS ====================
  console.log('🚩 Creating banners...')

  await prisma.banner.create({
    data: {
      name: 'Cookie Consent',
      kind: 'cookie',
      placement: 'bottom',
      title: null,
      body: 'This site uses minimal cookies for authentication and theme preferences. No tracking or advertising cookies.',
      ctaLabel: null,
      ctaUrl: null,
      ctaVariant: 'primary',
      dismissable: true,
      requireConsent: true,
      theme: 'auto',
      enabled: true,
      priority: 100,
      pagesInclude: [],
      pagesExclude: [],
      devices: [],
      showOnce: true,
      cooldownHours: 0,
      delaySeconds: 2,
      scrollTrigger: null,
      exitIntent: false,
      newsletterHook: false,
    },
  })
  console.log('  ✓ Created cookie consent banner')

  // ─── Projects ────────────────────────────────────
  console.log('🚀 Creating projects...')
  const projects = [
    {
      title: 'Rooibok Technologies',
      slug: 'rooibok-technologies',
      excerpt: 'Building digital solutions for businesses across Africa — web apps, mobile apps, and cloud infrastructure.',
      body: '<p>Rooibok Technologies is a full-service software company focused on delivering high-quality digital products for the African market.</p><p>We specialize in web and mobile application development, cloud infrastructure, and digital transformation consulting.</p>',
      status: 'in_progress',
      category: 'Company',
      techStack: ['Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS'],
      liveUrl: 'https://rooibok.com',
      ongoing: true,
      startDate: new Date('2023-01-01'),
      visible: true,
      featured: true,
      order: 0,
    },
    {
      title: 'Kakebe Technologies',
      slug: 'kakebe-technologies',
      excerpt: 'A technology company leveraging AI and data to solve real-world problems in agriculture, education, and healthcare.',
      body: '<p>Kakebe Technologies builds innovative solutions using artificial intelligence and data analytics to address challenges in key sectors across Uganda and East Africa.</p>',
      status: 'in_progress',
      category: 'Company',
      techStack: ['Python', 'React', 'TensorFlow', 'FastAPI', 'Docker'],
      liveUrl: 'https://www.kakebe.tech',
      ongoing: true,
      startDate: new Date('2022-06-01'),
      visible: true,
      featured: true,
      order: 1,
    },
    {
      title: 'Portfolio Website',
      slug: 'portfolio-website',
      excerpt: 'This very website — a full-stack Next.js portfolio with a custom CMS, newsletter system, and analytics.',
      body: '<p>A comprehensive portfolio and blog platform built from scratch with Next.js 16, Prisma, PostgreSQL, and Tailwind CSS.</p><p>Features include a custom admin panel with media management, blog editor with CKEditor, newsletter campaigns with tracking, banner management, and built-in analytics.</p>',
      status: 'completed',
      category: 'Web App',
      techStack: ['Next.js', 'TypeScript', 'Prisma', 'PostgreSQL', 'Tailwind CSS', 'Redis'],
      ongoing: false,
      startDate: new Date('2024-12-01'),
      endDate: new Date('2025-03-01'),
      visible: true,
      featured: false,
      order: 2,
    },
    {
      title: 'Community Platform',
      slug: 'community-platform',
      excerpt: 'A platform connecting African youth with mentorship, resources, and collaboration opportunities.',
      body: '<p>An upcoming community platform designed to connect young professionals and entrepreneurs across Africa with mentors, funding opportunities, and collaborative workspaces.</p>',
      status: 'planned',
      category: 'Web App',
      techStack: ['Next.js', 'tRPC', 'Prisma', 'Tailwind CSS'],
      ongoing: false,
      visible: true,
      featured: false,
      order: 3,
    },
  ]

  for (const project of projects) {
    await prisma.project.upsert({ where: { slug: project.slug }, update: project, create: project })
  }
  console.log(`  ✓ Created ${projects.length} projects`)

  console.log('✅ Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
