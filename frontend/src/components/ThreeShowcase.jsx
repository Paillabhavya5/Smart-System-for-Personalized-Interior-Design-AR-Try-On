import { useEffect, useRef } from 'react';

const ThreeShowcase = ({ imageUrl, width = 680, height = 420, isDarkMode = false }) => {
  const containerRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    if (!imageUrl || !containerRef.current) return undefined;

    let disposed = false;
    let renderer;
    let scene;
    let camera;
    let mesh;
    let controls;

    const load = async () => {
      const three = await import('three');
      const orbitControls = await import('three/examples/jsm/controls/OrbitControls.js');
      const OrbitControls = orbitControls.OrbitControls || orbitControls.default;

      renderer = new three.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height);
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      renderer.domElement.style.borderRadius = '18px';

      scene = new three.Scene();
      camera = new three.PerspectiveCamera(40, width / height, 0.1, 1000);
      camera.position.set(0, 0, 3.5);

      const ambient = new three.HemisphereLight(0xffffff, 0x8b8b8b, 1.1);
      const keyLight = new three.DirectionalLight(0xffffff, 1.2);
      keyLight.position.set(4, 5, 6);
      scene.add(ambient, keyLight);

      const textureLoader = new three.TextureLoader();
      const texture = await new Promise((resolve, reject) => {
        textureLoader.load(imageUrl, resolve, undefined, reject);
      });
      texture.colorSpace = three.SRGBColorSpace;

      const planeGeometry = new three.PlaneGeometry(2.4, 1.5, 32, 32);
      const material = new three.MeshStandardMaterial({ map: texture, roughness: 0.75, metalness: 0.05 });
      mesh = new three.Mesh(planeGeometry, material);
      mesh.rotation.x = -0.18;
      mesh.rotation.y = 0.12;
      scene.add(mesh);

      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.enablePan = false;
      controls.minDistance = 1.5;
      controls.maxDistance = 8;

      const floor = new three.Mesh(
        new three.CircleGeometry(2.4, 48),
        new three.MeshStandardMaterial({ color: isDarkMode ? '#1f2937' : '#e5e7eb', roughness: 1 })
      );
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = -1.15;
      scene.add(floor);

      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(renderer.domElement);

      const renderFrame = () => {
        if (disposed) return;
        controls.update();
        renderer.render(scene, camera);
        frameRef.current = requestAnimationFrame(renderFrame);
      };
      renderFrame();
    };

    load().catch((error) => {
      console.error('ThreeShowcase load failed:', error);
      if (containerRef.current) {
        containerRef.current.innerHTML = '<div style="padding: 24px; color: #ef4444;">3D preview unavailable for this image.</div>';
      }
    });

    return () => {
      disposed = true;
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      if (renderer) renderer.dispose();
      if (controls) controls.dispose();
    };
  }, [imageUrl, width, height, isDarkMode]);

  return <div ref={containerRef} style={{ width: '100%', maxWidth: width, height, margin: '0 auto', borderRadius: 18, overflow: 'hidden', background: isDarkMode ? '#111827' : '#f3f4f6' }} />;
};

export default ThreeShowcase;
