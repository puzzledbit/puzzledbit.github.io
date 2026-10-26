// Renders the home, CV and blog pages from data/*.json into <main id="main">.

function sectionHead(title, extra = '') {
    return `
        <div class="section-head" data-reveal>
            <h2 class="section-title">${escapeHTML(title)}</h2>
            ${extra}
        </div>
    `;
}

function currentJob(cv) {
    return cv.experience.items.find(item => parseDuration(item.duration).isCurrent);
}

function totalYears(cv) {
    const starts = cv.experience.items
        .map(item => parseDuration(item.duration).start)
        .filter(Boolean);
    if (!starts.length) return 0;
    const earliest = new Date(Math.min(...starts));
    return Math.floor(monthsBetween(earliest, new Date()) / 12);
}

function socialLinks(main, className) {
    return main.contact.social.map(link => `
        <a class="${className}" href="${escapeHTML(link.url)}" target="_blank" rel="noopener" aria-label="${escapeHTML(link.name)}">${icon(link.icon)}</a>
    `).join('');
}

function renderHero(main, cv) {
    const { header, terminal } = main;
    const job = currentJob(cv);
    const roleLine = job ? `${job.role} at ${job.company}` : header.role;
    const words = header.headline.rotating;
    const lines = terminal.lines.map(line => `
        <div class="terminal-line${line.prompt ? ' is-cmd' : ''}${line.type === 'success' ? ' is-success' : ''}" data-text="${escapeHTML(line.text)}">${line.prompt ? '<span class="terminal-prompt">$</span>' : ''}<span class="terminal-text">${escapeHTML(line.text)}</span></div>
    `).join('');

    return `
        <section class="hero">
            <div class="hero-copy">
                <div class="hero-badge hero-in" style="--i:0">
                    <img class="hero-avatar" src="${escapeHTML(header.avatar)}" alt="" width="40" height="40">
                    <div class="hero-badge-text">
                        <span class="hero-role"><span class="status-dot" aria-hidden="true"></span>${escapeHTML(roleLine)}</span>
                        <span class="hero-location">${icon('mapPin')}${escapeHTML(header.location)}</span>
                    </div>
                </div>
                <h1 class="hero-title hero-in" style="--i:1">${escapeHTML(header.name)}</h1>
                <p class="hero-headline hero-in" style="--i:2">
                    ${escapeHTML(header.headline.prefix)}
                    <span class="sr-only">${escapeHTML(words.join(', '))}</span>
                    <span class="rotator" aria-hidden="true" data-words="${escapeHTML(JSON.stringify(words))}"><span class="rotator-text">${escapeHTML(words[0])}</span><span class="rotator-caret" aria-hidden="true"></span></span>
                    <span class="hero-headline-suffix">${escapeHTML(header.headline.suffix)}</span>
                </p>
                <p class="hero-summary hero-in" style="--i:3">${escapeHTML(cv.summary)}</p>
                <div class="hero-actions hero-in" style="--i:4">
                    <a class="btn btn-primary" href="cv.html">View CV ${icon('arrowRight', 'icon btn-arrow')}</a>
                    <a class="btn btn-ghost" href="#contact">Get in touch</a>
                    <div class="hero-social">${socialLinks(main, 'icon-link')}</div>
                </div>
            </div>
            <div class="hero-visual hero-in" style="--i:3">
                <div class="terminal spotlight" role="img" aria-label="Terminal running a Bazel build">
                    <div class="terminal-bar">
                        <span class="terminal-dot"></span><span class="terminal-dot"></span><span class="terminal-dot"></span>
                        <span class="terminal-title">${escapeHTML(terminal.title)}</span>
                    </div>
                    <div class="terminal-body">
                        ${lines}
                        <div class="terminal-line is-cmd terminal-idle"><span class="terminal-prompt">$</span><span class="terminal-cursor"></span></div>
                    </div>
                </div>
            </div>
        </section>
    `;
}

function renderCompanies(cv) {
    const years = totalYears(cv);
    return `
        <section class="companies" data-reveal aria-label="Companies">
            <p class="companies-label">${years}+ years across</p>
            <ul class="companies-list">
                ${cv.experience.items.map(item => `<li>${escapeHTML(item.company)}</li>`).join('')}
            </ul>
        </section>
    `;
}

function renderFocus(main) {
    const { focus } = main;
    return `
        <section class="section" id="focus">
            ${sectionHead(focus.title)}
            <div class="focus-grid">
                ${focus.items.map(item => `
                    <article class="card focus-card spotlight" data-reveal>
                        <div class="focus-icon">${icon(item.icon)}</div>
                        <h3>${escapeHTML(item.title)}</h3>
                        <p>${escapeHTML(item.description)}</p>
                        <div class="tag-list">${item.tags.map(tag => `<span class="tag">${escapeHTML(tag)}</span>`).join('')}</div>
                    </article>
                `).join('')}
            </div>
        </section>
    `;
}

function renderTimeline(items) {
    return `
        <ol class="timeline">
            ${items.map(item => {
                const { start, end, isCurrent } = parseDuration(item.duration);
                return `
                    <li class="timeline-item${isCurrent ? ' is-current' : ''}" data-reveal>
                        <div class="timeline-head">
                            <h3>${escapeHTML(item.company)}</h3>
                            ${isCurrent ? '<span class="badge">Current</span>' : ''}
                        </div>
                        <p class="timeline-role">${escapeHTML(item.role)}</p>
                        <p class="timeline-meta">
                            <span>${escapeHTML(item.duration.replace(/\s+-\s+/, ' – '))}</span>
                            <span class="timeline-tenure">${formatTenure(monthsBetween(start, end))}</span>
                        </p>
                    </li>
                `;
            }).join('')}
        </ol>
    `;
}

function renderExperience(main, cv) {
    const { experience } = main.sections;
    const link = `<a class="text-link" href="cv.html" data-reveal>Full CV ${icon('arrowRight', 'icon btn-arrow')}</a>`;
    return `
        <section class="section" id="experience">
            ${sectionHead(experience.title, link)}
            ${renderTimeline(cv.experience.items)}
        </section>
    `;
}

function renderPostList(posts) {
    return `
        <div class="post-list">
            ${posts.map(post => `
                <a class="card post-row spotlight" href="post.html?id=${encodeURIComponent(post.id)}" data-reveal>
                    <time class="post-row-date" datetime="${escapeHTML(post.date)}">${formatPostDate(post.date)}</time>
                    <div class="post-row-body">
                        <h3>${escapeHTML(post.title)}</h3>
                        <p>${escapeHTML(post.description)}</p>
                    </div>
                    ${icon('arrowUpRight', 'icon post-row-arrow')}
                </a>
            `).join('')}
        </div>
    `;
}

function renderLatestPosts(main, posts) {
    if (!posts.length) return '';
    const { posts: titles } = main.sections;
    const link = `<a class="text-link" href="blog.html" data-reveal>All posts ${icon('arrowRight', 'icon btn-arrow')}</a>`;
    return `
        <section class="section" id="posts">
            ${sectionHead(titles.title_home, link)}
            ${renderPostList(posts.slice(0, 3))}
        </section>
    `;
}

function renderContact(main) {
    const { contact } = main;
    return `
        <section class="section" id="contact">
            <div class="card contact-card" data-reveal>
                <div class="contact-glow" aria-hidden="true"></div>
                <h2 class="section-title">${escapeHTML(contact.title)}</h2>
                <p class="contact-text">${escapeHTML(contact.description)}</p>
                <div class="contact-actions">
                    <a class="btn btn-primary" href="mailto:${escapeHTML(contact.email)}">${icon('mail')}${escapeHTML(contact.email)}</a>
                    <button class="btn btn-ghost copy-email" type="button" data-email="${escapeHTML(contact.email)}">
                        ${icon('copy', 'icon icon-copy')}${icon('check', 'icon icon-check')}<span class="copy-label">Copy email</span>
                    </button>
                </div>
                <div class="contact-social">
                    ${contact.social.map(link => `
                        <a class="text-link" href="${escapeHTML(link.url)}" target="_blank" rel="noopener">${icon(link.icon)}${escapeHTML(link.name)}</a>
                    `).join('')}
                </div>
            </div>
        </section>
    `;
}

function renderHome(main, cv, posts) {
    return [
        renderHero(main, cv),
        renderCompanies(cv),
        renderFocus(main),
        renderExperience(main, cv),
        renderLatestPosts(main, posts),
        renderContact(main)
    ].join('');
}

function renderCV(main, cv) {
    const { header, contact } = main;
    return `
        <section class="page-head">
            <h1 class="page-title hero-in" style="--i:0">${escapeHTML(header.name)}</h1>
            <p class="page-subtitle hero-in" style="--i:1">${escapeHTML(header.role)} · ${escapeHTML(header.location)}</p>
            <p class="page-lead hero-in" style="--i:2">${escapeHTML(cv.summary)}</p>
            <div class="page-actions hero-in" style="--i:3">
                <button class="btn btn-primary print-cv" type="button">${icon('printer')}Save as PDF</button>
                <a class="btn btn-ghost" href="mailto:${escapeHTML(contact.email)}">${icon('mail')}Email me</a>
            </div>
        </section>
        <div class="cv-layout">
            <section class="cv-main">
                <h2 class="cv-heading" data-reveal>${escapeHTML(cv.experience.title)}</h2>
                ${renderTimeline(cv.experience.items)}
            </section>
            <aside class="cv-side">
                <div class="card cv-card" data-reveal>
                    <h2 class="cv-heading">${escapeHTML(cv.skills.title)}</h2>
                    <div class="tag-list">${cv.skills.items.map(skill => `<span class="tag">${escapeHTML(skill)}</span>`).join('')}</div>
                </div>
                <div class="card cv-card" data-reveal>
                    <h2 class="cv-heading">${escapeHTML(cv.education.title)}</h2>
                    ${cv.education.items.map(edu => `
                        <div class="education-item">
                            <div class="education-icon">${icon('graduation')}</div>
                            <div>
                                <h3>${escapeHTML(edu.school)}</h3>
                                <p>${escapeHTML(edu.degree)}</p>
                                <p class="muted">${escapeHTML(edu.duration.replace(/\s+-\s+/, ' – '))}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="card cv-card cv-links" data-reveal>
                    <h2 class="cv-heading">Links</h2>
                    <a class="text-link" href="mailto:${escapeHTML(contact.email)}">${icon('mail')}${escapeHTML(contact.email)}</a>
                    ${contact.social.map(link => `
                        <a class="text-link" href="${escapeHTML(link.url)}" target="_blank" rel="noopener">${icon(link.icon)}${escapeHTML(link.url.replace(/^https?:\/\/(www\.)?/, ''))}</a>
                    `).join('')}
                </div>
            </aside>
        </div>
    `;
}

function renderBlog(main, posts) {
    const titles = main.sections.posts;
    const body = posts.length
        ? renderPostList(posts)
        : `<div class="card empty-state" data-reveal><p>No posts yet. Check back soon.</p></div>`;
    return `
        <section class="page-head">
            <h1 class="page-title hero-in" style="--i:0">${escapeHTML(titles.title_all)}</h1>
            <p class="page-lead hero-in" style="--i:1">Notes on build systems, CI/CD and mobile infrastructure.</p>
        </section>
        <section class="section section-tight">${body}</section>
    `;
}

function initCopyEmail(root) {
    root.querySelectorAll('.copy-email').forEach(button => {
        const label = button.querySelector('.copy-label');
        let timer = null;
        button.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(button.dataset.email);
                button.classList.add('is-copied');
                label.textContent = 'Copied';
            } catch (error) {
                label.textContent = button.dataset.email;
            }
            clearTimeout(timer);
            timer = setTimeout(() => {
                button.classList.remove('is-copied');
                label.textContent = 'Copy email';
            }, 2000);
        });
    });
}

async function initializePage() {
    const page = document.body.dataset.page || 'home';
    const container = document.getElementById('main');
    try {
        const [{ main, posts }, cv] = await Promise.all([
            initLayout(page),
            page === 'blog' ? Promise.resolve(null) : loadJSON('./data/cv.json')
        ]);
        if (page !== 'blog' && !cv) throw new Error('Failed to load CV data');

        if (page === 'cv') container.innerHTML = renderCV(main, cv);
        else if (page === 'blog') container.innerHTML = renderBlog(main, posts);
        else container.innerHTML = renderHome(main, cv, posts);

        initCopyEmail(container);
        container.querySelector('.print-cv')?.addEventListener('click', () => window.print());
        initAnimations(container);
    } catch (error) {
        console.error('Error initializing page:', error);
        container.innerHTML = `<div class="card empty-state"><p>Something went wrong loading this page.</p></div>`;
    }
}

document.addEventListener('DOMContentLoaded', initializePage);
