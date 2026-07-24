"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface Device {
  id: string;
  name: string;
  type: string;
  current: number;
  pole: number;
  width: number;
  height: number;
  brand?: string;
  model?: string;
  circuit?: string;
  leakage?: string;
}

interface CabinetParams {
  name: string;
  width: number;
  height: number;
  depth: number;
  ventLouvers?: boolean;
  phase?: string;
  cabinetStyle?: string;
}

interface ThreeCabinetViewerProps {
  cabinetParams: CabinetParams;
  devices: Device[];
  activeLayout: {
    rails: { id: string; devices: string[] }[];
  };
  isDoorOpen: boolean;
  isInnerOpen: boolean;
  isExploded: boolean;
  showFrame3d: boolean;
  showBusbar3d: boolean;
  showDevices3d: boolean;
  presetView: "front" | "iso" | "side" | "top";
  onSelectDevice: (dev: Device | null) => void;
}

export default function ThreeCabinetViewer({
  cabinetParams,
  devices,
  activeLayout,
  isDoorOpen,
  isInnerOpen,
  isExploded,
  showFrame3d,
  showBusbar3d,
  showDevices3d,
  presetView,
  onSelectDevice,
}: ThreeCabinetViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const doorGroupRef = useRef<THREE.Group | null>(null);
  const innerGroupRef = useRef<THREE.Group | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cabinetGroupRef = useRef<THREE.Group | null>(null);

  // Orbit rotation controls
  const isDraggingRef = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const rotationRef = useRef({ x: -0.25, y: 0.55 });
  const zoomRef = useRef(1);

  // Target angles for smooth door opening (UPDATED DYNAMICALLY VIA REF)
  const targetDoorAngleRef = useRef(0);
  const targetInnerAngleRef = useRef(0);
  const currentDoorAngle = useRef(0);
  const currentInnerAngle = useRef(0);

  // Sync door angle targets smoothly whenever props change
  useEffect(() => {
    targetDoorAngleRef.current = isDoorOpen ? -Math.PI * 0.65 : 0;
  }, [isDoorOpen]);

  useEffect(() => {
    targetInnerAngleRef.current = isInnerOpen ? -Math.PI * 0.55 : 0;
  }, [isInnerOpen]);

  // Raycaster for 3D device click detection
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  // 1. Initialize WebGL Scene
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060911); // Deep slate space
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(42, width / height, 1, 5000);
    camera.position.set(0, 0, 1350);
    cameraRef.current = camera;

    // WebGL Renderer setup with soft shadows & antialiasing
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    mountRef.current.innerHTML = "";
    mountRef.current.appendChild(renderer.domElement);

    // Studio Quality Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const mainKeyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    mainKeyLight.position.set(900, 1400, 1100);
    mainKeyLight.castShadow = true;
    mainKeyLight.shadow.mapSize.width = 2048;
    mainKeyLight.shadow.mapSize.height = 2048;
    scene.add(mainKeyLight);

    const fillBlueLight = new THREE.DirectionalLight(0x38bdf8, 1.0); // Cyan rim light
    fillBlueLight.position.set(-900, -500, -700);
    scene.add(fillBlueLight);

    const topSpot = new THREE.SpotLight(0xffedd5, 1.5);
    topSpot.position.set(0, 1500, 400);
    scene.add(topSpot);

    // Cabinet Main 3D Group
    const cabinetGroup = new THREE.Group();
    cabinetGroupRef.current = cabinetGroup;
    scene.add(cabinetGroup);

    // Dimension scaling (1mm = 0.5 units)
    const scale = 0.5;
    const cWidth = cabinetParams.width * scale;
    const cHeight = cabinetParams.height * scale;
    const cDepth = cabinetParams.depth * scale;
    const halfW = cWidth / 2;
    const halfH = cHeight / 2;
    const halfD = cDepth / 2;

    // Authentic Industrial PBR Materials matching Reference CAD 3D
    const steelMaterial = new THREE.MeshStandardMaterial({
      color: 0xdfe4ea, // RAL 7035 Light Industrial Off-White Powder Coat
      metalness: 0.25,
      roughness: 0.35,
    });

    const plinthBaseMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e293b, // Dark Graphite Plinth Base
      metalness: 0.6,
      roughness: 0.4,
    });

    const hingeChromeMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e293b, // Heavy-Duty Industrial Black Hinge
      metalness: 0.7,
      roughness: 0.3,
    });

    const doorSealYellowMaterial = new THREE.MeshStandardMaterial({
      color: 0xeab308, // Golden Yellow Rubber Gasket Seal Trim
      roughness: 0.4,
    });

    const steelInnerPlateMaterial = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0, // Galvanized Zinc Mounting Plate
      metalness: 0.6,
      roughness: 0.35,
    });

    const doorOuterMaterial = new THREE.MeshStandardMaterial({
      color: 0xd9e1e8, // RAL 7035 Powder Coated Door
      metalness: 0.2,
      roughness: 0.35,
    });

    const wireDuctMaterial = new THREE.MeshStandardMaterial({
      color: 0x475569, // Slotted PVC Wire Duct Gray
      metalness: 0.1,
      roughness: 0.6,
    });

    const dinRailMaterial = new THREE.MeshStandardMaterial({
      color: 0xcbd5e1, // Silver Zinc DIN Rail
      metalness: 0.9,
      roughness: 0.2,
    });

    const peCopperMaterial = new THREE.MeshStandardMaterial({
      color: 0x84cc16, // PE Earth Grounding Strip
      metalness: 0.85,
      roughness: 0.25,
    });

    // ----------------------------------------------------
    // A. ENCLOSURE STEEL BOX FRAME (M5 Rear + M2 Sides + Top/Bottom Plates + Plinth + Hinges)
    // ----------------------------------------------------
    if (showFrame3d) {
      // Rear Steel Plate M5
      const rearGeo = new THREE.BoxGeometry(cWidth, cHeight, 6);
      const rearMesh = new THREE.Mesh(rearGeo, steelMaterial);
      rearMesh.position.set(0, 0, -halfD);
      cabinetGroup.add(rearMesh);

      // Left Side Panel M2 (With 2 Groups of Pressed Sheet-Metal Louvers)
      const leftGeo = new THREE.BoxGeometry(6, cHeight, cDepth);
      const leftMesh = new THREE.Mesh(leftGeo, steelMaterial);
      leftMesh.position.set(-halfW, 0, 0);
      cabinetGroup.add(leftMesh);

      // Render 2 groups of clean pressed sheet-metal louvers (Top & Bottom) flush with left side panel
      if (cabinetParams.ventLouvers) {
        const ventYPositions = [cHeight * 0.22, -cHeight * 0.22];
        ventYPositions.forEach((vY) => {
          for (let lSlot = -18; lSlot <= 18; lSlot += 18) {
            const louverGroup = new THREE.Group();
            louverGroup.position.set(-halfW - 0.5, vY + lSlot, 0);
            cabinetGroup.add(louverGroup);

            // Recessed slot opening
            const slotCut = new THREE.Mesh(
              new THREE.BoxGeometry(2, 4, cDepth * 0.38),
              new THREE.MeshBasicMaterial({ color: 0x0f172a })
            );
            louverGroup.add(slotCut);

            // Downward angled 45° pressed louver blade (Flush sheet metal louver)
            const louverBlade = new THREE.Mesh(
              new THREE.BoxGeometry(1.5, 4.5, cDepth * 0.36),
              new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.5, roughness: 0.3 })
            );
            louverBlade.position.set(-0.8, -1, 0);
            louverBlade.rotation.z = Math.PI / 4;
            louverGroup.add(louverBlade);
          }
        });
      }

      // Right Side Panel
      const rightMesh = new THREE.Mesh(leftGeo, steelMaterial);
      rightMesh.position.set(halfW, 0, 0);
      cabinetGroup.add(rightMesh);

      // Yellow Sealing Gasket Trim along Door Frame Rim
      const gasketTop = new THREE.Mesh(new THREE.BoxGeometry(cWidth + 2, 4, 4), doorSealYellowMaterial);
      gasketTop.position.set(0, halfH, halfD);
      cabinetGroup.add(gasketTop);

      const gasketBot = new THREE.Mesh(new THREE.BoxGeometry(cWidth + 2, 4, 4), doorSealYellowMaterial);
      gasketBot.position.set(0, -halfH, halfD);
      cabinetGroup.add(gasketBot);

      const gasketLeft = new THREE.Mesh(new THREE.BoxGeometry(4, cHeight, 4), doorSealYellowMaterial);
      gasketLeft.position.set(-halfW, 0, halfD);
      cabinetGroup.add(gasketLeft);

      // Top Plate
      const topGeo = new THREE.BoxGeometry(cWidth, 6, cDepth);
      const topMesh = new THREE.Mesh(topGeo, steelMaterial);
      topMesh.position.set(0, halfH, 0);
      cabinetGroup.add(topMesh);

      // Bottom Plate
      const bottomMesh = new THREE.Mesh(topGeo, steelMaterial);
      bottomMesh.position.set(0, -halfH, 0);
      cabinetGroup.add(bottomMesh);

      // Cabinet Plinth Base 100mm (Dark Graphite Base)
      const baseGeo = new THREE.BoxGeometry(cWidth + 4, 30, cDepth + 4);
      const baseMesh = new THREE.Mesh(baseGeo, plinthBaseMaterial);
      baseMesh.position.set(0, -halfH - 15, 0);
      cabinetGroup.add(baseMesh);

      // Heavy-Duty Black Industrial Steel Door Hinges
      const hingePositions = [halfH * 0.65, -halfH * 0.65];
      hingePositions.forEach((hy) => {
        const hingeGroup = new THREE.Group();
        hingeGroup.position.set(-halfW - 2, hy, halfD - 2);
        cabinetGroup.add(hingeGroup);

        const pinMesh = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 28, 16), hingeChromeMaterial);
        hingeGroup.add(pinMesh);

        const plateMesh = new THREE.Mesh(new THREE.BoxGeometry(10, 24, 5), hingeChromeMaterial);
        plateMesh.position.set(5, 0, -3);
        hingeGroup.add(plateMesh);
      });
    }

    // ----------------------------------------------------
    // B. M1 FRONT MOUNTING PLATE + COPPER BUSBARS + DIN RAILS + BREAKERS
    // ----------------------------------------------------
    const m1Z = isExploded ? -halfD + 170 : -halfD + 65;
    const maxInnerWidth = cWidth - 76; // Available mounting width inside cabinet

    // Galvanized Mounting Back Plate M1
    const m1Geo = new THREE.BoxGeometry(cWidth - 16, cHeight - 16, 5);
    const m1Mesh = new THREE.Mesh(m1Geo, steelInnerPlateMaterial);
    m1Mesh.position.set(0, 0, m1Z);
    cabinetGroup.add(m1Mesh);

    // COPPER BUSBARS & 3-PHASE VERTICAL DISTRIBUTION BUSBAR SYSTEM (Mounted on FRONT face of M1)
    if (showBusbar3d) {
      const busbarZ = m1Z + 12; // Mounted on front face of M1 on standoff insulators!

      // 1. PE Grounding Copper Bar with Terminal Screws
      const peGeo = new THREE.BoxGeometry(cWidth * 0.72, 10, 8);
      const peMesh = new THREE.Mesh(peGeo, peCopperMaterial);
      peMesh.position.set(0, halfH - 42, busbarZ);
      cabinetGroup.add(peMesh);

      // PE Standoff Insulators
      const insMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 });
      [-cWidth * 0.3, cWidth * 0.3].forEach((ix) => {
        const ins = new THREE.Mesh(new THREE.CylinderGeometry(6, 7, 10, 16), insMat);
        ins.rotation.x = Math.PI / 2;
        ins.position.set(ix, halfH - 42, m1Z + 5);
        cabinetGroup.add(ins);
      });

      // Brass PE Earth Terminal Screws pattern
      const peScrewMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.9, roughness: 0.2 });
      for (let sX = -cWidth * 0.3; sX <= cWidth * 0.3; sX += 30) {
        const screw = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 4, 12), peScrewMat);
        screw.rotation.x = Math.PI / 2;
        screw.position.set(sX, halfH - 42, busbarZ + 5);
        cabinetGroup.add(screw);
      }

      // 2. Main Copper Busbars (Continuous L-Bent Distribution Tree: 1P L-Red + N-Blue OR 3P L1-Red, L2-Yellow, L3-Blue)
      const isSinglePhase = cabinetParams?.phase === "1P" || cabinetParams?.phase === "2P" || cabinetParams?.cabinetStyle === "FACADE_DB_1P";
      const phaseColors = isSinglePhase ? [0xdc2626, 0x2563eb] : [0xdc2626, 0xeab308, 0x2563eb]; // Single-Phase (L Red + N Blue) vs 3-Phase (R, S, T)
      
      phaseColors.forEach((col, pIdx) => {
        const pMat = new THREE.MeshStandardMaterial({ color: col, metalness: 0.7, roughness: 0.2 });

        // Left corner junction X coordinate for each phase
        const cornerX = -cWidth * 0.35 + pIdx * 16;
        const barY = halfH - 58 - pIdx * 13;

        // A. Horizontal Main Busbar Section with Heat-Shrink Insulation Sleeve (Thanh cái ngang bọc gen co nhiệt)
        const horizW = cWidth * 0.35 + cornerX - 10;
        const horizMesh = new THREE.Mesh(new THREE.BoxGeometry(horizW, 8, 6), pMat);
        horizMesh.position.set(cornerX + 10 + horizW / 2, barY, busbarZ);
        cabinetGroup.add(horizMesh);

        // Epoxy Standoff Insulator Posts for Horizontal Bar
        const pInsMat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.3 });
        [0, cWidth * 0.32].forEach((ix) => {
          const ins = new THREE.Mesh(new THREE.CylinderGeometry(5, 6, 9, 16), pInsMat);
          ins.rotation.x = Math.PI / 2;
          ins.position.set(ix, barY, m1Z + 4.5);
          cabinetGroup.add(ins);
        });

        // B. Smooth Radiused 90-Degree CNC Corner Bend (Góc uốn cong mềm mại bán kính R bằng máy uốn CNC)
        const bendGeo = new THREE.TorusGeometry(8, 3.5, 12, 16, Math.PI / 2);
        const bendMesh = new THREE.Mesh(bendGeo, pMat);
        bendMesh.position.set(cornerX + 8, barY - 8, busbarZ);
        bendMesh.rotation.z = Math.PI / 2;
        cabinetGroup.add(bendMesh);

        // C. Vertical Main Busbar Riser Section (Dừng chuẩn phía trên cầu đấu X1 tại y = -halfH + 85, không đâm vào cọc PE)
        const vertBottomY = -halfH + 85;
        const vertH = barY - 10 - vertBottomY;
        const vertMesh = new THREE.Mesh(new THREE.BoxGeometry(8, vertH, 6), pMat);
        vertMesh.position.set(cornerX, barY - 10 - vertH / 2, busbarZ);
        cabinetGroup.add(vertMesh);

        // Insulated Bottom End Cap for Vertical Busbar
        const bottomCap = new THREE.Mesh(
          new THREE.BoxGeometry(10, 6, 8),
          new THREE.MeshStandardMaterial({ color: col, roughness: 0.3 })
        );
        bottomCap.position.set(cornerX, vertBottomY, busbarZ);
        cabinetGroup.add(bottomCap);

        // Epoxy Standoff Insulator Posts for Vertical Bar
        [-20, -cHeight * 0.25].forEach((iy) => {
          const ins = new THREE.Mesh(new THREE.CylinderGeometry(5, 6, 9, 16), pInsMat);
          ins.rotation.x = Math.PI / 2;
          ins.position.set(cornerX, iy, m1Z + 4.5);
          cabinetGroup.add(ins);
        });

        // D. 3-Phase Branch Feeder Bars (Căn phẳng 100% cùng độ cao y = railY + 28mm cắm đỉnh cọc Aptomat)
        for (let railIdx = 0; railIdx < 3; railIdx++) {
          const railY = halfH - 75 - railIdx * 110;
          const entryY = railY + 28; // Uniform height for ALL 3 phases plugging into top breaker terminals!
          
          // Stepped Z depth offset so phases pass forward of each other cleanly (NO INTERSECTION)
          const branchZ = busbarZ + 4 + pIdx * 6; 
          const targetX = -maxInnerWidth / 2 + 18 + pIdx * 12;

          // Single Flush Tin-Plated Connection Joint Pad on Main Busbar (Đế mạ thiếc áp sát mặt thanh đứng)
          const tinPad = new THREE.Mesh(
            new THREE.BoxGeometry(9, 9, 3),
            new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.15 })
          );
          tinPad.position.set(cornerX, entryY, busbarZ + 1.5);
          cabinetGroup.add(tinPad);

          // Flush Hex Bolt Screw with Spring Lock Washer (Bu-lông xiết chân mối nối)
          const boltMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.1 });
          const boltMesh = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 5, 6), boltMat);
          boltMesh.rotation.x = Math.PI / 2;
          boltMesh.position.set(cornerX, entryY, busbarZ + 4);
          cabinetGroup.add(boltMesh);

          // FLAT RECTANGULAR THIN COPPER STRIP (Thanh đồng dẹp dẹt mỏng 3mm x 10mm phẳng tắp cùng độ cao)
          const flatStripShape = new THREE.Shape();
          flatStripShape.moveTo(-5, -1.5);
          flatStripShape.lineTo(5, -1.5);
          flatStripShape.lineTo(5, 1.5);
          flatStripShape.lineTo(-5, 1.5);
          flatStripShape.closePath();

          const branchCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(cornerX, entryY, busbarZ + 2),
            new THREE.Vector3(cornerX + 4, entryY, branchZ),
            new THREE.Vector3(cornerX + 12, entryY, branchZ),
            new THREE.Vector3(targetX, entryY, branchZ),
          ]);
          const branchGeo = new THREE.ExtrudeGeometry(flatStripShape, {
            steps: 16,
            bevelEnabled: false,
            extrudePath: branchCurve,
          });
          const branchMesh = new THREE.Mesh(branchGeo, pMat);
          cabinetGroup.add(branchMesh);

          // Tin-Plated Copper Lug Terminal Clamp at End (Đầu cốt mạ thiếc dẹp cắm cọc đỉnh Aptomat)
          const lugMesh = new THREE.Mesh(
            new THREE.BoxGeometry(6, 8, 4),
            new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.1 })
          );
          lugMesh.position.set(targetX, entryY, branchZ);
          cabinetGroup.add(lugMesh);
        }

        // E. 3-Phase S-Curve Bent Flat Copper Drop Feeders to Bottom Terminal Strip X1 (Thanh đồng dẹp uốn lượn hình chữ S 3D liền khối)
        const termDropX = -maxInnerWidth / 2 + 60 + pIdx * 21;
        const dropTopY = vertBottomY;
        const dropBotY = -halfH + 64; // Direct top entry into terminal blocks!

        const dropStripShape = new THREE.Shape();
        dropStripShape.moveTo(-5, -1.5);
        dropStripShape.lineTo(5, -1.5);
        dropStripShape.lineTo(5, 1.5);
        dropStripShape.lineTo(-5, 1.5);
        dropStripShape.closePath();

        // Authentic 4-Point S-Curve Bend Path (Uốn cong lượn kiểu chữ S: Xuống -> Cong qua phải -> Cong dọc xuống cắm thẳng cực)
        const dropCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(cornerX, dropTopY, busbarZ + 2), // 1. Start from main busbar bottom end
          new THREE.Vector3(cornerX, dropTopY - 12, busbarZ + 6 + pIdx * 4), // 2. S-Curve upper curve
          new THREE.Vector3(termDropX, dropBotY + 16, busbarZ + 8 + pIdx * 4), // 3. S-Curve lower curve
          new THREE.Vector3(termDropX, dropBotY, m1Z + 18), // 4. Straight vertical entry into terminal block top!
        ]);

        const dropGeo = new THREE.ExtrudeGeometry(dropStripShape, {
          steps: 24,
          bevelEnabled: false,
          extrudePath: dropCurve,
        });
        const dropMesh = new THREE.Mesh(dropGeo, pMat);
        cabinetGroup.add(dropMesh);
      });
    }

    // M1 Galvanized Plate 4 Corner Mounting Hex Bolts (Bu-lông mạ kẽm bắt 4 góc tấm M1)
    const m1BoltMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.9, roughness: 0.2 });
    const m1BoltCoords = [
      [-halfW + 24, halfH - 24],
      [halfW - 24, halfH - 24],
      [-halfW + 24, -halfH + 24],
      [halfW - 24, -halfH + 24],
    ];
    m1BoltCoords.forEach(([bx, by]) => {
      const bMesh = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 6, 6), m1BoltMat);
      bMesh.rotation.x = Math.PI / 2;
      bMesh.position.set(bx, by, m1Z + 4);
      cabinetGroup.add(bMesh);
    });

    // Vertical Slotted Wire Ducts (Panduit Trunking Left & Right)
    const vertDuctW = 20;
    const vertDuctH = cHeight - 40;
    const vertDuctD = 26;

    const leftDuctGeo = new THREE.BoxGeometry(vertDuctW, vertDuctH, vertDuctD);
    const leftDuctMesh = new THREE.Mesh(leftDuctGeo, wireDuctMaterial);
    leftDuctMesh.position.set(-halfW + 18, 0, m1Z + 13);
    cabinetGroup.add(leftDuctMesh);

    const rightDuctMesh = new THREE.Mesh(leftDuctGeo, wireDuctMaterial);
    rightDuctMesh.position.set(halfW - 18, 0, m1Z + 13);
    cabinetGroup.add(rightDuctMesh);

    // Slot teeth pattern along vertical ducts
    for (let slotY = -vertDuctH / 2 + 15; slotY < vertDuctH / 2 - 15; slotY += 16) {
      const slotGeo = new THREE.BoxGeometry(vertDuctW + 2, 4, vertDuctD + 2);
      const slotMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
      
      const leftSlot = new THREE.Mesh(slotGeo, slotMat);
      leftSlot.position.set(-halfW + 18, slotY, m1Z + 13);
      cabinetGroup.add(leftSlot);

      const rightSlot = new THREE.Mesh(slotGeo, slotMat);
      rightSlot.position.set(halfW - 18, slotY, m1Z + 13);
      cabinetGroup.add(rightSlot);
    }

    // DIN Rails & 3D Breakers Rendering (STRICT BOUNDS COMPUTATION)
    if (showDevices3d && activeLayout?.rails) {
      const railCount = activeLayout.rails.length;
      const railAvailableHeight = cHeight - 100;
      const railSpacing = railAvailableHeight / Math.max(1, railCount);

      // Available mounting width inside the cabinet (strictly between left and right wire ducts)
      activeLayout.rails.forEach((rail, idx) => {
        const railY = halfH - 60 - idx * railSpacing;

        // Horizontal Slotted Wire Duct above each DIN Rail
        const horizDuctGeo = new THREE.BoxGeometry(maxInnerWidth, 18, 22);
        const horizDuctMesh = new THREE.Mesh(horizDuctGeo, wireDuctMaterial);
        horizDuctMesh.position.set(0, railY + 34, m1Z + 11);
        cabinetGroup.add(horizDuctMesh);

        // Real 35mm Steel Omega DIN Rail Bar (Standard TS35/7.5)
        const dinRailGroup = new THREE.Group();
        dinRailGroup.position.set(0, railY, m1Z + 6);
        cabinetGroup.add(dinRailGroup);

        // Main DIN rail body (35mm height)
        const dinGeo = new THREE.BoxGeometry(maxInnerWidth, 17.5, 5);
        const dinMesh = new THREE.Mesh(dinGeo, dinRailMaterial);
        dinRailGroup.add(dinMesh);

        // Top & Bottom Flange Lips for DIN rail clip locking
        const lipGeo = new THREE.BoxGeometry(maxInnerWidth, 2.5, 7.5);
        const topLip = new THREE.Mesh(lipGeo, dinRailMaterial);
        topLip.position.set(0, 8, 1);
        dinRailGroup.add(topLip);

        const botLip = new THREE.Mesh(lipGeo, dinRailMaterial);
        botLip.position.set(0, -8, 1);
        dinRailGroup.add(botLip);

        // DIN Rail perforated mounting slots pattern + Stainless Steel Pan-Head Screws
        const dinScrewMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.1 });
        for (let holeX = -maxInnerWidth / 2 + 15; holeX < maxInnerWidth / 2 - 15; holeX += 18) {
          const holeGeo = new THREE.BoxGeometry(6, 4, 6);
          const holeMesh = new THREE.Mesh(holeGeo, new THREE.MeshBasicMaterial({ color: 0x1e293b }));
          holeMesh.position.set(holeX, 0, 0);
          dinRailGroup.add(holeMesh);

          // Pan-Head Screw every 72mm (Vít inox cấy bắt cố định thanh ray TS35)
          if (Math.abs(holeX % 72) < 9) {
            const screwHead = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 3.5, 3, 16), dinScrewMat);
            screwHead.rotation.x = Math.PI / 2;
            screwHead.position.set(holeX, 0, 2);
            dinRailGroup.add(screwHead);
          }
        }

        // Breakers on Rail
        const railDevs = rail.devices
          .map((id) => devices.find((d) => d.id === id))
          .filter((d): d is Device => !!d);

        // Calculate compact widths
        const getDevWidth = (d: Device) => {
          if (d.type === "FUSE") return 28;
          if (d.type === "CONTACTOR") return 36;
          if (d.pole === 4) return 48;
          if (d.pole === 3) return 36;
          if (d.pole === 2) return 26;
          return 15;
        };

        const totalWidth = railDevs.reduce((sum, d) => sum + getDevWidth(d) + 4, 0);

        // Align breakers starting from left edge of DIN rail (20mm after left wire duct)
        const scaleFactor = totalWidth > maxInnerWidth ? (maxInnerWidth - 10) / totalWidth : 1;
        let startX = -maxInnerWidth / 2 + 18;

        // 3-Phase Comb Busbar System (Thanh Busbar Lược 3 Pha R-S-T gài nối liên tục đỉnh các Aptomat)
        if (railDevs.length > 0) {
          const combBusWidth = Math.min(totalWidth, maxInnerWidth - 30);
          const combGroup = new THREE.Group();
          combGroup.position.set(startX + combBusWidth / 2, railY + 28, m1Z + 27);
          cabinetGroup.add(combGroup);

          // Copper Main Spine Bar
          const combSpine = new THREE.Mesh(
            new THREE.BoxGeometry(combBusWidth, 5, 4),
            new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.85, roughness: 0.2 })
          );
          combGroup.add(combSpine);

          // Insulated Phase Pin Caps (Nắp cách điện 3 màu R-S-T gài trên các cực)
          const combPhaseColors = [0xdc2626, 0xeab308, 0x2563eb];
          for (let pX = -combBusWidth / 2 + 6; pX <= combBusWidth / 2 - 6; pX += 12) {
            const pIdx = Math.abs(Math.round(pX / 12)) % 3;
            const pinCap = new THREE.Mesh(
              new THREE.BoxGeometry(8, 7, 5),
              new THREE.MeshStandardMaterial({ color: combPhaseColors[pIdx], roughness: 0.3 })
            );
            pinCap.position.set(pX, 0, 1);
            combGroup.add(pinCap);
          }
        }

        railDevs.forEach((dev) => {
          const devW = getDevWidth(dev) * scaleFactor;
          const devH = 68;
          const devD = 42;

          const devGroup = new THREE.Group();
          const bX = startX + devW / 2;
          devGroup.position.set(bX, railY, m1Z + 6 + devD / 2);
          devGroup.userData = { device: dev };
          cabinetGroup.add(devGroup);

          // Realistic Modular Breaker Casing Body (Dual-tone stepped PC plastic)
          const bodyMat = new THREE.MeshStandardMaterial({
            color: 0xf8fafc,
            roughness: 0.25,
            metalness: 0.05,
          });
          // Main rear housing
          const bodyMesh = new THREE.Mesh(new THREE.BoxGeometry(devW, devH, devD * 0.7), bodyMat);
          devGroup.add(bodyMesh);

          // Stepped Front Shoulder (Vai nhô aptomat)
          const shoulderMesh = new THREE.Mesh(new THREE.BoxGeometry(devW, devH * 0.6, devD * 0.3), bodyMat);
          shoulderMesh.position.set(0, 0, devD * 0.35);
          devGroup.add(shoulderMesh);

          // Front Brand Label Window Accent
          const faceColor = dev.type === "RCBO" ? 0x10b981 : dev.type === "MCCB" ? 0x2563eb : 0x0284c7;
          const faceMat = new THREE.MeshStandardMaterial({ color: faceColor, roughness: 0.3 });
          const faceMesh = new THREE.Mesh(new THREE.BoxGeometry(devW - 2, devH * 0.3, 2), faceMat);
          faceMesh.position.set(0, devH * 0.12, devD / 2 + 1);
          devGroup.add(faceMesh);

          // Curved Molded Toggle Switch Lever (Cần gạt Aptomat vát cong)
          const switchMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.15 });
          const switchLever = new THREE.Mesh(
            new THREE.CylinderGeometry(3, 3, Math.max(6, devW * 0.45), 16),
            switchMat
          );
          switchLever.rotation.z = Math.PI / 2;
          switchLever.position.set(0, -devH * 0.1, devD / 2 + 4);
          devGroup.add(switchLever);

          // Phase Colored Screws & Wire Input Slots (R-RED, S-YELLOW, T-BLUE)
          const phaseColorArr = [0xdc2626, 0xeab308, 0x2563eb];
          const poleCount = dev.pole || 1;
          const poleStep = devW / poleCount;
          for (let p = 0; p < poleCount; p++) {
            const screwX = -devW / 2 + poleStep / 2 + p * poleStep;
            const pMat = new THREE.MeshStandardMaterial({ color: phaseColorArr[p % 3], roughness: 0.3 });
            // Screw Recessed Housing
            const screwHousing = new THREE.Mesh(
              new THREE.CylinderGeometry(2.5, 2.5, 3, 12),
              new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.4 })
            );
            screwHousing.position.set(screwX, devH / 2 - 5, devD / 2 - 2);
            devGroup.add(screwHousing);

            // Brass Terminal Pin
            const screwPin = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 4, 12), pMat);
            screwPin.position.set(screwX, devH / 2 - 5, devD / 2);
            devGroup.add(screwPin);
          }

          startX += devW + 4 * scaleFactor;
        });
      });

      // Bottom Industrial Terminal Block Assembly X1 (Hàng Cầu Đấu Dây Công Nghiệp Phân Pha R-S-T, N, PE)
      const termY = -halfH + 45;
      const termGroup = new THREE.Group();
      termGroup.position.set(0, termY, m1Z + 6);
      cabinetGroup.add(termGroup);

      // Steel DIN Rail TS35 Base for Terminal Blocks
      const termDinMesh = new THREE.Mesh(new THREE.BoxGeometry(maxInnerWidth, 17.5, 5), dinRailMaterial);
      termGroup.add(termDinMesh);

      // Steel End Clamps (EW-35 Cầu chặn góc khoá 2 đầu hàng cầu đấu)
      const endClampMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
      [-maxInnerWidth / 2 + 10, maxInnerWidth / 2 - 10].forEach((cx) => {
        const clampMesh = new THREE.Mesh(new THREE.BoxGeometry(8, 30, 22), endClampMat);
        clampMesh.position.set(cx, 0, 10);
        termGroup.add(clampMesh);
      });

      // Realistic Modular Terminal Block Elements (Phoenix Contact Style)
      const termStartX = -maxInnerWidth / 2 + 18;
      const termW = maxInnerWidth - 36;
      const blockWidth = 7;
      const blockCount = Math.floor(termW / blockWidth);

      for (let i = 0; i < blockCount; i++) {
        const tX = termStartX + i * blockWidth;
        
        // Color Assignment: Left/Right PE = Green, N = Blue, R-S-T = Red/Yellow/Blue, Signal = Light Grey
        let blockColor = 0x94a3b8; // Light Grey Signal Terminal
        if (i < 3 || i > blockCount - 4) blockColor = 0x65a30d; // PE Grounding Terminal (Yellow/Green)
        else if (i >= 3 && i < 6) blockColor = 0x0284c7; // Neutral Terminal N (Blue)
        else if (i >= 6 && i < 9) blockColor = 0xdc2626; // Phase R (Red)
        else if (i >= 9 && i < 12) blockColor = 0xeab308; // Phase S (Yellow)
        else if (i >= 12 && i < 15) blockColor = 0x2563eb; // Phase T (Blue)

        const blockGroup = new THREE.Group();
        blockGroup.position.set(tX, 0, 12);
        termGroup.add(blockGroup);

        // Terminal Block Plastic Body
        const blockMesh = new THREE.Mesh(
          new THREE.BoxGeometry(blockWidth - 1, 38, 24),
          new THREE.MeshStandardMaterial({ color: blockColor, roughness: 0.35 })
        );
        blockGroup.add(blockMesh);

        // White Center Marking Strip (Tem nhãn ghi số cọc cầu đấu 1, 2, 3...)
        const markerMesh = new THREE.Mesh(
          new THREE.BoxGeometry(blockWidth - 1, 8, 1),
          new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 })
        );
        markerMesh.position.set(0, 0, 12.1);
        blockGroup.add(markerMesh);

        // Top Screw Terminals (Vít kẹp xiết dây)
        const screwMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.9 });
        [-12, 12].forEach((sy) => {
          const sMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 3, 12), screwMat);
          sMesh.rotation.x = Math.PI / 2;
          sMesh.position.set(0, sy, 11);
          blockGroup.add(sMesh);
        });
      }
    }
    // ----------------------------------------------------
    // D. M3 INNER PROTECTIVE COVER PLATE (HINGED AT LEFT EDGE WITH REALISTIC ACRYLIC TRANSPARENCY)
    // ----------------------------------------------------
    const m3Z = isExploded ? halfD + 120 : halfD - 10;
    const innerGroup = new THREE.Group();
    innerGroup.position.set(-halfW, 0, m3Z); // Pivot at left edge
    innerGroupRef.current = innerGroup;
    cabinetGroup.add(innerGroup);

    // Realistic Tinted Transparent Acrylic Safety Cover Plate (M3)
    const m3CoverMat = new THREE.MeshStandardMaterial({
      color: 0x059669, // Emerald Tinted Transparent Acrylic Safety Cover
      metalness: 0.1,
      roughness: 0.1,
      transparent: true,
      opacity: 0.4, // Clear crystal transparency so inner breakers are visible!
    });
    const m3CoverGeo = new THREE.BoxGeometry(cWidth - 6, cHeight - 6, 5);
    const m3CoverMesh = new THREE.Mesh(m3CoverGeo, m3CoverMat);
    m3CoverMesh.position.set(halfW, 0, 0);
    innerGroup.add(m3CoverMesh);

    // 4 Corner Screw Fasteners on M3 Plate
    const screwHeadMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95 });
    const screwCoords = [
      [12, halfH - 12],
      [cWidth - 12, halfH - 12],
      [12, -halfH + 12],
      [cWidth - 12, -halfH + 12],
    ];
    screwCoords.forEach(([sx, sy]) => {
      const sMesh = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 4, 16), screwHeadMat);
      sMesh.rotation.x = Math.PI / 2;
      sMesh.position.set(sx, sy, 4);
      innerGroup.add(sMesh);
    });

    // ----------------------------------------------------
    // E. M4 FRONT OUTER DOOR (HINGED AT LEFT Y-AXIS)
    // ----------------------------------------------------
    const m4Z = isExploded ? halfD + 250 : halfD;
    const doorGroup = new THREE.Group();
    doorGroup.position.set(-halfW, 0, m4Z); // Pivot at left edge
    doorGroupRef.current = doorGroup;
    cabinetGroup.add(doorGroup);

    // Outer Door Main Steel Plate
    const doorMesh = new THREE.Mesh(new THREE.BoxGeometry(cWidth, cHeight, 6), doorOuterMaterial);
    doorMesh.position.set(halfW, 0, 0);
    doorGroup.add(doorMesh);

    // Inner Door Back Cover Plate (RAL 7035 Off-White Industrial Powder Coat finish)
    const doorBackCover = new THREE.Mesh(
      new THREE.BoxGeometry(cWidth - 4, cHeight - 4, 1.5),
      new THREE.MeshStandardMaterial({ color: 0xdfe4ea, metalness: 0.2, roughness: 0.35 })
    );
    doorBackCover.position.set(halfW, 0, -3.5);
    doorGroup.add(doorBackCover);

    // Door Gasket Rubber Seal Rim
    const gasketMesh = new THREE.Mesh(
      new THREE.BoxGeometry(cWidth - 8, cHeight - 8, 2),
      new THREE.MeshBasicMaterial({ color: 0x1e293b })
    );
    gasketMesh.position.set(halfW, 0, -3.5);
    doorGroup.add(gasketMesh);

    // Realistic Industrial Metal Swing-Lever Lock (Khóa tay nắm xoay kèm ổ khóa cơ 3D)
    const handleGroup = new THREE.Group();
    handleGroup.position.set(cWidth - 18, 0, 8);
    doorGroup.add(handleGroup);

    // Lock Escutcheon Base (Bế tay khóa)
    const handleBase = new THREE.Mesh(
      new THREE.BoxGeometry(14, 60, 8),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.25 })
    );
    handleGroup.add(handleBase);

    // Chrome Swing Lever (Tay gạt khóa mạ Chrome)
    const handleLever = new THREE.Mesh(
      new THREE.BoxGeometry(10, 42, 12),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.15 })
    );
    handleLever.position.set(0, -6, 4);
    handleGroup.add(handleLever);

    // Keyhole Cylinder (Ổ khóa cắm chìa 3D)
    const keyhole = new THREE.Mesh(
      new THREE.CylinderGeometry(3.5, 3.5, 6, 16),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.1 })
    );
    keyhole.rotation.x = Math.PI / 2;
    keyhole.position.set(0, 16, 5);
    handleGroup.add(keyhole);

    // 3D Phase Pilot Lamps (R, S, T Dome Lenses + Chrome Bezel Ring)
    const lampColors = [0xdc2626, 0xeab308, 0x2563eb];
    lampColors.forEach((color, i) => {
      const lampX = halfW - 45 + i * 35;
      const lampY = halfH * 0.42;

      // Front Lamp Group
      const lampGroup = new THREE.Group();
      lampGroup.position.set(lampX, lampY, 6);
      doorGroup.add(lampGroup);

      // Chrome Bezel Ring
      const bezel = new THREE.Mesh(
        new THREE.CylinderGeometry(11, 11, 4, 20),
        new THREE.MeshStandardMaterial({ color: 0xc0c6d0, metalness: 0.95, roughness: 0.1 })
      );
      bezel.rotation.x = Math.PI / 2;
      lampGroup.add(bezel);

      // Glowing Lens
      const lens = new THREE.Mesh(
        new THREE.SphereGeometry(9, 20, 20),
        new THREE.MeshStandardMaterial({
          color: color,
          emissive: color,
          emissiveIntensity: 0.8,
          roughness: 0.1,
        })
      );
      lens.position.set(0, 0, 4);
      lampGroup.add(lens);

      // Inner Back Lamp Terminal Body (Mặt trong cánh tủ: Củ đít đèn báo 3 màu R-S-T & cọc vít đồng thau)
      const lampBackGroup = new THREE.Group();
      lampBackGroup.position.set(lampX, lampY, -10);
      doorGroup.add(lampBackGroup);

      const lampBackMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(8, 8, 14, 16),
        new THREE.MeshStandardMaterial({ color: color, roughness: 0.3 })
      );
      lampBackMesh.rotation.x = Math.PI / 2;
      lampBackGroup.add(lampBackMesh);

      // Brass Terminal Screws
      const brassScrewMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.9, roughness: 0.2 });
      [-4, 4].forEach((sY) => {
        const sMesh = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 4, 12), brassScrewMat);
        sMesh.rotation.z = Math.PI / 2;
        sMesh.position.set(0, sY, -7);
        lampBackGroup.add(sMesh);
      });
    });

    // Helper to generate dynamic 2D canvas LED display texture
    const createMeterTexture = (valText: string, unitText: string, colorHex: string) => {
      const canvas = document.createElement("canvas");
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#090d16";
        ctx.fillRect(0, 0, 128, 128);
        ctx.strokeStyle = colorHex;
        ctx.lineWidth = 4;
        ctx.strokeRect(4, 4, 120, 120);

        // Header label
        ctx.fillStyle = "#94a3b8";
        ctx.font = "bold 16px monospace";
        ctx.textAlign = "center";
        ctx.fillText(unitText, 64, 30);

        // Value text
        ctx.fillStyle = colorHex;
        ctx.font = "bold 32px monospace";
        ctx.fillText(valText, 64, 75);
      }
      return new THREE.CanvasTexture(canvas);
    };

    // 3D Active Digital Meters (4 Meters arranged in 2x2: Voltmeter 380V + 3 Ammeters R/S/T)
    const meterPositions = [
      { x: halfW - 38, y: 38, val: "380.0", unit: "V (L-L)", col: "#38bdf8" },
      { x: halfW + 38, y: 38, val: "16.2", unit: "A (R)", col: "#ef4444" },
      { x: halfW - 38, y: -20, val: "15.8", unit: "A (S)", col: "#facc15" },
      { x: halfW + 38, y: -20, val: "16.0", unit: "A (T)", col: "#3b82f6" },
    ];

    meterPositions.forEach(({ x, y, val, unit, col }) => {
      // Front Meter Housing & Active Display Screen
      const mGroup = new THREE.Group();
      mGroup.position.set(x, y, 8);
      doorGroup.add(mGroup);

      const frameMesh = new THREE.Mesh(
        new THREE.BoxGeometry(34, 34, 10),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3 })
      );
      mGroup.add(frameMesh);

      const tex = createMeterTexture(val, unit, col);
      const displayMat = new THREE.MeshBasicMaterial({ map: tex });
      const displayScreen = new THREE.Mesh(new THREE.PlaneGeometry(26, 26), displayMat);
      displayScreen.position.set(0, 0, 5.1);
      mGroup.add(displayScreen);

      // Inner Back Meter Enclosure Box (Mặt trong cánh tủ: Hộp đít đồng hồ xám ABS 3D + Tem nhãn màu)
      const meterBackGroup = new THREE.Group();
      meterBackGroup.position.set(x, y, -10);
      doorGroup.add(meterBackGroup);

      const meterBackMesh = new THREE.Mesh(
        new THREE.BoxGeometry(32, 32, 14),
        new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.35 })
      );
      meterBackGroup.add(meterBackMesh);

      // Terminal Block Strip on Back of Meter
      const termStrip = new THREE.Mesh(
        new THREE.BoxGeometry(24, 8, 4),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 })
      );
      termStrip.position.set(0, -10, -6);
      meterBackGroup.add(termStrip);

      // Color Tag Sticker on Back of Meter
      const colTagMat = new THREE.MeshStandardMaterial({
        color: col === "#38bdf8" ? 0x0284c7 : col === "#ef4444" ? 0xdc2626 : col === "#facc15" ? 0xeab308 : 0x2563eb,
      });
      const colTag = new THREE.Mesh(new THREE.BoxGeometry(20, 6, 1), colTagMat);
      colTag.position.set(0, 8, -6.5);
      meterBackGroup.add(colTag);
    });

    // Door Wiring Harness Cable Loom (Bó dây điện sườn cánh tủ 2 màu Vàng/Xanh & Đỏ chạy dọc bản lề)
    const cableGroup = new THREE.Group();
    doorGroup.add(cableGroup);

    const cablePoints: THREE.Vector3[] = [];
    for (let cY = halfH * 0.45; cY >= -halfH * 0.55; cY -= 20) {
      cablePoints.push(new THREE.Vector3(25, cY, -10));
    }
    const cableCurve = new THREE.CatmullRomCurve3(cablePoints);
    const cableGeo = new THREE.TubeGeometry(cableCurve, 24, 3.5, 8, false);
    const cableMat = new THREE.MeshStandardMaterial({ color: 0x84cc16, roughness: 0.35 });
    const cableMesh = new THREE.Mesh(cableGeo, cableMat);
    cableGroup.add(cableMesh);

    // Rear Lock Cam Latch Bar (Lưỡi gà chốt khóa mạ Chrome mặt sau cánh tủ)
    const lockCamMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
    const lockCam = new THREE.Mesh(new THREE.BoxGeometry(8, 45, 4), lockCamMat);
    lockCam.position.set(cWidth - 18, 0, -8);
    doorGroup.add(lockCam);

    // Bottom Control Accessories Row (Matching 2D M4: Emergency Stop + Selector Switch + Start/Stop Buttons)
    const ctrlY = -halfH * 0.55;

    // 1. Emergency Stop Mushroom Pushbutton (Red Cap + Yellow Guard)
    const emgGroup = new THREE.Group();
    emgGroup.position.set(halfW - 60, ctrlY, 6);
    doorGroup.add(emgGroup);

    const guardRing = new THREE.Mesh(
      new THREE.CylinderGeometry(14, 14, 4, 24),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3 })
    );
    guardRing.rotation.x = Math.PI / 2;
    emgGroup.add(guardRing);

    const mushroomCap = new THREE.Mesh(
      new THREE.CylinderGeometry(10, 11, 10, 24),
      new THREE.MeshStandardMaterial({
        color: 0xdc2626,
        emissive: 0x991b1b,
        emissiveIntensity: 0.4,
        roughness: 0.2,
      })
    );
    mushroomCap.rotation.x = Math.PI / 2;
    mushroomCap.position.set(0, 0, 6);
    emgGroup.add(mushroomCap);

    // 2. Rotary Selector Switch (MAN/AUTO Knob)
    const selGroup = new THREE.Group();
    selGroup.position.set(halfW, ctrlY, 6);
    doorGroup.add(selGroup);

    const selBezel = new THREE.Mesh(
      new THREE.CylinderGeometry(12, 12, 4, 24),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4 })
    );
    selBezel.rotation.x = Math.PI / 2;
    selGroup.add(selBezel);

    const selKnob = new THREE.Mesh(
      new THREE.BoxGeometry(4, 16, 8),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 })
    );
    selKnob.position.set(0, 0, 5);
    selKnob.rotation.z = Math.PI / 4;
    selGroup.add(selKnob);

    // 3. Start (Green) & Stop (Red) Push Buttons
    const btnGroup = new THREE.Group();
    btnGroup.position.set(halfW + 60, ctrlY, 6);
    doorGroup.add(btnGroup);

    // Green Start Button
    const greenBtn = new THREE.Mesh(
      new THREE.CylinderGeometry(9, 9, 8, 20),
      new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x047857, emissiveIntensity: 0.3 })
    );
    greenBtn.rotation.x = Math.PI / 2;
    greenBtn.position.set(-14, 0, 4);
    btnGroup.add(greenBtn);

    // Red Stop Button
    const redBtn = new THREE.Mesh(
      new THREE.CylinderGeometry(9, 9, 8, 20),
      new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xb91c1c, emissiveIntensity: 0.3 })
    );
    redBtn.rotation.x = Math.PI / 2;
    redBtn.position.set(14, 0, 4);
    btnGroup.add(redBtn);

    // ----------------------------------------------------
    // Animation Loop
    // ----------------------------------------------------
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Smooth hinge rotation for door opening (USES LIVE REFS)
      if (doorGroupRef.current) {
        currentDoorAngle.current += (targetDoorAngleRef.current - currentDoorAngle.current) * 0.12;
        doorGroupRef.current.rotation.y = currentDoorAngle.current;
      }
      if (innerGroupRef.current) {
        currentInnerAngle.current += (targetInnerAngleRef.current - currentInnerAngle.current) * 0.12;
        innerGroupRef.current.rotation.y = currentInnerAngle.current;
      }

      // Smooth Orbit rotation
      if (cabinetGroupRef.current) {
        cabinetGroupRef.current.rotation.x +=
          (rotationRef.current.x - cabinetGroupRef.current.rotation.x) * 0.15;
        cabinetGroupRef.current.rotation.y +=
          (rotationRef.current.y - cabinetGroupRef.current.rotation.y) * 0.15;
        cabinetGroupRef.current.scale.setScalar(zoomRef.current);
      }

      renderer.render(scene, camera);
    };

    animate();

    // Window Resize Handler
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const newW = mountRef.current.clientWidth;
      const newH = mountRef.current.clientHeight;
      cameraRef.current.aspect = newW / newH;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newW, newH);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, [cabinetParams, showFrame3d, showBusbar3d, showDevices3d, isExploded]);

  // Preset Views Update
  useEffect(() => {
    if (presetView === "front") rotationRef.current = { x: 0, y: 0 };
    if (presetView === "iso") rotationRef.current = { x: -0.25, y: 0.55 };
    if (presetView === "side") rotationRef.current = { x: 0, y: Math.PI / 2 };
    if (presetView === "top") rotationRef.current = { x: -Math.PI / 2 + 0.1, y: 0 };
  }, [presetView]);

  // Mouse Orbit Drag Controls
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - previousMousePosition.current.x;
    const deltaY = e.clientY - previousMousePosition.current.y;

    rotationRef.current.y += deltaX * 0.008;
    rotationRef.current.x = Math.max(-1.4, Math.min(1.4, rotationRef.current.x + deltaY * 0.008));

    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Mouse Wheel Zooming
  const handleWheel = (e: React.WheelEvent) => {
    zoomRef.current = Math.min(2.5, Math.max(0.3, zoomRef.current - e.deltaY * 0.0012));
  };

  // 3D Raycasting Device Click Handler (RECURSIVE PARENT TRAVERSAL FOR RELIABLE CLICK SELECTION)
  const handleClick = (e: React.MouseEvent) => {
    if (!mountRef.current || !cameraRef.current || !cabinetGroupRef.current) return;
    const rect = mountRef.current.getBoundingClientRect();
    mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.current.setFromCamera(mouse.current, cameraRef.current);
    const intersects = raycaster.current.intersectObjects(cabinetGroupRef.current.children, true);

    for (const hit of intersects) {
      let currentObj: THREE.Object3D | null = hit.object;
      while (currentObj) {
        if (currentObj.userData?.device) {
          onSelectDevice(currentObj.userData.device);
          return;
        }
        currentObj = currentObj.parent;
      }
    }

    // Deselect if background clicked
    onSelectDevice(null);
  };

  return (
    <div
      ref={mountRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onClick={handleClick}
      className="w-full h-full cursor-grab active:cursor-grabbing select-none"
    />
  );
}
