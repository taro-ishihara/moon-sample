import { useRef } from "react";

import { useLoader, useFrame } from "@react-three/fiber";
import { Mesh, MeshLambertMaterial, TextureLoader } from "three";

export const Moon = () => {
  const colorMap = useLoader(TextureLoader, "textures/moon_color.png");

  const ref = useRef<Mesh>(null);
  useFrame((state, delta) => (ref.current!.rotation.y += delta * 0.1));

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[3, 256, 128]} />
      <meshLambertMaterial map={colorMap} />
    </mesh>
  );
};
