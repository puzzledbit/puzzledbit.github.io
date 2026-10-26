// Motion layer. Everything here is decorative: with prefers-reduced-motion the
// content renders in its final state and only pointer-driven hover effects remain.

const motionOk = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Run fn on scroll/resize, at most once per animation frame
function onScrollFrame(fn) {
    let rafId = null;
    const schedule = () => {
        if (rafId) return;
        rafId = window.requestAnimationFrame(() => {
            rafId = null;
            fn();
        });
    };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    fn();
}

// Fade/slide [data-reveal] elements in as they enter the viewport, staggered among siblings
function initReveal(root) {
    const items = [...root.querySelectorAll('[data-reveal]')];
    if (!motionOk || !('IntersectionObserver' in window)) {
        items.forEach(el => el.classList.add('is-visible'));
        return;
    }
    items.forEach(el => {
        const siblings = [...el.parentElement.children].filter(child => child.hasAttribute('data-reveal'));
        el.style.setProperty('--reveal-delay', `${Math.min(siblings.indexOf(el), 6) * 80}ms`);
    });
    // Once revealed, drop the reveal hooks so the element's own hover transitions apply undelayed
    const finish = (el) => {
        el.removeAttribute('data-reveal');
        el.classList.remove('is-visible');
        el.style.removeProperty('--reveal-delay');
    };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            el.classList.add('is-visible');
            observer.unobserve(el);
            const delay = parseInt(el.style.getPropertyValue('--reveal-delay'), 10) || 0;
            setTimeout(() => finish(el), delay + 900);
        });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });
    items.forEach(el => observer.observe(el));
}

// Typewriter that cycles through data-words
function initRotator(el) {
    const words = JSON.parse(el.dataset.words || '[]');
    const text = el.querySelector('.rotator-text');
    if (!motionOk || words.length < 2 || !text) return;

    let wordIndex = 0;
    let length = words[0].length;
    let deleting = false;

    const tick = () => {
        const word = words[wordIndex];
        if (!deleting && length < word.length) {
            length += 1;
            text.textContent = word.slice(0, length);
            setTimeout(tick, 65 + Math.random() * 40);
        } else if (!deleting) {
            deleting = true;
            el.classList.add('is-idle');
            setTimeout(() => { el.classList.remove('is-idle'); tick(); }, 2400);
        } else if (length > 0) {
            length -= 1;
            text.textContent = word.slice(0, length);
            setTimeout(tick, 32);
        } else {
            deleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            setTimeout(tick, 280);
        }
    };
    el.classList.add('is-idle');
    setTimeout(() => { el.classList.remove('is-idle'); deleting = true; tick(); }, 2600);
}

// Types the command, streams the output lines, idles, then loops
function initTerminal(el) {
    if (!motionOk) return;
    const lines = [...el.querySelectorAll('.terminal-line:not(.terminal-idle)')];
    const idle = el.querySelector('.terminal-idle');
    const all = [...lines, idle];

    const reset = () => all.forEach(line => line.classList.add('is-pending'));

    const run = async () => {
        while (true) {
            reset();
            await sleep(500);
            for (const line of lines) {
                const textEl = line.querySelector('.terminal-text');
                const full = line.dataset.text;
                if (line.classList.contains('is-cmd')) {
                    textEl.textContent = '';
                    line.classList.add('is-typing');
                    line.classList.remove('is-pending');
                    for (let i = 1; i <= full.length; i++) {
                        textEl.textContent = full.slice(0, i);
                        await sleep(26 + Math.random() * 45);
                    }
                    await sleep(420);
                    line.classList.remove('is-typing');
                } else {
                    await sleep(180 + Math.random() * 320);
                    line.classList.remove('is-pending');
                }
            }
            idle.classList.remove('is-pending');
            await sleep(7000);
        }
    };

    reset();
    const observer = new IntersectionObserver((entries) => {
        if (!entries.some(entry => entry.isIntersecting)) return;
        observer.disconnect();
        run();
    }, { threshold: 0.3 });
    observer.observe(el);
}

// Timeline rail fills as the reader scrolls past it; dots light up when reached
function initTimelines(root) {
    const timelines = [...root.querySelectorAll('.timeline')];
    if (!timelines.length) return;
    if (!motionOk) {
        timelines.forEach(timeline => {
            timeline.style.setProperty('--progress', '1');
            timeline.querySelectorAll('.timeline-item').forEach(item => item.classList.add('is-reached'));
        });
        return;
    }
    onScrollFrame(() => {
        const anchor = window.innerHeight * 0.7;
        timelines.forEach(timeline => {
            const rect = timeline.getBoundingClientRect();
            const progress = Math.min(1, Math.max(0, (anchor - rect.top) / rect.height));
            timeline.style.setProperty('--progress', progress.toFixed(3));
            timeline.querySelectorAll('.timeline-item').forEach(item => {
                item.classList.toggle('is-reached', item.getBoundingClientRect().top + 12 < anchor);
            });
        });
    });
}

// Pointer position feeds the lit backdrop grid (--mx/--my) and per-card spotlights (--x/--y)
let spotlightReady = false;
function initSpotlight() {
    if (spotlightReady || !finePointer) return;
    spotlightReady = true;
    const docEl = document.documentElement;
    let lastEvent = null;
    let rafId = null;

    const update = () => {
        rafId = null;
        const event = lastEvent;
        docEl.style.setProperty('--mx', `${event.clientX}px`);
        docEl.style.setProperty('--my', `${event.clientY}px`);
        const card = event.target.closest ? event.target.closest('.spotlight') : null;
        if (card) {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--x', `${event.clientX - rect.left}px`);
            card.style.setProperty('--y', `${event.clientY - rect.top}px`);
        }
    };

    document.addEventListener('pointermove', (event) => {
        lastEvent = event;
        docEl.classList.add('has-pointer');
        if (!rafId) rafId = window.requestAnimationFrame(update);
    }, { passive: true });
    document.addEventListener('pointerleave', () => docEl.classList.remove('has-pointer'));
}

function initAnimations(root = document) {
    initReveal(root);
    root.querySelectorAll('.rotator').forEach(initRotator);
    root.querySelectorAll('.terminal').forEach(initTerminal);
    initTimelines(root);
    initSpotlight();
}
