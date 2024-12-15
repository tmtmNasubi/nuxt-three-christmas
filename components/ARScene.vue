<template>
  <div ref="arContainer"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import * as THREE from "three";
import { THREEx, ARjs } from "@ar-js-org/ar.js-threejs";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

const arContainer = ref<HTMLElement | null>(null);
let renderer: THREE.WebGLRenderer;
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let arToolkitSource: any;
let arToolkitContext: any;
let arMarkerControls: any;
let mesh: THREE.Mesh;
let torusMesh: THREE.Mesh;

const onRenderFcts: ((delta: number, now: number) => void)[] = [];

const objectParam = {
  x: 0,
  y: -1,
  z: 0,
};

/**
 * Three.jsの初期化
 */
const initThree = () => {
  THREEx.ArToolkitContext.baseURL = "./";

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setClearColor(new THREE.Color("lightgrey"), 0);
  renderer.setSize(640, 480);
  renderer.domElement.style.position = "absolute";
  renderer.domElement.style.top = "0px";
  renderer.domElement.style.left = "0px";
  arContainer.value?.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera();
  scene.add(camera);
};

/**
 * AR.jsの初期化
 */
const initAR = () => {
  // カメラを設定
  arToolkitSource = new THREEx.ArToolkitSource({
    sourceType: "webcam",
    sourceWidth: window.innerWidth > window.innerHeight ? 640 : 480,
    sourceHeight: window.innerWidth > window.innerHeight ? 480 : 640,
  });

  arToolkitSource.init(
    () => {
      arToolkitSource.domElement.addEventListener("canplay", initARContext);
      setTimeout(onResize, 2000);
    },
    () => {}
  );

  window.addEventListener("resize", onResize);
};

/**
 * ARコンテキストを初期化
 */
const initARContext = () => {
  arToolkitContext = new THREEx.ArToolkitContext({
    cameraParametersUrl:
      THREEx.ArToolkitContext.baseURL + "./data/camera_para.dat",
    detectionMode: "mono",
  });

  arToolkitContext.init(() => {
    camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
    arToolkitContext.arController.orientation = getSourceOrientation();
    arToolkitContext.arController.options.orientation = getSourceOrientation();
  });

  arMarkerControls = new THREEx.ArMarkerControls(arToolkitContext, camera, {
    type: "pattern",
    patternUrl: THREEx.ArToolkitContext.baseURL + "./data/patt.hiro",
    changeMatrixMode: "cameraTransformMatrix",
  });

  scene.visible = false;
};

const onResize = () => {
  arToolkitSource.onResizeElement();
  arToolkitSource.copyElementSizeTo(renderer.domElement);
  if (arToolkitContext.arController !== null) {
    arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas);
  }
};

const getSourceOrientation = (): string => {
  if (!arToolkitSource) return "";
  return arToolkitSource.domElement.videoWidth >
    arToolkitSource.domElement.videoHeight
    ? "landscape"
    : "portrait";
};

/**
 * シーンに3Dオブジェクトを追加
 */
const addObjects = () => {
  // const myFont = new THREE.Font(font);
  // const params = new THREE.TextGeometryParameter({
  //   font: myFont,
  // });
  // const geometry = new THREE.TextGeometry("Merry Christmas", params);
  // const material = new THREE.MeshNormalMaterial({
  //   transparent: true,
  //   opacity: 0.5,
  //   side: THREE.DoubleSide,
  // });
  // mesh = new THREE.Mesh(geometry, material);
  // mesh.position.y = geometry.parameters.height / 2;
  // scene.add(mesh);
  const fontLoader = new FontLoader();
  const textGroup = new THREE.Group();
  fontLoader.load("/data/Courgette_Regular.json", (font) => {
    console.log("loaded font!!");
    const textGeometry = new TextGeometry("Marry Christmas", {
      font: font,
      size: 1,
      height: 0.2,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.02,
      bevelOffset: 0,
      bevelSegments: 5,
    });
    textGeometry.center();

    // メインのテキストマテリアル
    const textMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(1, 1, 1), // 白色
    });

    // アウトライン用のマテリアル
    const outlineMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0, 0, 0), // 黒色
      side: THREE.BackSide, // 裏面を表示
    });

    // メインのテキストメッシュ
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);

    // アウトライン用のメッシュ
    const outlineMesh = new THREE.Mesh(textGeometry, outlineMaterial);
    outlineMesh.scale.multiplyScalar(1.05); // アウトラインを少し大きくする

    // テキストグループを作成

    textGroup.add(textMesh);
    textGroup.add(outlineMesh);

    // グループ全体を回転
    textGroup.rotation.x = -Math.PI / 4; // 45度回転（X軸周り）
    textGroup.position.z = 1;

    scene.add(textGroup);
  });
  // const geometry = new THREE.BoxGeometry(1, 1, 1);
  // const material = new THREE.MeshNormalMaterial({
  //   transparent: true,
  //   opacity: 0.5,
  //   side: THREE.DoubleSide,
  // });
  // mesh = new THREE.Mesh(geometry, material);
  // mesh.position.y = geometry.parameters.height / 2;
  // scene.add(mesh);

  // const torusKnotGeometry = new THREE.TorusKnotGeometry(0.3, 0.1, 64, 16);
  // const torusMaterial = new THREE.MeshNormalMaterial();
  // torusMesh = new THREE.Mesh(torusKnotGeometry, torusMaterial);
  // torusMesh.position.y = 0.5;
  // scene.add(torusMesh);

  onRenderFcts.push((delta) => {
    // textGroup.rotation.x += Math.PI * delta;
  });
};

/**
 * アニメーションループを処理
 * @param nowMsec
 */
const animate = (nowMsec: number) => {
  requestAnimationFrame(animate);

  if (!arToolkitContext || !arToolkitSource || !arToolkitSource.ready) {
    return;
  }

  arToolkitContext.update(arToolkitSource.domElement);
  scene.visible = camera.visible;

  const lastTimeMsec = nowMsec - 1000 / 60;
  const deltaMsec = Math.min(200, nowMsec - lastTimeMsec);
  onRenderFcts.forEach((onRenderFct) => {
    onRenderFct(deltaMsec / 1000, nowMsec / 1000);
  });

  renderer.render(scene, camera);
};

onMounted(() => {
  initThree();
  initAR();
  addObjects();
  onRenderFcts.push(() => {
    renderer.render(scene, camera);
  });
  requestAnimationFrame(animate);

  window.addEventListener("markerFound", (e) => {
    console.log("marker found!", e);
  });
});

onUnmounted(() => {
  window.removeEventListener("resize", onResize);
});
</script>

<style scoped>
/* 必要に応じてスタイルを追加 */
</style>
