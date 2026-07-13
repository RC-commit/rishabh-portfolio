import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, Float, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { SKILLS, type Skill } from '../../data/resumeData';
import { getSkillIconUrl } from '../../lib/skillIconUrl';

const GLOBE_SKILLS = SKILLS.filter((skill) => skill.featured && skill.iconPath);
const AUTO_ROTATION_SPEED = 0.12;
const ROTATION_RESUME_DAMPING = 2.8;
const COMPACT_GLOBE_WIDTH = 480;
const MAX_DEVICE_PIXEL_RATIO = 1.75;

interface SkillIconProps {
  skill: Skill;
  position: [number, number, number];
  isHovered: boolean;
  isCompact: boolean;
  onHover: (hovered: boolean) => void;
}

function SkillIcon({ skill, position, isHovered, isCompact, onHover }: SkillIconProps) {
  const groupRef = useRef<THREE.Group>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const worldPosition = useMemo(() => new THREE.Vector3(), []);
  const globeCenter = useMemo(() => new THREE.Vector3(), []);
  const relativePosition = useMemo(() => new THREE.Vector3(), []);
  const cameraDirection = useMemo(() => new THREE.Vector3(), []);

  const iconUrl = getSkillIconUrl(skill.iconPath);

  useFrame((state) => {
    if (!groupRef.current || !divRef.current) return;

    groupRef.current.getWorldPosition(worldPosition);
    groupRef.current.parent?.getWorldPosition(globeCenter);
    state.camera.getWorldDirection(cameraDirection);
    relativePosition.copy(worldPosition).sub(globeCenter);

    // -1 faces the camera, +1 faces away. This stays correct if the camera moves.
    const normalizedRearDepth = THREE.MathUtils.clamp(
      relativePosition.dot(cameraDirection) / Math.max(relativePosition.length(), 0.001),
      -1,
      1,
    );
    const frontDepth = (1 - normalizedRearDepth) / 2;
    const opacity = THREE.MathUtils.lerp(0.35, 1, frontDepth);
    const scale = THREE.MathUtils.lerp(0.8, 1.1, frontDepth);
    const isBack = normalizedRearDepth > 0.75;
    const compactRearFade = THREE.MathUtils.smoothstep(normalizedRearDepth, 0, 0.55);
    const compactLabelOpacity = THREE.MathUtils.lerp(0.95, 0.03, compactRearFade);

    // Compact layouts retain every icon and fade only labels on the rear hemisphere.
    divRef.current.style.opacity = isCompact || isHovered ? '1' : opacity.toString();
    divRef.current.style.transform = isHovered ? 'scale(1.2)' : `scale(${scale})`;
    divRef.current.style.pointerEvents = (isBack && !isHovered) ? 'none' : 'auto';
    divRef.current.style.zIndex = isHovered ? '100' : Math.round(frontDepth * 100).toString();
    if (labelRef.current) {
      labelRef.current.style.opacity = isHovered
        ? '1'
        : (isCompact ? compactLabelOpacity.toFixed(3) : '0.95');
    }
  });

  if (!iconUrl) return null;

  return (
    <group ref={groupRef} position={position}>
      <Html center distanceFactor={10} zIndexRange={[100, 0]}>
        <div
          ref={divRef}
          className={`cp-globe-skill-node ${isHovered ? 'hovered' : ''}`}
          onPointerEnter={() => onHover(true)}
          onPointerLeave={() => onHover(false)}
          style={{ pointerEvents: 'auto' }}
        >
          <div className="cp-globe-icon-wrap">
            <img src={iconUrl} alt={skill.name} className="cp-globe-icon" loading="lazy" />
          </div>
          <span ref={labelRef} className="cp-globe-skill-name">{skill.name}</span>
        </div>
      </Html>
    </group>
  );
}

interface GlobeContentProps {
  autoRotationPaused: boolean;
}

function GlobeContent({ autoRotationPaused }: GlobeContentProps) {
  const groupRef = useRef<THREE.Group>(null);
  const planetRef = useRef<THREE.Mesh>(null);
  const rotationSpeedRef = useRef(AUTO_ROTATION_SPEED);
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);
  const isCompact = useThree((state) => state.size.width < COMPACT_GLOBE_WIDTH);

  const skillPositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    const n = GLOBE_SKILLS.length;
    const phi = Math.PI * (3 - Math.sqrt(5));
    // Keep rotating HTML icons inside the canvas, including hover scale and Float drift.
    const baseScale = isCompact ? 2.95 : 3.65;

    for (let i = 0; i < n; i++) {
      const y = 1 - (i / (n - 1)) * 2;
      const radius = Math.sqrt(1 - y * y);
      const theta = phi * i;
      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius;

      positions.push([x * baseScale, y * baseScale, z * baseScale]);
    }

    return positions;
  }, [isCompact]);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const frameDelta = Math.min(delta, 0.05);

    if (groupRef.current) {
      rotationSpeedRef.current = autoRotationPaused
        ? 0
        : THREE.MathUtils.damp(
          rotationSpeedRef.current,
          AUTO_ROTATION_SPEED,
          ROTATION_RESUME_DAMPING,
          frameDelta,
        );
      groupRef.current.rotation.y += rotationSpeedRef.current * frameDelta;
    }
    if (planetRef.current) {
      planetRef.current.rotation.x = Math.sin(t * 0.2) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      <Sphere args={[2, 64, 64]} ref={planetRef}>
        <MeshDistortMaterial
          color="#a855f7"
          distort={0.4}
          speed={2}
          transparent
          opacity={0.45}
          emissive="#22d3ee"
          emissiveIntensity={1.5}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Sphere>

      <Sphere args={[1.3, 32, 32]}>
        <meshBasicMaterial
          color="#06b6d4"
          transparent
          opacity={0.55}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </Sphere>

      <Sphere args={[3.1, 24, 24]}>
        <meshBasicMaterial
          color="#7dd3fc"
          wireframe
          transparent
          opacity={0.15}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Sphere>

      {GLOBE_SKILLS.map((skill, index) => (
        <SkillIcon
          key={skill.name}
          skill={skill}
          position={skillPositions[index]}
          isHovered={hoveredSkill === skill.name}
          isCompact={isCompact}
          onHover={(hovered) => setHoveredSkill(hovered ? skill.name : null)}
        />
      ))}
    </group>
  );
}

export function SkillGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInViewport, setIsInViewport] = useState(true);
  const [isPageVisible, setIsPageVisible] = useState(() => (
    typeof document === 'undefined' || document.visibilityState !== 'hidden'
  ));
  const [isPointerHovering, setIsPointerHovering] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsInViewport(Boolean(entry?.isIntersecting && entry.intersectionRatio > 0));
    }, { threshold: 0.01 });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const updatePageVisibility = () => setIsPageVisible(document.visibilityState !== 'hidden');
    document.addEventListener('visibilitychange', updatePageVisibility);
    return () => document.removeEventListener('visibilitychange', updatePageVisibility);
  }, []);

  const shouldRenderFrames = isInViewport && isPageVisible;
  const autoRotationPaused = !shouldRenderFrames || isPointerHovering || isDragging;

  return (
    <div
      ref={containerRef}
      className="cp-skill-globe-container"
      role="img"
      aria-label={`Interactive globe highlighting ${GLOBE_SKILLS.length} core technologies`}
      data-render-state={shouldRenderFrames ? 'active' : 'paused'}
      data-rotation-state={autoRotationPaused ? 'paused' : 'running'}
      data-drag-state={isDragging ? 'dragging' : 'idle'}
      data-icon-source="local"
      data-max-dpr={MAX_DEVICE_PIXEL_RATIO}
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') setIsPointerHovering(true);
      }}
      onPointerLeave={() => setIsPointerHovering(false)}
      onPointerCancel={() => {
        setIsPointerHovering(false);
        setIsDragging(false);
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 13], fov: 40 }}
        gl={{ antialias: true, alpha: true, stencil: false, depth: true }}
        dpr={[1, MAX_DEVICE_PIXEL_RATIO]}
        frameloop={shouldRenderFrames ? 'always' : 'never'}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.1} />
        <pointLight position={[15, 15, 5]} intensity={1} color="#ffffff" />
        <spotLight position={[-15, 10, 10]} angle={0.15} penumbra={1} intensity={0.8} color="#ffffff" />

        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
          <GlobeContent autoRotationPaused={autoRotationPaused} />
        </Float>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          rotateSpeed={0.4}
          dampingFactor={0.05}
          enableDamping
          onStart={() => setIsDragging(true)}
          onEnd={() => setIsDragging(false)}
        />
      </Canvas>
      <span className="cp-skill-globe-a11y">
        Featured technologies: {GLOBE_SKILLS.map((skill) => skill.name).join(', ')}.
      </span>
    </div>
  );
}
