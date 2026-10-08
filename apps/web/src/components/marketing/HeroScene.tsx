import { Float, MeshDistortMaterial, Sphere } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useRef } from "react";
import type { Mesh } from "three";

type OrbProps = {
  animate: boolean;
};

function EmeraldOrb({ animate }: OrbProps) {
  const mesh = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (!animate || !mesh.current) return;
    mesh.current.rotation.y += delta * 0.18;
    mesh.current.rotation.x += delta * 0.06;
  });

  return (
    <Float
      speed={animate ? 1.4 : 0}
      rotationIntensity={animate ? 0.35 : 0}
      floatIntensity={animate ? 0.6 : 0}
    >
      <Sphere ref={mesh} args={[1.15, 80, 80]} scale={1.35}>
        <MeshDistortMaterial
          color="#2dd4a0"
          attach="material"
          distort={animate ? 0.38 : 0.2}
          speed={animate ? 1.6 : 0}
          roughness={0.18}
          metalness={0.35}
          emissive="#0d3d2e"
          emissiveIntensity={0.45}
        />
      </Sphere>
      <Sphere args={[1.05, 32, 32]} scale={1.55}>
        <meshBasicMaterial color="#58cc02" transparent opacity={0.07} />
      </Sphere>
    </Float>
  );
}

/**
 * WebGL emerald orb — import only when desktop + motion are allowed.
 */
export function HeroScene({ animate = true }: { animate?: boolean }) {
  return (
    <div className="absolute inset-0" aria-hidden>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 4.2], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.55} />
        <directionalLight position={[4, 3, 2]} intensity={1.15} color="#d7ffb8" />
        <pointLight position={[-3, -1, 2]} intensity={0.7} color="#1a9b6c" />
        <Suspense fallback={null}>
          <EmeraldOrb animate={animate} />
        </Suspense>
      </Canvas>
    </div>
  );
}
