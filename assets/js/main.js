/**
 * Disk Creativo - Core Navigation & General Interactions
 */
document.addEventListener('DOMContentLoaded', () => {
    const topNavbar = document.getElementById('topNavbar');
    if (!topNavbar) return;

    const analogCut = document.querySelector('.analog-cut');
    let lastScrollY = window.scrollY;
    let ticking = false;

    const getCutThreshold = () => {
        if (analogCut) {
            const rect = analogCut.getBoundingClientRect();
            return rect.top + window.scrollY - 60;
        }
        return 650;
    };

    const updateNavbar = () => {
        const currentScrollY = window.scrollY;
        const cutThreshold = getCutThreshold();

        // 1. Difuminado continuo de Blanco hacia Apple Liquid Glass a medida que scrolleas (0px a 240px)
        const maxMorphScroll = 240;
        const progress = Math.min(1, Math.max(0, currentScrollY / maxMorphScroll));
        topNavbar.style.setProperty('--scroll-p', progress.toFixed(3));

        // 2. Control de Visibilidad suave según la línea de rayas analógica (.analog-cut)
        if (currentScrollY >= cutThreshold) {
            const scrollDelta = currentScrollY - lastScrollY;
            // Movimiento suave y deliberado: oculta al bajar tras cruzar la línea
            if (scrollDelta > 6) {
                topNavbar.classList.add('nav-hidden');
            } else if (scrollDelta < -4) {
                topNavbar.classList.remove('nav-hidden');
            }
        } else {
            // Dentro del Hero: permanece siempre en pantalla
            topNavbar.classList.remove('nav-hidden');
        }

        lastScrollY = Math.max(0, currentScrollY);
        ticking = false;
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(updateNavbar);
            ticking = true;
        }
    }, { passive: true });

    // Inicializar de inmediato al cargar la página
    updateNavbar();
});
