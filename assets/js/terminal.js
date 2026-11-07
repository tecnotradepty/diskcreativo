/**
 * Disk Creativo - macOS Studio Project Configurator & Executive WhatsApp Compiler
 * Gestiona la selección interactiva de tarjetas y píldoras, el resumen en tiempo real
 * y la generación del mensaje corporativo limpio hacia WhatsApp.
 */
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('auditForm');
    if (!form) return;

    const qSolucion = document.getElementById('q_solucion');
    const qEtapa = document.getElementById('q_etapa');
    const qPrioridad = document.getElementById('q_prioridad');
    const qNombre = document.getElementById('q_nombre');
    const qSector = document.getElementById('q_sector');
    const qDetalles = document.getElementById('q_detalles');
    const qPresupuesto = document.getElementById('q_presupuesto');

    const sumSolucion = document.getElementById('sum_solucion');
    const sumEtapa = document.getElementById('sum_etapa');
    const sumPrioridad = document.getElementById('sum_prioridad');
    const sumPresupuesto = document.getElementById('sum_presupuesto');
    const whatsappPreview = document.getElementById('whatsappPreview');
    const sidebarItems = document.querySelectorAll('.sidebar-nav-item');

    // Construye el mensaje ejecutivo limpio, sin emojis ni símbolos innecesarios
    function buildCorporateMessage() {
        const nombre = qNombre?.value.trim() || '[Tu Nombre / Empresa]';
        const sector = qSector?.value.trim() || '[Tu Sector o Actividad]';
        const solucion = qSolucion?.value || 'Sitio Web Corporativo / Landing Page';
        const etapa = qEtapa?.value || 'Proyecto nuevo desde cero';
        const prioridad = qPrioridad?.value || 'Captar más clientes y aumentar ventas';
        const presupuesto = qPresupuesto?.value || '$600 – $1,200 USD';
        const detalles = qDetalles?.value.trim() || '[Descripción breve de lo que necesitas construir o resolver]';

        return [
            'Hola equipo de Disk Creativo, les escribo desde su portal web para evaluar un proyecto.',
            '',
            'RESUMEN DE LA SOLICITUD',
            `Cliente / Empresa: ${nombre}`,
            `Sector: ${sector}`,
            `Solución requerida: ${solucion}`,
            `Situación actual: ${etapa}`,
            `Objetivo principal: ${prioridad}`,
            `Inversión estimada: ${presupuesto}`,
            '',
            'DETALLES DEL PROYECTO',
            detalles,
            '',
            'Quedo atento para conversar sobre el alcance y los siguientes pasos.'
        ].join('\n');
    }

    function updateLiveSummary() {
        if (sumSolucion && qSolucion) sumSolucion.textContent = qSolucion.value;
        if (sumEtapa && qEtapa) sumEtapa.textContent = qEtapa.value;
        if (sumPrioridad && qPrioridad) sumPrioridad.textContent = qPrioridad.value;
        if (sumPresupuesto && qPresupuesto) sumPresupuesto.textContent = qPresupuesto.value;
        if (whatsappPreview) {
            whatsappPreview.textContent = buildCorporateMessage();
        }
    }

    function activateSidebarStep(stepNum) {
        sidebarItems.forEach(item => {
            if (item.getAttribute('data-step') === String(stepNum)) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    // 1. Interacción de Tarjetas y Píldoras (Selección única por grupo)
    const optionGroups = document.querySelectorAll('[data-target]');
    optionGroups.forEach(group => {
        const targetId = group.getAttribute('data-target');
        const hiddenInput = document.getElementById(targetId);
        const buttons = group.querySelectorAll('button[data-value]');

        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');

                if (hiddenInput) {
                    hiddenInput.value = btn.getAttribute('data-value');
                }

                // Actualizar indicador de paso en el sidebar
                if (targetId === 'q_solucion') activateSidebarStep(1);
                if (targetId === 'q_etapa' || targetId === 'q_prioridad') activateSidebarStep(2);
                if (targetId === 'q_presupuesto') activateSidebarStep(4);

                updateLiveSummary();
            });
        });
    });

    // 2. Sincronización en tiempo real al escribir en los campos de texto
    [qNombre, qSector, qDetalles].forEach(input => {
        if (!input) return;
        input.addEventListener('focus', () => activateSidebarStep(3));
        input.addEventListener('input', updateLiveSummary);
    });

    // Inicializar estado de vista previa
    updateLiveSummary();

    // 3. Envío del Formulario hacia WhatsApp
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const finalMessage = buildCorporateMessage();
        const encodedPayload = encodeURIComponent(finalMessage);
        const whatsappUrl = `https://wa.me/50768529324?text=${encodedPayload}`;

        window.open(whatsappUrl, '_blank');
    });
});
