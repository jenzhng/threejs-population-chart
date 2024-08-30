import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';  // Import dat.GUI

class DataPart extends THREE.Object3D {
  constructor(data) {
    super();
    this.countryName = data.countryName;
    this.peaks = data.peaks;
    this.isDataPart = true;

    // Create the geometry with a slightly larger scale for height
    const gData = new THREE.BoxGeometry(1, 1, 1, this.peaks.length - 1, 1, 1)
      .translate(0.5, 0.5, 1)
      .scale(this.peaks.length - 1, 2, 0.1); // Scale up height by factor of 2

    for (let i = 0; i < gData.attributes.position.count; i++) {
      if (gData.attributes.position.getY(i) > 0.5) {
        const idx = Math.round(gData.attributes.position.getX(i));
        gData.attributes.position.setY(i, this.peaks[idx] * 1.5); // Scale values up for more visibility
      }
    }
    gData.translate(-0.5 * (this.peaks.length - 1), 0, 0);
    gData.scale(10 / this.peaks.length, 1, 1);
    gData.toNonIndexed();
    gData.computeVertexNormals();

    const mData = new THREE.MeshLambertMaterial();
    const oData = new THREE.Mesh(gData, mData);
    this.add(oData);

    // Adjust anchors
    this.anchors = [
      new THREE.Vector3(-this.peaks.length * 0.5, this.peaks[0] * 1.5 - 1, 0), // Anchor just below the bottom of the bar
      new THREE.Vector3(this.peaks.length * 0.5, this.peaks[this.peaks.length - 1] * 1.5 + 1, 0) // Anchor above the peak
    ];

    this.anchorsProjection = (camera, projVectors, halfSize) => {
      projVectors.forEach((pv, idx) => {
        pv.copy(this.anchors[idx]);
        this.localToWorld(pv);
        pv.project(camera);
        pv.x *= halfSize.x;
        pv.y *= -1 * halfSize.y;
        pv.x += halfSize.x;
        pv.y += halfSize.y;
      });
    };
  }
}


class DataWidget extends THREE.Object3D {
  constructor(mainData) {
    super();
    this.colors = [new THREE.Color('pink'), new THREE.Color('orange')];
    this.mainData = mainData;
    this.count = mainData.length;

    this.dataBars = [];
    this.mainData.forEach((md, mdIdx) => {
      const dp = new DataPart(md);
      dp.children[0].material.color.lerpColors(
        this.colors[0],
        this.colors[1],
        mdIdx / (mainData.length - 1)
      );
      dp.position.z = ((this.count - 1) * 0.5 - mdIdx) * 0.5;
      this.dataBars.push(dp);
      this.add(dp);
    });

    const helper = new THREE.LineSegments(
      new THREE.BufferGeometry(),
      new THREE.LineBasicMaterial({
        color: 0xff0088,
        depthWrite: false,
        depthTest: false
      })
    );
    this.add(helper);
    this.helper = helper;

    this.textName = document.createElement('div');
    this.textName.className = 'text';
    this.textName.style.position = 'absolute';
    this.textName.style.display = 'none';
    this.textName.style.fontSize = '14px';
    this.textName.style.color = 'black';
    this.textName.style.background = 'white';
    this.textName.style.padding = '5px';
    this.textName.style.border = '1px solid black';
    document.body.appendChild(this.textName);

    this.textVal = document.createElement('div');
    this.textVal.className = 'text';
    this.textVal.style.position = 'absolute';
    this.textVal.style.display = 'none';
    this.textVal.style.fontSize = '14px';
    this.textVal.style.color = 'black';
    this.textVal.style.background = 'white';
    this.textVal.style.padding = '5px';
    this.textVal.style.border = '1px solid black';
    document.body.appendChild(this.textVal);

    this.anchorsProjections = [new THREE.Vector3(), new THREE.Vector3()];

    this.hideData = () => {
      this.helper.visible = false;
      this.textName.style.display = 'none';
      this.textVal.style.display = 'none';
    };

    this.showData = () => {
      this.helper.visible = true;
      this.textName.style.display = 'block';
      this.textVal.style.display = 'block';
    };

    this.showText = (obj, camera, halfSize) => {
      obj.parent.anchorsProjection(camera, this.anchorsProjections, halfSize);

      // Ensure text is within viewport
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Check if text is within viewport bounds
      this.textName.style.left = `${Math.max(0, Math.min(this.anchorsProjections[0].x, viewportWidth - 100))}px`;
      this.textName.style.top = `${Math.max(0, Math.min(this.anchorsProjections[0].y, viewportHeight - 100))}px`;

      this.textName.innerHTML = obj.parent.countryName;

      this.textVal.style.left = `${Math.max(0, Math.min(this.anchorsProjections[1].x, viewportWidth - 100))}px`;
      this.textVal.style.top = `${Math.max(0, Math.min(this.anchorsProjections[1].y, viewportHeight - 100))}px`;

      this.textVal.innerHTML = obj.parent.peaks[obj.parent.peaks.length - 1].toFixed(2);
    };

    this.setSelected = (obj) => {
      this.helper.geometry.dispose();
      this.helper.geometry = new THREE.EdgesGeometry(obj.geometry);
      this.helper.position.copy(obj.parent.position);
      this.textName.innerHTML = obj.parent.countryName;
      this.textVal.innerHTML = obj.parent.peaks[obj.parent.peaks.length - 1].toFixed(2);
    };
  }
}

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xface8D);

const frustumSize = 13;
const aspect = window.innerWidth / window.innerHeight;
const camera = new THREE.OrthographicCamera(
  -frustumSize * aspect / 2,
  frustumSize * aspect / 2,
  frustumSize / 2,
  -frustumSize / 2,
  1,
  1000
);

camera.position.set(-1, 1, 0.75).setLength(12);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 2.5, 0);
controls.enableDamping = true;

scene.add(new THREE.GridHelper(10, 10, 'maroon', 'maroon'));

const light = new THREE.DirectionalLight(0xffffff, 0.25);
light.position.set(3, 5, 8);
scene.add(light, new THREE.AmbientLight(0xffffff, 0.75));

// Fetch and load data
fetch('population_data.json')
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    const dw = new DataWidget(data);
    scene.add(dw);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2(-1, -1);
    const halfSize = new THREE.Vector2();

    function onPointerMove(event) {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    window.addEventListener('pointermove', onPointerMove);

    renderer.setAnimationLoop(() => {
      controls.update();

      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(dw.dataBars);
      if (intersects.length > 0) {
        const obj = intersects[0].object;
        if (obj.parent.isDataPart && dw.prevSelected !== obj) {
          dw.setSelected(obj);
          dw.showData();
          dw.prevSelected = obj;
        }
        if (dw.prevSelected !== null) {
          dw.showText(obj, camera, halfSize.set(window.innerWidth, window.innerHeight).multiplyScalar(0.5));
        }
      } else {
        dw.hideData();
        dw.prevSelected = null;
      }

      renderer.render(scene, camera);
    });
  })
  .catch(error => console.error('Error loading data:', error));

// Handle window resize
window.addEventListener('resize', () => {
  const aspect = window.innerWidth / window.innerHeight;
  camera.left = -frustumSize * aspect / 2;
  camera.right = frustumSize * aspect / 2;
  camera.top = frustumSize / 2;
  camera.bottom = -frustumSize / 2;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Initialize dat.GUI
const gui = new dat.GUI();
gui.add({ fullscreen: false }, 'fullscreen').name('Toggle Fullscreen').onChange(value => {
  if (value) {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) { // Firefox
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) { // Chrome, Safari and Opera
      document.documentElement.webkitRequestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) { // IE/Edge
      document.documentElement.msRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) { // Firefox
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) { // Chrome, Safari and Opera
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { // IE/Edge
      document.msExitFullscreen();
    }
  }
});
