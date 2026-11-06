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
            return rect.top + window.scrollY - 80;
        }
        return 650;
    };

    const updateNavbar = () => {
        const currentScrollY = window.scrollY;
        const cutThreshold = getCutThreshold();

        // 1. Difuminado continuo de Blanco sólido hacia Apple Liquid Glass (0px a 220px)
        const maxMorphScroll = 220;
        const progress = Math.min(1, Math.max(0, currentScrollY / maxMorphScroll));
        
        // Modula la opacidad de la capa blanca (1.0 en el tope -> 0.0 a los 220px)
        const clayOpacity = (1 - progress).toFixed(3);
        topNavbar.style.setProperty('--clay-opacity', clayOpacity);

        // Clases de estado para transición suave de tipografía y colores
        if (currentScrollY > 25) {
            topNavbar.classList.add('is-glass');
            topNavbar.classList.remove('is-at-top');
        } else {
            topNavbar.classList.remove('is-glass');
            topNavbar.classList.add('is-at-top');
        }

        // 2. Control de Visibilidad suave según la línea de rayas analógica (.analog-cut)
        if (currentScrollY >= cutThreshold) {
            // Ya cruzamos la cinta analógica: ocultar al bajar, mostrar al subir
            if (currentScrollY > lastScrollY) {
                topNavbar.classList.add('nav-hidden');
            } else if (currentScrollY < lastScrollY) {
                topNavbar.classList.remove('nav-hidden');
            }
        } else {
            // Dentro del Hero: permanece siempre visible
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
