"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { buildBot } from "./buildBot";
import { CodeScreen } from "./CodeScreen";

gsap.registerPlugin(ScrollTrigger);

/**
 * Site-wide mascot. One fixed, click-through WebGL layer that sits between the
 * backgrounds and the text. Place it anywhere by adding a "stop" element:
 *
 *   <div data-mascot-stop
 *        data-mascot-x="0.5"   // -1 (left edge) … 1 (right edge) of the viewport
 *        data-mascot-y="0"     // -1 (bottom) … 1 (top)
 *        data-mascot-scale="0.8"
 *        data-mascot-turn="-0.4"   // body yaw in radians (face the text)
 *        data-mascot-code="quantum" // snippet shown on its screen (codeSnippets.ts)
 *        data-mascot-mx / -my / -ms  // optional overrides below 768px
 *        data-mascot-start / -end    // optional ScrollTrigger range for the flight
 *        data-mascot-fit="0.8"       // size/centre the bot inside this element instead
 *        data-mascot-fit-anchor="section" // …relative to that ancestor's top
 *        data-mascot-attach          // after arriving, stay glued to this element (scrolls with it)
 *   />
 *
 *   <div data-mascot-dock …fit/scale… />  // the bot flies in and stands here with its hands
 *        up; clicking its hands dispatches window "mascot:hand" (detail -1 = screen-left
 *        hand, 1 = screen-right hand) — used by the mentors carousel
 *   />
 *
 * As each stop scrolls into view the bot flies to that pose.
 */

type Pose = { x: number; y: number; s: number; turn: number };

const num = (v: string | undefined, d: number) =>
  v === undefined || v === "" ? d : Number(v);

type Metrics = { mobile: boolean; halfH: number; botH: number };

function readPose(el: HTMLElement, m: Metrics): Pose {
  const d = el.dataset;

  // data-mascot-fit: size + centre the bot inside this element's box
  // (measured in document space, so it is independent of scroll position)
  // on phones a stop may opt out of fitting by giving explicit -mx/-my/-ms values
  const fit =
    d.mascotFit !== undefined && !(m.mobile && d.mascotMx !== undefined);
  if (fit) {
    const r = el.getBoundingClientRect();
    // optional: stretch the area from the bottom of another element
    // (data-mascot-fit-top) down to the bottom of an ancestor (data-mascot-fit-bottom)
    const topEl = d.mascotFitTop
      ? document.querySelector(d.mascotFitTop)
      : null;
    const bottomEl = d.mascotFitBottom ? el.closest(d.mascotFitBottom) : null;
    const top = topEl ? topEl.getBoundingClientRect().bottom : r.top;
    const bottom = bottomEl
      ? bottomEl.getBoundingClientRect().bottom
      : r.bottom;
    const height = Math.max(0, bottom - top);
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const cx = r.left + r.width / 2;
    // data-mascot-fit-anchor: measure relative to that ancestor's top (e.g. "section"),
    // i.e. the pose the bot should hold once that section is scrolled to the top
    const anchor = d.mascotFitAnchor ? el.closest(d.mascotFitAnchor) : null;
    const cy = anchor
      ? top - anchor.getBoundingClientRect().top + height / 2
      : top + window.scrollY + height / 2;
    const unitsPerPx = (2 * m.halfH) / vh;
    const fill = num(d.mascotFit, 0.92);
    const maxS = num(d.mascotScale, 0.6);
    const s = Math.min(maxS, (height * fill * unitsPerPx) / m.botH);
    return {
      x: (cx / vw) * 2 - 1,
      y: 1 - (cy / vh) * 2,
      s: Math.max(0.12, s),
      turn: num(d.mascotTurn, 0),
    };
  }

  const pose = {
    x: num(d.mascotX, 0),
    y: num(d.mascotY, 0),
    s: num(d.mascotScale, 0.8),
    turn: num(d.mascotTurn, 0),
  };
  if (m.mobile) {
    pose.x = num(d.mascotMx, pose.x * 0.5);
    pose.y = num(d.mascotMy, pose.y);
    pose.s = num(d.mascotMs, pose.s * 0.55);
  }
  return pose;
}

export default function Mascot() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // ── renderer / scene ─────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.cssText = "display:block;width:100%;height:100%";
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;

    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(0, 0, 14);

    const key = new THREE.DirectionalLight("#ffffff", 1.6);
    key.position.set(3, 5, 6);
    scene.add(key);
    const rim = new THREE.DirectionalLight("#9cc7ff", 1.2);
    rim.position.set(-5, 2, -4);
    scene.add(rim);
    scene.add(new THREE.HemisphereLight("#dbe9ff", "#b9c4d6", 0.6));

    const screen = new CodeScreen("agent");
    const bot = buildBot(screen.texture);
    scene.add(bot.root);

    // screen glow spilling onto the face/hands
    const screenLight = new THREE.PointLight("#7fb4ff", 2.2, 4, 2);
    screenLight.position.set(0, 0.9, 1.4);
    bot.float.add(screenLight);

    // ── sizing ───────────────────────────────────────────────
    let halfW = 1;
    let halfH = 1;
    const botSize = new THREE.Box3()
      .setFromObject(bot.root)
      .getSize(new THREE.Vector3());
    const metrics: Metrics = { mobile: false, halfH: 1, botH: botSize.y };
    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      metrics.mobile = w < 768;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      halfH =
        Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
      halfW = halfH * camera.aspect;
      metrics.halfH = halfH;
    };
    resize();
    window.addEventListener("resize", resize);

    // ── pointer (head tracking) ─────────────────────────────
    const pointer = new THREE.Vector2();
    const onPointer = (e: PointerEvent) => {
      pointer.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -((e.clientY / window.innerHeight) * 2 - 1),
      );
    };
    window.addEventListener("pointermove", onPointer);

    // sections can ask the bot to show a specific snippet (e.g. the active card)
    const onCode = (e: Event) => {
      const key = (e as CustomEvent<string>).detail;
      if (key) screen.setSnippet(key);
    };
    window.addEventListener("mascot:code", onCode);

    // ── scroll choreography ─────────────────────────────────
    const pose: Pose = { x: 0, y: 0, s: 0.8, turn: 0 };
    const intro = { k: reduced ? 1 : 0, wave: 0 };

    // data-mascot-attach: once the bot arrives at this stop it is glued to the element
    // (scrolls with its section) instead of hovering at a fixed spot on the screen
    const attach: { el: HTMLElement | null; p: number } = { el: null, p: 0 };
    const livePose = (el: HTMLElement): Pose => {
      const r = el.getBoundingClientRect();
      const section = el.closest("section");
      if (metrics.mobile || r.height === 0) {
        const fixed = readPose(el, metrics);
        // on phones it rides in its corner until the section has scrolled away
        if (section && section.getBoundingClientRect().bottom < 0) fixed.y = 3;
        return fixed;
      }
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const unitsPerPx = (2 * metrics.halfH) / vh;
      const fill = num(el.dataset.mascotFit, 0.92);
      const maxS = num(el.dataset.mascotScale, 0.6);
      return {
        x: ((r.left + r.width / 2) / vw) * 2 - 1,
        y: 1 - ((r.top + r.height / 2) / vh) * 2,
        s: Math.max(
          0.12,
          Math.min(maxS, (r.height * fill * unitsPerPx) / metrics.botH),
        ),
        turn: num(el.dataset.mascotTurn, 0),
      };
    };
    const view: Pose = { x: 0, y: 0, s: 0.8, turn: 0 };

    // data-mascot-walk: a horizontal strip (the ground). While it is on screen the bot
    // stands on it, side-on, and walks left → right; the section drives the step
    // progress through data-walk-p (0..1), so every step is tied to the scroll.
    const walk: { el: HTMLElement | null; on: boolean; phase: number } = {
      el: null,
      on: false,
      phase: 0,
    };
    const WALK_STEPS = 9;

    // data-mascot-dock: fly in and stand inside this element, hands raised; the
    // hands are clickable (raycast, since the canvas itself ignores the pointer)
    const dock = {
      el: null as HTMLElement | null,
      p: 0, // scroll progress of the arrival
      k: 0, // 0..1 how "docked" the bot is this frame
      hover: 0 as -1 | 0 | 1,
      poke: { [-1]: 0, [1]: 0 } as Record<number, number>,
    };
    const hitMat = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
      colorWrite: false,
    });
    const hitGeo = new THREE.SphereGeometry(0.5, 12, 8);
    const hitL = new THREE.Mesh(hitGeo, hitMat); // bot's left = screen-left
    const hitR = new THREE.Mesh(hitGeo, hitMat);
    hitL.position.y = hitR.position.y = -0.6;
    bot.elbowL.add(hitL);
    bot.elbowR.add(hitR);
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const handAt = (cx: number, cy: number): -1 | 0 | 1 => {
      if (dock.k < 0.9) return 0;
      ndc.set(
        (cx / window.innerWidth) * 2 - 1,
        -(cy / window.innerHeight) * 2 + 1,
      );
      raycaster.setFromCamera(ndc, camera);
      const hit = raycaster.intersectObjects([hitL, hitR], false)[0];
      return hit ? (hit.object === hitL ? -1 : 1) : 0;
    };
    const onDockMove = (e: PointerEvent) => {
      const h = handAt(e.clientX, e.clientY);
      if (h !== dock.hover) {
        dock.hover = h;
        document.documentElement.style.cursor = h ? "pointer" : "";
      }
    };
    const onDockClick = (e: MouseEvent) => {
      const h = handAt(e.clientX, e.clientY);
      if (!h) return;
      dock.poke[h] = 1;
      window.dispatchEvent(new CustomEvent("mascot:hand", { detail: h }));
    };
    window.addEventListener("pointermove", onDockMove);
    window.addEventListener("click", onDockClick);

    const ctx = gsap.context(() => {
      walk.el = document.querySelector<HTMLElement>("[data-mascot-walk]");
      dock.el = document.querySelector<HTMLElement>("[data-mascot-dock]");
      if (dock.el) {
        ScrollTrigger.create({
          trigger: dock.el.closest("section") ?? dock.el,
          start: "top 70%",
          end: "top 5%",
          onUpdate: (self) => (dock.p = self.progress),
          onRefresh: (self) => (dock.p = self.progress),
        });
      }
      const stops = gsap.utils.toArray<HTMLElement>("[data-mascot-stop]");
      if (!stops.length) return;

      Object.assign(pose, readPose(stops[0], metrics));
      // re-fit the first pose after layout changes while still near the top
      ScrollTrigger.addEventListener("refresh", () => {
        if (window.scrollY < window.innerHeight * 0.25)
          Object.assign(pose, readPose(stops[0], metrics));
      });
      screen.setSnippet(stops[0].dataset.mascotCode ?? "agent");

      stops.forEach((el, i) => {
        // swap the code on screen while this stop's section owns the viewport
        ScrollTrigger.create({
          trigger: el,
          start: "top 60%",
          end: "bottom 40%",
          onToggle: (self) =>
            self.isActive &&
            screen.setSnippet(el.dataset.mascotCode ?? "agent"),
        });
        if (i === 0) return;
        if (el.dataset.mascotAttach !== undefined) {
          attach.el = el;
          ScrollTrigger.create({
            trigger:
              (el.dataset.mascotFitAnchor
                ? el.closest<HTMLElement>(el.dataset.mascotFitAnchor)
                : null) ?? el,
            start: el.dataset.mascotStart ?? "top 85%",
            end: el.dataset.mascotEnd ?? "top 30%",
            onUpdate: (self) => (attach.p = self.progress),
            onRefresh: (self) => (attach.p = self.progress),
          });
          return;
        }
        // fromTo with the previous stop as an explicit start, so fast jumps or
        // scrolling back up never leave the bot stranded between stops
        const prev = stops[i - 1];
        gsap.fromTo(
          pose,
          {
            x: () => readPose(prev, metrics).x,
            y: () => readPose(prev, metrics).y,
            s: () => readPose(prev, metrics).s,
            turn: () => readPose(prev, metrics).turn,
          },
          {
            x: () => readPose(el, metrics).x,
            y: () => readPose(el, metrics).y,
            s: () => readPose(el, metrics).s,
            turn: () => readPose(el, metrics).turn,
            ease: "power2.inOut",
            immediateRender: false,
            scrollTrigger: {
              // time the flight against the fit anchor (e.g. the section) when there is one
              trigger:
                (el.dataset.mascotFitAnchor
                  ? el.closest<HTMLElement>(el.dataset.mascotFitAnchor)
                  : null) ?? el,
              start: el.dataset.mascotStart ?? "top bottom",
              end: el.dataset.mascotEnd ?? "top 25%",
              scrub: 1.2,
              invalidateOnRefresh: true,
            },
          },
        );
      });

      if (!reduced) {
        gsap
          .timeline({ delay: 0.7 })
          .to(intro, { k: 1, duration: 1.6, ease: "elastic.out(1, 0.6)" })
          .to(intro, { wave: 1, duration: 0.4, ease: "power2.out" }, 0.9)
          .to(intro, { wave: 0, duration: 0.6, ease: "power2.inOut" }, 3.0);
      }
    });

    // ── render loop ─────────────────────────────────────────
    const timer = new THREE.Timer();
    let lastX = pose.x;
    let lean = 0;
    let raf = 0;
    const headTarget = new THREE.Euler();

    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (document.hidden) return;
      timer.update();
      const dt = Math.min(timer.getDelta(), 0.05);
      const t = timer.getElapsed();

      screen.update(dt, reduced);

      // view pose = scroll pose, blended into the attached stop's live position
      Object.assign(view, pose);
      if (attach.el && attach.p > 0) {
        const live = livePose(attach.el);
        const e =
          attach.p < 0.5
            ? 2 * attach.p * attach.p
            : 1 - Math.pow(-2 * attach.p + 2, 2) / 2;
        view.x = pose.x + (live.x - pose.x) * e;
        view.y = pose.y + (live.y - pose.y) * e;
        view.s = pose.s + (live.s - pose.s) * e;
        view.turn = pose.turn + (live.turn - pose.turn) * e;
      }

      // walking on the ground strip overrides the scroll pose
      walk.on = false;
      if (walk.el && !metrics.mobile) {
        const r = walk.el.getBoundingClientRect();
        const vh = window.innerHeight;
        if (r.top < vh + 150 && r.top > -150) {
          const p = Number(walk.el.dataset.walkP ?? 0);
          const sc =
            (Math.min(300, vh * 0.3) * 2 * halfH) / (vh * metrics.botH);
          const groundY = (1 - (2 * r.top) / vh) * halfH;
          const feet = -2.57 + bot.floatBase; // sole bottom, in bot units
          walk.on = true;
          walk.phase = p * WALK_STEPS * Math.PI * 2;
          view.x = -1.3 + 2.6 * p;
          view.s = sc;
          view.y = (groundY - feet * sc) / halfH;
          view.turn = 1.05;
        }
      }

      // docked: fly in from the right and stand inside the dock element
      dock.k = 0;
      if (!walk.on && dock.el && !metrics.mobile && dock.p > 0) {
        const r = dock.el.getBoundingClientRect();
        if (r.bottom > -300 && r.top < window.innerHeight + 300) {
          const live = livePose(dock.el);
          const p = dock.p;
          const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
          view.x = 1.45 + (live.x - 1.45) * e;
          view.y = live.y + (1 - e) * 0.6;
          view.s = live.s;
          view.turn = -0.7 * (1 - e) + live.turn * e;
          dock.k = e;
        }
      }
      if (dock.k < 0.9 && dock.hover) {
        dock.hover = 0;
        document.documentElement.style.cursor = "";
      }
      dock.poke[-1] = Math.max(0, dock.poke[-1] - dt * 2.5);
      dock.poke[1] = Math.max(0, dock.poke[1] - dt * 2.5);

      // place in viewport space
      const s = view.s * (0.35 + 0.65 * intro.k);
      bot.root.position.set(
        view.x * halfW,
        view.y * halfH + (1 - intro.k) * -1.5,
        0,
      );
      bot.root.scale.setScalar(Math.max(s, 0.001));

      // lean into horizontal travel
      const vx = walk.on ? 0 : (view.x - lastX) / Math.max(dt, 1e-3);
      lastX = view.x;
      lean = THREE.MathUtils.lerp(
        lean,
        THREE.MathUtils.clamp(-vx * 0.25, -0.35, 0.35),
        0.08,
      );
      bot.root.rotation.z = lean;
      bot.root.rotation.y = THREE.MathUtils.lerp(
        bot.root.rotation.y,
        view.turn,
        0.08,
      );

      bot.ring.visible = !walk.on;
      bot.glow.visible = !walk.on;

      if (!reduced && walk.on) {
        // walk cycle: legs and arms swing in opposition, knees bend on the
        // forward swing, body dips as the feet spread
        const ph = walk.phase;
        const sw = Math.sin(ph);
        bot.float.position.y = bot.floatBase - Math.abs(sw) * 0.07;
        bot.float.rotation.x = 0.05;
        bot.legL.rotation.set(-sw * 0.55, 0, -0.03);
        bot.legR.rotation.set(sw * 0.55, 0, 0.03);
        bot.kneeL.rotation.x =
          0.1 + Math.max(0, Math.sin(ph + Math.PI / 2)) * 0.75;
        bot.kneeR.rotation.x =
          0.1 + Math.max(0, Math.sin(ph - Math.PI / 2)) * 0.75;
        bot.armL.rotation.set(sw * 0.5, 0, -0.22);
        bot.armR.rotation.set(-sw * 0.5, 0, 0.22);
        bot.elbowL.rotation.set(-0.45, 0, 0);
        bot.elbowR.rotation.set(-0.45, 0, 0);
        bot.chestLight.emissiveIntensity = 0.9 + Math.sin(t * 2.4) * 0.5;
      } else if (!reduced) {
        // idle bob + breathing
        bot.float.position.y = bot.floatBase + Math.sin(t * 1.6) * 0.09;
        bot.float.rotation.x = Math.sin(t * 1.1) * 0.03;
        bot.ring.scale.setScalar(1 + Math.sin(t * 3.2) * 0.06);
        (bot.glow.material as THREE.MeshBasicMaterial).opacity =
          0.75 + Math.sin(t * 3.2) * 0.2;
        bot.chestLight.emissiveIntensity = 0.9 + Math.sin(t * 2.4) * 0.5;

        // arms sway with soft elbows; right arm waves during the intro
        const sway = Math.sin(t * 1.6);
        bot.armL.rotation.z = -0.35 - sway * 0.06;
        bot.armL.rotation.x = Math.sin(t * 1.3) * 0.08;
        bot.elbowL.rotation.x = -0.3 - Math.sin(t * 1.3 + 0.6) * 0.08;

        const wave = intro.wave;
        bot.armR.rotation.z = 0.35 + sway * 0.06 + wave * 2.3;
        bot.armR.rotation.x = Math.sin(t * 1.3 + 1) * 0.08 * (1 - wave);
        bot.elbowR.rotation.x =
          -0.3 - Math.sin(t * 1.3 + 1.6) * 0.08 * (1 - wave);
        bot.elbowR.rotation.z = wave * Math.sin(t * 11) * 0.55; // forearm wiggle = hello!

        // legs dangle while hovering, trailing behind sideways travel
        const trail = -lean * 0.8;
        bot.legL.rotation.x = Math.sin(t * 1.6) * 0.07;
        bot.legR.rotation.x = Math.sin(t * 1.6 + 0.8) * 0.07;
        bot.legL.rotation.z = -0.04 + trail;
        bot.legR.rotation.z = 0.04 + trail;
        bot.kneeL.rotation.x = 0.12 + Math.sin(t * 1.6 + 0.6) * 0.06;
        bot.kneeR.rotation.x = 0.12 + Math.sin(t * 1.6 + 1.4) * 0.06;
      }

      // docked: hands up and out, ready to be pressed; hovered hand lifts, clicked hand pokes
      if (dock.k > 0 && !walk.on) {
        const k = dock.k;
        const lift = (side: -1 | 1) =>
          (dock.hover === side ? 0.18 : 0) +
          Math.sin(dock.poke[side] * Math.PI) * 0.45;
        const bob = reduced ? 0 : Math.sin(t * 2.2) * 0.05;
        const mix = THREE.MathUtils.lerp;
        bot.armL.rotation.z = mix(
          bot.armL.rotation.z,
          -(1.15 + lift(-1) + bob),
          k,
        );
        bot.armR.rotation.z = mix(bot.armR.rotation.z, 1.15 + lift(1) - bob, k);
        bot.armL.rotation.x = mix(bot.armL.rotation.x, 0, k);
        bot.armR.rotation.x = mix(bot.armR.rotation.x, 0, k);
        bot.elbowL.rotation.z = mix(
          bot.elbowL.rotation.z,
          -(0.9 + lift(-1) * 0.6),
          k,
        );
        bot.elbowR.rotation.z = mix(
          bot.elbowR.rotation.z,
          0.9 + lift(1) * 0.6,
          k,
        );
        bot.elbowL.rotation.x = mix(bot.elbowL.rotation.x, -0.15, k);
        bot.elbowR.rotation.x = mix(bot.elbowR.rotation.x, -0.15, k);
      } else if (!walk.on) {
        bot.elbowL.rotation.z = 0;
      }

      // head follows the cursor (relative to the bot's own facing)
      if (walk.on) headTarget.set(0.05, -0.45, 0);
      else
        headTarget.set(
          -pointer.y * 0.22,
          pointer.x * 0.45 - view.turn * 0.5,
          0,
        );
      bot.head.rotation.x = THREE.MathUtils.lerp(
        bot.head.rotation.x,
        headTarget.x,
        0.06,
      );
      bot.head.rotation.y = THREE.MathUtils.lerp(
        bot.head.rotation.y,
        headTarget.y,
        0.06,
      );

      // parked off-screen (after its last stop): skip drawing
      const offscreen = Math.abs(view.y) > 1.9;
      renderer.domElement.style.visibility = offscreen ? "hidden" : "visible";
      if (!offscreen) renderer.render(scene, camera);
    };
    loop();

    // re-measure scroll positions once fonts/images settle
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);

    return () => {
      cancelAnimationFrame(raf);
      ctx.revert();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("mascot:code", onCode);
      window.removeEventListener("pointermove", onDockMove);
      window.removeEventListener("click", onDockClick);
      document.documentElement.style.cursor = "";
      hitGeo.dispose();
      hitMat.dispose();
      window.removeEventListener("load", refresh);
      bot.dispose();
      screen.dispose();
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div
      ref={hostRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[1]"
    />
  );
}
