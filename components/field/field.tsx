"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { BloomEffect, EffectComposer, EffectPass, RenderPass, VignetteEffect } from "postprocessing";
import { FRAG, VERT } from "./shaders";
import { avatarShapes, buildShapes, pictureShape } from "./shapes";

type Props = { days: number[]; stars: number };

/**
 * The field behind the whole page. Sections say what it should be while they
 * hold the middle of the screen with `data-field="<shape> <opacity>"`; between
 * two sections the field is somewhere between their shapes.
 */
export function Field({ days, stars }: Props) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = host.current;
    if (!element) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.matchMedia("(max-width: 760px)").matches;
    const side = small ? 100 : 150;
    const count = side * side;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: "high-performance" });
    } catch {
      element.dataset.failed = "";
      return;
    }
    const dpr = Math.min(window.devicePixelRatio, small ? 1.25 : 2);
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 1);
    element.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
    camera.position.set(0, 0, 7);

    const shapes = buildShapes(count, days, stars);
    const geometry = new THREE.BufferGeometry();
    // Positions are computed in the shader; this only sizes the draw.
    geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    geometry.setAttribute("aGrid", new THREE.BufferAttribute(shapes.grid, 2));
    geometry.setAttribute("aGraph", new THREE.BufferAttribute(shapes.graph, 3));
    geometry.setAttribute("aGraphInfo", new THREE.BufferAttribute(shapes.graphInfo, 4));
    geometry.setAttribute("aStar", new THREE.BufferAttribute(shapes.star, 3));
    geometry.setAttribute("aStarOn", new THREE.BufferAttribute(shapes.starOn, 1));
    const markAttribute = new THREE.BufferAttribute(shapes.mark, 3);
    const soloAttribute = new THREE.BufferAttribute(shapes.solo, 3);
    geometry.setAttribute("aMark", markAttribute);
    geometry.setAttribute("aSolo", soloAttribute);
    const pictureAttribute = new THREE.BufferAttribute(shapes.picture, 4);
    const pictureColorAttribute = new THREE.BufferAttribute(shapes.pictureColor, 3);
    geometry.setAttribute("aImg", pictureAttribute);
    geometry.setAttribute("aImgColor", pictureColorAttribute);
    geometry.setAttribute("aRand", new THREE.BufferAttribute(shapes.rand, 4));
    geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 100);

    const uniforms = {
      uTime: { value: 0 },
      uFrom: { value: 0 },
      uTo: { value: 0 },
      uMix: { value: 0 },
      uPointer: { value: new THREE.Vector2(9, 9) },
      uPointerPower: { value: 0 },
      uAspect: { value: 1 },
      uSize: { value: small ? 34 : 30 },
      uPixelRatio: { value: dpr },
      uFit: { value: 1 },
      uImgAspect: { value: 1.818 },
      uOpacity: { value: 0 },
    };
    const material = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });
    const points = new THREE.Points(geometry, material);
    points.frustumCulled = false;
    scene.add(points);

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(
      new EffectPass(
        camera,
        new BloomEffect({
          intensity: 0.95,
          luminanceThreshold: 0.32,
          luminanceSmoothing: 0.25,
          mipmapBlur: true,
          radius: 0.6,
          resolutionScale: small ? 0.4 : 0.6,
        }),
        new VignetteEffect({ offset: 0.32, darkness: 0.62 }),
      ),
    );

    // The avatar's shapes, once the avatar and the font are in.
    let cancelled = false;
    const avatar = new Image();
    avatar.src = "/avatar.png";
    Promise.all([avatar.decode(), document.fonts.ready]).then(() => {
      if (cancelled) return;
      const font = getComputedStyle(document.body).fontFamily;
      const made = avatarShapes(count, avatar, font);
      markAttribute.array.set(made.withName);
      soloAttribute.array.set(made.alone);
      markAttribute.needsUpdate = true;
      soloAttribute.needsUpdate = true;
    });

    // Terax's terminal, as a dot matrix.
    const terminal = new Image();
    terminal.src = "/work/terax-terminal.jpg";
    terminal.decode().then(() => {
      if (cancelled) return;
      const made = pictureShape(count, terminal);
      pictureAttribute.array.set(made.place);
      pictureColorAttribute.array.set(made.color);
      pictureAttribute.needsUpdate = true;
      pictureColorAttribute.needsUpdate = true;
      uniforms.uImgAspect.value = made.aspect;
    });

    // Sections, and where their middles fall on the page.
    type Mark = { at: number; phase: number; opacity: number };
    let marks: Mark[] = [];
    let probe = -1;
    const measure = () => {
      marks = Array.from(document.querySelectorAll<HTMLElement>("[data-field]"))
        .map((el) => {
          const [phase, opacity = "1"] = (el.dataset.field ?? "0").split(" ");
          const box = el.getBoundingClientRect();
          return { at: box.top + window.scrollY + box.height / 2, phase: +phase, opacity: +opacity };
        })
        .sort((a, b) => a.at - b.at);
    };
    // Where the page is, as two shapes and how far between them.
    const at = (probe: number) => {
      if (marks.length === 0) return { from: 0, to: 0, mix: 0, opacity: 1 };
      const first = marks[0];
      const last = marks[marks.length - 1];
      if (probe <= first.at) return { from: first.phase, to: first.phase, mix: 0, opacity: first.opacity };
      for (let i = 0; i < marks.length - 1; i++) {
        const a = marks[i];
        const b = marks[i + 1];
        if (probe <= b.at) {
          let t = (probe - a.at) / (b.at - a.at);
          t = t * t * (3 - 2 * t);
          return { from: a.phase, to: b.phase, mix: t, opacity: a.opacity + (b.opacity - a.opacity) * t };
        }
      }
      return { from: last.phase, to: last.phase, mix: 0, opacity: last.opacity };
    };

    // The canvas is as tall as the largest viewport (100lvh), so a phone's
    // address bar sliding in and out never resizes it; only a width change does.
    let lastWidth = 0;
    const resize = () => {
      const w = element.clientWidth;
      const h = element.clientHeight;
      if (w === lastWidth && small) {
        measure();
        return;
      }
      lastWidth = w;
      renderer.setSize(w, h, false);
      composer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      uniforms.uAspect.value = w / h;
      uniforms.uFit.value = Math.min(1, Math.max(0, (w / h - 0.5) / 1.1));
      measure();
    };
    resize();
    window.addEventListener("resize", resize);
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);

    // Pointer, with a wake: moving stirs the field more than resting does.
    const pointer = new THREE.Vector2(9, 9);
    const smoothPointer = new THREE.Vector2(9, 9);
    let energy = 0;
    let lastMove = 0;
    const onMove = (event: PointerEvent) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -(event.clientY / window.innerHeight) * 2 + 1;
      const moved = Math.hypot(x - pointer.x, y - pointer.y);
      if (pointer.x > 5) smoothPointer.set(x, y);
      pointer.set(x, y);
      energy = Math.min(1, energy + moved * 3);
      lastMove = performance.now();
    };
    const onLeave = () => pointer.set(9, 9);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    let frame = 0;
    let last = performance.now();
    let time = 0;
    let intro = 0;
    const tilt = new THREE.Vector2();
    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!reduced) time += dt;

      // The field follows the scroll a beat behind, so it glides.
      const ease = 1 - Math.exp(-dt * 4.2);
      const goal = window.scrollY + window.innerHeight / 2;
      probe = probe < 0 ? goal : probe + (goal - probe) * ease;
      const state = at(probe);
      uniforms.uFrom.value = state.from;
      uniforms.uTo.value = state.to;
      uniforms.uMix.value = state.mix;
      intro = Math.min(1, intro + dt * 0.5);
      const introEase = 1 - Math.pow(1 - intro, 3);
      uniforms.uOpacity.value = state.opacity * introEase;

      smoothPointer.lerp(pointer, 1 - Math.exp(-dt * 7));
      uniforms.uPointer.value.copy(smoothPointer);
      if (now - lastMove > 120) energy *= Math.exp(-dt * 1.6);
      uniforms.uPointerPower.value = 0.35 + energy * 0.9;

      // The whole field leans a little toward the pointer.
      const px = pointer.x > 5 ? 0 : pointer.x;
      const py = pointer.y > 5 ? 0 : pointer.y;
      tilt.x += (py * 0.035 - tilt.x) * ease;
      tilt.y += (px * 0.06 - tilt.y) * ease;
      points.rotation.set(-tilt.x, tilt.y, 0);
      uniforms.uTime.value = time;

      if (uniforms.uOpacity.value < 0.004) {
        renderer.clear();
        return;
      }
      composer.render(dt);
    };
    frame = requestAnimationFrame(loop);
    element.dataset.ready = "";

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      observer.disconnect();
      composer.dispose();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [days, stars]);

  return <div ref={host} aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-0 h-lvh [&>canvas]:block [&>canvas]:h-full [&>canvas]:w-full" />;
}
