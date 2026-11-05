/**
 * Disk Creativo - Core Navigation & General Interactions
 */
document.addEventListener('DOMContentLoaded', () => {
    const topNavbar = document.getElementById('topNavbar');
    if (!topNavbar) return;

    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        // Ocultar al bajar después de 50px, mostrar al subir o estar arriba
        if (currentScrollY > 50 && currentScrollY > lastScrollY) {
            topNavbar.style.transform = 'translateY(-100%)';
        } else {
            topNavbar.style.transform = 'translateY(0)';
        }
        lastScrollY = currentScrollY;
    }, { passive: true });
});
