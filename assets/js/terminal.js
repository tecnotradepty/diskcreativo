/**
 * Disk Creativo - Terminal OS Simulator & WhatsApp Brief Compiler
 */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Reloj del sistema en la terminal
    const timeNode = document.getElementById('timeNode');
    if (timeNode) {
        const date = new Date();
        timeNode.textContent = date.toLocaleString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    // 2. Compilación del Formulario a WhatsApp
    const form = document.getElementById('auditForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const nombre = document.getElementById('q_nombre')?.value.trim() || 'N/A';
        const sector = document.getElementById('q_sector')?.value || 'N/A';
        const modelo = document.getElementById('q_modelo')?.value || 'N/A';
        const infra = document.getElementById('q_infra')?.value || 'N/A';
        const falla = document.getElementById('q_falla')?.value || 'N/A';
        const detonante = document.getElementById('q_detonante')?.value.trim() || 'N/A';
        const objetivo = document.getElementById('q_objetivo')?.value || 'N/A';
        const vision = document.getElementById('q_vision')?.value.trim() || 'N/A';
        const presupuesto = document.getElementById('q_presupuesto')?.value || 'N/A';

        // Payload B2B Estructurado
        const payload = `*INIT: DISK_CREATIVO_OS_AUDIT* 🚀
----------------------------------------
*1. IDENTIDAD COMERCIAL*
🏢 *Negocio:* ${nombre}
🏷️ *Sector:* ${sector}
🔄 *Modelo:* ${modelo}

*2. DIAGNÓSTICO OPERATIVO*
🧱 *Infraestructura Actual:* ${infra}
⚠️ *Cuello de Botella Crítico:* ${falla}
⚡ *Detonante del Cambio:* "${detonante}"

*3. ALCANCE Y VISIÓN*
🎯 *Requerimiento:* ${objetivo}
🔭 *Visión a Futuro:* "${vision}"

*4. PARÁMETROS FINANCIEROS*
💰 *Presupuesto Asignado:* ${presupuesto}
----------------------------------------
*Esperando conexión con arquitectura técnica...*`;

        const encodedPayload = encodeURIComponent(payload);
        const whatsappUrl = `https://wa.me/50768529324?text=${encodedPayload}`;
        
        window.open(whatsappUrl, '_blank');
    });
});
