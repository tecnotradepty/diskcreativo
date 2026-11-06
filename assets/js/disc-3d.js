/**
 * Disk Creativo - Réplica 3D Fiel del Isotipo Original (Three.js WebGL)
 * Geometría real con corte angular ("C" notch), núcleo concéntrico multicapa,
 * metal cepillado anisotrópico (gunmetal) y haces de difracción radiales fieles al render original.
 * Rotación continua autónoma sin movimiento con el mouse.
 */

(function () {
    'use strict';

    const container = document.getElementById('webglDiscContainer');
    const canvas = document.getElementById('threeDiscCanvas');
    if (!container || !canvas || typeof THREE === 'undefined') return;

    // 1. ESCENA, CÁMARA Y RENDERER
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.set(0, 0, 7.6);

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    // Grupo con la inclinación perspectiva 3D exacta del isotipo original (disco-3d.png)
    const tiltGroup = new THREE.Group();
    tiltGroup.rotation.x = -0.46; // Inclinación hacia atrás
    tiltGroup.rotation.y = 0.52;  // Inclinación lateral mostrando el grosor izquierdo
    tiltGroup.rotation.z = 0.12;
    scene.add(tiltGroup);

    // Grupo interno que rota sobre el eje propio del disco
    const spinGroup = new THREE.Group();
    tiltGroup.add(spinGroup);

    const outerRadius = 2.20;
    const bladeInnerRadius = 0.752; // 0.342 * outerRadius (borde exterior del anillo negro)
    const holeRadius = 0.341;       // 0.155 * outerRadius (agujero central)

    // Función auxiliar para asignar UVs polares/radiales exactos respecto al centro (0,0)
    // y guardar en uv2 las coordenadas locales del disco para que el grano gire con la pieza
    function assignDiscUVs(geom, maxR) {
        const pos = geom.attributes.position;
        const uvs = new Float32Array(pos.count * 2);
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);
            uvs[i * 2] = (x / (maxR * 2.0)) + 0.5;
            uvs[i * 2 + 1] = (y / (maxR * 2.0)) + 0.5;
        }
        geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
        geom.computeVertexNormals();
    }

    // 2. GEOMETRÍA PARTE A: NÚCLEO CENTRAL CONTINUO (360 GRADOS)
    // En el isotipo original, el anillo negro y el centro gris/plateado son continuos incluso en la muesca
    const hubShape = new THREE.Shape();
    hubShape.absarc(0, 0, bladeInnerRadius + 0.008, 0, Math.PI * 2, false);
    const hubHole = new THREE.Path();
    hubHole.absarc(0, 0, holeRadius, 0, Math.PI * 2, true);
    hubShape.holes.push(hubHole);

    const hubExtrudeSettings = {
        depth: 0.065,
        bevelEnabled: true,
        bevelSegments: 3,
        steps: 1,
        bevelSize: 0.014,
        bevelThickness: 0.014,
        curveSegments: 72
    };
    const hubGeometry = new THREE.ExtrudeGeometry(hubShape, hubExtrudeSettings);
    hubGeometry.center();
    assignDiscUVs(hubGeometry, outerRadius);

    // 3. GEOMETRÍA PARTE B: HOJA ÓPTICA EXTERIOR CON LA MUESCA ("NOTCH") ICÓNICA
    const gapHalfAngle = THREE.MathUtils.degToRad(11.8); // Apertura total de ~23.6° idéntica al PNG
    const startAngle = gapHalfAngle;
    const endAngle = Math.PI * 2 - gapHalfAngle;

    const bladeShape = new THREE.Shape();
    bladeShape.moveTo(
        bladeInnerRadius * Math.cos(startAngle),
        bladeInnerRadius * Math.sin(startAngle)
    );
    bladeShape.lineTo(
        outerRadius * Math.cos(startAngle),
        outerRadius * Math.sin(startAngle)
    );
    bladeShape.absarc(0, 0, outerRadius, startAngle, endAngle, false);
    bladeShape.lineTo(
        bladeInnerRadius * Math.cos(endAngle),
        bladeInnerRadius * Math.sin(endAngle)
    );
    bladeShape.absarc(0, 0, bladeInnerRadius, endAngle, startAngle, true);
    bladeShape.closePath();

    const bladeExtrudeSettings = {
        depth: 0.055,
        bevelEnabled: true,
        bevelSegments: 3,
        steps: 1,
        bevelSize: 0.016,
        bevelThickness: 0.016,
        curveSegments: 80
    };
    const bladeGeometry = new THREE.ExtrudeGeometry(bladeShape, bladeExtrudeSettings);
    bladeGeometry.center();
    assignDiscUVs(bladeGeometry, outerRadius);

    // 4. SHADER FOTORREALISTA FIEL A DISCO-3D.PNG
    const vertexShader = `
        varying vec2 vLocalUv;
        varying vec3 vLocalPos;
        varying vec3 vLocalNormal;
        varying vec3 vViewNormal;
        varying vec3 vWorldPos;

        void main() {
            vLocalUv = uv;
            vLocalPos = position;
            vLocalNormal = normal;
            vViewNormal = normalize(normalMatrix * normal);
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPos = worldPosition.xyz;
            gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
    `;

    const fragmentShader = `
        uniform float uSpinAngle;
        uniform float uTime;

        varying vec2 vLocalUv;
        varying vec3 vLocalPos;
        varying vec3 vLocalNormal;
        varying vec3 vViewNormal;
        varying vec3 vWorldPos;

        #define PI 3.14159265359

        // Diferencia angular más corta entre dos ángulos (-PI a PI)
        float angleDiff(float a, float b) {
            float d = mod(a - b + PI, 2.0 * PI) - PI;
            return d < -PI ? d + 2.0 * PI : d;
        }

        // Arcoíris físico suave para los abanicos de difracción del CD
        vec3 warmSpectrum(float t) {
            // t va de 0.0 (violeta/azul) a 1.0 (naranja/rojo)
            vec3 c1 = vec3(0.48, 0.28, 0.85); // Violeta
            vec3 c2 = vec3(0.15, 0.68, 0.98); // Azul Cian
            vec3 c3 = vec3(0.28, 0.88, 0.48); // Verde Esmeralda
            vec3 c4 = vec3(0.98, 0.88, 0.22); // Amarillo Cálido
            vec3 c5 = vec3(0.98, 0.48, 0.18); // Naranja
            vec3 c6 = vec3(0.92, 0.22, 0.30); // Rojo Carmesí

            float x = clamp(t, 0.0, 1.0) * 5.0;
            if (x < 1.0) return mix(c1, c2, smoothstep(0.0, 1.0, x));
            if (x < 2.0) return mix(c2, c3, smoothstep(1.0, 2.0, x));
            if (x < 3.0) return mix(c3, c4, smoothstep(2.0, 3.0, x));
            if (x < 4.0) return mix(c4, c5, smoothstep(3.0, 4.0, x));
            return mix(c5, c6, smoothstep(4.0, 5.0, x));
        }

        void main() {
            // Coordenadas polares en el espacio local del disco
            vec2 pLocal = vLocalUv - vec2(0.5);
            float r = length(pLocal) * 2.0; // r = 0 en el centro, r = 1 en el borde exterior
            float localAngle = atan(pLocal.y, pLocal.x);

            // Ángulo en el espacio de cámara/estudio (para que los reflejos de luz tengan anclaje físico
            // mientras el disco y su muesca rotan a través de la luz)
            float studioAngle = localAngle + uSpinAngle;

            // Determinar si estamos en la cara plana frontal/trasera o en el canto/bisel 3D
            float isFlatFace = smoothstep(0.35, 0.85, abs(vLocalNormal.z));

            // ─── 1. TEXTURA DE MICROSURCOS CONCÉNTRICOS (GRAIN REALISTA) ───
            float g1 = sin(r * 520.0) * 0.5 + 0.5;
            float g2 = sin(r * 1350.0 + 1.7) * 0.5 + 0.5;
            float g3 = sin(r * 140.0 - localAngle * 2.0) * 0.5 + 0.5;
            float groovePattern = (g1 * 0.45 + g2 * 0.35 + g3 * 0.20);

            // Variación anisotrópica que gira con el metal del disco
            float metalRotarySheen = 0.92 + 0.08 * sin(localAngle * 4.0 + r * 6.0);

            // ─── 2. CANTO Y BISELES 3D (GROSOR DEL DISCO Y DE LA MUESCA) ───
            if (isFlatFace < 0.5) {
                vec3 N = normalize(vViewNormal);
                vec3 L1 = normalize(vec3(-0.6, 0.7, 0.8));
                vec3 L2 = normalize(vec3(0.7, -0.5, 0.6));
                float edgeSpec1 = pow(max(dot(N, L1), 0.0), 28.0);
                float edgeSpec2 = pow(max(dot(N, L2), 0.0), 16.0);

                // Canto metálico oscuro con línea brillante plateada en el bisel
                vec3 rimBase = vec3(0.20, 0.20, 0.23);
                vec3 rimHighlight = vec3(0.88, 0.90, 0.94) * (edgeSpec1 * 0.9 + edgeSpec2 * 0.45);
                gl_FragColor = vec4(rimBase + rimHighlight, 1.0);
                return;
            }

            // ─── 3. ZONA DEL NÚCLEO CENTRAL (r < 0.343) ───
            if (r < 0.343) {
                // Iluminación sutil del estudio para el centro
                float hubLight = 0.75 + 0.25 * cos(studioAngle - 2.1);

                // A. Labio interior plateado junto al agujero (0.155 - 0.178)
                if (r < 0.178) {
                    float innerLine = smoothstep(0.163, 0.166, r) * (1.0 - smoothstep(0.168, 0.171, r));
                    vec3 silverLip = vec3(0.76, 0.77, 0.80) * hubLight;
                    silverLip = mix(silverLip, vec3(0.18, 0.18, 0.20), innerLine * 0.85);
                    gl_FragColor = vec4(silverLip, 1.0);
                    return;
                }

                // B. Anillo gris antracita cepillado con surcos concéntricos (0.178 - 0.280)
                if (r < 0.280) {
                    vec3 darkHub = vec3(0.22, 0.21, 0.23) * (0.85 + 0.30 * groovePattern) * hubLight * metalRotarySheen;
                    // Sutil bisel interno oscuro
                    float innerShadow = smoothstep(0.178, 0.192, r);
                    darkHub *= (0.7 + 0.3 * innerShadow);
                    gl_FragColor = vec4(darkHub, 1.0);
                    return;
                }

                // C. Anillo metálico plateado intermedio con doble bisel (0.280 - 0.304)
                if (r < 0.304) {
                    float midGroove = smoothstep(0.290, 0.293, r) * (1.0 - smoothstep(0.294, 0.297, r));
                    vec3 silverRing = vec3(0.74, 0.75, 0.78) * (0.7 + 0.3 * hubLight);
                    silverRing = mix(silverRing, vec3(0.15, 0.15, 0.17), midGroove * 0.9);
                    gl_FragColor = vec4(silverRing, 1.0);
                    return;
                }

                // D. Anillo negro profundo brillante (Clamping ring: 0.304 - 0.343)
                float blackSpec = pow(max(cos(studioAngle - 1.9), 0.0), 24.0) * 0.18;
                vec3 blackRing = vec3(0.035, 0.035, 0.04) + vec3(blackSpec);
                gl_FragColor = vec4(blackRing, 1.0);
                return;
            }

            // ─── 4. SUPERFICIE ÓPTICA DE DATOS (0.343 <= r <= 1.0) ───
            // Base de titanio / gunmetal oscuro cepillado (como en las zonas neutras de disco-3d.png)
            float baseShade = 0.88 + 0.22 * cos(studioAngle * 2.0 - 0.8);
            vec3 gunmetalBase = vec3(0.37, 0.35, 0.38) * baseShade * metalRotarySheen;
            // Aplicar textura fina de microsurcos al metal base
            gunmetalBase += (groovePattern - 0.5) * 0.045;

            // ─── 5. HACES RADIALES DE DIFRACCIÓN HOLOGRÁFICA (FIELES AL ORIGINAL) ───
            // Pequeña modulación orgánica ligada al giro del disco para que el destello respire
            float shimmer = sin(uSpinAngle * 2.0) * 0.035;

            // HAZ 1: Destello estrecho de alta energía (Magenta -> Blanco/Cian -> Azul)
            // En disco-3d.png aparece a ~108° (arriba-izquierda) y su opuesto a ~-72° (abajo-derecha)
            float d1A = angleDiff(studioAngle, 1.88 + shimmer);
            float d1B = angleDiff(studioAngle, -1.26 + shimmer);
            float d1 = abs(d1A) < abs(d1B) ? d1A : d1B;

            // Envolvente gaussiana estrecha para el haz cian/magenta/blanco
            float mask1 = exp(-(d1 * d1) / (2.0 * 0.15 * 0.15));
            // Transición cromática transversal: Magenta a la izquierda, Blanco en el centro, Cian a la derecha
            float t1 = clamp((d1 / 0.24) + 0.5, 0.0, 1.0);
            vec3 beam1Color = mix(
                vec3(0.95, 0.32, 0.88), // Magenta vibrante
                vec3(0.25, 0.95, 1.00), // Cian eléctrico
                smoothstep(0.2, 0.8, t1)
            );
            // Núcleo especular blanco puro en el centro exacto del haz
            float whiteCore1 = exp(-(d1 * d1) / (2.0 * 0.055 * 0.055));
            beam1Color = mix(beam1Color, vec3(1.0, 0.99, 1.0), whiteCore1 * 0.88);

            // HAZ 2: Abanico amplio de arcoíris cálido (Izquierda: ~152° y Derecha-Abajo: ~-22°)
            float d2A = angleDiff(studioAngle, 2.68 - shimmer);
            float d2B = angleDiff(studioAngle, -0.38 - shimmer);
            float d2 = abs(d2A) < abs(d2B) ? d2A : d2B;

            float mask2 = exp(-(d2 * d2) / (2.0 * 0.34 * 0.34));
            // En el haz izquierdo el orden va de Naranja/Amarillo arriba a Verde/Cian/Rojo abajo
            float dir2 = abs(d2A) < abs(d2B) ? -1.0 : 1.0;
            float t2 = clamp((d2 * dir2 / 0.62) + 0.52, 0.0, 1.0);
            vec3 beam2Color = warmSpectrum(t2);

            // HAZ 3: Abanico secundario de arcoíris (Arriba-Derecha: ~48° y Abajo-Izquierda: ~-125°)
            float d3A = angleDiff(studioAngle, 0.84 + shimmer);
            float d3B = angleDiff(studioAngle, -2.18 + shimmer);
            float d3 = abs(d3A) < abs(d3B) ? d3A : d3B;

            float mask3 = exp(-(d3 * d3) / (2.0 * 0.28 * 0.28));
            float dir3 = abs(d3A) < abs(d3B) ? 1.0 : -1.0;
            float t3 = clamp((d3 * dir3 / 0.52) + 0.5, 0.0, 1.0);
            vec3 beam3Color = warmSpectrum(t3);

            // HAZ 4: Toque sutil rojizo/cálido en la zona media izquierda (~-165°) y borde de muesca (~18°)
            float d4A = angleDiff(studioAngle, -2.88);
            float d4B = angleDiff(studioAngle, 0.32);
            float d4 = abs(d4A) < abs(d4B) ? d4A : d4B;
            float mask4 = exp(-(d4 * d4) / (2.0 * 0.22 * 0.22)) * 0.55;
            vec3 beam4Color = mix(vec3(0.85, 0.28, 0.32), vec3(0.55, 0.35, 0.85), clamp((d4 / 0.4) + 0.5, 0.0, 1.0));

            // ─── 6. COMPOSICIÓN DEL COLOR EN LA HOJA ÓPTICA ───
            vec3 surfaceColor = gunmetalBase;

            // Modulación por microsurcos en los reflejos de color (da aspecto de metal real y no plástico liso)
            float grooveHighlight = 0.88 + 0.24 * groovePattern;

            surfaceColor = mix(surfaceColor, beam2Color * grooveHighlight, mask2 * 0.88);
            surfaceColor = mix(surfaceColor, beam3Color * grooveHighlight, mask3 * 0.85);
            surfaceColor = mix(surfaceColor, beam4Color * grooveHighlight, mask4 * 0.70);
            surfaceColor = mix(surfaceColor, beam1Color * (0.92 + 0.16 * groovePattern), mask1 * 0.95);

            // Sombra suave junto al anillo negro central y bisel metálico exterior (r > 0.975)
            float innerFade = smoothstep(0.343, 0.358, r);
            surfaceColor *= (0.75 + 0.25 * innerFade);

            // Borde exterior plateado fino (como el aro perimetral del CD)
            if (r > 0.978) {
                float rimLight = 0.65 + 0.35 * cos(studioAngle - 2.2);
                vec3 outerRimColor = vec3(0.75, 0.77, 0.80) * rimLight;
                surfaceColor = mix(surfaceColor, outerRimColor, smoothstep(0.978, 0.986, r));
            }

            gl_FragColor = vec4(surfaceColor, 1.0);
        }
    `;

    const uniforms = {
        uSpinAngle: { value: 0.0 },
        uTime: { value: 0.0 }
    };

    const discMaterial = new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: uniforms,
        side: THREE.DoubleSide
    });

    const hubMesh = new THREE.Mesh(hubGeometry, discMaterial);
    const bladeMesh = new THREE.Mesh(bladeGeometry, discMaterial);

    spinGroup.add(hubMesh);
    spinGroup.add(bladeMesh);

    // 5. RESPONSIVE RESIZE
    function resize() {
        const width = container.clientWidth || 360;
        const height = container.clientHeight || 360;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }

    const resizeObserver = new ResizeObserver(() => resize());
    resizeObserver.observe(container);
    window.addEventListener('resize', resize);
    resize();

    // 6. BUCLE DE ANIMACIÓN OPTIMIZADO (PAUSA AUTOMÁTICA FUERA DE PANTALLA)
    const clock = new THREE.Clock();
    let isVisible = true;

    if ('IntersectionObserver' in window) {
        const discObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                isVisible = entry.isIntersecting;
            });
        }, { rootMargin: '100px' });
        discObserver.observe(container);
    }

    function animate() {
        requestAnimationFrame(animate);

        // Si el usuario scrolleó fuera del Hero, pausar renderizado para liberar GPU al 100%
        if (!isVisible) return;

        const elapsed = clock.getElapsedTime();
        uniforms.uTime.value = elapsed;

        // Giro continuo y elegante sobre el eje del disco
        const currentSpin = -elapsed * 0.45;
        spinGroup.rotation.z = currentSpin;
        uniforms.uSpinAngle.value = currentSpin;

        // Levitación mecánica vertical muy sutil
        tiltGroup.position.y = Math.sin(elapsed * 1.4) * 0.06;

        renderer.render(scene, camera);
    }

    animate();
})();
