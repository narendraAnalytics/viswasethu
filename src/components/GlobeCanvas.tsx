"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import * as topojson from "topojson-client";
import type { Topology, Objects, GeometryCollection } from "topojson-specification";

type WorldTopology = Topology<Objects<Record<string, unknown>>>;

interface Props {
  isActive: boolean;
}

export default function GlobeCanvas({ isActive }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const isActiveRef = useRef(isActive);

  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);

    // Globe base
    const globe = new THREE.Mesh(
      new THREE.SphereGeometry(1.6, 64, 64),
      new THREE.MeshPhongMaterial({
        color: 0x0b3d6b,
        emissive: 0x061e38,
        specular: 0x4fc3f7,
        shininess: 90,
        transparent: true,
        opacity: 0.95,
      })
    );
    scene.add(globe);

    // Atmosphere glow
    scene.add(
      new THREE.Mesh(
        new THREE.SphereGeometry(1.78, 32, 32),
        new THREE.MeshBasicMaterial({ color: 0x4fc3f7, transparent: true, opacity: 0.07, side: THREE.BackSide })
      )
    );
    scene.add(
      new THREE.Mesh(
        new THREE.SphereGeometry(1.95, 32, 32),
        new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.04, side: THREE.BackSide })
      )
    );

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 1.8));
    const sun = new THREE.DirectionalLight(0xfff3e0, 2.5);
    sun.position.set(4, 2, 3);
    scene.add(sun);
    const rimLight = new THREE.PointLight(0x4fc3f7, 1.2, 14);
    rimLight.position.set(-4, 1, -3);
    scene.add(rimLight);
    const warmLight = new THREE.PointLight(0xf59e0b, 0.8, 12);
    warmLight.position.set(2, -3, 2);
    scene.add(warmLight);

    // Helper: lat/lon to 3D position
    function ll2xyz(lat: number, lon: number, r: number): THREE.Vector3 {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      return new THREE.Vector3(
        -r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta)
      );
    }

    const countryGroup = new THREE.Group();
    scene.add(countryGroup);

    // Fetch and draw country borders
    fetch("https://unpkg.com/world-atlas@2/countries-110m.json")
      .then((r) => r.json())
      .then((world: WorldTopology) => {
        const borders = topojson.mesh(
          world,
          world.objects.countries as GeometryCollection,
          (a, b) => a !== b
        );
        const drawLine = (coords: number[][]) => {
          if (coords.length < 2) return;
          const pts = coords.map(([lon, lat]) => ll2xyz(lat, lon, 1.615));
          const g = new THREE.BufferGeometry().setFromPoints(pts);
          const m = new THREE.LineBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.55 });
          countryGroup.add(new THREE.Line(g, m));
        };
        if (borders.type === "MultiLineString") {
          (borders.coordinates as unknown as number[][][]).forEach((line) => drawLine(line));
        } else if (borders.type === "LineString") {
          drawLine(borders.coordinates as unknown as number[][]);
        }

        const allBorders = topojson.mesh(
          world,
          world.objects.countries as GeometryCollection,
          () => true
        );
        if (allBorders.type === "MultiLineString") {
          (allBorders.coordinates as unknown as number[][][]).forEach((line) => {
            const pts = line.map(([lon, lat]) => ll2xyz(lat, lon, 1.618));
            const g = new THREE.BufferGeometry().setFromPoints(pts);
            const m = new THREE.LineBasicMaterial({ color: 0xfcd34d, transparent: true, opacity: 0.35 });
            countryGroup.add(new THREE.Line(g, m));
          });
        }
      })
      .catch(() => {
        // Fallback: lat/lon grid
        for (let lat = -80; lat <= 80; lat += 20) {
          const pts: THREE.Vector3[] = [];
          for (let lon = -180; lon <= 180; lon += 2) pts.push(ll2xyz(lat, lon, 1.615));
          countryGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.15 })));
        }
        for (let lon = -180; lon <= 180; lon += 30) {
          const pts: THREE.Vector3[] = [];
          for (let lat = -90; lat <= 90; lat += 2) pts.push(ll2xyz(lat, lon, 1.615));
          countryGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.15 })));
        }
      });

    // City dots
    const cities = [
      { lat: 17.4, lon: 78.5, color: 0x10b981 },
      { lat: 25.2, lon: 55.3, color: 0xf59e0b },
      { lat: 35.7, lon: 139.7, color: 0xf97316 },
      { lat: 51.5, lon: -0.1, color: 0xfcd34d },
      { lat: 40.7, lon: -74.0, color: 0xf97316 },
    ];
    const dotGeo = new THREE.SphereGeometry(0.045, 10, 10);
    cities.forEach((c) => {
      const pos = ll2xyz(c.lat, c.lon, 1.63);
      const dot = new THREE.Mesh(dotGeo, new THREE.MeshBasicMaterial({ color: c.color }));
      dot.position.copy(pos);
      scene.add(dot);
      [0.08, 0.12].forEach((s, i) => {
        const halo = new THREE.Mesh(
          new THREE.SphereGeometry(s, 8, 8),
          new THREE.MeshBasicMaterial({ color: c.color, transparent: true, opacity: 0.25 - i * 0.1 })
        );
        halo.position.copy(pos);
        scene.add(halo);
      });
    });

    // Travel arcs
    const arcColors = [0xf59e0b, 0xf97316, 0x10b981, 0xfcd34d];
    const arcs: Array<{ mat: THREE.LineBasicMaterial; offset: number }> = [];
    [[0, 1], [0, 2], [0, 3], [0, 4]].forEach(([a, b], i) => {
      const p1 = ll2xyz(cities[a].lat, cities[a].lon, 1.63);
      const p2 = ll2xyz(cities[b].lat, cities[b].lon, 1.63);
      const mid = p1.clone().add(p2).multiplyScalar(0.5).normalize().multiplyScalar(2.25);
      const pts = new THREE.QuadraticBezierCurve3(p1, mid, p2).getPoints(80);
      const m = new THREE.LineBasicMaterial({ color: arcColors[i % 4], transparent: true, opacity: 0.75 });
      scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), m));
      arcs.push({ mat: m, offset: Math.random() * Math.PI * 2 });
    });

    // Space particles
    const spacePos: number[] = [];
    for (let i = 0; i < 350; i++) {
      const r = 2.6 + Math.random() * 1.6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      spacePos.push(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta)
      );
    }
    const spGeo = new THREE.BufferGeometry();
    spGeo.setAttribute("position", new THREE.Float32BufferAttribute(spacePos, 3));
    scene.add(new THREE.Points(spGeo, new THREE.PointsMaterial({ color: 0xf59e0b, size: 0.016, transparent: true, opacity: 0.45 })));

    // Camera position
    const positionCamera = () => {
      camera.position.set(window.innerWidth > 900 ? 1.2 : 0, 0, 5.5);
    };
    positionCamera();

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      positionCamera();
    };
    window.addEventListener("resize", onResize);

    let t = 0;
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!isActiveRef.current) return;
      t += 0.008;
      globe.rotation.y += 0.003;
      countryGroup.rotation.y += 0.003;
      arcs.forEach((a) => {
        a.mat.opacity = 0.25 + 0.45 * Math.abs(Math.sin(t + a.offset));
      });
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{ position: "absolute", inset: 0, opacity: 0.9, pointerEvents: "none" }}
    />
  );
}
