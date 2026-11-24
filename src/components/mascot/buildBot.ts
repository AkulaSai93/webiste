import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

/**
 * Colour roles, modelled on the mascot concept (green shell / yellow plates /
 * pink pads / black joints). Swap these to re-skin the whole bot, e.g. for the
 * concept colours use: shell "#4fae6e", plate "#e6c55a", pad "#d98aa3", joint "#15181f".
 */
export const PALETTE = {
  shell: "#f3f5f9", // head, chest, forearm cuffs, shins
  plate: "#c5d2e4", // upper arms, thighs, palms, shoes
  pad: "#e4002b", // shoulder & knee domes, fingertips, soles
  joint: "#151a24", // ball joints, waist, bezel
};

export type BotParts = {
  root: THREE.Group; // position / scale / facing (driven by scroll)
  float: THREE.Group; // idle bob
  floatBase: number;
  head: THREE.Group; // looks at the cursor
  armL: THREE.Group; // shoulder pivots
  armR: THREE.Group;
  elbowL: THREE.Group;
  elbowR: THREE.Group;
  legL: THREE.Group; // hip pivots
  legR: THREE.Group;
  kneeL: THREE.Group;
  kneeR: THREE.Group;
  antennaTip: THREE.Mesh;
  chestLight: THREE.MeshStandardMaterial;
  ring: THREE.Mesh;
  glow: THREE.Mesh;
  dispose: () => void;
};

/** Builds the upGrad SOT bot procedurally — monitor head with live code, jointed arms, hands and legs. */
export function buildBot(screenTexture: THREE.Texture): BotParts {
  const disposables: Array<{ dispose: () => void }> = [];
  const track = <T extends { dispose: () => void }>(x: T) => (disposables.push(x), x);

  // ── materials ───────────────────────────────────────────────
  const glossy = (color: string) =>
    track(
      new THREE.MeshPhysicalMaterial({
        color,
        roughness: 0.28,
        metalness: 0,
        clearcoat: 1,
        clearcoatRoughness: 0.12,
      }),
    );
  const shell = glossy(PALETTE.shell);
  const plate = glossy(PALETTE.plate);
  const pad = glossy(PALETTE.pad);
  const joint = track(new THREE.MeshStandardMaterial({ color: PALETTE.joint, roughness: 0.35, metalness: 0.35 }));
  const red = track(
    new THREE.MeshStandardMaterial({ color: "#e4002b", emissive: "#e4002b", emissiveIntensity: 0.35, roughness: 0.3 }),
  );
  const chestLight = track(
    new THREE.MeshStandardMaterial({ color: "#e4002b", emissive: "#ff1f4b", emissiveIntensity: 1.2, roughness: 0.2 }),
  );
  const blueGlow = track(
    new THREE.MeshBasicMaterial({ color: "#8ec5ff", transparent: true, opacity: 0.9, toneMapped: false }),
  );
  const screenMat = track(new THREE.MeshBasicMaterial({ map: screenTexture, toneMapped: false }));
  const glass = track(
    new THREE.MeshPhysicalMaterial({ color: "#ffffff", roughness: 0.05, transparent: true, opacity: 0.12, clearcoat: 1 }),
  );

  // shared geometry helpers
  const sphere = (r: number) => track(new THREE.SphereGeometry(r, 32, 24));
  const cyl = (rt: number, rb: number, h: number) => track(new THREE.CylinderGeometry(rt, rb, h, 32));
  const rbox = (w: number, h: number, d: number, r: number) => track(new RoundedBoxGeometry(w, h, d, 4, r));
  const mesh = (g: THREE.BufferGeometry, m: THREE.Material, x = 0, y = 0, z = 0) => {
    const o = new THREE.Mesh(g, m);
    o.position.set(x, y, z);
    return o;
  };

  const root = new THREE.Group();
  const float = new THREE.Group();
  root.add(float);

  // ── head (monitor) ─────────────────────────────────────────
  const head = new THREE.Group();
  head.position.y = 1.05;
  float.add(head);

  head.add(mesh(track(new RoundedBoxGeometry(2.0, 1.42, 1.0, 6, 0.34)), shell));
  head.add(mesh(rbox(1.74, 1.16, 0.12, 0.14), joint, 0, 0, 0.47));
  head.add(mesh(track(new THREE.PlaneGeometry(1.6, 1.04)), screenMat, 0, 0, 0.535));
  head.add(mesh(track(new THREE.PlaneGeometry(1.6, 1.04)), glass, 0, 0, 0.54));

  // headphone-style ear pods
  for (const side of [-1, 1]) {
    const pod = mesh(cyl(0.26, 0.26, 0.22), joint, side * 1.06);
    pod.rotation.z = Math.PI / 2;
    head.add(pod);
    const ring = mesh(track(new THREE.TorusGeometry(0.18, 0.035, 12, 32)), red, side * 1.18);
    ring.rotation.y = Math.PI / 2;
    head.add(ring);
  }

  // antenna
  head.add(mesh(cyl(0.03, 0.03, 0.38), joint, 0, 0.88));
  const antennaTip = mesh(sphere(0.1), chestLight, 0, 1.1);
  head.add(antennaTip);

  // ── neck + torso ───────────────────────────────────────────
  float.add(mesh(cyl(0.18, 0.24, 0.22), joint, 0, 0.24));

  const chest = mesh(sphere(0.62), shell, 0, -0.32);
  chest.scale.set(1.05, 0.82, 0.78);
  float.add(chest);

  // chest light: dark plate + glowing red ring
  const plateDisc = mesh(track(new THREE.CircleGeometry(0.16, 40)), joint, 0, -0.26, 0.47);
  plateDisc.rotation.x = -0.25;
  float.add(plateDisc);
  const chestRing = mesh(track(new THREE.TorusGeometry(0.12, 0.025, 12, 40)), chestLight, 0, -0.26, 0.48);
  chestRing.rotation.x = -0.25;
  float.add(chestRing);

  // waist joint + pelvis
  float.add(mesh(cyl(0.28, 0.26, 0.22), joint, 0, -0.84));
  const pelvis = mesh(rbox(0.86, 0.34, 0.58, 0.14), shell, 0, -1.04);
  float.add(pelvis);

  // ── arms ──────────────────────────────────────────────────
  const makeArm = (side: number) => {
    const shoulder = new THREE.Group();
    shoulder.position.set(side * 0.78, -0.12, 0);

    const dome = mesh(sphere(0.25), pad, side * 0.03, 0.04);
    dome.scale.set(1, 0.78, 1);
    shoulder.add(dome);
    shoulder.add(mesh(sphere(0.15), joint, 0, -0.12));
    shoulder.add(mesh(cyl(0.12, 0.11, 0.36), plate, 0, -0.34)); // upper arm

    const elbow = new THREE.Group();
    elbow.position.y = -0.56;
    shoulder.add(elbow);
    elbow.add(mesh(sphere(0.12), joint));
    elbow.add(mesh(cyl(0.15, 0.2, 0.4), shell, 0, -0.24)); // chunky forearm cuff
    elbow.add(mesh(cyl(0.11, 0.11, 0.06), joint, 0, -0.47)); // wrist band

    // hand: palm + three fingers + thumb, fingertips in pad colour
    const hand = new THREE.Group();
    hand.position.y = -0.58;
    elbow.add(hand);
    hand.add(mesh(rbox(0.22, 0.18, 0.14, 0.05), plate));
    const fingerGeo = track(new THREE.CapsuleGeometry(0.032, 0.1, 4, 8));
    const tipGeo = sphere(0.04);
    [-0.07, 0, 0.07].forEach((fx) => {
      const finger = mesh(fingerGeo, plate, fx, -0.15, 0.02);
      finger.rotation.x = 0.25;
      hand.add(finger);
      hand.add(mesh(tipGeo, pad, fx, -0.23, 0.05));
    });
    const thumb = mesh(fingerGeo, plate, -side * 0.12, -0.06, 0.05);
    thumb.rotation.z = side * 0.9;
    hand.add(thumb);
    hand.add(mesh(tipGeo, pad, -side * 0.18, -0.1, 0.06));

    shoulder.rotation.z = side * 0.35;
    elbow.rotation.x = -0.3;
    float.add(shoulder);
    return { shoulder, elbow };
  };
  const L = makeArm(-1);
  const R = makeArm(1);

  // ── legs ──────────────────────────────────────────────────
  const makeLeg = (side: number) => {
    const hip = new THREE.Group();
    hip.position.set(side * 0.26, -1.18, 0);

    hip.add(mesh(sphere(0.14), joint));
    hip.add(mesh(rbox(0.4, 0.42, 0.4, 0.12), plate, 0, -0.28)); // thigh armour

    const knee = new THREE.Group();
    knee.position.y = -0.54;
    hip.add(knee);
    knee.add(mesh(sphere(0.12), joint));
    const kneePad = mesh(sphere(0.18), pad, 0, 0.02, 0.12);
    kneePad.scale.set(1, 1, 0.7);
    knee.add(kneePad);
    knee.add(mesh(cyl(0.24, 0.29, 0.46), shell, 0, -0.28)); // chunky shin
    knee.add(mesh(cyl(0.18, 0.18, 0.08), joint, 0, -0.55)); // ankle

    // shoe + sole
    knee.add(mesh(rbox(0.46, 0.24, 0.64, 0.11), plate, 0, -0.69, 0.1));
    knee.add(mesh(rbox(0.48, 0.06, 0.66, 0.03), pad, 0, -0.82, 0.1));

    float.add(hip);
    return { hip, knee };
  };
  const LL = makeLeg(-1);
  const RL = makeLeg(1);

  // ── hover ring under the feet ─────────────────────────────
  const floatBase = 0.3;
  const feetY = -1.18 - 0.54 - 0.85 + floatBase; // hip + knee + sole bottom

  const ring = new THREE.Mesh(track(new THREE.TorusGeometry(0.62, 0.035, 16, 64)), blueGlow);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = feetY - 0.22;
  root.add(ring);

  const glow = new THREE.Mesh(
    track(new THREE.PlaneGeometry(2.6, 2.6)),
    track(
      new THREE.MeshBasicMaterial({
        map: track(radialTexture()),
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    ),
  );
  glow.rotation.x = -Math.PI / 2;
  glow.position.y = feetY - 0.24;
  root.add(glow);

  float.position.y = floatBase;

  return {
    root,
    float,
    floatBase,
    head,
    armL: L.shoulder,
    armR: R.shoulder,
    elbowL: L.elbow,
    elbowR: R.elbow,
    legL: LL.hip,
    legR: RL.hip,
    kneeL: LL.knee,
    kneeR: RL.knee,
    antennaTip,
    chestLight,
    ring,
    glow,
    dispose: () => disposables.forEach((d) => d.dispose()),
  };
}

function radialTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(142,197,255,0.9)");
  g.addColorStop(0.35, "rgba(142,197,255,0.35)");
  g.addColorStop(1, "rgba(142,197,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
