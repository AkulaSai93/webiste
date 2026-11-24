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

    const ctx = gsap.context(() => {
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

      // place in viewport space
      const s = pose.s * (0.35 + 0.65 * intro.k);
      bot.root.position.set(
        pose.x * halfW,
        pose.y * halfH + (1 - intro.k) * -1.5,
        0,
      );
      bot.root.scale.setScalar(Math.max(s, 0.001));

      // lean into horizontal travel
      const vx = (pose.x - lastX) / Math.max(dt, 1e-3);
      lastX = pose.x;
      lean = THREE.MathUtils.lerp(
        lean,
        THREE.MathUtils.clamp(-vx * 0.25, -0.35, 0.35),
        0.08,
      );
      bot.root.rotation.z = lean;
      bot.root.rotation.y = THREE.MathUtils.lerp(
        bot.root.rotation.y,
        pose.turn,
        0.08,
      );

      if (!reduced) {
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

      // head follows the cursor (relative to the bot's own facing)
      headTarget.set(-pointer.y * 0.22, pointer.x * 0.45 - pose.turn * 0.5, 0);
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

      renderer.render(scene, camera);
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
