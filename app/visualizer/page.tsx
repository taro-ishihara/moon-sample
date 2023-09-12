"use client";

import { useEffect, useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { InstancedMesh, TextureLoader } from "three";
import { Moon } from "@/components/moon";

export default function Visualizer() {
  useEffect(() => {}, []);
  return (
    <div className="w-screen h-screen bg-black">
      <Canvas>
        <directionalLight intensity={12} />
        <Moon />
      </Canvas>
    </div>
  );
}
