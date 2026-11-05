/**
 * Disk Creativo - Interactive 3D Holographic CD Engine (Three.js WebGL)
 * Modelado procedural con shader de difracción anisotrópica e iridiscencia espectral en tiempo real.
 */

(function () {
    'use strict';

    const container = document.getElementById('webglDiscContainer');
    const canvas = document.getElementById('threeDiscCanvas');
    if (!container || !canvas || typeof THREE === 'undefined') return;

    // 1. ESCENA, CÁMARA Y RENDERER
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 7.2);

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    // 2. GEOMETRÍA PROCEDURAL DEL DISCO CD/VINILO
    const discRadius = 2.2;
    const innerHoleRadius = 0.32;
    const discShape = new THREE.Shape();
    discShape.absarc(0, 0, discRadius, 0, Math.PI * 2, false);

    const centerHole = new THREE.Path();
    centerHole.absarc(0, 0, innerHoleRadius, 0, Math.PI * 2, true);
    discShape.holes.push(centerHole);

    const extrudeSettings = {
        depth: 0.045,
        bevelEnabled: true,
        bevelSegments: 4,
        steps: 1,
        bevelSize: 0.02,
        bevelThickness: 0.02,
        curveSegments: 80
    };

    const geometry = new THREE.ExtrudeGeometry(discShape, extrudeSettings);
    geometry.center();

    // Mapeo UV radial de alta precisión centrado en (0.5, 0.5)
    const pos = geometry.attributes.position;
    const uvs = new Float32Array(pos.count * 2);
    const maxBound = discRadius + 0.02;

    for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        uvs[i * 2] = (x / (maxBound * 2)) + 0.5;
        uvs[i * 2 + 1] = (y / (maxBound * 2)) + 0.5;
    }
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geometry.computeVertexNormals();

    // 3. SHADER DE DIFRACCIÓN HOLOGRÁFICA ESPECTRAL
    const cdVertexShader = `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying vec3 vWorldPosition;

        void main() {
            vUv = uv;
            vNormal = normalize(normalMatrix * normal);
            vec4 worldPos = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPos.xyz;
            vec4 mvPos = viewMatrix * worldPos;
            vViewPosition = -mvPos.xyz;
            gl_Position = projectionMatrix * mvPos;
        }
    `;

    const cdFragmentShader = `
        uniform vec3 uLightPos;
        uniform float uTime;
        uniform vec2 uMouse;

        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying vec3 vWorldPosition;

        // Paleta espectral de arcoíris puro (Bragg diffraction colors)
        vec3 spectralRainbow(float t) {
            vec3 a = vec3(0.5, 0.5, 0.5);
            vec3 b = vec3(0.5, 0.5, 0.5);
            vec3 c = vec3(1.0, 1.0, 1.0);
            vec3 d = vec3(0.00, 0.33, 0.67);
            return a + b * cos(6.2831853 * (c * t + d));
        }

        void main() {
            vec3 N = normalize(vNormal);
            vec3 V = normalize(vViewPosition);
            vec3 L = normalize(uLightPos - vWorldPosition);
            vec3 H = normalize(L + V);

            vec2 p = vUv - vec2(0.5);
            float r = length(p) * 2.0;
            float angle = atan(p.y, p.x);

            float isFace = smoothstep(0.4, 0.85, abs(N.z));

            // Tangente a los microsurcos concéntricos
            vec3 T = normalize(vec3(-p.y, p.x, 0.0));

            // Ecuación de difracción anisotrópica
            float dL = dot(T, L);
            float dV = dot(T, V);
            float gratingShift = (dL + dV) * 3.6;

            // Haz dual en forma de pajarita (hourglass/bowtie) característico de CDs
            float phase = gratingShift + sin(angle * 2.0) * 0.35 + (uTime * 0.04);
            vec3 iridColor = spectralRainbow(phase);

            // Zonas del disco
            float dataTrack = smoothstep(0.28, 0.33, r) * (1.0 - smoothstep(0.95, 0.99, r));
            float hubClear = smoothstep(0.14, 0.17, r) * (1.0 - smoothstep(0.28, 0.30, r));
            float mirrorRing = smoothstep(0.28, 0.30, r) * (1.0 - smoothstep(0.31, 0.33, r));

            // Iluminación Phong / Blinn especular
            float NdotL = max(dot(N, L), 0.0);
            float NdotH = max(dot(N, H), 0.0);
            float spec = pow(NdotH, 48.0);
            float broadSpec = pow(NdotH, 12.0);

            // Color base cromo plateado
            vec3 chrome = vec3(0.85, 0.87, 0.90);
            vec3 color = chrome * (0.35 + 0.65 * NdotL);

            // Inyección del arcoíris holográfico en los surcos de datos
            vec3 rainbowGlint = iridColor * (0.8 + 1.4 * spec + 0.3 * broadSpec);
            color = mix(color, color + rainbowGlint * 1.4, dataTrack * isFace);

            // Reflejo central intenso
            color += vec3(1.0, 0.98, 0.95) * spec * 0.95;

            // Centro plástico y anillo de fijación
            if (r < 0.30) {
                vec3 plasticHub = vec3(0.12, 0.13, 0.17);
                float plasticGlint = pow(NdotH, 32.0);
                color = mix(plasticHub, vec3(0.65, 0.68, 0.72), mirrorRing) + vec3(1.0) * plasticGlint * 0.45;
            }

            // Bisel y bordes
            if (isFace < 0.5) {
                color = vec3(0.25, 0.26, 0.30) + vec3(1.0) * spec * 0.8;
            }

            // Resplandor de borde Fresnel
            float fresnel = pow(1.0 - max(dot(N, V), 0.0), 3.0);
            color += vec3(0.9, 0.95, 1.0) * fresnel * 0.35;

            gl_FragColor = vec4(color, 1.0);
        }
    `;

    const uniforms = {
        uLightPos: { value: new THREE.Vector3(4.0, 5.0, 6.0) },
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) }
    };

    const discMaterial = new THREE.ShaderMaterial({
        vertexShader: cdVertexShader,
        fragmentShader: cdFragmentShader,
        uniforms: uniforms,
        side: THREE.DoubleSide
    });

    const discMesh = new THREE.Mesh(geometry, discMaterial);
    // Inclinación inicial estética idéntica al render original
    discMesh.rotation.x = 0.28;
    discMesh.rotation.y = -0.32;
    scene.add(discMesh);

    // Luces sutiles para el cálculo de profundidad
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(4, 5, 6);
    scene.add(dirLight);

    // 4. INTERACTIVIDAD CON EL MOUSE & PARALAJE
    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0.28;
    let targetRotY = -0.32;
    let isHovered = false;

    window.addEventListener('mousemove', (e) => {
        const nx = (e.clientX / window.innerWidth) * 2 - 1;
        const ny = -(e.clientY / window.innerHeight) * 2 + 1;
        mouseX = nx;
        mouseY = ny;

        // Inclinación suave orientada al cursor
        targetRotX = 0.28 + (ny * 0.45);
        targetRotY = -0.32 + (nx * 0.65);

        // Movimiento de la fuente de luz para desplazar los reflejos
        uniforms.uLightPos.value.x = 4.0 + (nx * 6.0);
        uniforms.uLightPos.value.y = 5.0 + (ny * 6.0);
        uniforms.uMouse.value.set(nx, ny);
    });

    container.addEventListener('mouseenter', () => { isHovered = true; });
    container.addEventListener('mouseleave', () => { isHovered = false; });

    // 5. RESPONSIVE RESIZE
    function resize() {
        const width = container.clientWidth || 320;
        const height = container.clientHeight || 320;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }

    const resizeObserver = new ResizeObserver(() => resize());
    resizeObserver.observe(container);
    window.addEventListener('resize', resize);
    resize();

    // 6. BUCLE DE RENDERIZADO 60 FPS
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const elapsedTime = clock.getElapsedTime();
        uniforms.uTime.value = elapsedTime;

        // Rotación continua sobre el eje Z (giro de tocadiscos / CD)
        const spinSpeed = isHovered ? 0.016 : 0.008;
        discMesh.rotation.z += spinSpeed;

        // Inercia y suavizado de inclinación 3D (lerp)
        discMesh.rotation.x += (targetRotX - discMesh.rotation.x) * 0.055;
        discMesh.rotation.y += (targetRotY - discMesh.rotation.y) * 0.055;

        // Levitación mecánica suave en Y
        discMesh.position.y = Math.sin(elapsedTime * 1.8) * 0.08;

        renderer.render(scene, camera);
    }

    animate();
})();
