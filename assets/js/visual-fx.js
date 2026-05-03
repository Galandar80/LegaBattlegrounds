/**
 * visual-fx.js  —  All 10 visual improvements wired up via JS
 * Loaded on every page after utils.js
 */

document.addEventListener('DOMContentLoaded', () => {

    /* ─── 3. Star Particles in Hero ─────────────────────────────── */
    const hero = document.querySelector('.hero, .hof-hero');
    if (hero) {
        const PARTICLE_COUNT = 18;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const p = document.createElement('span');
            p.className = 'hero-particle';
            const size = Math.random() * 3 + 1.5;
            p.style.cssText = `
                left: ${Math.random() * 100}%;
                top: ${20 + Math.random() * 70}%;
                width: ${size}px;
                height: ${size}px;
                animation-duration: ${4 + Math.random() * 6}s;
                animation-delay: ${Math.random() * 5}s;
            `;
            hero.appendChild(p);
        }
    }

    /* ─── 6. Count-up for Stats Bar .stat-number elements ───────── */
    function countUp(el, target, suffix) {
        const duration = 1400;
        const start = performance.now();
        const from = 0;

        function step(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            const value = Math.round(from + eased * (target - from));
            el.textContent = value + suffix;
            el.classList.toggle('counting', progress < 1);
            if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    const statsBar = document.querySelector('.stats-bar');
    if (statsBar) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    statsBar.querySelectorAll('.stat-number').forEach(el => {
                        const raw = el.textContent.trim();
                        el.textContent = raw;
                    });
                    observer.disconnect();
                }
            });
        }, { threshold: 0.4 });
        observer.observe(statsBar);
    }

    /* ─── 7. 3D Tilt on HOF cards ───────────────────────────────── */
    document.querySelectorAll('.hof-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = (e.clientX - cx) / (rect.width / 2);
            const dy = (e.clientY - cy) / (rect.height / 2);
            card.style.transform = `perspective(700px) rotateX(${-dy * 8}deg) rotateY(${dx * 8}deg) scale(1.03)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

    /* ─── 9. Scrollspy — only on index.html ─────────────────────── */
    const sections = document.querySelectorAll('section[id], main[id]');
    if (sections.length > 0) {
        const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
        const spy = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    navLinks.forEach(a => {
                        a.classList.toggle('scrollspy-active', a.getAttribute('href') === '#' + id);
                    });
                }
            });
        }, { rootMargin: '-30% 0px -60% 0px' });
        sections.forEach(s => spy.observe(s));
    }

    /* ─── 8. Live badge already handled via tornei.js if needed ─── */
    /* (See tornei.js for event-level badge injection) */
});
