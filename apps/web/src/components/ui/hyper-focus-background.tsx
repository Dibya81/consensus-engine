'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSensory } from './SensoryProvider';

const fragmentShader = `
uniform float u_time;
uniform float u_speed;
uniform vec2 u_mouse;
varying vec2 vUv;

// Simplex 2D noise
//
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
    dot(x12.zw,x12.zw)), 0.0);
  m = m*m;
  m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
    // Parallax shifting
    vec2 p = vUv * 2.0 - 1.0;
    p -= u_mouse * 0.05; 
    
    // Scale up UV to prevent edges from showing
    vec2 uv = p * 1.5;
    
    // Time variable modified by typing speed
    float t = u_time * (0.05 + u_speed * 1.5);
    
    // Compute flow using 2D noise (much faster than 3D!)
    float noiseVal = snoise(uv * 1.5 + vec2(t * 0.5, t * 0.3));
    
    // Smooth, deep obsidian colors (matches theme)
    vec3 baseColor = vec3(0.01, 0.01, 0.02);
    vec3 accent1 = vec3(0.5, 0.1, 0.9) * 0.15; // deep purple glow
    vec3 accent2 = vec3(0.0, 0.8, 0.6) * 0.1;  // teal cyber glow
    
    vec3 color = baseColor;
    
    // Fast path: map noise value directly to color mix
    float normalizedNoise = noiseVal * 0.5 + 0.5; // 0.0 to 1.0
    color += accent1 * smoothstep(0.4, 0.8, normalizedNoise);
    
    // Only apply second layer if moving fast
    if (u_speed > 0.05) {
        float fastNoise = snoise(uv * 2.0 + vec2(-t * 0.8, t * 0.6));
        color += accent2 * smoothstep(0.5, 0.9, fastNoise * 0.5 + 0.5) * (u_speed * 1.5);
    }
    
    // Add pulsing vignette based on typing speed overlaying the edges
    float vignette = length(p);
    color -= vec3(vignette * 0.2);
    
    gl_FragColor = vec4(color, 1.0);
}
`;

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

function FluidShaderMaterial() {
    const { typingSpeed, mouseParallax } = useSensory();
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const speedRef = useRef(0);

    const uniforms = useMemo(
        () => ({
            u_time: { value: 0 },
            u_speed: { value: 0 },
            u_mouse: { value: new THREE.Vector2(0, 0) },
        }),
        []
    );

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.u_time.value = state.clock.elapsedTime;
            // Smoothly interpolate speed uniform
            speedRef.current += (typingSpeed - speedRef.current) * 0.05;
            materialRef.current.uniforms.u_speed.value = speedRef.current;
            // Target mouse parallax
            materialRef.current.uniforms.u_mouse.value.lerp(
                new THREE.Vector2(mouseParallax.x, mouseParallax.y),
                0.05
            );
        }
    });

    return (
        <shaderMaterial
            ref={materialRef}
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            uniforms={uniforms}
        />
    );
}

export function HyperFocusBackground() {
    return (
        <div className="fixed inset-0 z-[-1] pointer-events-none opacity-80 mix-blend-screen transition-opacity duration-1000">
            <Canvas camera={{ position: [0, 0, 1] }} dpr={[1, 1.5]} gl={{ powerPreference: "high-performance", antialias: false, stencil: false, depth: false }}>
                <mesh>
                    <planeGeometry args={[10, 10]} />
                    <FluidShaderMaterial />
                </mesh>
            </Canvas>
        </div>
    );
}

