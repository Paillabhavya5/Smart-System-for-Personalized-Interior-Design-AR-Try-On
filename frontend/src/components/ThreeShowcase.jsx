import { useEffect, useRef, useState } from 'react';

const ROOM_LAYOUTS = {
  bedroom: [
    { type: 'bed', x: -1.5, z: -1.2 },
    { type: 'wardrobe', x: 2.4, z: -1.8 },
    { type: 'nightstand', x: 0.1, z: -1.2 },
  ],
  'living room': [
    { type: 'sofa', x: -1.2, z: -1.7 },
    { type: 'coffee table', x: -0.5, z: 0.1 },
    { type: 'plant', x: 2.8, z: -1.8 },
  ],
  kitchen: [
    { type: 'counter', x: -2.3, z: -2 },
    { type: 'dining table', x: 0.6, z: -0.5 },
    { type: 'chair', x: 1.8, z: -0.5 },
  ],
  bathroom: [
    { type: 'vanity', x: -2.4, z: -1.8 },
    { type: 'plant', x: 2.5, z: -1.8 },
    { type: 'stool', x: 0, z: 0.3 },
  ],
  'dining room': [
    { type: 'dining table', x: 0, z: -0.6 },
    { type: 'chair', x: -1.5, z: -0.6 },
    { type: 'chair', x: 1.5, z: -0.6 },
  ],
};

const FURNITURE_OPTIONS = [
  'sofa', 'bed', 'dining table', 'coffee table', 'chair', 'wardrobe',
  'nightstand', 'counter', 'vanity', 'stool', 'plant',
];

const makeLayout = (roomType) => (ROOM_LAYOUTS[roomType] || ROOM_LAYOUTS.bedroom)
  .map((item, index) => ({ ...item, id: `${roomType}-${index}-${Date.now()}` }));

const ThreeShowcase = ({
  roomType = 'bedroom',
  backgroundColor = '#F5F1EB',
  foregroundColor = '#1F2937',
  width = 680,
  height = 420,
  isDarkMode = false,
}) => {
  const containerRef = useRef(null);
  const [furniture, setFurniture] = useState(() => makeLayout(roomType));
  const [selectedId, setSelectedId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setFurniture(makeLayout(roomType));
    setSelectedId(null);
  }, [roomType]);

  useEffect(() => {
    if (!containerRef.current) return undefined;

    let disposed = false;
    let renderer;
    let controls;
    let animationFrame;

    const setup = async () => {
      const three = await import('three');
      const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');
      if (disposed || !containerRef.current) return;

      const scene = new three.Scene();
      scene.background = new three.Color(isDarkMode ? '#111827' : '#eef2f7');
      scene.fog = new three.Fog(scene.background, 15, 28);
      const camera = new three.PerspectiveCamera(42, width / height, 0.1, 100);
      camera.position.set(8, 7, 10);
      renderer = new three.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(containerRef.current.clientWidth || width, height);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = three.PCFSoftShadowMap;
      renderer.outputColorSpace = three.SRGBColorSpace;
      containerRef.current.replaceChildren(renderer.domElement);

      scene.add(new three.HemisphereLight(0xffffff, 0x7c746b, 2));
      const sunlight = new three.DirectionalLight(0xffffff, 2.2);
      sunlight.position.set(-4, 9, 6);
      sunlight.castShadow = true;
      scene.add(sunlight);

      const floorMaterial = new three.MeshStandardMaterial({ color: backgroundColor, roughness: 0.9 });
      const wallMaterial = new three.MeshStandardMaterial({ color: isDarkMode ? '#374151' : '#fffdf9', roughness: 1 });
      const floor = new three.Mesh(new three.BoxGeometry(8, 0.16, 6), floorMaterial);
      floor.position.y = -0.08;
      floor.receiveShadow = true;
      scene.add(floor);
      const backWall = new three.Mesh(new three.BoxGeometry(8, 4, 0.16), wallMaterial);
      backWall.position.set(0, 2, -3);
      backWall.receiveShadow = true;
      scene.add(backWall);
      const sideWall = new three.Mesh(new three.BoxGeometry(0.16, 4, 6), wallMaterial);
      sideWall.position.set(-4, 2, 0);
      sideWall.receiveShadow = true;
      scene.add(sideWall);

      const furnitureGroups = new Map();
      const furnitureMaterial = new three.MeshStandardMaterial({ color: foregroundColor, roughness: 0.75 });
      const accentMaterial = new three.MeshStandardMaterial({ color: '#c89f72', roughness: 0.8 });
      const leafMaterial = new three.MeshStandardMaterial({ color: '#527b58', roughness: 0.85 });
      const addBox = (group, material, size, position) => {
        const mesh = new three.Mesh(new three.BoxGeometry(...size), material);
        mesh.position.set(...position);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        group.add(mesh);
      };
      const addCylinder = (group, material, radiusTop, radiusBottom, heightValue, position) => {
        const mesh = new three.Mesh(
          new three.CylinderGeometry(radiusTop, radiusBottom, heightValue, 12),
          material
        );
        mesh.position.set(...position);
        mesh.castShadow = true;
        group.add(mesh);
      };
      const makeFurniture = (item) => {
        const group = new three.Group();
        const wood = accentMaterial;
        switch (item.type) {
          case 'bed':
            addBox(group, wood, [1.8, 0.22, 2.2], [0, 0.2, 0]);
            addBox(group, furnitureMaterial, [1.72, 0.28, 1.45], [0, 0.45, 0.28]);
            addBox(group, wallMaterial, [0.72, 0.16, 0.42], [-0.42, 0.66, -0.65]);
            addBox(group, wallMaterial, [0.72, 0.16, 0.42], [0.42, 0.66, -0.65]);
            addBox(group, wood, [1.9, 0.75, 0.14], [0, 0.48, -1.08]);
            break;
          case 'sofa':
            addBox(group, furnitureMaterial, [2.4, 0.42, 0.9], [0, 0.42, 0.05]);
            addBox(group, furnitureMaterial, [2.4, 0.82, 0.3], [0, 0.95, -0.32]);
            addBox(group, furnitureMaterial, [0.34, 0.82, 0.9], [-1.03, 0.72, 0.05]);
            addBox(group, furnitureMaterial, [0.34, 0.82, 0.9], [1.03, 0.72, 0.05]);
            break;
          case 'dining table':
            addBox(group, wood, [1.8, 0.16, 1.2], [0, 0.9, 0]);
            [-0.72, 0.72].forEach((x) => [-0.42, 0.42].forEach((z) => {
              addBox(group, wood, [0.12, 0.82, 0.12], [x, 0.45, z]);
            }));
            break;
          case 'coffee table':
            addBox(group, wood, [1.5, 0.14, 0.9], [0, 0.48, 0]);
            [-0.58, 0.58].forEach((x) => [-0.32, 0.32].forEach((z) => {
              addBox(group, wood, [0.09, 0.46, 0.09], [x, 0.23, z]);
            }));
            break;
          case 'chair':
            addBox(group, wood, [0.72, 0.14, 0.72], [0, 0.48, 0]);
            addBox(group, furnitureMaterial, [0.72, 0.72, 0.14], [0, 0.88, -0.3]);
            [-0.26, 0.26].forEach((x) => [-0.25, 0.25].forEach((z) => {
              addBox(group, wood, [0.08, 0.48, 0.08], [x, 0.24, z]);
            }));
            break;
          case 'wardrobe':
          case 'counter':
          case 'vanity':
            addBox(group, wood, [item.type === 'wardrobe' ? 1.5 : 1.8, item.type === 'wardrobe' ? 2.2 : 1, 0.75], [0, item.type === 'wardrobe' ? 1.1 : 0.5, 0]);
            if (item.type === 'wardrobe') {
              addBox(group, furnitureMaterial, [0.06, 0.18, 0.06], [-0.1, 1.1, 0.4]);
              addBox(group, furnitureMaterial, [0.06, 0.18, 0.06], [0.1, 1.1, 0.4]);
            }
            break;
          case 'nightstand':
          case 'stool':
            addBox(group, wood, [0.65, 0.55, 0.6], [0, 0.28, 0]);
            break;
          case 'plant':
            addCylinder(group, wood, 0.24, 0.3, 0.48, [0, 0.24, 0]);
            [-0.2, 0, 0.2].forEach((x, index) => {
              addCylinder(group, leafMaterial, 0.08, 0.13, 0.9 + (index % 2) * 0.3, [x, 0.95, 0]);
            });
            break;
          default:
            addBox(group, wood, [1, 0.5, 1], [0, 0.25, 0]);
        }
        group.position.set(item.x, 0, item.z);
        group.userData.furnitureId = item.id;
        group.traverse((child) => {
          if (child.isMesh) child.userData.furnitureId = item.id;
        });
        scene.add(group);
        furnitureGroups.set(item.id, group);
      };
      furniture.forEach(makeFurniture);

      controls = new OrbitControls(camera, renderer.domElement);
      controls.target.set(0, 0.8, 0);
      controls.enableDamping = true;
      controls.maxPolarAngle = Math.PI / 2.05;
      controls.minDistance = 7;
      controls.maxDistance = 18;

      const raycaster = new three.Raycaster();
      const pointer = new three.Vector2();
      const dragPlane = new three.Plane(new three.Vector3(0, 1, 0), 0);
      const intersection = new three.Vector3();
      let draggedGroup = null;
      const getPointer = (event) => {
        const bounds = renderer.domElement.getBoundingClientRect();
        pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
        pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
      };
      const onPointerDown = (event) => {
        getPointer(event);
        const hit = raycaster.intersectObjects(Array.from(furnitureGroups.values()), true)[0];
        if (!hit) return;
        const id = hit.object.userData.furnitureId;
        draggedGroup = furnitureGroups.get(id);
        setSelectedId(id);
        controls.enabled = false;
        renderer.domElement.setPointerCapture(event.pointerId);
      };
      const onPointerMove = (event) => {
        if (!draggedGroup) return;
        getPointer(event);
        if (raycaster.ray.intersectPlane(dragPlane, intersection)) {
          draggedGroup.position.x = three.MathUtils.clamp(intersection.x, -3.2, 3.2);
          draggedGroup.position.z = three.MathUtils.clamp(intersection.z, -2.2, 2.2);
        }
      };
      const onPointerUp = () => {
        if (!draggedGroup) return;
        const { furnitureId } = draggedGroup.userData;
        const { x, z } = draggedGroup.position;
        setFurniture((items) => items.map((item) => item.id === furnitureId ? { ...item, x, z } : item));
        draggedGroup = null;
        controls.enabled = true;
      };
      renderer.domElement.addEventListener('pointerdown', onPointerDown);
      renderer.domElement.addEventListener('pointermove', onPointerMove);
      renderer.domElement.addEventListener('pointerup', onPointerUp);
      renderer.domElement.addEventListener('pointercancel', onPointerUp);

      const resizeObserver = new ResizeObserver((entries) => {
        const { width: nextWidth, height: nextHeight } = entries[0].contentRect;
        if (!nextWidth || !nextHeight) return;
        camera.aspect = nextWidth / nextHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(nextWidth, nextHeight);
      });
      resizeObserver.observe(containerRef.current);
      const render = () => {
        if (disposed) return;
        controls.update();
        renderer.render(scene, camera);
        animationFrame = requestAnimationFrame(render);
      };
      render();

      return () => {
        resizeObserver.disconnect();
        renderer.domElement.removeEventListener('pointerdown', onPointerDown);
        renderer.domElement.removeEventListener('pointermove', onPointerMove);
        renderer.domElement.removeEventListener('pointerup', onPointerUp);
        renderer.domElement.removeEventListener('pointercancel', onPointerUp);
        controls.dispose();
        scene.traverse((object) => {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            (Array.isArray(object.material) ? object.material : [object.material]).forEach((material) => material.dispose());
          }
        });
      };
    };

    let cleanupScene;
    setError('');
    setup()
      .then((cleanup) => {
        if (disposed) cleanup?.();
        else cleanupScene = cleanup;
      })
      .catch((cause) => {
        if (!disposed) {
          console.error('3D furniture planner failed:', cause);
          setError('3D furniture planner is unavailable in this browser.');
        }
      });

    return () => {
      disposed = true;
      cancelAnimationFrame(animationFrame);
      if (renderer) renderer.dispose();
      if (controls) controls.dispose();
      if (cleanupScene) cleanupScene();
    };
  }, [backgroundColor, furniture, foregroundColor, height, isDarkMode, roomType, width]);

  const addFurniture = (type) => {
    const item = { id: `item-${Date.now()}-${Math.random()}`, type, x: 0, z: 0 };
    setFurniture((items) => [...items, item]);
    setSelectedId(item.id);
  };

  const removeSelected = () => {
    setFurniture((items) => items.filter((item) => item.id !== selectedId));
    setSelectedId(null);
  };

  return (
    <div className={`furniture-planner ${isDarkMode ? 'dark' : ''}`}>
      <div className="planner-toolbar">
        <label>
          Add furniture
          <select value="" onChange={(event) => event.target.value && addFurniture(event.target.value)}>
            <option value="">Choose an item...</option>
            {FURNITURE_OPTIONS.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <button type="button" className="ghost-button" onClick={removeSelected} disabled={!selectedId}>
          Remove selected
        </button>
      </div>
      <div className="planner-canvas-wrap">
        <div ref={containerRef} className="planner-canvas" style={{ height }} />
        {error && <div className="planner-error" role="alert">{error}</div>}
      </div>
      <p className="planner-hint">Drag furniture to arrange it. Drag the room to orbit; scroll to zoom.</p>
      <div className="planner-items" aria-label="Furniture in room">
        {furniture.map((item) => (
          <button
            type="button"
            className={`planner-item ${selectedId === item.id ? 'selected' : ''}`}
            key={item.id}
            onClick={() => setSelectedId(item.id)}
          >
            {item.type}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThreeShowcase;
