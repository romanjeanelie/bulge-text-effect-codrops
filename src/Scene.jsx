import { useRef, useMemo, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useControls } from "leva";
import * as THREE from "three";
import CustomShaderMaterial from "three-custom-shader-material";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";
import { useHelper, Html, OrbitControls } from "@react-three/drei";
import { PointLightHelper, DirectionalLightHelper } from "three";
import html2canvas from "html2canvas";
import { debounce } from "lodash";

function downloadCanvasAsImage(canvas, filename) {
  const link = document.createElement("a");
  link.setAttribute("download", filename + ".png");
  canvas.toBlob(function (blob) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.click();
  });
}
const useDomToCanvas = (domEl) => {
  const [texture, setTexture] = useState();
  useEffect(() => {
    if (!domEl) return;
    const convertDomToCanvas = async () => {
      domEl.style.display = "flex";
      const canvas = await html2canvas(domEl, { backgroundColor: null });
      setTexture(new THREE.CanvasTexture(canvas));
      //   domEl.style.display = "none";
      //   downloadCanvasAsImage(canvas, "bump-text-effect");
    };

    convertDomToCanvas();

    const debouncedResize = debounce(() => {
      convertDomToCanvas();
    }, 100);

    window.addEventListener("resize", debouncedResize);
    return () => {
      window.removeEventListener("resize", debouncedResize);
    };
  }, [domEl]);

  return texture;
};

function Lights() {
  const pointLightRef = useRef();

  useHelper(pointLightRef, PointLightHelper, 0.7, "cyan");

  const config = useControls("Lights", {
    color: "#c79566",
    // color: "#c2e812",
    intensity: { value: 3716, min: 0, max: 5000, step: 0.01 },
    distance: { value: 12.9, min: 0, max: 100, step: 0.1 },
    decay: { value: 2.6, min: 0, max: 5, step: 0.1 },
    position: { value: [2.39, 4.91, 6.3] },
  });
  return <pointLight ref={pointLightRef} {...config} />;
  //   return <directionalLight ref={pointLightRef} {...config} />;
}

function Scene() {
  const state = useThree();
  const { width, height } = state.viewport;
  const [domEl, setDomEl] = useState(null);

  const materialRef = useRef();
  const textureDOM = useDomToCanvas(domEl);

  const uniforms = useMemo(
    () => ({
      uTexture: { value: textureDOM },
      uMouse: { value: new THREE.Vector2(0, 0) },
    }),
    [textureDOM]
  );

  const mouseLerped = useRef({ x: 0, y: 0 });

  useFrame((state, delta) => {
    const mouse = state.mouse;
    mouseLerped.current.x = THREE.MathUtils.lerp(mouseLerped.current.x, mouse.x, 0.1);
    mouseLerped.current.y = THREE.MathUtils.lerp(mouseLerped.current.y, mouse.y, 0.1);
    materialRef.current.uniforms.uMouse.value.x = mouseLerped.current.x;
    materialRef.current.uniforms.uMouse.value.y = mouseLerped.current.y;
  });

  return (
    <>
      <OrbitControls makeDefault enabled={true} />
      <Html zIndexRange={[-1, -10]} prepend fullscreen>
        <div ref={(el) => setDomEl(el)} className="dom-element">
          <p className="flex flex-col">
            DESIGN <br />
            PORTFOLIO <br />
            <span className="ml-auto">2024</span>
          </p>
        </div>
      </Html>
      <mesh scale={[1, 1, 1]}>
        <planeGeometry args={[width, height, 254, 254]} />
        <CustomShaderMaterial
          ref={materialRef}
          baseMaterial={THREE.MeshStandardMaterial}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          silent
          flatShading
          transparent
        />
        <Lights />
      </mesh>
    </>
  );
}

export default Scene;
