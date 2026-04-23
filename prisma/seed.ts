import { PrismaClient } from '@prisma/client'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Clear existing data (in reverse order due to dependencies)
  console.log('🗑️  Clearing existing data...')
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
  await prisma.adminUser.deleteMany()

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

    // ABOUT PAGE
    { page: 'about', section: 'hero', fieldKey: 'heading', value: 'About', fieldType: 'text' },
    { page: 'about', section: 'hero', fieldKey: 'subtitle', value: 'The story behind the work — where I come from, what drives me, and who I build with.', fieldType: 'text' },
    { page: 'about', section: 'hero', fieldKey: 'image', value: '/images/hero/portrait-about.png', fieldType: 'image' },
    { page: 'about', section: 'mission', fieldKey: 'statement', value: 'I build technology that moves people forward — companies, communities, and careers rooted in Africa and reaching beyond.', fieldType: 'text' },
    { page: 'about', section: 'story', fieldKey: 'items', value: JSON.stringify([
      { year: 'Early years', title: 'A curiosity that wouldn\'t sit still', organization: 'Childhood', description: 'Long before I ever wrote a line of code, I was the kid buried in books — self-help, science, novels, anything that promised a new way of seeing the world. I had questions that wouldn\'t leave me alone: Why do we behave the way we do? Are we alone out here? What happens at the edge of a black hole? That restless hunger to understand things became the thread that connects everything I\'ve done since.', icon: 'calendar' },
      { year: '2018', title: 'Finding my lane at university', organization: 'Kampala International University', description: 'I enrolled at KIU to study computer science and business, and something clicked. For the first time, engineering and entrepreneurship stopped feeling like separate worlds. University wasn\'t just coursework — it was where the seed was planted that technology built by Africans could genuinely serve African markets.', icon: 'calendar' },
      { year: '2021', title: 'Becoming a software engineer', organization: 'Kakebe Technologies Limited', description: 'I joined Kakebe as a full-stack developer and quickly fell in love with the craft of building real products for real people. Before long I was leading the software department — managing a team, shipping digital products across East Africa, and learning that the hardest problems are never purely technical.', icon: 'briefcase' },
      { year: '2023', title: 'Leading a youth movement', organization: 'African Youth Congress — Uganda Chapter', description: 'Being elected president of the AYC Uganda Chapter changed me. I organised tech camps, ran school outreaches, and pulled together hackathons that brought technology within reach of young people who\'d never had the chance. It taught me that the most powerful thing you can build isn\'t a product — it\'s the people around you.', icon: 'award' },
      { year: '2024', title: 'A voice against corruption', organization: 'National Debate Council Uganda \u00b7 VNSAC234', description: 'I was selected to contribute to the Virtual National Students\' Anti-Corruption Challenge — a collaboration with the Auditor General, Parliament, and GIZ. Writing about the rot in Uganda\'s health sector felt personal. It reminded me why I build: not for the sake of technology, but for the sake of the people it should protect.', icon: 'award' },
      { year: '2024', title: 'Starting my own company', organization: 'Rooibok Technologies Limited', description: 'Founding Rooibok was the moment years of thinking and building crystallised into something of my own. The company exists to create software, digital products, and tech infrastructure for African businesses — born from a simple conviction that we should be building the tools that serve our own markets, not waiting for someone else to do it.', icon: 'briefcase' },
      { year: 'Present', title: 'Writing, wondering, building', organization: 'medium.com/@bodo_desderio', description: 'These days I split my time between running Rooibok, engineering at Kakebe, and writing on Medium about the things that keep me curious — technology, leadership, space, philosophy, and the question of what kind of future is actually worth building.', icon: 'calendar' },
    ]), fieldType: 'json' },
    { page: 'about', section: 'values', fieldKey: 'items', value: JSON.stringify([
      { title: 'Build with purpose', description: 'Technology is a means, not the mission. Every project I take on has to serve someone, solve something, or move something forward.', icon: 'heart' },
      { title: 'Prefer clarity over complexity', description: 'The best systems — and teams — are the ones you can actually understand. Simplicity is a discipline, not a shortcut.', icon: 'lightbulb' },
      { title: 'Invest in people', description: 'The most powerful thing you can build isn\'t a product — it\'s the people around you. Mentor, teach, hire well, stay loyal.', icon: 'users' },
    ]), fieldType: 'json' },
    { page: 'about', section: 'why', fieldKey: 'items', value: JSON.stringify([
      { title: 'Technical depth, business fluency', description: 'I speak both engineer and founder — which means I can translate between them when things get hard.' },
      { title: 'Built across Africa', description: 'Every project I\'ve shipped was built for African contexts first. I understand the constraints, infrastructure, and user behaviours others miss.' },
      { title: 'Focused on outcomes', description: 'I don\'t ship features — I ship results. Every engagement is measured against the problem it was hired to solve.' },
      { title: 'Long-term collaboration', description: 'I\'m not a contractor looking for the next gig. The clients I work with tend to stay for years.' },
    ]), fieldType: 'json' },
    { page: 'about', section: 'cta', fieldKey: 'heading', value: 'Want to build something together?', fieldType: 'text' },
    { page: 'about', section: 'cta', fieldKey: 'lead', value: 'I\'m always open to conversations about meaningful work — whether that\'s a product, a programme, or a partnership.', fieldType: 'text' },
    { page: 'about', section: 'cta', fieldKey: 'button_label', value: 'Start a conversation', fieldType: 'text' },
    { page: 'about', section: 'cta', fieldKey: 'button_url', value: '/contact', fieldType: 'text' },

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
    { key: 'theme.brand_color', value: '#C9A84C' },
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
    { name: 'Keri Naturals', website: 'https://www.kerinaturals.com', order: 7, visible: true },
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
        cloudinaryId: `local/${img.folder}/${path.parse(img.filename).name}`,
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
      body: '<p>As developers, we have a responsibility to consider the environmental impact of our digital creations. The internet consumes massive amounts of energy...</p>',
      excerpt: 'Exploring how sustainable practices in web development can reduce our digital carbon footprint.',
      status: 'published',
      category: 'Green Tech',
      tags: ['sustainability', 'web dev', 'carbon footprint'],
      publishedAt: new Date('2025-01-15'),
    },
    {
      title: 'Responsible AI Development: Balancing Innovation and Ethics',
      slug: 'responsible-ai-development-balancing-innovation-and-ethics',
      body: '<p>Artificial Intelligence is transforming industries at an unprecedented pace. But with great power comes great responsibility...</p>',
      excerpt: 'Examining the ethical considerations that must guide AI development in Africa and beyond.',
      status: 'published',
      category: 'AI Ethics',
      tags: ['AI', 'ethics', 'responsible innovation'],
      publishedAt: new Date('2025-02-10'),
    },
    {
      title: 'Closing the Gender Gap in Computer Science Education',
      slug: 'closing-gender-gap-computer-science-education',
      body: '<p>The technology sector has long struggled with gender diversity. In Uganda and across Africa, we need intentional efforts to bring more women into tech...</p>',
      excerpt: 'Strategies for increasing female participation in computer science and technology fields.',
      status: 'published',
      category: 'STEM Education',
      tags: ['gender gap', 'STEM', 'education'],
      publishedAt: new Date('2025-03-05'),
    },
    {
      title: 'Quantum Computing Breakthroughs and Practical Applications',
      slug: 'quantum-computing-breakthroughs-practical-applications',
      body: '<p>Quantum computing promises to revolutionise everything from cryptography to drug discovery. While still in its early days, the breakthroughs are coming fast...</p>',
      excerpt: 'A look at recent quantum computing advances and what they mean for practical applications.',
      status: 'published',
      category: 'Future Tech',
      tags: ['quantum', 'computing', 'research'],
      publishedAt: new Date('2025-03-28'),
    },
    {
      title: 'Innovative Approaches to Tech Recycling and Circular Economy',
      slug: 'innovative-approaches-tech-recycling-circular-economy',
      body: '<p>Electronic waste is a growing crisis in Africa. Innovative recycling programs and circular economy models offer a sustainable path forward...</p>',
      excerpt: 'How tech recycling and circular economy principles can address e-waste challenges.',
      status: 'published',
      category: 'E-Waste',
      tags: ['e-waste', 'recycling', 'circular economy'],
      publishedAt: new Date('2025-04-12'),
    },
    {
      title: 'How Data Centers Are Transitioning to 100% Renewable Energy',
      slug: 'how-data-centers-transitioning-100-renewable-energy',
      body: '<p>Data centers are the backbone of our digital world, but they consume enormous amounts of electricity. The industry is making strides toward renewable energy...</p>',
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
        cloudinaryId: `local/gallery/${path.parse(imgFile).name}`,
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

  // ==================== PRESS ITEMS ====================
  console.log('📰 Creating press items...')
  await prisma.pressItem.deleteMany()
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

  // ==================== ADMIN USER ====================
  console.log('🔐 Creating admin user...')
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH
  if (!adminPasswordHash) {
    throw new Error('ADMIN_PASSWORD_HASH is required in .env to seed the admin user')
  }
  await prisma.adminUser.create({
    data: {
      email: process.env.ADMIN_EMAIL || 'info@bododesderio.com',
      passwordHash: adminPasswordHash,
    },
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
