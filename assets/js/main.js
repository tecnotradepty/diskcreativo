/**
 * Disk Creativo - Core Navigation & General Interactions (High Performance)
 */
document.addEventListener('DOMContentLoaded', () => {
    const topNavbar = document.getElementById('topNavbar');
    if (!topNavbar) return;

    const analogCut = document.querySelector('.analog-cut');
    let lastScrollY = Math.max(0, window.pageYOffset ?? window.scrollY ?? document.documentElement.scrollTop ?? 0);
    let ticking = false;
    let lastClayOpacity = -1;
    let cutThreshold = 700;

    // Calcular y cachear umbral sin forzar reflow (layout thrashing) en cada scroll
    const computeThreshold = () => {
        if (analogCut) {
            const rect = analogCut.getBoundingClientRect();
            const scrollPos = window.pageYOffset ?? window.scrollY ?? document.documentElement.scrollTop ?? 0;
            cutThreshold = rect.top + scrollPos - 75;
        } else {
            cutThreshold = 380;
        }
    };

    computeThreshold();

    const updateNavbar = () => {
        const currentScrollY = Math.max(0, window.pageYOffset ?? window.scrollY ?? document.documentElement.scrollTop ?? 0);

        // 1. Morphing Continuo: Arcilla Blanca Sólida -> Apple Liquid Glass (0px a 220px)
        const maxMorphScroll = 220;
        const progress = Math.min(1, Math.max(0, currentScrollY / maxMorphScroll));
        const clayOpacity = (1 - progress).toFixed(3);

        // Solo mutar estilos si el valor realmente cambió para evitar invalidación innecesaria de capas
        if (clayOpacity !== lastClayOpacity) {
            topNavbar.style.setProperty('--clay-opacity', clayOpacity);
            lastClayOpacity = clayOpacity;
        }

        // Clases de estado para transición suave de tipografía y contraste
        if (progress > 0.45) {
            if (!topNavbar.classList.contains('is-glass')) {
                topNavbar.classList.add('is-glass');
                topNavbar.classList.remove('is-at-top');
            }
        } else {
            if (!topNavbar.classList.contains('is-at-top')) {
                topNavbar.classList.remove('is-glass');
                topNavbar.classList.add('is-at-top');
            }
        }

        // 2. Control de Visibilidad suave según la cinta analógica (.analog-cut)
        if (currentScrollY >= cutThreshold) {
            const scrollDelta = currentScrollY - lastScrollY;
            if (scrollDelta > 4) {
                if (!topNavbar.classList.contains('nav-hidden')) {
                    topNavbar.classList.add('nav-hidden');
                }
            } else if (scrollDelta < -4) {
                if (topNavbar.classList.contains('nav-hidden')) {
                    topNavbar.classList.remove('nav-hidden');
                }
            }
        } else {
            if (topNavbar.classList.contains('nav-hidden')) {
                topNavbar.classList.remove('nav-hidden');
            }
        }

        lastScrollY = currentScrollY;
        ticking = false;
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(updateNavbar);
            ticking = true;
        }
    }, { passive: true });

    window.addEventListener('resize', () => {
        computeThreshold();
        updateNavbar();
    }, { passive: true });

    window.addEventListener('load', () => {
        computeThreshold();
        updateNavbar();
    });

    // Ejecución inicial inmediata
    updateNavbar();
});
