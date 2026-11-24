"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Full-bleed animated sky: blue-to-haze gradient with drifting fbm clouds,
 * a soft sun bloom, and mouse parallax. Rendered on a single fullscreen quad.
 */

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2  uRes;
  uniform vec2  uMouse;   // -1..1, eased
  uniform float uReveal;  // 0..1 intro

  // --- noise -------------------------------------------------------------
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x),
               mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    mat2 r = mat2(0.8, -0.6, 0.6, 0.8);
    for (int i = 0; i < 6; i++) { v += a * noise(p); p = r * p * 2.02; a *= 0.5; }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uRes.x / uRes.y;
    vec2 p = vec2(uv.x * aspect, uv.y);

    // Sky gradient (top blue -> mid -> haze)
    vec3 top  = vec3(0.490, 0.612, 0.769); // #7d9cc4
    vec3 mid  = vec3(0.722, 0.796, 0.878); // #b8cbe0
    vec3 haze = vec3(0.953, 0.961, 0.969); // #f3f5f7
    float g = uv.y;
    vec3 col = mix(haze, mid, smoothstep(0.05, 0.55, g));
    col = mix(col, top, smoothstep(0.5, 1.0, g));

    // Sun bloom, upper right
    vec2 sunPos = vec2(aspect * 0.78, 0.92) + uMouse * 0.03;
    float sun = exp(-length(p - sunPos) * 2.6);
    col += vec3(1.0, 0.97, 0.92) * sun * 0.35;

    // Two cloud layers with parallax
    float t = uTime * 0.012;
    vec2 q1 = p * 1.6 + vec2(t * 2.0, 0.0) + uMouse * 0.06;
    vec2 q2 = p * 3.2 + vec2(t * 3.5, t * 0.6) + uMouse * 0.14;

    // domain warp for soft, billowy shapes
    vec2 w = vec2(fbm(q1 + vec2(1.7, 9.2)), fbm(q1 + vec2(8.3, 2.8)));
    float c1 = fbm(q1 + 1.4 * w);
    float c2 = fbm(q2 + 0.8 * w);

    // clouds thicker toward the lower-middle of the frame
    float band = smoothstep(0.95, 0.25, uv.y) * smoothstep(-0.1, 0.35, uv.y);
    float d1 = smoothstep(0.48, 0.82, c1) * (0.35 + 0.65 * band);
    float d2 = smoothstep(0.55, 0.9, c2) * band * 0.7;

    // light from above: cloud tops bright, undersides cool
    vec3 cloudLit  = vec3(1.0);
    vec3 cloudShade = vec3(0.80, 0.85, 0.92);
    float shade = smoothstep(0.4, 0.9, fbm(q1 + w + vec2(0.0, 0.25)));
    vec3 cloud = mix(cloudLit, cloudShade, shade * 0.6);

    col = mix(col, cloud, d1 * 0.85 * uReveal);
    col = mix(col, vec3(1.0), d2 * 0.55 * uReveal);

    // ground haze so bottom UI stays legible
    col = mix(col, haze, smoothstep(0.32, 0.0, uv.y) * 0.9);

    // fine grain
    col += (hash(uv * uRes + uTime) - 0.5) * 0.012;

    gl_FragColor = vec4(col, 1.0);
  }
`;

export default function SkyCanvas({ className = "" }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    host.appendChild(renderer.domElement);
    renderer.domElement.style.cssText = "display:block;width:100%;height:100%";

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const uniforms = {
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uReveal: { value: 0 },
    };
    const material = new THREE.ShaderMaterial({ vertexShader: vertex, fragmentShader: fragment, uniforms });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(mesh);

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = host;
      renderer.setSize(w, h, false);
      uniforms.uRes.value.set(w, h);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    const target = new THREE.Vector2();
    const onMove = (e: PointerEvent) => {
      target.set((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1));
    };
    window.addEventListener("pointermove", onMove);

    let visible = true;
    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    io.observe(host);

    const timer = new THREE.Timer();
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!visible || document.hidden) return;
      timer.update();
      const dt = timer.getDelta();
      if (!reduceMotion) uniforms.uTime.value += dt;
      uniforms.uMouse.value.lerp(target, 0.04);
      uniforms.uReveal.value = Math.min(1, uniforms.uReveal.value + dt * 0.6);
      renderer.render(scene, camera);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      ro.disconnect();
      io.disconnect();
      mesh.geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={hostRef} aria-hidden className={className} />;
}
