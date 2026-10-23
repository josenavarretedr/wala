import { Composition, Folder } from "remotion";
import { z } from "zod";
import { HelloWorld } from "./HelloWorld";
import { Logo } from "./HelloWorld/Logo";
import { Title } from "./HelloWorld/Title";
import {
  defaultLowerThirdProps,
  lowerThirdSchema,
  VideoComposition,
} from "./LowerThird";
import {
  AtmHookScene,
  defaultWalaAtmHookProps,
  walaAtmHookSchema,
  FerreteriaMasterVideo,
  FerreteriaScene1Hook,
  FerreteriaScene2ACaos,
  FerreteriaScene2BClaridad,
  FerreteriaScene3AMetricas,
  FerreteriaScene3BPuertaAbierta,
  EditorialFlowTriadScene,
  StockComparisonScene,
  OnCameraHudScene,
  WalaIconsShowcaseScene,
  BodegaFullMotionMaster,
  BodegaScene1Hook,
  BodegaScene2Caso,
  BodegaScene3Valor,
  BodegaScene4Accion,
  BodegaScene5CTA,
} from "./WalaMotion";

import {
  AgricultorVideo,
  getComputedTimeline,
} from "./AgricultorVsCooperativa";

const logoSchema = z.object({
  logoColor1: z.string(),
  logoColor2: z.string(),
});

const titleSchema = z.object({
  titleText: z.string(),
  titleColor: z.string(),
});

const helloWorldSchema = z.object({
  titleText: z.string(),
  titleColor: z.string(),
});

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  const { totalFrames: agricultorTotalFrames } = getComputedTimeline(60);

  return (
    <>
      {/* ============================================================== */}
      {/* EXPLICATIVO: AGRICULTOR vs COOPERATIVA AGROINDUSTRIAL          */}
      {/* ============================================================== */}
      <Folder name="Infografia-Explicativa">
        <Composition
          id="Agricultor-Vs-Cooperativa"
          component={AgricultorVideo}
          durationInFrames={agricultorTotalFrames}
          fps={60}
          width={1080}
          height={1920}
        />
      </Folder>

      {/* ============================================================== */}
      {/* WALA MOTION SYSTEM - ESTILO EDITORIAL & HUD (Capturas 1, 2, 3) */}
      {/* ============================================================== */}
      <Folder name="Wala-Estilo-Editorial">
        {/* Captura 1: Tríada Proveedor -> Tienda -> Cliente (5s @ 60 FPS) */}
        <Composition
          id="Wala-01-Flujo-Proveedor-Tienda-Cliente"
          component={EditorialFlowTriadScene}
          durationInFrames={300}
          fps={60}
          width={1080}
          height={1920}
        />
        {/* Captura 2: Comparativa Stock 0, Catálogo y Tickets (6s @ 60 FPS) */}
        <Composition
          id="Wala-02-Comparativa-Stock-Tickets"
          component={StockComparisonScene}
          durationInFrames={360}
          fps={60}
          width={1080}
          height={1920}
        />
        {/* Captura 3: On-Camera HUD Stepper & Dark Capsule (5s @ 60 FPS) */}
        <Composition
          id="Wala-03-OnCamera-HUD-Stepper"
          component={OnCameraHudScene}
          durationInFrames={300}
          fps={60}
          width={1080}
          height={1920}
        />
        {/* Catálogo de los 24 Iconos WALA Doodle (5s @ 60 FPS) */}
        <Composition
          id="Wala-04-Catalogo-Iconos-Doodle"
          component={WalaIconsShowcaseScene}
          durationInFrames={300}
          fps={60}
          width={1080}
          height={1920}
        />
      </Folder>

      {/* ============================================================== */}
      {/* WALA BODEGAS - 100% FULL MOTION GRAPHICS (9:16 VERTICAL 60s) */}
      {/* ============================================================== */}
      <Folder name="Bodega-FullMotion">
        {/* Master Video 60 segundos (3600 frames @ 60 FPS) */}
        <Composition
          id="Bodega-FullVideo"
          component={BodegaFullMotionMaster}
          durationInFrames={3600}
          fps={60}
          width={1080}
          height={1920}
        />
        {/* Escena 1: 0-5s (300 frames) */}
        <Composition
          id="Bodega-01-Gancho"
          component={BodegaScene1Hook}
          durationInFrames={300}
          fps={60}
          width={1080}
          height={1920}
        />
        {/* Escena 2: 5-20s (900 frames) */}
        <Composition
          id="Bodega-02-Caso-Comparativa"
          component={BodegaScene2Caso}
          durationInFrames={900}
          fps={60}
          width={1080}
          height={1920}
        />
        {/* Escena 3: 20-45s (1500 frames) */}
        <Composition
          id="Bodega-03-Valor-Caja-Abierta"
          component={BodegaScene3Valor}
          durationInFrames={1500}
          fps={60}
          width={1080}
          height={1920}
        />
        {/* Escena 4: 45-55s (600 frames) */}
        <Composition
          id="Bodega-04-Micro-Accion"
          component={BodegaScene4Accion}
          durationInFrames={600}
          fps={60}
          width={1080}
          height={1920}
        />
        {/* Escena 5: 55-60s (300 frames) */}
        <Composition
          id="Bodega-05-CTA-WALA"
          component={BodegaScene5CTA}
          durationInFrames={300}
          fps={60}
          width={1080}
          height={1920}
        />
      </Folder>

      {/* 45-second (2700 frames @ 60 FPS) Master Video for Ferreteria Script */}
      <Composition
        id="Ferreteria-FullVideo"
        component={FerreteriaMasterVideo}
        durationInFrames={2700}
        fps={60}
        width={1080}
        height={1920}
      />

      <Folder name="Ferreteria-Escenas">
        {/* Scene 1: 0-5s (300 frames) */}
        <Composition
          id="Ferreteria-01-Gancho"
          component={FerreteriaScene1Hook}
          durationInFrames={300}
          fps={60}
          width={1080}
          height={1920}
        />
        {/* Scene 2A: 5-12.5s (450 frames) */}
        <Composition
          id="Ferreteria-02A-Caso-Caos"
          component={FerreteriaScene2ACaos}
          durationInFrames={450}
          fps={60}
          width={1080}
          height={1920}
        />
        {/* Scene 2B: 12.5-20s (450 frames) */}
        <Composition
          id="Ferreteria-02B-Caso-Claridad"
          component={FerreteriaScene2BClaridad}
          durationInFrames={450}
          fps={60}
          width={1080}
          height={1920}
        />
        {/* Scene 3A: 20-32.5s (750 frames) */}
        <Composition
          id="Ferreteria-03A-Valor-Metricas"
          component={FerreteriaScene3AMetricas}
          durationInFrames={750}
          fps={60}
          width={1080}
          height={1920}
        />
        {/* Scene 3B: 32.5-45s (750 frames) */}
        <Composition
          id="Ferreteria-03B-Valor-Puerta"
          component={FerreteriaScene3BPuertaAbierta}
          durationInFrames={750}
          fps={60}
          width={1080}
          height={1920}
        />
      </Folder>

      {/* 5-second (300 frames @ 60 FPS) Vertical 9:16 WALA Salón Hook */}
      <Composition
        id="WalaAtmHook"
        component={AtmHookScene}
        durationInFrames={300}
        fps={60}
        width={1080}
        height={1920}
        schema={walaAtmHookSchema}
        defaultProps={defaultWalaAtmHookProps}
      />

      {/* 10-second (300 frames @ 30 FPS) Lower Third Subscribe Banner */}
      <Composition
        id="SubscribeLowerThird"
        component={VideoComposition}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        schema={lowerThirdSchema}
        defaultProps={defaultLowerThirdProps}
      />

      <Folder name="Elements">
        <Composition
          id="Logo"
          component={Logo}
          durationInFrames={150}
          fps={30}
          width={1920}
          height={1080}
          schema={logoSchema}
          defaultProps={{
            logoColor1: "#91EAE4",
            logoColor2: "#86A8E7",
          }}
        />
        <Composition
          id="Title"
          component={Title}
          durationInFrames={115}
          fps={30}
          width={1920}
          height={1080}
          schema={titleSchema}
          defaultProps={{
            titleText: "Welcome to Remotion",
            titleColor: "#000000",
          }}
        />
      </Folder>
      <Composition
        // You can take the "id" to render a video:
        // bunx remotion render HelloWorld
        id="HelloWorld"
        component={HelloWorld}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        schema={helloWorldSchema}
        // You can override these props for each render:
        // https://www.remotion.dev/docs/parametrized-rendering
        defaultProps={{
          titleText: "Welcome to Remotion",
          titleColor: "#000000",
        }}
      />
    </>
  );
};
