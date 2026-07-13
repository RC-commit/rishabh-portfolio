import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';

let avatarModelPromise: ReturnType<GLTFLoader['loadAsync']> | null = null;

function loadAvatarModel() {
    if (!avatarModelPromise) {
        const loader = new GLTFLoader();
        loader.setMeshoptDecoder(MeshoptDecoder);
        avatarModelPromise = loader.loadAsync('/model.glb').catch((error: unknown) => {
            avatarModelPromise = null;
            throw error;
        });
    }
    return avatarModelPromise;
}

type AvatarStatus = 'loading' | 'ready' | 'error';

interface InteractiveAvatarProps {
    onReady: () => void;
    onError: () => void;
}

/* ─────────────────────────────────────────────────
 *  Utility: map mouse position → rotation degrees
 * ───────────────────────────────────────────────── */
function getMouseDegrees(x: number, y: number, degreeLimit: number) {
    let dx = 0, dy = 0;
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Horizontal
    if (x <= w / 2) {
        dx = -((degreeLimit * ((w / 2 - x) / (w / 2) * 100)) / 100);
    } else {
        dx = (degreeLimit * ((x - w / 2) / (w / 2) * 100)) / 100;
    }
    // Vertical (half range to avoid extreme up/down)
    if (y <= h / 2) {
        dy = -(((degreeLimit * 0.5) * ((h / 2 - y) / (h / 2) * 100)) / 100);
    } else {
        dy = ((degreeLimit * 0.5) * ((y - h / 2) / (h / 2) * 100)) / 100;
    }
    return { x: dx, y: dy };
}

/* ─────────────────────────────────────────────────
 *  Mixamo bone names (lowercased for matching)
 * ───────────────────────────────────────────────── */
const BONE_NAMES = {
    head: 'head',
    neck: 'neck',
    spine: 'spine',
    spine1: 'spine1',
    spine2: 'spine2',
    leftEye: 'lefteye',
    rightEye: 'righteye',
    leftShoulder: 'leftshoulder',
    rightShoulder: 'rightshoulder',
    leftArm: 'leftarm',
    rightArm: 'rightarm',
    leftForeArm: 'leftforearm',
    rightForeArm: 'rightforearm',
    leftHand: 'lefthand',
    rightHand: 'righthand',
    hips: 'hips',
} as const;

function InteractiveAvatar({ onReady, onError }: InteractiveAvatarProps) {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const mountNode = mountRef.current;
        if (!mountNode) return;

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const compactViewport = window.matchMedia('(max-width: 860px)').matches;

        /* ── Scene ────────────────────────────── */
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(compactViewport ? 21 : 22, 1, 0.1, 20);
        camera.position.set(0, compactViewport ? 1.5 : 1.46, compactViewport ? 1.74 : 2.02);
        camera.lookAt(0, compactViewport ? 1.42 : 1.32, 0);
        mountNode.classList.add('cp-avatar-loading');

        let renderer: THREE.WebGLRenderer;
        try {
            renderer = new THREE.WebGLRenderer({
                alpha: true,
                antialias: true,
                powerPreference: 'high-performance',
            });
        } catch {
            mountNode.classList.remove('cp-avatar-loading');
            onError();
            return;
        }
        renderer.setClearColor(0x000000, 0);
        renderer.setPixelRatio(Math.min(
            window.devicePixelRatio || 1,
            compactViewport ? 1.35 : 1.6,
        ));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.domElement.setAttribute('aria-hidden', 'true');
        renderer.domElement.tabIndex = -1;
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
        renderer.domElement.style.display = 'block';
        mountNode.appendChild(renderer.domElement);

        /* ── Lighting ─────────────────────────── */
        scene.add(new THREE.AmbientLight(0xffffff, 1.32));
        const keyLight = new THREE.DirectionalLight(0xfff4e2, 2.2);
        keyLight.position.set(2.4, 3.1, 2.6);
        scene.add(keyLight);
        const fillLight = new THREE.DirectionalLight(0xd9c2a3, 0.95);
        fillLight.position.set(-1.7, 1.8, 1.25);
        scene.add(fillLight);
        const faceLight = new THREE.PointLight(0xf1d0a0, 1.05, 10);
        faceLight.position.set(0, 1.58, 1.95);
        scene.add(faceLight);
        const rimLight = new THREE.DirectionalLight(0xb6e5f2, 0.68);
        rimLight.position.set(-2.8, 2.6, -1.5);
        scene.add(rimLight);

        /* ── Bone references ──────────────────── */
        const bones: Record<string, THREE.Object3D | null> = {
            head: null,
            neck: null,
            leftEye: null,
            rightEye: null,
            leftShoulder: null,
            rightShoulder: null,
            leftArm: null,
            rightArm: null,
            leftForeArm: null,
            rightForeArm: null,
            leftHand: null,
            rightHand: null,
            hips: null,
            spine: null,
            spine1: null,
            spine2: null,
        };

        // Store initial (rest) rotations so we can blend tracking on top
        const restQuaternions: Record<string, THREE.Quaternion> = {};
        const blinkMeshes: Array<{
            mesh: THREE.Mesh;
            leftIdx: number;
            rightIdx: number;
        }> = [];
        let rootModel: THREE.Object3D | null = null;
        let rafId = 0;
        let lastTime = performance.now();
        let disposed = false;
        let breathTime = 0;
        let isInViewport = true;
        let isPageVisible = !document.hidden;

        /* ── Blinking Animation State ─────────── */
        let blinkTimer = 2.5 + Math.random() * 3.0; // random time to first blink
        let blinkPhase: 'none' | 'closing' | 'closed' | 'opening' = 'none';
        let blinkTime = 0;
        let isDoubleBlink = false;
        let blinkCount = 0;

        /* ── AI Expression State ──────────────── */
        type AvatarAIState = 'idle' | 'thinking' | 'success';
        let aiState: AvatarAIState = 'idle';
        let aiStateTime = 0;     // Time since state entry (seconds)
        let successPhase = 0;    // Progress through the nod animation

        const handleAIState = (e: Event) => {
            const detail = (e as CustomEvent).detail as { state: AvatarAIState } | undefined;
            if (detail?.state && detail.state !== aiState) {
                aiState = detail.state;
                aiStateTime = 0;
                if (detail.state === 'success') successPhase = 0;
            }
        };
        window.addEventListener('avatar-ai-state', handleAIState);

        /* ── Mouse tracking ───────────────────── */
        const mouseCoords = new THREE.Vector2(-1000, -1000);
        let lastPointerMoveTime = 0; // 0 represents loaded / initial state

        const resize = () => {
            const width = Math.max(mountNode.clientWidth, 1);
            const height = Math.max(mountNode.clientHeight, 1);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height, false);
            if (mouseCoords.x === -1000) {
                mouseCoords.set(width / 2, height / 2);
            }
        };

        const handlePointerMove = (event: PointerEvent) => {
            if (!isInViewport || !isPageVisible) return;
            mouseCoords.x = event.clientX;
            mouseCoords.y = event.clientY;
            lastPointerMoveTime = performance.now();
        };

        const handlePointerLeave = () => {
            mouseCoords.set(window.innerWidth / 2, window.innerHeight / 2);
            lastPointerMoveTime = 0;
        };

        /* ─────────────────────────────────────────
         *  Apply tracking rotation to a single joint
         *  - Reads the rest quaternion
         *  - Computes target from mouse position
         *  - Smoothly lerps toward target
         * ───────────────────────────────────────── */
        const _qTarget = new THREE.Quaternion();
        const _euler = new THREE.Euler();

        function trackJoint(
            joint: THREE.Object3D | null,
            key: string,
            degreeLimit: number,
            alpha: number,
        ) {
            if (!joint) return;
            const rest = restQuaternions[key];
            if (!rest) return;

            const deg = getMouseDegrees(mouseCoords.x, mouseCoords.y, degreeLimit);
            // Build target = rest × tracking offset
            _euler.set(
                THREE.MathUtils.degToRad(deg.y),
                THREE.MathUtils.degToRad(deg.x),
                0,
                'XYZ',
            );
            _qTarget.copy(rest).multiply(new THREE.Quaternion().setFromEuler(_euler));
            joint.quaternion.slerp(_qTarget, alpha);
        }

        /* ── Render loop ──────────────────────── */
        const queueFrame = () => {
            if (!disposed && rootModel && isInViewport && isPageVisible && rafId === 0) {
                rafId = window.requestAnimationFrame(renderLoop);
            }
        };

        function renderLoop(time: number) {
            rafId = 0;
            if (disposed || !isInViewport || !isPageVisible) return;

            const delta = Math.min((time - lastTime) / 1000, 0.04);
            lastTime = time;
            aiStateTime += delta;

            if (rootModel) {
                const now = performance.now();
                if (lastPointerMoveTime === 0 || (now - lastPointerMoveTime) > 2000) {
                    const targetX = window.innerWidth / 2;
                    const targetY = window.innerHeight / 2;
                    const blend = 1 - Math.exp(-4 * delta); // Smoothly return to center
                    mouseCoords.x += (targetX - mouseCoords.x) * blend;
                    mouseCoords.y += (targetY - mouseCoords.y) * blend;
                }

                const smoothing = reduceMotion ? 6 : 10;
                const alpha = 1 - Math.exp(-smoothing * delta);

                /* (1) Breathing — gentle spine oscillation & sway */
                breathTime += delta;
                if (bones.spine2) {
                    const restQ = restQuaternions['spine2'];
                    if (restQ) {
                        const breathAmt = Math.sin(breathTime * 1.5) * 0.012;
                        const swayAmt = Math.cos(breathTime * 0.8) * 0.015;
                        _euler.set(breathAmt, swayAmt, 0, 'XYZ');
                        _qTarget.copy(restQ).multiply(new THREE.Quaternion().setFromEuler(_euler));
                        bones.spine2.quaternion.slerp(_qTarget, alpha);
                    }
                }

                /* (2) AI Expression Animations */
                if (aiState === 'thinking' && !reduceMotion) {
                    // Contemplative gentle head tilt — rhythmic side-to-side + slight forward lean
                    const thinkX = Math.sin(aiStateTime * 1.2) * 4;  // Slow rhythmic lateral tilt
                    const thinkY = Math.sin(aiStateTime * 0.8) * 3 + 4;  // Slight upward gaze + lateral movement
                    const thinkZ = Math.cos(aiStateTime * 0.6) * 2;   // Subtle head roll

                    if (bones.head) {
                        const rest = restQuaternions['head'];
                        if (rest) {
                            _euler.set(
                                THREE.MathUtils.degToRad(thinkY * 0.5),
                                THREE.MathUtils.degToRad(thinkX),
                                THREE.MathUtils.degToRad(thinkZ),
                                'XYZ',
                            );
                            _qTarget.copy(rest).multiply(new THREE.Quaternion().setFromEuler(_euler));
                            bones.head.quaternion.slerp(_qTarget, alpha * 0.4);
                        }
                    }
                    if (bones.neck) {
                        const rest = restQuaternions['neck'];
                        if (rest) {
                            _euler.set(
                                THREE.MathUtils.degToRad(thinkY * 0.25),
                                THREE.MathUtils.degToRad(thinkX * 0.4),
                                0,
                                'XYZ',
                            );
                            _qTarget.copy(rest).multiply(new THREE.Quaternion().setFromEuler(_euler));
                            bones.neck.quaternion.slerp(_qTarget, alpha * 0.3);
                        }
                    }
                } else if (aiState === 'success' && !reduceMotion) {
                    // Double nod — quick agreement gesture (takes ~0.8s total)
                    successPhase += delta;
                    const nodProgress = Math.min(successPhase / 0.8, 1);

                    // Two-peak sinusoidal nod (0 → down → up → down → up → rest)
                    const nodAngle = Math.sin(nodProgress * Math.PI * 3) * (1 - nodProgress) * 8;

                    if (bones.head) {
                        const rest = restQuaternions['head'];
                        if (rest) {
                            _euler.set(THREE.MathUtils.degToRad(nodAngle), 0, 0, 'XYZ');
                            _qTarget.copy(rest).multiply(new THREE.Quaternion().setFromEuler(_euler));
                            bones.head.quaternion.slerp(_qTarget, alpha * 0.6);
                        }
                    }

                    // After the nod completes, return to idle
                    if (nodProgress >= 1) {
                        aiState = 'idle';
                    }
                } else {
                    /* (3) Default: Mouse tracking — head, neck, eyes */
                    if (!reduceMotion) {
                        trackJoint(bones.neck, 'neck', 18, alpha);
                        trackJoint(bones.head, 'head', 22, alpha);
                        trackJoint(bones.leftEye, 'leftEye', 12, alpha);
                        trackJoint(bones.rightEye, 'rightEye', 12, alpha);
                    }
                }

                /* (4) Blinking Animation */
                if (blinkPhase === 'none') {
                    blinkTimer -= delta;
                    if (blinkTimer <= 0) {
                        blinkPhase = 'closing';
                        blinkTime = 0;
                        isDoubleBlink = Math.random() < 0.15;
                        blinkCount = isDoubleBlink ? 2 : 1;
                    }
                }

                let blinkInfluence = 0;
                if (blinkPhase !== 'none') {
                    blinkTime += delta;

                    const closingDuration = 0.08;
                    const closedDuration = 0.04;
                    const openingDuration = 0.12;

                    if (blinkPhase === 'closing') {
                        const progress = blinkTime / closingDuration;
                        if (progress >= 1) {
                            blinkPhase = 'closed';
                            blinkTime = 0;
                            blinkInfluence = 1;
                        } else {
                            blinkInfluence = progress;
                        }
                    } else if (blinkPhase === 'closed') {
                        const progress = blinkTime / closedDuration;
                        if (progress >= 1) {
                            blinkPhase = 'opening';
                            blinkTime = 0;
                            blinkInfluence = 1;
                        } else {
                            blinkInfluence = 1;
                        }
                    } else if (blinkPhase === 'opening') {
                        const progress = blinkTime / openingDuration;
                        if (progress >= 1) {
                            blinkCount--;
                            if (blinkCount > 0) {
                                blinkPhase = 'closing';
                                blinkTime = 0;
                                blinkInfluence = 0;
                            } else {
                                blinkPhase = 'none';
                                blinkTimer = 2.5 + Math.random() * 3.0;
                                blinkInfluence = 0;
                            }
                        } else {
                            blinkInfluence = 1 - progress;
                        }
                    }
                }

                for (let i = 0; i < blinkMeshes.length; i++) {
                    const { mesh, leftIdx, rightIdx } = blinkMeshes[i];
                    if (mesh.morphTargetInfluences) {
                        mesh.morphTargetInfluences[leftIdx] = blinkInfluence;
                        mesh.morphTargetInfluences[rightIdx] = blinkInfluence;
                    }
                }

            }

            renderer.render(scene, camera);
            queueFrame();
        }

        const handlePageVisibility = () => {
            isPageVisible = !document.hidden;
            if (isPageVisible) {
                lastTime = performance.now();
                queueFrame();
            } else if (rafId) {
                window.cancelAnimationFrame(rafId);
                rafId = 0;
            }
        };

        const visibilityObserver = typeof IntersectionObserver === 'undefined'
            ? null
            : new IntersectionObserver(([entry]) => {
                isInViewport = entry?.isIntersecting ?? true;
                if (isInViewport) {
                    lastTime = performance.now();
                    queueFrame();
                } else if (rafId) {
                    window.cancelAnimationFrame(rafId);
                    rafId = 0;
                }
            }, { rootMargin: '120px' });

        visibilityObserver?.observe(mountNode);
        document.addEventListener('visibilitychange', handlePageVisibility);

        /* ── Load model ───────────────────────── */
        loadAvatarModel().then((sourceGltf) => {
            if (disposed) return;

            const model = clone(sourceGltf.scene);
            model.scale.setScalar(1.02);
            model.position.set(0, -0.29, 0);
            // Counter native backward tilt
            model.rotation.set(0.10, 0, 0);

            model.traverse((child) => {
                const mesh = child as THREE.Mesh;
                if ('isMesh' in mesh && mesh.isMesh) {
                    mesh.frustumCulled = false;
                    const material = mesh.material;
                    if (Array.isArray(material)) {
                        material.forEach((m) => { m.needsUpdate = true; });
                    } else if (material) {
                        material.needsUpdate = true;
                    }

                    if (mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
                        const dictionary = mesh.morphTargetDictionary;
                        const leftIdx = dictionary['eyeBlinkLeft'];
                        const rightIdx = dictionary['eyeBlinkRight'];
                        if (leftIdx !== undefined && rightIdx !== undefined) {
                            blinkMeshes.push({ mesh, leftIdx, rightIdx });
                        }

                    }
                }

                const boneName = child.name.toLowerCase();
                if (!boneName) return;

                // Match bones
                if (boneName === BONE_NAMES.head) bones.head = child;
                if (boneName === BONE_NAMES.neck) bones.neck = child;
                if (boneName === BONE_NAMES.spine) bones.spine = child;
                if (boneName === BONE_NAMES.spine1) bones.spine1 = child;
                if (boneName === BONE_NAMES.spine2) bones.spine2 = child;
                if (boneName === BONE_NAMES.leftEye) bones.leftEye = child;
                if (boneName === BONE_NAMES.rightEye) bones.rightEye = child;
                if (boneName === BONE_NAMES.leftShoulder) bones.leftShoulder = child;
                if (boneName === BONE_NAMES.rightShoulder) bones.rightShoulder = child;
                if (boneName === BONE_NAMES.leftArm) bones.leftArm = child;
                if (boneName === BONE_NAMES.rightArm) bones.rightArm = child;
                if (boneName === BONE_NAMES.leftForeArm) bones.leftForeArm = child;
                if (boneName === BONE_NAMES.rightForeArm) bones.rightForeArm = child;
                if (boneName === BONE_NAMES.leftHand) bones.leftHand = child;
                if (boneName === BONE_NAMES.rightHand) bones.rightHand = child;
                if (boneName === BONE_NAMES.hips) bones.hips = child;
            });

            /* ──────────────────────────────────────
             *  Force Perfect Rest Pose: Match User Reference
             *  - Shoulders: Depressed (Z) + Slightly forward (X or Y)
             *  - Arms: Dropped almost fully down (tight to torso)
             * ────────────────────────────────────── */
            if (bones.leftShoulder) {
                bones.leftShoulder.rotation.z += THREE.MathUtils.degToRad(8); // Drop shoulder
                bones.leftShoulder.rotation.y -= THREE.MathUtils.degToRad(8);
            }
            if (bones.rightShoulder) {
                bones.rightShoulder.rotation.z -= THREE.MathUtils.degToRad(8);
                bones.rightShoulder.rotation.y += THREE.MathUtils.degToRad(8);
            }

            if (bones.leftArm) {
                bones.leftArm.rotation.x += THREE.MathUtils.degToRad(70); // Drop tight to the body!
                bones.leftArm.rotation.z += THREE.MathUtils.degToRad(8);
            }
            if (bones.rightArm) {
                bones.rightArm.rotation.x += THREE.MathUtils.degToRad(70);
                bones.rightArm.rotation.z += THREE.MathUtils.degToRad(8);
            }

            if (bones.leftForeArm) {
                // Keep mostly straight with tiny bend
                bones.leftForeArm.rotation.x += THREE.MathUtils.degToRad(10);
            }
            if (bones.rightForeArm) {
                bones.rightForeArm.rotation.x += THREE.MathUtils.degToRad(10);
            }

            if (bones.leftHand) {
                // Ensure palms aren't pointing out awkwardly
                bones.leftHand.rotation.x += THREE.MathUtils.degToRad(5);
            }
            if (bones.rightHand) {
                bones.rightHand.rotation.x += THREE.MathUtils.degToRad(5);
            }

            /* ──────────────────────────────────────
             *  Relax Fingers: procedurally curl the
             *  fingers to match model.glb's natural
             *  resting posture (since we removed the
             *  animation clip that did this).
             * ────────────────────────────────────── */
            const curlFingers = (bone: THREE.Object3D) => {
                const name = bone.name.toLowerCase();
                // Mixamo finger bones: HandIndex1, HandMiddle2, etc.
                if (name.includes('hand') && (
                    name.includes('index') || name.includes('middle') ||
                    name.includes('ring') || name.includes('pinky') || name.includes('thumb')
                )) {
                    // In Mixamo, Z is the primary bend axis for fingers
                    // Negative Z curls inward for Left, Positive for Right (or vice-versa depending on export)
                    // Let's rely on the hand side to determine curl direction
                    const isLeft = name.includes('left');
                    const isThumb = name.includes('thumb');

                    // Thumb curls differently from other fingers
                    if (isThumb) {
                        bone.rotation.y += isLeft ? THREE.MathUtils.degToRad(10) : THREE.MathUtils.degToRad(-10);
                        bone.rotation.z += isLeft ? THREE.MathUtils.degToRad(-10) : THREE.MathUtils.degToRad(10);
                    } else {
                        // Base joint (1) curls less, middle (2) and tip (3) curl more
                        let curlAmount = 15;
                        if (name.includes('2') || name.includes('3')) curlAmount = 25;

                        bone.rotation.z += isLeft ? THREE.MathUtils.degToRad(-curlAmount) : THREE.MathUtils.degToRad(curlAmount);
                    }
                }
            };

            if (bones.leftHand) bones.leftHand.traverse(curlFingers);
            if (bones.rightHand) bones.rightHand.traverse(curlFingers);

            /* ── Capture rest quaternions for all tracked bones ── */
            model.updateMatrixWorld(true);
            for (const [key, bone] of Object.entries(bones)) {
                if (bone) {
                    restQuaternions[key] = bone.quaternion.clone();
                }
            }

            rootModel = model;
            scene.add(model);
            resize();
            renderer.render(scene, camera);
            mountNode.classList.remove('cp-avatar-loading');
            lastTime = performance.now();
            window.requestAnimationFrame(() => {
                if (disposed) return;
                onReady();
                queueFrame();
            });
        }).catch(() => {
            if (disposed) return;
            mountNode.classList.remove('cp-avatar-loading');
            mountNode.dataset.avatarError = 'true';
            onError();
        });

        resize();
        window.addEventListener('resize', resize);
        window.addEventListener('pointermove', handlePointerMove, { passive: true });
        window.addEventListener('pointerleave', handlePointerLeave);

        return () => {
            disposed = true;
            window.cancelAnimationFrame(rafId);
            visibilityObserver?.disconnect();
            document.removeEventListener('visibilitychange', handlePageVisibility);
            window.removeEventListener('resize', resize);
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerleave', handlePointerLeave);
            window.removeEventListener('avatar-ai-state', handleAIState);
            // The cloned avatar shares source resources with the cached GLB.
            // Keep those resources valid for route remounts and release renderer state.
            scene.clear();
            renderer.renderLists.dispose();
            renderer.dispose();
            mountNode.classList.remove('cp-avatar-loading');
            if (renderer.domElement.parentElement === mountNode) {
                mountNode.removeChild(renderer.domElement);
            }
        };
    }, [onError, onReady]);

    return <div ref={mountRef} className="cp-hero-avatar-canvas" aria-hidden="true" />;
}

export function PortfolioAvatar() {
    const [status, setStatus] = useState<AvatarStatus>('loading');
    const [showSkeleton, setShowSkeleton] = useState(true);

    const handleReady = useCallback(() => setStatus('ready'), []);
    const handleError = useCallback(() => setStatus('error'), []);

    useEffect(() => {
        if (status !== 'ready') return;
        const timeout = window.setTimeout(() => setShowSkeleton(false), 280);
        return () => window.clearTimeout(timeout);
    }, [status]);

    return (
        <div
            className="cp-hero-avatar-stage-react"
            data-avatar-state={status}
        >
            {showSkeleton && (
                <div className="cp-avatar-skeleton cp-avatar-skeleton--model" aria-hidden="true" />
            )}
            <InteractiveAvatar onReady={handleReady} onError={handleError} />
            {status === 'error' && (
                <span className="cp-avatar-status" role="status">
                    Interactive avatar unavailable.
                </span>
            )}
        </div>
    );
}
