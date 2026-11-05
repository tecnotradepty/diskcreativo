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

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const currentScrollY = window.scrollY;
                const cutThreshold = getCutThreshold();
                
                // 1. Dentro del Hero: Difuminar hacia blanco translúcido con blur no uniforme
                if (currentScrollY > 20) {
                    topNavbar.classList.add('nav-frosted');
                } else {
                    topNavbar.classList.remove('nav-frosted');
                }

                // 2. Control de Visibilidad según la línea de rayas analógica (.analog-cut)
                if (currentScrollY >= cutThreshold) {
                    // Tras pasar la línea de rayas: subir y desaparecer al bajar, bajar al subir
                    if (currentScrollY > lastScrollY && (currentScrollY - lastScrollY > 3)) {
                        topNavbar.classList.add('nav-hidden');
                    } else if (currentScrollY < lastScrollY) {
                        topNavbar.classList.remove('nav-hidden');
                    }
                } else {
                    // Dentro del Hero (antes de la línea de rayas): permanece siempre visible
                    topNavbar.classList.remove('nav-hidden');
                }

                lastScrollY = Math.max(0, currentScrollY);
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
});
