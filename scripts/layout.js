// Shared page chrome: animated backdrop, site header with nav + theme toggle, footer.
// Each page calls initLayout(page) and renders its own content into <main id="main">.

const THEME_KEY = 'theme';

function effectiveTheme() {
    const explicit = document.documentElement.dataset.theme;
    if (explicit) return explicit;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function toggleTheme() {
    const next = effectiveTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* storage unavailable */ }
}

function renderBackdrop() {
    if (document.querySelector('.backdrop')) return;
    const backdrop = document.createElement('div');
    backdrop.className = 'backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    backdrop.innerHTML = `
        <div class="backdrop-blob backdrop-blob-1"></div>
        <div class="backdrop-blob backdrop-blob-2"></div>
        <div class="backdrop-grid"></div>
        <div class="backdrop-grid backdrop-grid-lit"></div>
    `;
    document.body.prepend(backdrop);
}

function renderSiteHeader(main, page, hasPosts) {
    const header = document.getElementById('site-header');
    if (!header) return;
    const links = main.nav
        .filter(item => !item.requiresPosts || hasPosts)
        .map(item => `
            <a class="nav-link${item.page === 'home' ? ' nav-link-home' : ''}" href="${escapeHTML(item.href)}"${item.page === page ? ' aria-current="page"' : ''}>${escapeHTML(item.label)}</a>
        `).join('');
    header.innerHTML = `
        <div class="container header-inner">
            <a class="brand" href="index.html" aria-label="${escapeHTML(main.header.name)}, home">
                <span class="brand-prompt">~/</span><span class="brand-name">${escapeHTML(main.site.brand)}</span><span class="brand-caret" aria-hidden="true"></span>
            </a>
            <nav class="nav" aria-label="Main">${links}</nav>
            <button class="theme-toggle" type="button" aria-label="Toggle light and dark theme">
                ${icon('sun', 'icon icon-sun')}${icon('moon', 'icon icon-moon')}
            </button>
        </div>
    `;
    header.querySelector('.theme-toggle').addEventListener('click', toggleTheme);
}

function renderSiteFooter(main) {
    const footer = document.getElementById('site-footer');
    if (!footer) return;
    const social = [
        { name: 'Email', icon: 'mail', url: `mailto:${main.contact.email}` },
        ...main.contact.social
    ];
    footer.innerHTML = `
        <div class="container footer-inner">
            <div class="footer-text">
                <span>${escapeHTML(main.footer.copyright)}</span>
                <span class="footer-tagline">${escapeHTML(main.footer.tagline)}</span>
            </div>
            <div class="footer-social">
                ${social.map(link => `
                    <a class="icon-link" href="${escapeHTML(link.url)}" aria-label="${escapeHTML(link.name)}"${link.url.startsWith('http') ? ' target="_blank" rel="noopener"' : ''}>${icon(link.icon)}</a>
                `).join('')}
            </div>
        </div>
    `;
}

// Adds a hairline + blur to the sticky header once the page scrolls
function initHeaderScroll() {
    const header = document.getElementById('site-header');
    if (!header) return;
    const update = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    window.addEventListener('scroll', update, { passive: true });
    update();
}

async function initLayout(page) {
    renderBackdrop();
    const [main, postsData] = await Promise.all([
        loadJSON('./data/main.json'),
        loadJSON('./data/posts.json')
    ]);
    if (!main) throw new Error('Failed to load site data');
    const posts = postsData?.posts || [];
    renderSiteHeader(main, page, posts.length > 0);
    renderSiteFooter(main);
    initHeaderScroll();
    return { main, posts };
}
