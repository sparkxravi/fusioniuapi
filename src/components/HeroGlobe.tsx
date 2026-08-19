import { useEffect, useRef } from "react";
import * as THREE from "three";

export function HeroGlobe() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = 3.2;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // Wireframe globe
    const globeGeo = new THREE.IcosahedronGeometry(1, 4);
    const globeMat = new THREE.MeshBasicMaterial({
      color: 0x4a9eff,
      wireframe: true,
      transparent: true,
      opacity: 0.55,
    });
    const globe = new THREE.Mesh(globeGeo, globeMat);
    scene.add(globe);

    // Inner solid glow sphere
    const innerGeo = new THREE.SphereGeometry(0.95, 48, 48);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x1a3a8a,
      transparent: true,
      opacity: 0.35,
    });
    scene.add(new THREE.Mesh(innerGeo, innerMat));

    // Orbiting points (data nodes)
    const pointsGroup = new THREE.Group();
    const pointGeo = new THREE.SphereGeometry(0.025, 12, 12);
    const pointMat = new THREE.MeshBasicMaterial({ color: 0x9bc7ff });
    const nodeCount = 40;
    const nodes: THREE.Mesh[] = [];
    for (let i = 0; i < nodeCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / nodeCount);
      const theta = Math.sqrt(nodeCount * Math.PI) * phi;
      const m = new THREE.Mesh(pointGeo, pointMat);
      m.position.setFromSphericalCoords(1.02, phi, theta);
      pointsGroup.add(m);
      nodes.push(m);
    }
    scene.add(pointsGroup);

    // Particle starfield
    const starsGeo = new THREE.BufferGeometry();
    const starCount = 300;
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    starsGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const stars = new THREE.Points(
      starsGeo,
      new THREE.PointsMaterial({ color: 0x88aaff, size: 0.02, transparent: true, opacity: 0.7 })
    );
    scene.add(stars);

    let frame = 0;
    let raf = 0;
    const animate = () => {
      frame += 0.005;
      globe.rotation.y += 0.0035;
      globe.rotation.x = Math.sin(frame) * 0.1;
      pointsGroup.rotation.y -= 0.002;
      pointsGroup.rotation.x = Math.cos(frame) * 0.15;
      stars.rotation.y += 0.0005;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      globeGeo.dispose();
      globeMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      pointGeo.dispose();
      pointMat.dispose();
      starsGeo.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 -z-10 pointer-events-none" />;
}
