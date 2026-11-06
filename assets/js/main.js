/**
 * Disk Creativo - Core Navigation & General Interactions
 */
document.addEventListener('DOMContentLoaded', () => {
    const topNavbar = document.getElementById('topNavbar');
    if (!topNavbar) return;

    const analogCut = document.querySelector('.analog-cut');
    let lastScrollY = Math.max(0, window.pageYOffset ?? window.scrollY ?? document.documentElement.scrollTop ?? 0);
    let ticking = false;

    // Calcular umbral dinámico exacto de la línea de cinta analógica
    const getCutThreshold = () => {
        if (analogCut) {
            const rect = analogCut.getBoundingClientRect();
            const scrollPos = window.pageYOffset ?? window.scrollY ?? document.documentElement.scrollTop ?? 0;
            return rect.top + scrollPos - 75;
        }
        return 380; // En páginas secundarias como DEX
    };

    const updateNavbar = () => {
        const currentScrollY = Math.max(0, window.pageYOffset ?? window.scrollY ?? document.documentElement.scrollTop ?? 0);
        const cutThreshold = getCutThreshold();

        // 1. Morphing Continuo: Arcilla Blanca Sólida -> Apple Liquid Glass (0px a 220px)
        const maxMorphScroll = 220;
        const progress = Math.min(1, Math.max(0, currentScrollY / maxMorphScroll));
        
        // Modula la opacidad de la capa blanca (1.0 en el tope -> 0.0 al scrollear 220px)
        const clayOpacity = (1 - progress).toFixed(3);
        topNavbar.style.setProperty('--clay-opacity', clayOpacity);

        // Clases de estado para transición suave de tipografía y contraste
        if (progress > 0.45) {
            topNavbar.classList.add('is-glass');
            topNavbar.classList.remove('is-at-top');
        } else {
            topNavbar.classList.remove('is-glass');
            topNavbar.classList.add('is-at-top');
        }

        // 2. Control de Visibilidad suave según la cinta analógica (.analog-cut)
        if (currentScrollY >= cutThreshold) {
            const scrollDelta = currentScrollY - lastScrollY;
            // Solo actuar ante movimiento real para evitar fluctuaciones por micro-scroll
            if (scrollDelta > 4) {
                topNavbar.classList.add('nav-hidden');
            } else if (scrollDelta < -4) {
                topNavbar.classList.remove('nav-hidden');
            }
        } else {
            // Mientras esté en el Hero o por encima del corte: 100% visible
            topNavbar.classList.remove('nav-hidden');
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

    window.addEventListener('resize', updateNavbar, { passive: true });
    window.addEventListener('load', updateNavbar);

    // Ejecución inicial inmediata
    updateNavbar();
});
