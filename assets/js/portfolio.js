/**
 * Disk Creativo - Hero Parallax, 3D Cards & Google Sheets Portfolio API
 */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Parallax 3D en Logo Hero (solo escritorio)
    const dynamicLogo = document.getElementById('dynamic-logo');
    const heroContainer = document.getElementById('inicio');
    
    if (heroContainer && dynamicLogo && window.innerWidth > 768) {
        heroContainer.addEventListener('mousemove', (e) => {
            const rect = heroContainer.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            dynamicLogo.style.transform = `translate(calc(-50% + ${x * -40}px), calc(-50% + ${y * -40}px))`;
        });
        
        heroContainer.addEventListener('mouseleave', () => { 
            dynamicLogo.style.transform = 'translate(-50%, -50%)'; 
        });
    }

    // 2. Físicas 3D de Tarjetas de Portafolio
    function init3DInteractions() {
        const cards = document.querySelectorAll('.card-wrapper');
        cards.forEach(wrapper => {
            const card = wrapper.querySelector('.card-editorial');
            if (!card) return;
            
            const handleMove = (e) => {
                const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                const clientY = e.touches ? e.touches[0].clientY : e.clientY;
                const rect = wrapper.getBoundingClientRect();
                const x = clientX - rect.left;
                const y = clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = ((y - centerY) / centerY) * -15; 
                const rotateY = ((x - centerX) / centerX) * 15;
                
                card.style.transform = `rotate3d(1, 0, 0, ${rotateX}deg) rotate3d(0, 1, 0, ${rotateY}deg) scale(1.02)`;
                card.classList.add('is-active');
            };

            const handleLeave = () => {
                card.style.transform = `rotate3d(0, 0, 0, 0deg) scale(1)`;
                card.classList.remove('is-active');
            };

            wrapper.addEventListener('mousemove', handleMove);
            wrapper.addEventListener('mouseleave', handleLeave);
            wrapper.addEventListener('touchmove', handleMove, { passive: true });
            wrapper.addEventListener('touchend', handleLeave);
        });
    }

    // 3. Consumo Dinámico de Google Sheets API + Paginación
    const API_URL = 'https://script.google.com/macros/s/AKfycbzyXAjKVOHlpxDYFgZ_J_TPOoync5-J9zaXdPdW3ex4O-y9o-WVUepMV2CflgF9dxo0Eg/exec';
    const grid = document.getElementById('portfolioGrid');
    const toggleContainer = document.getElementById('toggleContainer');
    const toggleBtn = document.getElementById('toggleProjectsBtn');
    let isExpanded = false;

    if (!grid) return;

    async function fetchProyectos() {
        try {
            const response = await fetch(API_URL);
            const proyectosData = await response.json();
            
            if (proyectosData && proyectosData.length > 0) { 
                grid.innerHTML = ''; 
                
                proyectosData.forEach((p, index) => {
                    const wrapper = document.createElement('div');
                    // Ocultar del 4to proyecto en adelante por defecto
                    wrapper.className = index >= 3 ? 'card-wrapper card-hidden' : 'card-wrapper'; 
                    
                    let imgUrl = p.imagen ? p.imagen.trim() : "";
                    let thumbHtml = imgUrl !== "" 
                        ? `<img src="${imgUrl}" alt="${p.titulo || 'Proyecto'}" loading="lazy" decoding="async">` 
                        : `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#999;font-family:var(--font-sans);">[Sin Imagen]</div>`;

                    wrapper.innerHTML = `
                        <a href="${p.enlace || "#"}" target="_blank" rel="noopener noreferrer" class="card-editorial">
                            <div class="card-thumb">${thumbHtml}</div>
                            <div class="card-content">
                                <span class="card-badge">${p.categoria || "SOFTWARE"}</span>
                                <h3 class="card-title">${p.titulo || "Proyecto_00"}</h3>
                                <p class="card-desc">${p.descripcion || "..."}</p>
                            </div>
                            <div class="card-bottom">
                                <span class="card-exe">Explorar Plataforma</span>
                            </div>
                        </a>
                    `;
                    grid.appendChild(wrapper);
                });

                // Botón mostrar más / mostrar menos
                if (proyectosData.length > 3 && toggleContainer && toggleBtn) {
                    toggleContainer.style.display = 'flex';
                    
                    toggleBtn.addEventListener('click', () => {
                        const allCards = grid.querySelectorAll('.card-wrapper');
                        isExpanded = !isExpanded;
                        
                        allCards.forEach((card, idx) => {
                            if (idx >= 3) {
                                if (isExpanded) {
                                    card.classList.remove('card-hidden');
                                } else {
                                    card.classList.add('card-hidden');
                                }
                            }
                        });

                        toggleBtn.textContent = isExpanded ? 'Mostrar menos ↑' : 'Mostrar más proyectos ↓';
                    });
                }

                init3DInteractions(); 
            } else { 
                grid.innerHTML = '<div style="grid-column: 1/-1; padding: 3rem; text-align:center; color: var(--text-muted);">Registro vacío.</div>'; 
            }
        } catch (error) {
            console.error("Error API:", error);
            grid.innerHTML = '<div style="grid-column: 1/-1; padding: 3rem; text-align:center; color: var(--text-muted);">Error 503: Falla de conexión con servidor.</div>';
        }
    }

    fetchProyectos();
});
