"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import landTopo from "world-atlas/land-110m.json";

/**
 * Full-bleed hero backdrop: starfield + a dotted 3D globe sitting on the right,
 * with an orange/blue rim glow, pulsing markers on the two campuses and arcs
 * flying from India to the world (United Carriers-style, built from scratch).
 */

const DEG = Math.PI / 180;
const CAMPUSES: [number, number][] = [
  [13.34, 77.1], // Tumkuru (SSAHE)
  [18.52, 73.86], // Pune (ADYPU)
];
const DESTINATIONS: [number, number][] = [
  [51.5, -0.13], // London
  [40.71, -74.0], // New York
  [37.77, -122.42], // San Francisco
  [1.35, 103.82], // Singapore
  [25.2, 55.27], // Dubai
  [-33.87, 151.21], // Sydney
  [35.68, 139.69], // Tokyo
  [52.52, 13.4], // Berlin
  [-1.29, 36.82], // Nairobi
  [43.65, -79.38], // Toronto
];

function latLonToVec(lat: number, lon: number, r = 1) {
  const phi = (90 - lat) * DEG;
  const theta = (lon + 180) * DEG;
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
}

/** Rasterise land polygons to an equirectangular mask we can sample. */
function buildLandMask(w = 1024, h = 512) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  const topo = landTopo as unknown as Topology<{ land: GeometryCollection }>;
  const land = feature(topo, topo.objects.land) as GeoJSON.FeatureCollection | GeoJSON.Feature;
  const geoms = "features" in land ? land.features.map((f) => f.geometry) : [land.geometry];
  ctx.fillStyle = "#fff";
  const toX = (lon: number) => ((lon + 180) / 360) * w;
  const toY = (lat: number) => ((90 - lat) / 180) * h;
  for (const g of geoms) {
    const polys = g.type === "Polygon" ? [g.coordinates] : g.type === "MultiPolygon" ? g.coordinates : [];
    for (const poly of polys) {
      const outer = poly[0];
      const lats = outer.map((p) => p[1]);
      // Antarctica: its ring wraps all 360° of longitude — fill it as a polar band instead
      if (Math.min(...lats) < -60 && Math.max(...lats) < -55) {
        const edge = Math.max(...lats);
        ctx.fillRect(0, toY(edge + 2), w, h - toY(edge + 2));
        continue;
      }
      // unwrap rings that cross the antimeridian so they don't streak across the map,
      // then draw them at -360/0/+360 so the wrapped part still lands on the canvas
      const rings = poly.map((ring) => {
        const out: [number, number][] = [];
        let prev = ring[0][0];
        let shift = 0;
        for (const [lon, lat] of ring) {
          if (lon - prev > 180) shift -= 360;
          else if (prev - lon > 180) shift += 360;
          prev = lon;
          out.push([lon + shift, lat]);
        }
        return out;
      });
      for (const off of [-360, 0, 360]) {
        ctx.beginPath();
        for (const ring of rings) {
          ring.forEach(([lon, lat], i) => {
            if (i === 0) ctx.moveTo(toX(lon + off), toY(lat));
            else ctx.lineTo(toX(lon + off), toY(lat));
          });
          ctx.closePath();
        }
        ctx.fill("evenodd");
      }
    }
  }
  const data = ctx.getImageData(0, 0, w, h).data;
  return (lat: number, lon: number) => {
    const x = Math.min(w - 1, Math.max(0, Math.floor(((lon + 180) / 360) * w)));
    const y = Math.min(h - 1, Math.max(0, Math.floor(((90 - lat) / 180) * h)));
    return data[(y * w + x) * 4] > 128;
  };
}

function dotTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, "rgba(255,255,255,1)");
  grd.addColorStop(0.5, "rgba(255,255,255,0.9)");
  grd.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export default function GlobeCanvas({ className = "" }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const disposables: Array<{ dispose: () => void }> = [];
    const track = <T extends { dispose: () => void }>(x: T) => (disposables.push(x), x);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.domElement.style.cssText = "display:block;width:100%;height:100%";
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0, 6);

    // ── stars ─────────────────────────────────────────────
    const sprite = track(dotTexture());
    {
      const n = 900;
      const pos = new Float32Array(n * 3);
      const col = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 24;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 14;
        pos[i * 3 + 2] = -4 - Math.random() * 6;
        const b = 0.35 + Math.random() * 0.65;
        col.set([b, b, b * 1.05], i * 3);
      }
      const g = track(new THREE.BufferGeometry());
      g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      g.setAttribute("color", new THREE.BufferAttribute(col, 3));
      const m = track(
        new THREE.PointsMaterial({ size: 0.03, map: sprite, vertexColors: true, transparent: true, depthWrite: false, opacity: 0.8 }),
      );
      scene.add(new THREE.Points(g, m));
    }

    // ── globe ─────────────────────────────────────────────
    const globe = new THREE.Group();
    scene.add(globe);
    const spin = new THREE.Group(); // rotates; globe positions/scales
    globe.add(spin);

    // occluding body (hides the back-side dots)
    spin.add(
      new THREE.Mesh(track(new THREE.SphereGeometry(0.995, 64, 64)), track(new THREE.MeshBasicMaterial({ color: "#060912" }))),
    );

    // land as dots (Fibonacci sphere sampled against the land mask)
    {
      const isLand = buildLandMask();
      const N = 11000;
      const pos: number[] = [];
      const col: number[] = [];
      const golden = Math.PI * (3 - Math.sqrt(5));
      for (let i = 0; i < N; i++) {
        const y = 1 - (i / (N - 1)) * 2;
        const rad = Math.sqrt(1 - y * y);
        const th = golden * i;
        const v = new THREE.Vector3(Math.cos(th) * rad, y, Math.sin(th) * rad);
        const lat = Math.asin(v.y) / DEG;
        // invert latLonToVec: x = -sinφ cosθ, z = sinφ sinθ
        const lon = Math.atan2(v.z, -v.x) / DEG - 180;
        const L = lon < -180 ? lon + 360 : lon;
        if (!isLand(lat, L)) continue;
        pos.push(v.x * 1.002, v.y * 1.002, v.z * 1.002);
        const warm = Math.random() < 0.06;
        if (warm) col.push(1, 0.72, 0.45);
        else {
          const b = 0.7 + Math.random() * 0.3;
          col.push(b * 0.88, b * 0.92, b);
        }
      }
      const g = track(new THREE.BufferGeometry());
      g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
      const m = track(
        new THREE.PointsMaterial({ size: 0.024, map: sprite, vertexColors: true, transparent: true, depthWrite: false, alphaTest: 0.05 }),
      );
      spin.add(new THREE.Points(g, m));
    }

    // rim glow: orange upper-right, blue lower-left (view-space fresnel)
    const glowMat = track(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        uniforms: {},
        vertexShader: /* glsl */ `
          varying vec3 vN; varying vec3 vV;
          void main() {
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vN = normalize(normalMatrix * normal);
            vV = normalize(-mv.xyz);
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: /* glsl */ `
          varying vec3 vN; varying vec3 vV;
          void main() {
            float rim = pow(1.0 - abs(dot(vN, vV)), 1.6);
            float t = smoothstep(-0.7, 0.7, vN.x * 0.6 + vN.y * 0.8);
            vec3 col = mix(vec3(0.18, 0.42, 1.0), vec3(1.0, 0.48, 0.18), t);
            gl_FragColor = vec4(col * rim * 1.6, rim);
          }`,
      }),
    );
    const glow = new THREE.Mesh(track(new THREE.SphereGeometry(1.075, 64, 64)), glowMat);
    globe.add(glow);

    // thin bright edge on the front face
    const edgeMat = track(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: glowMat.vertexShader,
        fragmentShader: /* glsl */ `
          varying vec3 vN; varying vec3 vV;
          void main() {
            float rim = pow(1.0 - max(dot(vN, vV), 0.0), 5.0);
            float t = smoothstep(-0.7, 0.7, vN.x * 0.6 + vN.y * 0.8);
            vec3 col = mix(vec3(0.3, 0.55, 1.0), vec3(1.0, 0.62, 0.3), t);
            gl_FragColor = vec4(col, rim * 0.9);
          }`,
      }),
    );
    globe.add(new THREE.Mesh(track(new THREE.SphereGeometry(1.004, 64, 64)), edgeMat));

    // ── arcs from the campuses ──────────────────────────────
    const arcMats: THREE.ShaderMaterial[] = [];
    const arcVert = /* glsl */ `
      varying float vT;
      void main() { vT = uv.x; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
    const arcFrag = /* glsl */ `
      uniform float uHead; uniform vec3 uColor;
      varying float vT;
      void main() {
        float d = uHead - vT;
        float comet = smoothstep(0.0, 0.015, d) * (1.0 - smoothstep(0.0, 0.32, d));
        float base = 0.22;
        float a = max(base, comet);
        gl_FragColor = vec4(uColor * (0.9 + comet * 1.4), a);
      }`;
    DESTINATIONS.forEach((dest, i) => {
      const from = CAMPUSES[i % CAMPUSES.length];
      const a = latLonToVec(from[0], from[1], 1.003);
      const b = latLonToVec(dest[0], dest[1], 1.003);
      const dist = a.distanceTo(b);
      const mid = a.clone().add(b).multiplyScalar(0.5).normalize().multiplyScalar(1 + dist * 0.38);
      const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
      const geo = track(new THREE.TubeGeometry(curve, 80, 0.006, 6, false));
      const mat = track(
        new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          uniforms: { uHead: { value: -Math.random() }, uColor: { value: new THREE.Color(i % 3 === 0 ? "#ff3b5c" : "#ff9a4a") } },
          vertexShader: arcVert,
          fragmentShader: arcFrag,
        }),
      );
      arcMats.push(mat);
      spin.add(new THREE.Mesh(geo, mat));
    });

    // pulsing campus markers
    const markers: THREE.Mesh[] = [];
    CAMPUSES.forEach(([lat, lon]) => {
      const p = latLonToVec(lat, lon, 1.006);
      const dot = new THREE.Mesh(track(new THREE.CircleGeometry(0.014, 24)), track(new THREE.MeshBasicMaterial({ color: "#ff2d55" })));
      dot.position.copy(p);
      dot.lookAt(p.clone().multiplyScalar(2));
      spin.add(dot);
      const ring = new THREE.Mesh(
        track(new THREE.RingGeometry(0.02, 0.028, 32)),
        track(new THREE.MeshBasicMaterial({ color: "#ff2d55", transparent: true, depthWrite: false })),
      );
      ring.position.copy(p);
      ring.lookAt(p.clone().multiplyScalar(2));
      spin.add(ring);
      markers.push(ring);
    });

    // face India toward the viewer, northern hemisphere tilted in
    const india = latLonToVec(18, 76);
    const baseRotY = Math.atan2(-india.x, india.z) - 0.8;
    spin.rotation.y = baseRotY;
    globe.rotation.x = 0.32;
    globe.rotation.z = -0.12;

    // ── layout: globe on the right, partly off-screen (smaller + higher on phones) ──
    let halfW = 1;
    let halfH = 1;
    const resize = () => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      halfH = Math.tan((camera.fov / 2) * DEG) * camera.position.z;
      halfW = halfH * camera.aspect;
      const mobile = w < 768;
      const s = mobile ? halfH * 0.62 : halfH * 0.98;
      globe.scale.setScalar(s);
      globe.position.set(mobile ? halfW * 0.55 : halfW * 0.76, mobile ? halfH * 0.18 : -halfH * 0.02, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    // pointer tilt
    const target = new THREE.Vector2();
    const onMove = (e: PointerEvent) =>
      target.set((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
    window.addEventListener("pointermove", onMove);

    let visible = true;
    const io = new IntersectionObserver(([en]) => (visible = en.isIntersecting));
    io.observe(host);

    const timer = new THREE.Timer();
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!visible || document.hidden) return;
      timer.update();
      const dt = Math.min(timer.getDelta(), 0.05);
      const t = timer.getElapsed();
      if (!reduced) {
        spin.rotation.y = baseRotY + Math.sin(t * 0.08) * 0.35;
        arcMats.forEach((m, i) => {
          m.uniforms.uHead.value += dt * (0.22 + (i % 3) * 0.04);
          if (m.uniforms.uHead.value > 1.4) m.uniforms.uHead.value = -0.2 - Math.random() * 0.6;
        });
        markers.forEach((r, i) => {
          const k = (t * 0.8 + i * 0.5) % 1;
          r.scale.setScalar(1 + k * 2.2);
          (r.material as THREE.MeshBasicMaterial).opacity = 1 - k;
        });
        globe.rotation.x += (0.32 + target.y * 0.06 - globe.rotation.x) * 0.04;
        globe.rotation.y += (target.x * 0.12 - globe.rotation.y) * 0.04;
      } else {
        arcMats.forEach((m, i) => (m.uniforms.uHead.value = 0.5 + i * 0.05));
      }
      renderer.render(scene, camera);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={hostRef} aria-hidden className={className} />;
}
