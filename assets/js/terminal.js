/**
 * Disk Creativo - Minimalist macOS Project Form & Clean WhatsApp Handoff
 */
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('auditForm');
    if (!form) return;

    // Selección de botones segmentados
    document.querySelectorAll('.segmented-group').forEach(group => {
        const targetId = group.getAttribute('data-target');
        const hiddenInput = document.getElementById(targetId);
        const buttons = group.querySelectorAll('.seg-btn');

        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                if (hiddenInput) {
                    hiddenInput.value = btn.getAttribute('data-value');
                }
            });
        });
    });

    // Envío directo a WhatsApp con formato corporativo limpio
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const nombre = document.getElementById('q_nombre')?.value.trim() || '';
        const solucion = document.getElementById('q_solucion')?.value || 'Sitio Web / Landing Page';
        const presupuesto = document.getElementById('q_presupuesto')?.value || 'Por definir';
        const detalles = document.getElementById('q_detalles')?.value.trim() || '';

        const message = [
            `Hola equipo de Disk Creativo, les escribo desde su web para evaluar un proyecto.`,
            ``,
            `Cliente / Empresa: ${nombre}`,
            `Solución requerida: ${solucion}`,
            `Presupuesto estimado: ${presupuesto} USD`,
            ``,
            `Detalles del proyecto:`,
            detalles
        ].join('\n');

        const whatsappUrl = `https://wa.me/50768529324?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    });
});
