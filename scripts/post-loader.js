// Renders a single post (post.html?id=...) from data/posts.json + posts/<file>.md

function renderPostNotFound(container) {
    container.innerHTML = `
        <section class="page-head">
            <h1 class="page-title">Post not found</h1>
            <p class="page-lead">This post doesn't exist or has moved.</p>
            <div class="page-actions">
                <a class="btn btn-primary" href="blog.html">${icon('arrowLeft')}All posts</a>
            </div>
        </section>
    `;
}

function readingTime(html) {
    const words = html.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 220));
}

// Fixed bar at the top showing scroll progress through the post
function initReadingProgress() {
    const bar = document.createElement('div');
    bar.className = 'reading-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
    onScrollFrame(() => {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
        bar.style.transform = `scaleX(${progress})`;
    });
}

async function loadPost() {
    const container = document.getElementById('main');
    const { main, posts } = await initLayout('blog');
    const postId = new URLSearchParams(window.location.search).get('id');
    const post = posts.find(p => p.id === postId);
    if (!post) {
        renderPostNotFound(container);
        return;
    }

    document.title = `${post.title} — ${main.header.name}`;
    const html = await loadMarkdown(`./posts/${post.file}`);

    container.innerHTML = `
        <article class="post">
            <header class="post-head">
                <a class="text-link back-link hero-in" style="--i:0" href="blog.html">${icon('arrowLeft')}All posts</a>
                <h1 class="page-title hero-in" style="--i:1">${escapeHTML(post.title)}</h1>
                <p class="post-meta hero-in" style="--i:2">
                    <time datetime="${escapeHTML(post.date)}">${formatPostDate(post.date)}</time>
                    <span>${readingTime(html)} min read</span>
                </p>
            </header>
            <div class="prose hero-in" style="--i:3">${html}</div>
        </article>
    `;

    // The post title is rendered above; drop a duplicate leading <h1> from the markdown
    const prose = container.querySelector('.prose');
    if (prose.firstElementChild?.tagName === 'H1') prose.firstElementChild.remove();

    initReadingProgress();
    initAnimations(container);
}

document.addEventListener('DOMContentLoaded', () => {
    loadPost().catch(error => console.error('Error loading post:', error));
});
