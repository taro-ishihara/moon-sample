import { useRef } from "react";

import { useLoader, useFrame } from "@react-three/fiber";
import {
  Mesh,
  ShaderMaterial,
  TextureLoader,
  WebGLArrayRenderTarget,
} from "three";

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform int frame;
uniform float delta;
uniform sampler2D texture1;
varying vec2 vUv;
float sigmoid(float x) {
  return 1.0 / (1.0 + exp(-x));
}
void main() {
  gl_FragColor = texture2D(texture1, vUv);
  
  vec2 point = vec2(0.25, 0.5);
  float dist = distance(vUv, point);

  float speed = 0.0001;
  float size = 0.03;
  float position = mod(float(frame) * speed, size);
  float decay = (size - position) / size;
  float intensity = 1. - sigmoid(abs(dist - position) * 1000.);
  gl_FragColor += intensity * decay;
}
`;

export const Moon = () => {
  const colorMap = useLoader(TextureLoader, "textures/moon_color.png");
  const arrayRenderTarget = new WebGLArrayRenderTarget(1, 1, 2);
  const material = useRef<ShaderMaterial>(null);
  useFrame((state, delta) => {
    material.current!.uniforms.frame.value += 1;
    if (material.current!.uniforms.frame.value == 65535) {
      material.current!.uniforms.frame.value = 0;
    }
  });
  useFrame((state, delta) => (material.current!.uniforms.delta.value = delta));

  return (
    <mesh>
      <sphereGeometry args={[3, 256, 128]} />
      <shaderMaterial
        ref={material}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          frame: { value: 0 },
          delta: { value: 0.1 },
          texture1: { value: colorMap },
        }}
      />
    </mesh>
  );
};
