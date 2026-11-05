"use strict";
(() => {
  // src/animation/config.ts
  var FILM_CONFIG = {
    title: "Le G\xE2teau de Mamie",
    width: 1080,
    height: 1920,
    fps: 24,
    durationSeconds: 7.5,
    totalFrames: 180,
    // 7.50s * 24fps = 180 frames (dans la cible stricte de 5 à 8 secondes)
    boilStepFrames: 1
    // Chaque frame (24 Hz) possède un redessin unique feuille par feuille
  };
  var PALETTE = {
    // Papier & Crayon Graphite
    paperBase: "#F6EFE2",
    paperWarm: "#EFE5D4",
    paperShadow: "#E2D4BE",
    graphiteDark: "#261E18",
    graphiteMid: "#46382E",
    graphiteLight: "#756354",
    crayonHighlight: "#FFFDF8",
    // Cuisine & Architecture 3D
    wallCream: "#F2E6D0",
    wallWainscot: "#D7C3A5",
    woodBeam: "#8C623E",
    floorTileA: "#DFC7A7",
    floorTileB: "#C9AD88",
    counterWood: "#B58050",
    counterTop: "#E8DCC8",
    counterFront: "#9E6B3E",
    tileBacksplash: "#DCE6E2",
    ovenBody: "#48525A",
    ovenPanel: "#343C42",
    ovenGlassCold: "#697884",
    ovenGlowWarm: "#F6A842",
    ovenGlowHot: "#FFD470",
    ovenRack: "#C8C2B8",
    tableTop: "#C98E58",
    tableEdge: "#9E6838",
    tableLeg: "#825228",
    chairWood: "#B37844",
    // Jardin Ensoleillé (vu en profondeur par la porte-fenêtre)
    skyBlue: "#D6ECF6",
    sunGlow: "#FFF3C4",
    distantHills: "#B4CFA0",
    grassLight: "#A3C87D",
    grassMid: "#83B05C",
    grassDark: "#659142",
    treeTrunk: "#7E5638",
    foliageA: "#72A252",
    foliageB: "#8FBC68",
    flowerRed: "#DF6452",
    flowerYellow: "#F0C24B",
    // Mamie Colette
    skinWarm: "#FADBC8",
    skinShadow: "#E5B89E",
    cheeksRose: "#EA9486",
    hairSilver: "#ECE7DF",
    hairSilverShade: "#CBC2B5",
    bunRibbon: "#C96348",
    glassesGold: "#78583A",
    mamieDress: "#5B7894",
    mamieDressShade: "#455F78",
    apronCream: "#FAF4E8",
    apronShade: "#E4D9C5",
    slippersBurgundy: "#8E433D",
    // Léo (petit-fils)
    leoHair: "#6E462A",
    leoShirtAmber: "#E59A42",
    leoShirtStripe: "#FAF1E0",
    leoShortsBlue: "#4B6C8B",
    leoShoesRed: "#C84B38",
    // Clara (petite-fille)
    claraHair: "#593720",
    claraRibbon: "#E06858",
    claraDressSage: "#739C7B",
    claraShirtPink: "#F0ACA0",
    claraShoesYellow: "#DA9C36",
    // Pâtisserie & Accessoires
    bowlTerracotta: "#C86D4B",
    bowlInside: "#F2E5D2",
    batterGold: "#F4CE72",
    whiskMetal: "#7B848C",
    whiskHandle: "#8F5B34",
    panMetal: "#8B949C",
    panInside: "#6E7780",
    cakeSponge: "#E5A14B",
    cakeCrust: "#C47B2B",
    cakeIcing: "#FFF9F0",
    strawberryRed: "#D94436",
    strawberryLeaf: "#5C9448",
    platePorcelain: "#F7F4EE",
    plateRim: "#B9C8D2",
    ballRed: "#D84E3E",
    ballCream: "#F7EFE0"
  };
  var EXPOSURE_SHEET = [
    {
      id: "phase-1-whisking",
      phaseNumber: 1,
      title: "1. Mamie fouette la p\xE2te \xE0 g\xE2teau",
      startFrame: 0,
      endFrame: 31,
      summary: "Mamie pr\xE9pare la p\xE2te au fouet dans le saladier pendant que L\xE9o et Clara jouent au ballon dans le jardin.",
      details: "Main gauche sur le rebord du saladier, main droite fouettant en ellipse 3D ; ballon parabolique au jardin."
    },
    {
      id: "phase-2-pouring",
      phaseNumber: 2,
      title: "2. Versement de la p\xE2te dans le moule",
      startFrame: 32,
      endFrame: 47,
      summary: "Mamie incline le saladier et verse un ruban de p\xE2te dor\xE9e dans le moule pos\xE9 sur la table.",
      details: "Le niveau de p\xE2te monte dans le moule ; le saladier est ensuite pos\xE9 sur le comptoir arri\xE8re."
    },
    {
      id: "phase-3-oven-in",
      phaseNumber: 3,
      title: "3. Enfournement et cuisson au four 3D",
      startFrame: 48,
      endFrame: 71,
      summary: "Mamie ouvre la porte du four 3D, glisse le moule sur la grille, referme la porte ; le g\xE2teau gonfle et dore.",
      details: "Rotation perspective 3D de la porte du four ; lueur chaude et mont\xE9e du d\xF4me \xE0 travers le hublot."
    },
    {
      id: "phase-4-oven-out-call",
      phaseNumber: 4,
      title: "4. Sortie du four & Appel des enfants",
      startFrame: 72,
      endFrame: 107,
      summary: "Mamie sort le g\xE2teau dor\xE9 fumant du four, le pose sur la table et appelle les enfants : \xAB \xC0 table ! \xBB.",
      details: "Vapeur parfum\xE9e, fraises et gla\xE7age ; Mamie porte sa main en porte-voix vers la porte-fen\xEAtre."
    },
    {
      id: "phase-5-kids-running",
      phaseNumber: 5,
      title: "5. Course des enfants & Installation sur les chaises",
      startFrame: 108,
      endFrame: 135,
      summary: "L\xE9o et Clara accourent du jardin, entrent dans la cuisine et grimpent s\u2019asseoir sur leurs chaises.",
      details: "Cycle de course naturel (genoux fl\xE9chis vers l\u2019arri\xE8re), puis jambes pendantes qui commencent \xE0 se balancer."
    },
    {
      id: "phase-6-sneak-taste",
      phaseNumber: 6,
      title: "6. B\xEAtise gourmande quand Mamie a le dos tourn\xE9",
      startFrame: 136,
      endFrame: 153,
      summary: "Mamie se tourne vers le comptoir ; L\xE9o trempe son doigt dans le g\xE2teau et go\xFBte, Clara pouffe de rire.",
      details: "Balancement rythm\xE9 des pieds sous les chaises ; index de L\xE9o dans la chantilly + trace de cr\xE8me sur la joue."
    },
    {
      id: "phase-7-serving-finale",
      phaseNumber: 7,
      title: "7. Service des parts & Tableau familial final",
      startFrame: 154,
      endFrame: 179,
      summary: "Mamie se retourne, d\xE9coupe le g\xE2teau et sert une belle part dans l\u2019assiette de chacun des enfants.",
      details: "Encoche 3D dans le g\xE2teau, parts servies, pieds des enfants qui se balancent joyeusement sous la table."
    }
  ];
  var KEYFRAME_DOC_LIST = [
    { frame: 10, slug: "0010_phase1_fouet_et_jardin", label: "Mamie fouette la p\xE2te, enfants au jardin" },
    { frame: 38, slug: "0038_phase2_versement_moule", label: "Versement du ruban de p\xE2te dans le moule" },
    { frame: 56, slug: "0056_phase3_enfournement_3d", label: "Porte du four 3D ouverte et enfournement" },
    { frame: 84, slug: "0084_phase4_sortie_four_vapeur", label: "Sortie du g\xE2teau dor\xE9 et fumant du four 3D" },
    { frame: 100, slug: "0100_phase4_appel_mamie", label: "Mamie appelle les enfants \xE0 venir \xE0 table" },
    { frame: 116, slug: "0116_phase5_course_enfants", label: "L\xE9o et Clara arrivent en courant du jardin" },
    { frame: 132, slug: "0132_phase5_assis_chaises", label: "Installation sur les chaises et d\xE9but du balancement" },
    { frame: 143, slug: "0143_phase6_doigt_dans_gateau", label: "Mamie tourn\xE9e : L\xE9o met le doigt dans le g\xE2teau, Clara rit" },
    { frame: 149, slug: "0149_phase6_goute_creme_pieds", label: "L\xE9o go\xFBte la cr\xE8me sur son doigt, pieds qui balancent" },
    { frame: 165, slug: "0165_phase7_decoupe_et_service", label: "Mamie d\xE9coupe et sert la premi\xE8re part \xE0 Clara" },
    { frame: 175, slug: "0175_phase7_parts_servies_final", label: "Parts servies \xE0 chacun et bonheur familial" }
  ];
  function getPhaseForFrame(frameIndex) {
    const clamped = Math.max(0, Math.min(FILM_CONFIG.totalFrames - 1, Math.floor(frameIndex)));
    return EXPOSURE_SHEET.find((p) => clamped >= p.startFrame && clamped <= p.endFrame) || EXPOSURE_SHEET[EXPOSURE_SHEET.length - 1];
  }

  // src/animation/pencilEngine.ts
  function hashString(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function createPRNG(frameIndex, tag) {
    let seed = (hashString(tag) ^ Math.imul(frameIndex + 101, 2654435761)) >>> 0;
    return function rand() {
      seed = seed + 1831565813 >>> 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }
  function lerpPt(p, q, t) {
    return [lerp(p[0], q[0], t), lerp(p[1], q[1], t)];
  }
  function smoothstep(edge0, edge1, x) {
    const t = clamp((x - edge0) / (edge1 - edge0 || 1), 0, 1);
    return t * t * (3 - 2 * t);
  }
  function easeInOutCubic(t) {
    const c = clamp(t, 0, 1);
    return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
  }
  function solveTwoBoneIK(root, target, len1, len2, polePoint) {
    const dx = target[0] - root[0];
    const dy = target[1] - root[1];
    const rawDist = Math.hypot(dx, dy);
    const maxReach = Math.max(0.01, len1 + len2 - 0.5);
    const minReach = Math.abs(len1 - len2) + 0.5;
    const dist = clamp(rawDist, minReach, maxReach);
    const baseAngle = Math.atan2(dy, dx);
    const cosAngle = clamp((len1 * len1 + dist * dist - len2 * len2) / (2 * len1 * dist), -1, 1);
    const bendAngle = Math.acos(cosAngle);
    const mid1 = [
      root[0] + Math.cos(baseAngle + bendAngle) * len1,
      root[1] + Math.sin(baseAngle + bendAngle) * len1
    ];
    const mid2 = [
      root[0] + Math.cos(baseAngle - bendAngle) * len1,
      root[1] + Math.sin(baseAngle - bendAngle) * len1
    ];
    const d1 = Math.hypot(mid1[0] - polePoint[0], mid1[1] - polePoint[1]);
    const d2 = Math.hypot(mid2[0] - polePoint[0], mid2[1] - polePoint[1]);
    const mid = d1 <= d2 ? mid1 : mid2;
    const end = rawDist > maxReach ? [root[0] + Math.cos(baseAngle) * maxReach, root[1] + Math.sin(baseAngle) * maxReach] : [target[0], target[1]];
    return { mid, end };
  }
  function drawPaperBackground(ctx, width, height, frameIndex) {
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, PALETTE.paperBase);
    grad.addColorStop(0.55, PALETTE.paperWarm);
    grad.addColorStop(1, "#EADBC4");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
    const randStatic = createPRNG(0, "paper-fibers-static");
    ctx.save();
    ctx.strokeStyle = "rgba(130, 102, 74, 0.055)";
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 160; i++) {
      const x = randStatic() * width;
      const y = randStatic() * height;
      const len = 14 + randStatic() * 34;
      const ang = (randStatic() - 0.5) * 0.5;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len);
      ctx.stroke();
    }
    const randFrame = createPRNG(frameIndex, "paper-grain-boil");
    ctx.fillStyle = "rgba(98, 76, 54, 0.035)";
    for (let i = 0; i < 120; i++) {
      const gx = randFrame() * width;
      const gy = randFrame() * height;
      const gr = 1 + randFrame() * 2.4;
      ctx.fillRect(gx, gy, gr, gr);
    }
    ctx.restore();
  }
  function subdividePolyline(pts, maxStep = 14, closed = false) {
    if (pts.length < 2) return pts.slice();
    const out = [];
    const count = closed ? pts.length : pts.length - 1;
    for (let i = 0; i < count; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
      const dist = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const steps = Math.max(1, Math.ceil(dist / maxStep));
      for (let s = 0; s < steps; s++) {
        const t = s / steps;
        out.push([lerp(a[0], b[0], t), lerp(a[1], b[1], t)]);
      }
    }
    if (!closed) {
      out.push(pts[pts.length - 1]);
    }
    return out;
  }
  function drawPencilPolyline(ctx, pts, frameIndex, tag, opts = {}) {
    if (pts.length < 2) return;
    const {
      color = PALETTE.graphiteDark,
      width = 3.8,
      wobble = 2.1,
      closed = false,
      doublePass = true,
      alpha = 0.94,
      lineCap = "round"
    } = opts;
    const dense = subdividePolyline(pts, 13, closed);
    const rand = createPRNG(frameIndex, `stroke:${tag}`);
    ctx.save();
    ctx.lineCap = lineCap;
    ctx.lineJoin = "round";
    ctx.strokeStyle = color;
    const phase = rand() * Math.PI * 2;
    const freq = 0.45 + rand() * 0.35;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = width * (0.94 + rand() * 0.14);
    ctx.beginPath();
    const displaced1 = dense.map((p, idx) => {
      const edgeFactor = closed ? 1 : Math.min(1, Math.min(idx / 2, (dense.length - 1 - idx) / 2) + 0.35);
      const wave = Math.sin(idx * freq + phase) * wobble * 0.72;
      const jitterX = (rand() - 0.5) * wobble * 1.15;
      const jitterY = (rand() - 0.5) * wobble * 1.15;
      return [p[0] + (wave + jitterX) * edgeFactor, p[1] + (-wave * 0.6 + jitterY) * edgeFactor];
    });
    displaced1.forEach(([x, y], i) => {
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    if (closed) ctx.closePath();
    ctx.stroke();
    if (doublePass) {
      const phase2 = rand() * Math.PI * 2;
      ctx.globalAlpha = alpha * 0.44;
      ctx.lineWidth = Math.max(1.3, width * 0.56);
      ctx.beginPath();
      dense.forEach((p, idx) => {
        const wave2 = Math.cos(idx * (freq * 1.25) + phase2) * wobble * 1.15;
        const jx = (rand() - 0.5) * wobble * 1.45;
        const jy = (rand() - 0.5) * wobble * 1.45;
        const x = p[0] + wave2 + jx;
        const y = p[1] - wave2 * 0.7 + jy;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      if (closed) ctx.closePath();
      ctx.stroke();
    }
    ctx.restore();
  }
  function drawPencilHatchingInClip(ctx, bounds, frameIndex, tag, color, spacing = 11, angleRad = -0.55, alpha = 0.22) {
    const rand = createPRNG(frameIndex, `hatch:${tag}`);
    const cx = (bounds.minX + bounds.maxX) * 0.5;
    const cy = (bounds.minY + bounds.maxY) * 0.5;
    const diag = Math.hypot(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY) * 0.65;
    const cosA = Math.cos(angleRad);
    const sinA = Math.sin(angleRad);
    const nx = -sinA;
    const ny = cosA;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = 2.1;
    ctx.lineCap = "round";
    const steps = Math.min(48, Math.max(4, Math.floor(diag * 2 / spacing)));
    for (let i = -steps; i <= steps; i++) {
      const offset = i * spacing + (rand() - 0.5) * 3.2;
      const px = cx + nx * offset;
      const py = cy + ny * offset;
      const j1 = (rand() - 0.5) * 4;
      const j2 = (rand() - 0.5) * 4;
      ctx.beginPath();
      ctx.moveTo(px - cosA * diag + j1, py - sinA * diag - j1);
      ctx.lineTo(px + cosA * diag + j2, py + sinA * diag - j2);
      ctx.stroke();
    }
    ctx.restore();
  }
  function drawHandColoredPolygon(ctx, pts, frameIndex, tag, opts) {
    if (pts.length < 3) return;
    const {
      fillColor,
      strokeColor = PALETTE.graphiteDark,
      strokeWidth = 3.8,
      wobble = 2.1,
      colorOffsetScale = 3.6,
      occludePaper = true,
      hatchColor,
      hatchAlpha = 0.22,
      hatchSpacing = 12,
      hatchAngle = -0.52,
      strokeOutline = true
    } = opts;
    const dense = subdividePolyline(pts, 16, true);
    const rand = createPRNG(frameIndex, `fill:${tag}`);
    if (occludePaper) {
      ctx.save();
      ctx.fillStyle = PALETTE.paperBase;
      ctx.beginPath();
      dense.forEach(([x, y], i) => {
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    const shiftX = (rand() - 0.38) * colorOffsetScale * 1.55;
    const shiftY = (rand() - 0.42) * colorOffsetScale * 1.45;
    const phase = rand() * Math.PI * 2;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    const colorPoly = dense.map(([x, y], idx) => {
      const wave = Math.sin(idx * 0.55 + phase) * (colorOffsetScale * 0.65);
      const cx = x + shiftX + wave + (rand() - 0.5) * colorOffsetScale * 0.7;
      const cy = y + shiftY - wave * 0.6 + (rand() - 0.5) * colorOffsetScale * 0.7;
      if (cx < minX) minX = cx;
      if (cy < minY) minY = cy;
      if (cx > maxX) maxX = cx;
      if (cy > maxY) maxY = cy;
      return [cx, cy];
    });
    ctx.save();
    ctx.fillStyle = fillColor;
    ctx.globalAlpha = 0.94;
    ctx.beginPath();
    colorPoly.forEach(([x, y], i) => {
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fill();
    if (hatchColor) {
      ctx.clip();
      drawPencilHatchingInClip(
        ctx,
        { minX, minY, maxX, maxY },
        frameIndex,
        tag,
        hatchColor,
        hatchSpacing,
        hatchAngle,
        hatchAlpha
      );
    }
    ctx.restore();
    if (strokeOutline) {
      drawPencilPolyline(ctx, pts, frameIndex, `${tag}:outline`, {
        color: strokeColor,
        width: strokeWidth,
        wobble,
        closed: true,
        doublePass: true
      });
    }
  }
  function sampleEllipseArc(cx, cy, rx, ry, startAngle = 0, endAngle = Math.PI * 2, segments = 28, rotation = 0) {
    const pts = [];
    const cosR = Math.cos(rotation);
    const sinR = Math.sin(rotation);
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const a = lerp(startAngle, endAngle, t);
      const lx = Math.cos(a) * rx;
      const ly = Math.sin(a) * ry;
      pts.push([cx + lx * cosR - ly * sinR, cy + lx * sinR + ly * cosR]);
    }
    return pts;
  }
  function computeUnifiedLimbGeometry(start, mid, end, wStart, wMid, wEnd, stepsPerSegment = 10) {
    const spine = [];
    const pA = lerpPt(start, mid, 0.82);
    const pB = lerpPt(mid, end, 0.18);
    for (let i = 0; i < stepsPerSegment; i++) {
      const t = i / stepsPerSegment;
      spine.push(lerpPt(start, pA, t));
    }
    const cornerSteps = 7;
    for (let i = 0; i <= cornerSteps; i++) {
      const t = i / cornerSteps;
      const u = 1 - t;
      const x = u * u * pA[0] + 2 * u * t * mid[0] + t * t * pB[0];
      const y = u * u * pA[1] + 2 * u * t * mid[1] + t * t * pB[1];
      spine.push([x, y]);
    }
    for (let i = 1; i <= stepsPerSegment; i++) {
      const t = i / stepsPerSegment;
      spine.push(lerpPt(pB, end, t));
    }
    const n = spine.length;
    const outerEdge = [];
    const innerEdge = [];
    const v1x = mid[0] - start[0];
    const v1y = mid[1] - start[1];
    const v2x = end[0] - mid[0];
    const v2y = end[1] - mid[1];
    const cross = v1x * v2y - v1y * v2x;
    const bendSign = cross >= 0 ? 1 : -1;
    for (let i = 0; i < n; i++) {
      const prev = spine[Math.max(0, i - 1)];
      const next = spine[Math.min(n - 1, i + 1)];
      let tx = next[0] - prev[0];
      let ty = next[1] - prev[1];
      const len = Math.hypot(tx, ty) || 1;
      tx /= len;
      ty /= len;
      const nx = -ty * bendSign;
      const ny = tx * bendSign;
      const u = i / (n - 1);
      const width = u < 0.5 ? lerp(wStart, wMid, u * 2) : lerp(wMid, wEnd, (u - 0.5) * 2);
      const hw = width * 0.5;
      outerEdge.push([spine[i][0] - nx * hw, spine[i][1] - ny * hw]);
      innerEdge.push([spine[i][0] + nx * hw, spine[i][1] + ny * hw]);
    }
    const midIdx = Math.floor(n * 0.5);
    const fullPolygon = [...outerEdge, ...innerEdge.slice().reverse()];
    const endDir = Math.atan2(end[1] - mid[1], end[0] - mid[0]);
    return {
      spine,
      outerEdge,
      innerEdge,
      fullPolygon,
      midOuterPt: outerEdge[midIdx],
      midInnerPt: innerEdge[midIdx],
      endCenter: end,
      endDir
    };
  }
  function drawUnifiedLimb(ctx, start, mid, end, wStart, wMid, wEnd, frameIndex, tag, opts) {
    const geom = computeUnifiedLimbGeometry(start, mid, end, wStart, wMid, wEnd, 10);
    const {
      skinColor,
      skinHatchColor = PALETTE.skinShadow,
      garmentColor,
      garmentHatchColor,
      garmentSplitRatio = 0,
      cuffColor,
      strokeColor = PALETTE.graphiteDark,
      strokeWidth = 3.8
    } = opts;
    drawHandColoredPolygon(ctx, geom.fullPolygon, frameIndex, `${tag}:skin-base`, {
      fillColor: skinColor,
      hatchColor: skinHatchColor,
      hatchAlpha: 0.16,
      occludePaper: true,
      strokeOutline: false,
      colorOffsetScale: 3
    });
    const n = geom.outerEdge.length;
    if (garmentColor && garmentSplitRatio > 0.05) {
      const splitIdx = clamp(Math.round(n * garmentSplitRatio), 2, n - 2);
      const garmentPoly = [
        ...geom.outerEdge.slice(0, splitIdx + 1),
        ...geom.innerEdge.slice(0, splitIdx + 1).reverse()
      ];
      drawHandColoredPolygon(ctx, garmentPoly, frameIndex, `${tag}:garment`, {
        fillColor: garmentColor,
        hatchColor: garmentHatchColor,
        hatchAlpha: 0.22,
        occludePaper: false,
        // La base papier est déjà posée sur tout le membre
        strokeOutline: false,
        colorOffsetScale: 3.4
      });
      const cuffOut = geom.outerEdge[splitIdx];
      const cuffIn = geom.innerEdge[splitIdx];
      if (cuffColor) {
        const prevIdx = Math.max(0, splitIdx - 2);
        const bandPoly = [
          geom.outerEdge[prevIdx],
          cuffOut,
          cuffIn,
          geom.innerEdge[prevIdx]
        ];
        drawHandColoredPolygon(ctx, bandPoly, frameIndex, `${tag}:cuff`, {
          fillColor: cuffColor,
          occludePaper: false,
          strokeOutline: false,
          colorOffsetScale: 2.2
        });
      }
      drawPencilPolyline(ctx, [cuffOut, cuffIn], frameIndex, `${tag}:hem`, {
        color: strokeColor,
        width: strokeWidth * 0.82,
        wobble: 1.6,
        closed: false
      });
    }
    drawPencilPolyline(ctx, geom.outerEdge, frameIndex, `${tag}:outer-edge`, {
      color: strokeColor,
      width: strokeWidth,
      wobble: 2,
      closed: false
    });
    drawPencilPolyline(ctx, geom.innerEdge, frameIndex, `${tag}:inner-edge`, {
      color: strokeColor,
      width: strokeWidth,
      wobble: 2,
      closed: false
    });
    const ang1 = Math.atan2(mid[1] - start[1], mid[0] - start[0]);
    const ang2 = Math.atan2(end[1] - mid[1], end[0] - mid[0]);
    let bendDiff = Math.abs(ang2 - ang1);
    if (bendDiff > Math.PI) bendDiff = Math.PI * 2 - bendDiff;
    if (bendDiff > 0.42) {
      const creaseDir = [
        (geom.midOuterPt[0] - geom.midInnerPt[0]) * 0.24,
        (geom.midOuterPt[1] - geom.midInnerPt[1]) * 0.24
      ];
      drawPencilPolyline(
        ctx,
        [
          geom.midInnerPt,
          [geom.midInnerPt[0] + creaseDir[0], geom.midInnerPt[1] + creaseDir[1]]
        ],
        frameIndex,
        `${tag}:crease`,
        {
          color: strokeColor,
          width: strokeWidth * 0.65,
          wobble: 1.1,
          closed: false,
          doublePass: false
        }
      );
    }
    return geom;
  }

  // src/animation/environment.ts
  function getOvenDoorGeometry(openAngleDeg) {
    const openRad = clamp(openAngleDeg, 0, 82) * Math.PI / 180;
    const hingeY = 1096;
    const doorHeight = 224;
    const hingeLeft = [726, hingeY];
    const hingeRight = [976, hingeY];
    const cosA = Math.cos(openRad);
    const sinA = Math.sin(openRad);
    const perspectiveSpread = sinA * 28;
    const forwardDrop = sinA * 56;
    const topY = hingeY - doorHeight * cosA + forwardDrop;
    const topLeft = [hingeLeft[0] - perspectiveSpread, topY];
    const topRight = [hingeRight[0] + perspectiveSpread * 0.75, topY + 6 * (1 - cosA)];
    const hRatio = 0.84;
    const handleY = lerp(hingeY, topY, hRatio) - sinA * 10;
    const handleLeft = [
      lerp(hingeLeft[0], topLeft[0], hRatio) + 28,
      handleY
    ];
    const handleRight = [
      lerp(hingeRight[0], topRight[0], hRatio) - 28,
      handleY + 3 * (1 - cosA)
    ];
    const handleCenter = [
      (handleLeft[0] + handleRight[0]) * 0.5,
      (handleLeft[1] + handleRight[1]) * 0.5
    ];
    return {
      hingeLeft,
      hingeRight,
      topLeft,
      topRight,
      handleCenter,
      handleLeft,
      handleRight,
      openRad
    };
  }
  function drawKitchenAndGardenBackdrop(ctx, frameIndex, ovenGlow) {
    drawHandColoredPolygon(
      ctx,
      [
        [0, 0],
        [1080, 0],
        [1080, 880],
        [0, 880]
      ],
      frameIndex,
      "kitchen-wall-upper",
      {
        fillColor: PALETTE.wallCream,
        hatchColor: "#E3D2B6",
        hatchAlpha: 0.16,
        hatchSpacing: 18,
        strokeOutline: false,
        occludePaper: false,
        colorOffsetScale: 2
      }
    );
    drawHandColoredPolygon(
      ctx,
      [
        [0, 690],
        [660, 690],
        [660, 880],
        [0, 880]
      ],
      frameIndex,
      "kitchen-wainscot",
      {
        fillColor: PALETTE.wallWainscot,
        hatchColor: "#BDA482",
        hatchAlpha: 0.18,
        hatchSpacing: 14,
        hatchAngle: 1.57,
        strokeOutline: true,
        strokeWidth: 3.2
      }
    );
    drawHandColoredPolygon(
      ctx,
      [
        [0, 110],
        [1080, 110],
        [1080, 162],
        [0, 162]
      ],
      frameIndex,
      "ceiling-beam",
      {
        fillColor: PALETTE.woodBeam,
        hatchColor: "#5E3F24",
        hatchAlpha: 0.25,
        hatchSpacing: 12,
        hatchAngle: 0.08,
        strokeWidth: 3.8
      }
    );
    drawHandColoredPolygon(
      ctx,
      [
        [0, 875],
        [1080, 875],
        [1080, 1920],
        [0, 1920]
      ],
      frameIndex,
      "kitchen-floor-base",
      {
        fillColor: PALETTE.floorTileA,
        hatchColor: PALETTE.floorTileB,
        hatchAlpha: 0.2,
        hatchSpacing: 16,
        hatchAngle: -0.35,
        strokeWidth: 3.5
      }
    );
    const vpX = 510;
    const vpY = 640;
    for (let i = -3; i <= 7; i++) {
      const bottomX = i * 195;
      const tStart = (875 - vpY) / (1920 - vpY);
      const startX = lerp(vpX, bottomX, tStart);
      drawPencilPolyline(
        ctx,
        [
          [startX, 875],
          [bottomX, 1920]
        ],
        frameIndex,
        `floor-persp-ray-${i}`,
        {
          color: PALETTE.graphiteLight,
          width: 2.2,
          wobble: 1.5,
          alpha: 0.42,
          doublePass: false
        }
      );
    }
    const tileRows = [930, 1005, 1100, 1220, 1370, 1550, 1760];
    tileRows.forEach((ry, idx) => {
      drawPencilPolyline(
        ctx,
        [
          [0, ry],
          [1080, ry]
        ],
        frameIndex,
        `floor-row-${idx}`,
        {
          color: PALETTE.graphiteLight,
          width: 2.2,
          wobble: 1.6,
          alpha: 0.4,
          doublePass: false
        }
      );
    });
    const winLeft = 95;
    const winRight = 605;
    const winTop = 225;
    const winBottom = 875;
    drawHandColoredPolygon(
      ctx,
      [
        [winLeft, winTop],
        [winRight, winTop],
        [winRight, 550],
        [winLeft, 550]
      ],
      frameIndex,
      "garden-sky",
      {
        fillColor: PALETTE.skyBlue,
        hatchColor: "#B8D9EA",
        hatchAlpha: 0.22,
        hatchSpacing: 14,
        hatchAngle: -0.4,
        strokeOutline: false
      }
    );
    const sunPoly = sampleEllipseArc(495, 305, 42, 42, 0, Math.PI * 2, 20);
    drawHandColoredPolygon(ctx, sunPoly, frameIndex, "garden-sun", {
      fillColor: PALETTE.sunGlow,
      strokeColor: "#DFB44B",
      strokeWidth: 2.6,
      colorOffsetScale: 3.2
    });
    drawHandColoredPolygon(
      ctx,
      [
        [winLeft, 520],
        [220, 485],
        [390, 500],
        [510, 475],
        [winRight, 495],
        [winRight, 600],
        [winLeft, 600]
      ],
      frameIndex,
      "garden-hills",
      {
        fillColor: PALETTE.distantHills,
        hatchColor: "#8FB278",
        hatchAlpha: 0.22,
        strokeWidth: 2.6
      }
    );
    drawHandColoredPolygon(
      ctx,
      [
        [winLeft, 545],
        [winRight, 545],
        [winRight, winBottom - 22],
        [winLeft, winBottom - 22]
      ],
      frameIndex,
      "garden-lawn",
      {
        fillColor: PALETTE.grassLight,
        hatchColor: PALETTE.grassMid,
        hatchAlpha: 0.26,
        hatchSpacing: 13,
        hatchAngle: -0.25,
        strokeWidth: 2.8
      }
    );
    const steppingStones = [
      [355, 795, 58, 18],
      [335, 735, 48, 15],
      [312, 682, 40, 12]
    ];
    steppingStones.forEach(([sx, sy, srx, sry], idx) => {
      const stonePts = sampleEllipseArc(sx, sy, srx, sry, 0, Math.PI * 2, 16);
      drawHandColoredPolygon(ctx, stonePts, frameIndex, `garden-stone-${idx}`, {
        fillColor: "#E5D8C3",
        strokeWidth: 2.4,
        colorOffsetScale: 2.4
      });
    });
    drawHandColoredPolygon(
      ctx,
      [
        [152, 625],
        [165, 455],
        [192, 455],
        [204, 625]
      ],
      frameIndex,
      "garden-tree-trunk",
      {
        fillColor: PALETTE.treeTrunk,
        hatchColor: "#563820",
        hatchAlpha: 0.28,
        strokeWidth: 3
      }
    );
    const foliagePts = sampleEllipseArc(188, 395, 84, 68, 0, Math.PI * 2, 22);
    drawHandColoredPolygon(ctx, foliagePts, frameIndex, "garden-tree-crown", {
      fillColor: PALETTE.foliageA,
      hatchColor: PALETTE.foliageB,
      hatchAlpha: 0.3,
      strokeWidth: 3.2,
      colorOffsetScale: 4.2
    });
    const apples = [
      [152, 385],
      [205, 365],
      [225, 412]
    ];
    apples.forEach(([ax, ay], idx) => {
      drawHandColoredPolygon(
        ctx,
        sampleEllipseArc(ax, ay, 8, 8, 0, Math.PI * 2, 10),
        frameIndex,
        `tree-apple-${idx}`,
        {
          fillColor: PALETTE.flowerRed,
          strokeWidth: 2,
          colorOffsetScale: 1.5
        }
      );
    });
    drawHandColoredPolygon(
      ctx,
      [
        [winLeft - 12, winBottom - 26],
        [winRight + 12, winBottom - 26],
        [winRight + 22, winBottom + 6],
        [winLeft - 22, winBottom + 6]
      ],
      frameIndex,
      "doorway-threshold-step",
      {
        fillColor: "#D6C4AC",
        hatchColor: "#B59E82",
        hatchAlpha: 0.22,
        strokeWidth: 3.4
      }
    );
    drawHandColoredPolygon(
      ctx,
      [
        [42, 205],
        [winLeft, 225],
        [winLeft, winBottom],
        [42, winBottom + 24]
      ],
      frameIndex,
      "french-door-left-leaf",
      {
        fillColor: "#C89B6C",
        hatchColor: "#9E7145",
        hatchAlpha: 0.22,
        strokeWidth: 3.6
      }
    );
    drawHandColoredPolygon(
      ctx,
      [
        [winRight, 225],
        [648, 210],
        [648, winBottom + 18],
        [winRight, winBottom]
      ],
      frameIndex,
      "french-door-right-leaf",
      {
        fillColor: "#C89B6C",
        hatchColor: "#9E7145",
        hatchAlpha: 0.22,
        strokeWidth: 3.6
      }
    );
    drawHandColoredPolygon(
      ctx,
      [
        [winLeft - 18, 202],
        [winRight + 18, 202],
        [winRight + 10, winTop],
        [winLeft - 10, winTop]
      ],
      frameIndex,
      "french-door-lintel",
      {
        fillColor: "#B58354",
        strokeWidth: 3.6
      }
    );
    drawHandColoredPolygon(
      ctx,
      [
        [675, 520],
        [1045, 520],
        [1045, 745],
        [675, 745]
      ],
      frameIndex,
      "kitchen-backsplash",
      {
        fillColor: PALETTE.tileBacksplash,
        hatchColor: "#B8C9C3",
        hatchAlpha: 0.2,
        hatchSpacing: 15,
        strokeWidth: 3.2
      }
    );
    drawHandColoredPolygon(
      ctx,
      [
        [685, 505],
        [1035, 505],
        [1035, 528],
        [685, 528]
      ],
      frameIndex,
      "wall-shelf",
      {
        fillColor: PALETTE.counterWood,
        strokeWidth: 3.4
      }
    );
    drawHandColoredPolygon(
      ctx,
      [
        [940, 668],
        [998, 668],
        [1004, 752],
        [934, 752]
      ],
      frameIndex,
      "flour-jar-counter",
      {
        fillColor: "#FAF3E6",
        hatchColor: "#DFD2BC",
        strokeWidth: 3.2
      }
    );
    drawHandColoredPolygon(
      ctx,
      sampleEllipseArc(969, 662, 32, 10, 0, Math.PI * 2, 14),
      frameIndex,
      "flour-jar-lid",
      {
        fillColor: PALETTE.bunRibbon,
        strokeWidth: 3
      }
    );
    drawHandColoredPolygon(
      ctx,
      [
        [660, 775],
        [702, 740],
        [702, 1125],
        [660, 1175]
      ],
      frameIndex,
      "counter-side-3d",
      {
        fillColor: PALETTE.counterFront,
        hatchColor: "#784E2A",
        hatchAlpha: 0.26,
        strokeWidth: 3.6
      }
    );
    drawHandColoredPolygon(
      ctx,
      [
        [702, 785],
        [1045, 785],
        [1045, 1175],
        [702, 1175]
      ],
      frameIndex,
      "counter-front-face",
      {
        fillColor: PALETTE.counterWood,
        hatchColor: "#8E5E35",
        hatchAlpha: 0.22,
        strokeWidth: 3.8
      }
    );
    drawHandColoredPolygon(
      ctx,
      [
        [652, 778],
        [698, 736],
        [1050, 736],
        [1050, 788]
      ],
      frameIndex,
      "counter-top-3d",
      {
        fillColor: PALETTE.counterTop,
        hatchColor: "#CFC0A8",
        hatchAlpha: 0.2,
        strokeWidth: 3.8
      }
    );
    drawHandColoredPolygon(
      ctx,
      [
        [716, 812],
        [988, 812],
        [988, 1112],
        [716, 1112]
      ],
      frameIndex,
      "oven-frame-body",
      {
        fillColor: PALETTE.ovenBody,
        hatchColor: PALETTE.ovenPanel,
        hatchAlpha: 0.25,
        strokeWidth: 3.8
      }
    );
    for (const bx of [765, 852, 938]) {
      drawHandColoredPolygon(
        ctx,
        sampleEllipseArc(bx, 838, 12, 12, 0, Math.PI * 2, 12),
        frameIndex,
        `oven-knob-${bx}`,
        {
          fillColor: "#D8CFC2",
          strokeWidth: 2.8
        }
      );
    }
    const cavityColor = ovenGlow > 0.2 ? PALETTE.ovenGlowWarm : "#3E352F";
    drawHandColoredPolygon(
      ctx,
      [
        [734, 868],
        [968, 868],
        [968, 1092],
        [734, 1092]
      ],
      frameIndex,
      "oven-cavity-interior",
      {
        fillColor: cavityColor,
        hatchColor: ovenGlow > 0.2 ? PALETTE.ovenGlowHot : "#28221E",
        hatchAlpha: 0.35,
        strokeWidth: 3.4
      }
    );
    drawPencilPolyline(
      ctx,
      [
        [734, 868],
        [764, 896],
        [938, 896],
        [968, 868]
      ],
      frameIndex,
      "oven-inner-ceiling-persp",
      { color: PALETTE.graphiteDark, width: 2.4 }
    );
    drawPencilPolyline(
      ctx,
      [
        [742, 998],
        [766, 976],
        [936, 976],
        [960, 998],
        [742, 998]
      ],
      frameIndex,
      "oven-rack-3d",
      {
        color: "#DED8CE",
        width: 3.4,
        wobble: 1.5
      }
    );
  }
  function drawOvenDoor3D(ctx, frameIndex, openAngleDeg, ovenGlow) {
    const geom = getOvenDoorGeometry(openAngleDeg);
    const { hingeLeft, hingeRight, topLeft, topRight, handleLeft, handleRight, openRad } = geom;
    if (openAngleDeg > 8) {
      const thickness = Math.sin(openRad) * 18;
      drawHandColoredPolygon(
        ctx,
        [
          topLeft,
          topRight,
          [topRight[0], topRight[1] + thickness],
          [topLeft[0], topLeft[1] + thickness]
        ],
        frameIndex,
        "oven-door-thickness-3d",
        {
          fillColor: "#7A848D",
          strokeWidth: 3
        }
      );
    }
    drawHandColoredPolygon(
      ctx,
      [topLeft, topRight, hingeRight, hingeLeft],
      frameIndex,
      "oven-door-panel-3d",
      {
        fillColor: PALETTE.ovenBody,
        hatchColor: "#333B42",
        hatchAlpha: 0.24,
        strokeWidth: 3.8,
        occludePaper: openAngleDeg > 25
        // Lorsqu'elle est fermée, on dessine le hublot translucide
      }
    );
    const winTL = [
      lerp(topLeft[0], hingeLeft[0], 0.18) + 28,
      lerp(topLeft[1], hingeLeft[1], 0.18)
    ];
    const winTR = [
      lerp(topRight[0], hingeRight[0], 0.18) - 28,
      lerp(topRight[1], hingeRight[1], 0.18)
    ];
    const winBR = [
      lerp(topRight[0], hingeRight[0], 0.78) - 28,
      lerp(topRight[1], hingeRight[1], 0.78)
    ];
    const winBL = [
      lerp(topLeft[0], hingeLeft[0], 0.78) + 28,
      lerp(topLeft[1], hingeLeft[1], 0.78)
    ];
    ctx.save();
    ctx.fillStyle = ovenGlow > 0.15 ? `rgba(255, 198, 92, ${0.42 + ovenGlow * 0.32})` : "rgba(135, 158, 175, 0.48)";
    ctx.beginPath();
    ctx.moveTo(winTL[0], winTL[1]);
    ctx.lineTo(winTR[0], winTR[1]);
    ctx.lineTo(winBR[0], winBR[1]);
    ctx.lineTo(winBL[0], winBL[1]);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    drawPencilPolyline(
      ctx,
      [winTL, winTR, winBR, winBL],
      frameIndex,
      "oven-door-window-outline",
      {
        color: PALETTE.graphiteDark,
        width: 3.2,
        closed: true
      }
    );
    drawPencilPolyline(
      ctx,
      [handleLeft, handleRight],
      frameIndex,
      "oven-door-handle-bar",
      {
        color: "#EAE3D5",
        width: 7.5,
        wobble: 1.4,
        doublePass: false
      }
    );
    drawPencilPolyline(
      ctx,
      [handleLeft, handleRight],
      frameIndex,
      "oven-door-handle-stroke",
      {
        color: PALETTE.graphiteDark,
        width: 3.4,
        wobble: 1.5
      }
    );
  }
  function drawChildrenChairsBackAndSeat(ctx, frameIndex) {
    const chairs = [
      { id: "clara-chair", cx: 242, seatY: 1286 },
      { id: "leo-chair", cx: 438, seatY: 1286 }
    ];
    for (const ch of chairs) {
      const { id, cx, seatY } = ch;
      const halfW = 62;
      drawHandColoredPolygon(
        ctx,
        [
          [cx - halfW, 995],
          [cx - halfW + 14, 995],
          [cx - halfW + 14, 1575],
          [cx - halfW, 1575]
        ],
        frameIndex,
        `${id}-left-post`,
        {
          fillColor: PALETTE.tableLeg,
          strokeWidth: 3.2
        }
      );
      drawHandColoredPolygon(
        ctx,
        [
          [cx + halfW - 14, 1055],
          [cx + halfW, 1055],
          [cx + halfW, 1575],
          [cx + halfW - 14, 1575]
        ],
        frameIndex,
        `${id}-right-post`,
        {
          fillColor: PALETTE.tableLeg,
          strokeWidth: 3.2
        }
      );
      drawHandColoredPolygon(
        ctx,
        [
          [cx - halfW + 10, 1012],
          [cx + halfW - 10, 1012],
          [cx + halfW - 10, 1052],
          [cx - halfW + 10, 1052]
        ],
        frameIndex,
        `${id}-backrest-top`,
        {
          fillColor: PALETTE.chairWood,
          strokeWidth: 3.2
        }
      );
      drawHandColoredPolygon(
        ctx,
        [
          [cx - halfW - 8, seatY],
          [cx - halfW + 6, seatY - 24],
          [cx + halfW + 6, seatY - 24],
          [cx + halfW + 10, seatY],
          [cx + halfW + 10, seatY + 18],
          [cx - halfW - 8, seatY + 18]
        ],
        frameIndex,
        `${id}-seat-3d`,
        {
          fillColor: PALETTE.chairWood,
          hatchColor: PALETTE.tableEdge,
          hatchAlpha: 0.24,
          strokeWidth: 3.5
        }
      );
      drawHandColoredPolygon(
        ctx,
        [
          [cx - halfW - 4, seatY + 18],
          [cx - halfW + 10, seatY + 18],
          [cx - halfW + 8, 1595],
          [cx - halfW - 6, 1595]
        ],
        frameIndex,
        `${id}-front-left-leg`,
        {
          fillColor: PALETTE.chairWood,
          strokeWidth: 3.2
        }
      );
      drawHandColoredPolygon(
        ctx,
        [
          [cx + halfW - 8, seatY + 18],
          [cx + halfW + 6, seatY + 18],
          [cx + halfW + 4, 1595],
          [cx + halfW - 10, 1595]
        ],
        frameIndex,
        `${id}-front-right-leg`,
        {
          fillColor: PALETTE.chairWood,
          strokeWidth: 3.2
        }
      );
    }
  }
  function drawFamilyTable3D(ctx, frameIndex) {
    const shadowPts = sampleEllipseArc(510, 1605, 410, 44, 0, Math.PI * 2, 24);
    ctx.save();
    ctx.fillStyle = "rgba(92, 68, 44, 0.13)";
    ctx.beginPath();
    shadowPts.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    drawHandColoredPolygon(
      ctx,
      [
        [182, 1225],
        [204, 1225],
        [202, 1565],
        [180, 1565]
      ],
      frameIndex,
      "table-leg-back-left",
      {
        fillColor: PALETTE.tableLeg,
        strokeWidth: 3.4
      }
    );
    drawHandColoredPolygon(
      ctx,
      [
        [822, 1225],
        [844, 1225],
        [842, 1565],
        [820, 1565]
      ],
      frameIndex,
      "table-leg-back-right",
      {
        fillColor: PALETTE.tableLeg,
        strokeWidth: 3.4
      }
    );
    drawHandColoredPolygon(
      ctx,
      [
        [168, 1138],
        [854, 1138],
        [916, 1234],
        [112, 1234]
      ],
      frameIndex,
      "table-top-surface-3d",
      {
        fillColor: PALETTE.tableTop,
        hatchColor: PALETTE.tableEdge,
        hatchAlpha: 0.22,
        hatchSpacing: 14,
        hatchAngle: 0.05,
        strokeWidth: 4
      }
    );
    drawHandColoredPolygon(
      ctx,
      [
        [112, 1234],
        [916, 1234],
        [912, 1264],
        [116, 1264]
      ],
      frameIndex,
      "table-front-apron-3d",
      {
        fillColor: PALETTE.tableEdge,
        hatchColor: PALETTE.tableLeg,
        hatchAlpha: 0.26,
        strokeWidth: 3.8
      }
    );
    drawHandColoredPolygon(
      ctx,
      [
        [124, 1262],
        [152, 1262],
        [148, 1622],
        [120, 1622]
      ],
      frameIndex,
      "table-leg-front-left",
      {
        fillColor: PALETTE.tableEdge,
        hatchColor: PALETTE.tableLeg,
        strokeWidth: 3.8
      }
    );
    drawHandColoredPolygon(
      ctx,
      [
        [874, 1262],
        [902, 1262],
        [898, 1622],
        [870, 1622]
      ],
      frameIndex,
      "table-leg-front-right",
      {
        fillColor: PALETTE.tableEdge,
        hatchColor: PALETTE.tableLeg,
        strokeWidth: 3.8
      }
    );
  }

  // src/animation/props.ts
  function getMixingBowlAnchors(cx, cy, scale = 1, tiltRad = 0) {
    const rx = 56 * scale;
    const cosT = Math.cos(tiltRad);
    const sinT = Math.sin(tiltRad);
    const rot = (x, y) => [
      cx + x * cosT - y * sinT,
      cy + x * sinT + y * cosT
    ];
    return {
      leftRim: rot(-rx, -8 * scale),
      rightRim: rot(rx, -8 * scale),
      pourSpout: rot(rx * 0.95, 2 * scale),
      batterCenter: rot(0, -4 * scale)
    };
  }
  function drawMixingBowl3D(ctx, frameIndex, cx, cy, opts = {}) {
    const {
      scale = 1,
      tiltRad = 0,
      batterFill = 0.8,
      pouringTo = null,
      pouringStrength = 0
    } = opts;
    const rx = 56 * scale;
    const ryRim = 17 * scale;
    const depth = 52 * scale;
    const cosT = Math.cos(tiltRad);
    const sinT = Math.sin(tiltRad);
    const rot = (x, y) => [
      cx + x * cosT - y * sinT,
      cy + x * sinT + y * cosT
    ];
    const lowerArc = sampleEllipseArc(0, -6 * scale, rx, depth, 0, Math.PI, 20);
    const upperBackArc = sampleEllipseArc(0, -6 * scale, rx, ryRim, Math.PI, Math.PI * 2, 16);
    const bowlBodyPts = [...lowerArc, ...upperBackArc].map(([x, y]) => rot(x, y));
    drawHandColoredPolygon(ctx, bowlBodyPts, frameIndex, "mixing-bowl-body", {
      fillColor: PALETTE.bowlTerracotta,
      hatchColor: "#9E4D30",
      hatchAlpha: 0.25,
      strokeWidth: 3.6 * Math.max(0.75, scale)
    });
    const rimPts = sampleEllipseArc(0, -6 * scale, rx, ryRim, 0, Math.PI * 2, 24).map(
      ([x, y]) => rot(x, y)
    );
    drawHandColoredPolygon(ctx, rimPts, frameIndex, "mixing-bowl-inside", {
      fillColor: PALETTE.bowlInside,
      hatchColor: "#DECBB2",
      hatchAlpha: 0.2,
      strokeWidth: 3.4 * Math.max(0.75, scale)
    });
    if (batterFill > 0.08) {
      const bScale = 0.78 * clamp(batterFill, 0.25, 1);
      const batterPts = sampleEllipseArc(
        0,
        -4 * scale,
        rx * bScale,
        ryRim * bScale,
        0,
        Math.PI * 2,
        20
      ).map(([x, y]) => rot(x, y));
      drawHandColoredPolygon(ctx, batterPts, frameIndex, "mixing-bowl-batter", {
        fillColor: PALETTE.batterGold,
        hatchColor: "#DFA93E",
        hatchAlpha: 0.25,
        strokeWidth: 2.4 * Math.max(0.75, scale)
      });
    }
    const anchors = getMixingBowlAnchors(cx, cy, scale, tiltRad);
    if (pouringTo && pouringStrength > 0.05) {
      const sp = anchors.pourSpout;
      const tp = pouringTo;
      const midY = lerp(sp[1], tp[1], 0.5);
      const wTop = 11 * pouringStrength;
      const wBot = 7 * pouringStrength;
      const ribbonPoly = [
        [sp[0] - wTop, sp[1]],
        [lerp(sp[0], tp[0], 0.55) - wBot * 1.1, midY],
        [tp[0] - wBot, tp[1]],
        [tp[0] + wBot, tp[1]],
        [lerp(sp[0], tp[0], 0.55) + wBot * 1.1, midY],
        [sp[0] + wTop, sp[1]]
      ];
      drawHandColoredPolygon(ctx, ribbonPoly, frameIndex, "pouring-batter-ribbon", {
        fillColor: PALETTE.batterGold,
        hatchColor: "#E5B248",
        strokeWidth: 2.8,
        colorOffsetScale: 2.2
      });
    }
    return anchors;
  }
  function drawWhiskProp(ctx, frameIndex, gripPoint, tipPoint, scale = 1) {
    const dx = tipPoint[0] - gripPoint[0];
    const dy = tipPoint[1] - gripPoint[1];
    const angle = Math.atan2(dy, dx);
    const nx = -Math.sin(angle);
    const ny = Math.cos(angle);
    const handleStart = [
      gripPoint[0] - Math.cos(angle) * 20 * scale,
      gripPoint[1] - Math.sin(angle) * 20 * scale
    ];
    const handleEnd = [
      gripPoint[0] + Math.cos(angle) * 18 * scale,
      gripPoint[1] + Math.sin(angle) * 18 * scale
    ];
    const hw = 6.5 * scale;
    const handlePoly = [
      [handleStart[0] - nx * hw, handleStart[1] - ny * hw],
      [handleEnd[0] - nx * hw * 0.8, handleEnd[1] - ny * hw * 0.8],
      [handleEnd[0] + nx * hw * 0.8, handleEnd[1] + ny * hw * 0.8],
      [handleStart[0] + nx * hw, handleStart[1] + ny * hw]
    ];
    drawHandColoredPolygon(ctx, handlePoly, frameIndex, "whisk-handle", {
      fillColor: PALETTE.whiskHandle,
      strokeWidth: 3 * Math.max(0.75, scale)
    });
    for (const spread of [-11, -4, 4, 11]) {
      const mid = [
        lerp(handleEnd[0], tipPoint[0], 0.58) + nx * spread * scale,
        lerp(handleEnd[1], tipPoint[1], 0.58) + ny * spread * scale
      ];
      drawPencilPolyline(
        ctx,
        [handleEnd, mid, tipPoint],
        frameIndex,
        `whisk-wire-${spread}`,
        {
          color: PALETTE.whiskMetal,
          width: 2.3 * Math.max(0.75, scale),
          wobble: 1.2,
          doublePass: false
        }
      );
    }
  }
  function getCakePanAnchors(cx, cy, scale = 1) {
    const rx = 54 * scale;
    return {
      leftHandle: [cx - rx - 10 * scale, cy - 4 * scale],
      rightHandle: [cx + rx + 10 * scale, cy - 4 * scale],
      centerTop: [cx, cy - 16 * scale],
      leoTasteSpot: [cx - 34 * scale, cy - 28 * scale]
    };
  }
  function drawCakeAndPan3D(ctx, frameIndex, cx, cy, opts = {}) {
    const {
      scale = 1,
      batterLevel = 0.2,
      bakeDome = 0,
      decorated = false,
      steamAmount = 0,
      slicesRemoved = 0
    } = opts;
    const rx = 54 * scale;
    const ry = 17 * scale;
    const panH = 28 * scale;
    drawHandColoredPolygon(
      ctx,
      [
        [cx - rx - 14 * scale, cy - 8 * scale],
        [cx - rx + 2 * scale, cy - 8 * scale],
        [cx - rx + 2 * scale, cy + 4 * scale],
        [cx - rx - 14 * scale, cy + 4 * scale]
      ],
      frameIndex,
      "cake-pan-left-ear",
      { fillColor: PALETTE.panMetal, strokeWidth: 2.8 }
    );
    drawHandColoredPolygon(
      ctx,
      [
        [cx + rx - 2 * scale, cy - 8 * scale],
        [cx + rx + 14 * scale, cy - 8 * scale],
        [cx + rx + 14 * scale, cy + 4 * scale],
        [cx + rx - 2 * scale, cy + 4 * scale]
      ],
      frameIndex,
      "cake-pan-right-ear",
      { fillColor: PALETTE.panMetal, strokeWidth: 2.8 }
    );
    const bottomArc = sampleEllipseArc(cx, cy + panH, rx * 0.94, ry * 0.92, 0, Math.PI, 18);
    const topBackArc = sampleEllipseArc(cx, cy, rx, ry, Math.PI, Math.PI * 2, 18);
    drawHandColoredPolygon(
      ctx,
      [...bottomArc, ...topBackArc],
      frameIndex,
      "cake-pan-cylinder",
      {
        fillColor: PALETTE.panMetal,
        hatchColor: PALETTE.panInside,
        hatchAlpha: 0.25,
        strokeWidth: 3.4 * Math.max(0.75, scale)
      }
    );
    const rimPts = sampleEllipseArc(cx, cy, rx, ry, 0, Math.PI * 2, 22);
    drawHandColoredPolygon(ctx, rimPts, frameIndex, "cake-pan-rim", {
      fillColor: PALETTE.panInside,
      strokeWidth: 3 * Math.max(0.75, scale)
    });
    if (batterLevel > 0.05 || bakeDome > 0.05) {
      const domeH = bakeDome * 30 * scale;
      const topY = cy - domeH * 0.65;
      const domeCrownPts = sampleEllipseArc(
        cx,
        cy - 2 * scale,
        rx * 0.93,
        ry * 0.85 + domeH,
        Math.PI,
        Math.PI * 2,
        20
      );
      const frontRimPts = sampleEllipseArc(cx, cy - 2 * scale, rx * 0.93, ry * 0.88, 0, Math.PI, 18);
      const spongeColor = bakeDome > 0.35 ? PALETTE.cakeSponge : PALETTE.batterGold;
      const crustColor = bakeDome > 0.35 ? PALETTE.cakeCrust : "#DFB24C";
      drawHandColoredPolygon(
        ctx,
        [...frontRimPts, ...domeCrownPts],
        frameIndex,
        "cake-sponge-dome",
        {
          fillColor: spongeColor,
          hatchColor: crustColor,
          hatchAlpha: 0.28,
          strokeWidth: 3.4 * Math.max(0.75, scale)
        }
      );
      if (decorated && bakeDome > 0.6) {
        const icingPts = [];
        const steps = 18;
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const a = lerp(0, Math.PI * 2, t);
          const scallop = Math.sin(i * 2.4) * 3.5 * scale;
          icingPts.push([
            cx + Math.cos(a) * rx * 0.84,
            topY + Math.sin(a) * (ry * 0.72) + scallop
          ]);
        }
        drawHandColoredPolygon(ctx, icingPts, frameIndex, "cake-icing-top", {
          fillColor: PALETTE.cakeIcing,
          hatchColor: "#E5D8C5",
          hatchAlpha: 0.18,
          strokeWidth: 3 * Math.max(0.75, scale)
        });
        if (slicesRemoved > 0) {
          const wedgeWidth = slicesRemoved === 1 ? 22 * scale : 38 * scale;
          const wedgePoly = [
            [cx, topY - 2 * scale],
            [cx - wedgeWidth, cy - 4 * scale],
            [cx - wedgeWidth, cy + 14 * scale],
            [cx + 6 * scale, cy + 16 * scale],
            [cx + 6 * scale, cy - 2 * scale]
          ];
          drawHandColoredPolygon(ctx, wedgePoly, frameIndex, "cake-cut-wedge-interior", {
            fillColor: "#F3C77E",
            hatchColor: PALETTE.strawberryRed,
            // couche de confiture de fraises interne
            hatchAlpha: 0.35,
            strokeWidth: 3
          });
        }
        const berryAngles = [0.3, 1.2, 2.1, 3, 4.1, 5.2];
        berryAngles.forEach((ang, idx) => {
          if (slicesRemoved >= 1 && idx === 2) return;
          if (slicesRemoved >= 2 && idx === 1) return;
          const bx = cx + Math.cos(ang) * rx * 0.56;
          const by = topY + Math.sin(ang) * ry * 0.48 - 5 * scale;
          const berryPts = sampleEllipseArc(bx, by, 8.5 * scale, 9.5 * scale, 0, Math.PI * 2, 10);
          drawHandColoredPolygon(ctx, berryPts, frameIndex, `cake-strawberry-${idx}`, {
            fillColor: PALETTE.strawberryRed,
            strokeWidth: 2.5,
            colorOffsetScale: 1.8
          });
        });
      }
    }
    if (steamAmount > 0.05) {
      const steamXOffsets = [-26, 0, 26];
      steamXOffsets.forEach((ox, idx) => {
        const phase = frameIndex * 0.16 + idx * 1.8;
        const baseX = cx + ox * scale;
        const baseY = cy - 36 * scale;
        const pts = [
          [baseX, baseY],
          [baseX + Math.sin(phase) * 9, baseY - 22 * scale],
          [baseX - Math.sin(phase + 1.1) * 10, baseY - 46 * scale],
          [baseX + Math.cos(phase) * 8, baseY - 68 * scale]
        ];
        drawPencilPolyline(ctx, pts, frameIndex, `cake-steam-${idx}`, {
          color: "#8C7A68",
          width: 2.4,
          wobble: 1.8,
          alpha: 0.55 * steamAmount,
          doublePass: false
        });
      });
    }
    return getCakePanAnchors(cx, cy, scale);
  }
  function drawDessertPlateWithSlice(ctx, frameIndex, cx, cy, hasSlice, tag, scale = 1) {
    const outerPts = sampleEllipseArc(cx, cy, 38 * scale, 13 * scale, 0, Math.PI * 2, 20);
    drawHandColoredPolygon(ctx, outerPts, frameIndex, `${tag}-plate-outer`, {
      fillColor: PALETTE.platePorcelain,
      hatchColor: PALETTE.plateRim,
      hatchAlpha: 0.2,
      strokeWidth: 3.2 * Math.max(0.8, scale)
    });
    if (hasSlice) {
      const slicePoly = [
        [cx - 18 * scale, cy + 2 * scale],
        [cx + 18 * scale, cy - 6 * scale],
        [cx + 18 * scale, cy - 24 * scale],
        [cx - 4 * scale, cy - 26 * scale],
        [cx - 18 * scale, cy - 10 * scale]
      ];
      drawHandColoredPolygon(ctx, slicePoly, frameIndex, `${tag}-cake-slice`, {
        fillColor: PALETTE.cakeSponge,
        hatchColor: PALETTE.cakeCrust,
        hatchAlpha: 0.28,
        strokeWidth: 3
      });
      drawHandColoredPolygon(
        ctx,
        [
          [cx - 18 * scale, cy - 10 * scale],
          [cx - 4 * scale, cy - 26 * scale],
          [cx + 18 * scale, cy - 24 * scale],
          [cx + 10 * scale, cy - 10 * scale]
        ],
        frameIndex,
        `${tag}-slice-icing`,
        {
          fillColor: PALETTE.cakeIcing,
          strokeWidth: 2.5
        }
      );
      drawHandColoredPolygon(
        ctx,
        sampleEllipseArc(cx + 2 * scale, cy - 24 * scale, 7 * scale, 7.5 * scale, 0, Math.PI * 2, 10),
        frameIndex,
        `${tag}-slice-berry`,
        {
          fillColor: PALETTE.strawberryRed,
          strokeWidth: 2.2
        }
      );
    }
  }
  function drawGardenBall(ctx, frameIndex, bx, by, groundY, radius = 19, squash = 1) {
    const heightAboveGround = Math.max(0, groundY - by);
    const shadowScale = clamp(1 - heightAboveGround / 160, 0.35, 1.15);
    const shadowPts = sampleEllipseArc(
      bx,
      groundY + 4,
      radius * 1.1 * shadowScale,
      radius * 0.35 * shadowScale,
      0,
      Math.PI * 2,
      14
    );
    ctx.save();
    ctx.fillStyle = "rgba(65, 92, 42, 0.26)";
    ctx.beginPath();
    shadowPts.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    const rx = radius * squash;
    const ry = radius / Math.max(0.75, squash);
    const ballPts = sampleEllipseArc(bx, by, rx, ry, 0, Math.PI * 2, 18);
    drawHandColoredPolygon(ctx, ballPts, frameIndex, "garden-ball", {
      fillColor: PALETTE.ballRed,
      hatchColor: "#9E2E22",
      hatchAlpha: 0.25,
      strokeWidth: 3
    });
    const stripePts = sampleEllipseArc(bx, by, rx * 0.92, ry * 0.38, 0, Math.PI, 10);
    drawPencilPolyline(ctx, stripePts, frameIndex, "garden-ball-stripe", {
      color: PALETTE.ballCream,
      width: 3.5,
      doublePass: false
    });
  }

  // src/animation/characters.ts
  function drawSeamlessHand(ctx, frameIndex, limbGeom, tag, opts = {}) {
    const {
      scale = 1,
      skinColor = PALETTE.skinWarm,
      mode = "grip",
      pointTarget = null,
      hasCreamDab = false
    } = opts;
    const wristCenter = limbGeom.endCenter;
    const wristOut = limbGeom.outerEdge[limbGeom.outerEdge.length - 1];
    const wristIn = limbGeom.innerEdge[limbGeom.innerEdge.length - 1];
    const dir = pointTarget ? Math.atan2(pointTarget[1] - wristCenter[1], pointTarget[0] - wristCenter[0]) : limbGeom.endDir;
    const ux = Math.cos(dir);
    const uy = Math.sin(dir);
    const nx = -uy;
    const ny = ux;
    const localPt = (along, perp) => [
      wristCenter[0] + (ux * along + nx * perp) * scale,
      wristCenter[1] + (uy * along + ny * perp) * scale
    ];
    if (mode === "mitt") {
      const mittContour = [
        wristOut,
        localPt(12, -16),
        localPt(28, -14),
        localPt(34, -2),
        localPt(28, 13),
        localPt(14, 15),
        wristIn
      ];
      const mittFillPoly = [localPt(-5, -10), ...mittContour, localPt(-5, 10)];
      drawHandColoredPolygon(ctx, mittFillPoly, frameIndex, `${tag}:mitt-fill`, {
        fillColor: PALETTE.bunRibbon,
        hatchColor: "#9E422B",
        hatchAlpha: 0.28,
        strokeOutline: false,
        occludePaper: true
      });
      drawPencilPolyline(ctx, mittContour, frameIndex, `${tag}:mitt-outline`, {
        color: PALETTE.graphiteDark,
        width: 3.4 * Math.max(0.75, scale),
        closed: false
      });
      return localPt(24, 0);
    }
    if (mode === "point") {
      const tipPt = pointTarget ? pointTarget : localPt(34, -3);
      const handOpenContour = [
        wristOut,
        localPt(10, -13),
        // pouce relevé
        localPt(17, -9),
        localPt(14, -5),
        [lerp(wristCenter[0], tipPt[0], 0.65) + nx * (-4 * scale), lerp(wristCenter[1], tipPt[1], 0.65) + ny * (-4 * scale)],
        tipPt,
        // bout de l'index
        [lerp(wristCenter[0], tipPt[0], 0.65) + nx * (4 * scale), lerp(wristCenter[1], tipPt[1], 0.65) + ny * (4 * scale)],
        localPt(19, 6),
        // autres doigts repliés
        localPt(16, 12),
        localPt(8, 12),
        wristIn
      ];
      const fillPoly = [localPt(-6, -8), ...handOpenContour, localPt(-6, 8)];
      drawHandColoredPolygon(ctx, fillPoly, frameIndex, `${tag}:point-hand-fill`, {
        fillColor: skinColor,
        hatchColor: PALETTE.skinShadow,
        hatchAlpha: 0.16,
        strokeOutline: false,
        occludePaper: false
      });
      drawPencilPolyline(ctx, handOpenContour, frameIndex, `${tag}:point-hand-stroke`, {
        color: PALETTE.graphiteDark,
        width: 3.3 * Math.max(0.75, scale),
        closed: false
      });
      if (hasCreamDab) {
        drawHandColoredPolygon(
          ctx,
          sampleEllipseArc(tipPt[0], tipPt[1], 6.5 * scale, 5.5 * scale, 0, Math.PI * 2, 10),
          frameIndex,
          `${tag}:finger-cream-dab`,
          {
            fillColor: PALETTE.cakeIcing,
            strokeWidth: 2.2,
            colorOffsetScale: 1.5
          }
        );
      }
      return tipPt;
    }
    const spread = mode === "open" || mode === "cup-mouth" ? 1.2 : 0.95;
    const handContour = [
      wristOut,
      localPt(9, -13 * spread),
      // pouce
      localPt(19, -14 * spread),
      localPt(16, -7 * spread),
      localPt(26 * spread, -6 * spread),
      // index
      localPt(28 * spread, 1),
      // majeur
      localPt(24 * spread, 8 * spread),
      // annulaire/auriculaire
      localPt(12, 11 * spread),
      wristIn
    ];
    const handFillPoly = [localPt(-6, -8), ...handContour, localPt(-6, 8)];
    drawHandColoredPolygon(ctx, handFillPoly, frameIndex, `${tag}:hand-fill`, {
      fillColor: skinColor,
      hatchColor: PALETTE.skinShadow,
      hatchAlpha: 0.16,
      strokeOutline: false,
      occludePaper: false
    });
    drawPencilPolyline(ctx, handContour, frameIndex, `${tag}:hand-outline`, {
      color: PALETTE.graphiteDark,
      width: 3.4 * Math.max(0.75, scale),
      closed: false
    });
    return localPt(16, 0);
  }
  function drawSeamlessShoe(ctx, frameIndex, ankle, toeDirFacing, footAngleRad, shoeColor, soleColor, scale, tag) {
    const cosA = Math.cos(footAngleRad);
    const sinA = Math.sin(footAngleRad);
    const pt = (lx, ly) => {
      const fx = lx * toeDirFacing * scale;
      const fy = ly * scale;
      return [ankle[0] + fx * cosA - fy * sinA, ankle[1] + fx * sinA + fy * cosA];
    };
    const shoePoly = [
      pt(-13, -6),
      pt(14, -8),
      pt(34, 1),
      pt(36, 12),
      pt(-14, 13)
    ];
    drawHandColoredPolygon(ctx, shoePoly, frameIndex, `${tag}:shoe`, {
      fillColor: shoeColor,
      hatchColor: soleColor,
      hatchAlpha: 0.24,
      strokeWidth: 3.4 * Math.max(0.75, scale)
    });
    drawPencilPolyline(
      ctx,
      [pt(-14, 11), pt(35, 11)],
      frameIndex,
      `${tag}:sole-line`,
      {
        color: soleColor,
        width: 2.5 * Math.max(0.75, scale),
        doublePass: false
      }
    );
  }
  function drawMamieColette(ctx, frameIndex, pose) {
    const {
      footCenter,
      facing,
      bodyLeanRad = 0,
      headPitchRad = 0,
      leftHandTarget,
      rightHandTarget,
      leftHandMode = "grip",
      rightHandMode = "grip",
      expression = "smile",
      stepPhase = 0
    } = pose;
    const f = facing >= 0 ? 1 : -1;
    const baseX = footCenter[0];
    const groundY = footCenter[1];
    const bobY = Math.abs(Math.sin(stepPhase)) * 6;
    const pelvis = [baseX, groundY - 340 - bobY];
    const chest = [
      pelvis[0] + Math.sin(bodyLeanRad) * 185,
      pelvis[1] - Math.cos(bodyLeanRad) * 185
    ];
    const neckBase = [
      chest[0] + Math.sin(bodyLeanRad) * 62,
      chest[1] - Math.cos(bodyLeanRad) * 62
    ];
    const headCenter = [
      neckBase[0] + f * 6,
      neckBase[1] - 66
    ];
    const backShoulder = [chest[0] - f * 32, chest[1] - 26];
    const frontShoulder = [chest[0] + f * 26, chest[1] - 22];
    const upperArmLen = 116;
    const foreArmLen = 112;
    const backElbowPole = [backShoulder[0] - f * 75, backShoulder[1] + 135];
    const frontElbowPole = [frontShoulder[0] - f * 85, frontShoulder[1] + 140];
    const backHandTarget = f === -1 ? rightHandTarget : leftHandTarget;
    const frontHandTarget = f === -1 ? leftHandTarget : rightHandTarget;
    const backHandMode = f === -1 ? rightHandMode : leftHandMode;
    const frontHandMode = f === -1 ? leftHandMode : rightHandMode;
    const backIK = solveTwoBoneIK(backShoulder, backHandTarget, upperArmLen, foreArmLen, backElbowPole);
    const frontIK = solveTwoBoneIK(frontShoulder, frontHandTarget, upperArmLen, foreArmLen, frontElbowPole);
    const shadowPts = sampleEllipseArc(baseX, groundY + 12, 82, 20, 0, Math.PI * 2, 18);
    ctx.save();
    ctx.fillStyle = "rgba(78, 58, 38, 0.16)";
    ctx.beginPath();
    shadowPts.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    const stepSwing = Math.sin(stepPhase) * 18;
    const backAnkle = [baseX - f * 22 - stepSwing, groundY - 12];
    const frontAnkle = [baseX + f * 20 + stepSwing, groundY - 8];
    drawUnifiedLimb(
      ctx,
      [backAnkle[0], groundY - 135],
      [backAnkle[0], groundY - 70],
      backAnkle,
      30,
      26,
      22,
      frameIndex,
      "mamie-back-ankle",
      { skinColor: PALETTE.skinShadow, strokeWidth: 3.4 }
    );
    drawSeamlessShoe(
      ctx,
      frameIndex,
      backAnkle,
      f,
      0,
      PALETTE.slippersBurgundy,
      "#5C2824",
      1.05,
      "mamie-back-slipper"
    );
    drawUnifiedLimb(
      ctx,
      [frontAnkle[0], groundY - 135],
      [frontAnkle[0], groundY - 70],
      frontAnkle,
      30,
      26,
      22,
      frameIndex,
      "mamie-front-ankle",
      { skinColor: PALETTE.skinWarm, strokeWidth: 3.4 }
    );
    drawSeamlessShoe(
      ctx,
      frameIndex,
      frontAnkle,
      f,
      0,
      PALETTE.slippersBurgundy,
      "#5C2824",
      1.05,
      "mamie-front-slipper"
    );
    const backArmGeom = drawUnifiedLimb(
      ctx,
      backShoulder,
      backIK.mid,
      backIK.end,
      44,
      37,
      27,
      frameIndex,
      "mamie-back-arm",
      {
        skinColor: PALETTE.skinShadow,
        garmentColor: PALETTE.mamieDressShade,
        garmentSplitRatio: 0.56,
        cuffColor: "#7A96B0",
        strokeWidth: 3.8
      }
    );
    const backPalm = drawSeamlessHand(ctx, frameIndex, backArmGeom, "mamie-back-hand", {
      scale: 1,
      skinColor: PALETTE.skinShadow,
      mode: backHandMode
    });
    const skirtBottomY = groundY - 96 - bobY * 0.5;
    const dressPoly = [
      [neckBase[0] - 28, neckBase[1] + 6],
      [neckBase[0] + 28, neckBase[1] + 6],
      [chest[0] + 54, chest[1] + 15],
      [pelvis[0] + 66, pelvis[1] + 10],
      [baseX + 94, skirtBottomY],
      [baseX - 94, skirtBottomY],
      [pelvis[0] - 66, pelvis[1] + 10],
      [chest[0] - 54, chest[1] + 15]
    ];
    drawHandColoredPolygon(ctx, dressPoly, frameIndex, "mamie-dress-body", {
      fillColor: PALETTE.mamieDress,
      hatchColor: PALETTE.mamieDressShade,
      hatchAlpha: 0.24,
      hatchSpacing: 13,
      strokeWidth: 4
    });
    const apronPoly = [
      [chest[0] + f * 10 - 24, chest[1] - 12],
      [chest[0] + f * 10 + 28, chest[1] - 12],
      [pelvis[0] + f * 12 + 54, pelvis[1] + 8],
      [baseX + f * 12 + 72, skirtBottomY - 22],
      [baseX + f * 12 - 64, skirtBottomY - 22],
      [pelvis[0] + f * 12 - 48, pelvis[1] + 8]
    ];
    drawHandColoredPolygon(ctx, apronPoly, frameIndex, "mamie-apron-unified", {
      fillColor: PALETTE.apronCream,
      hatchColor: PALETTE.apronShade,
      hatchAlpha: 0.2,
      strokeWidth: 3.6
    });
    drawPencilPolyline(
      ctx,
      [
        [chest[0] + f * 10 - 18, chest[1] - 12],
        [neckBase[0] - f * 8, neckBase[1] + 8]
      ],
      frameIndex,
      "mamie-apron-neck-strap",
      { width: 3.2 }
    );
    const bowX = pelvis[0] - f * 58;
    const bowY = pelvis[1] + 6;
    drawPencilPolyline(
      ctx,
      [
        [bowX, bowY],
        [bowX - f * 24, bowY + 34],
        [bowX - f * 12, bowY + 56]
      ],
      frameIndex,
      "mamie-apron-tie",
      { width: 3.2 }
    );
    const neckPoly = [
      [neckBase[0] - 17, neckBase[1] - 28],
      [neckBase[0] + 17, neckBase[1] - 28],
      [neckBase[0] + 20, neckBase[1] + 14],
      [neckBase[0] - 20, neckBase[1] + 14]
    ];
    drawHandColoredPolygon(ctx, neckPoly, frameIndex, "mamie-neck", {
      fillColor: PALETTE.skinWarm,
      strokeOutline: false,
      occludePaper: true
    });
    drawPencilPolyline(
      ctx,
      [
        [neckBase[0] - 17, neckBase[1] - 20],
        [neckBase[0] - 19, neckBase[1] + 10]
      ],
      frameIndex,
      "mamie-neck-left",
      { width: 3.4 }
    );
    drawPencilPolyline(
      ctx,
      [
        [neckBase[0] + 17, neckBase[1] - 20],
        [neckBase[0] + 19, neckBase[1] + 10]
      ],
      frameIndex,
      "mamie-neck-right",
      { width: 3.4 }
    );
    drawHandColoredPolygon(
      ctx,
      [
        [neckBase[0] - 28, neckBase[1] + 6],
        [neckBase[0], neckBase[1] + 18],
        [neckBase[0] + 28, neckBase[1] + 6],
        [neckBase[0] + 18, neckBase[1] + 22],
        [neckBase[0] - 18, neckBase[1] + 22]
      ],
      frameIndex,
      "mamie-collar",
      {
        fillColor: PALETTE.apronCream,
        strokeWidth: 3
      }
    );
    const hx = headCenter[0];
    const hy = headCenter[1];
    const headRx = 50;
    const headRy = 56;
    const fullHeadEllipse = sampleEllipseArc(hx, hy, headRx, headRy, 0, Math.PI * 2, 28, headPitchRad);
    drawHandColoredPolygon(ctx, fullHeadEllipse, frameIndex, "mamie-face-fill", {
      fillColor: PALETTE.skinWarm,
      hatchColor: PALETTE.skinShadow,
      hatchAlpha: 0.14,
      strokeOutline: false,
      // IMPORTANT : pas de contour complet pour ne laisser aucun trait sous les cheveux
      occludePaper: true
    });
    const jawArc = sampleEllipseArc(
      hx,
      hy,
      headRx,
      headRy,
      0.06 * Math.PI,
      0.94 * Math.PI,
      20,
      headPitchRad
    );
    drawPencilPolyline(ctx, jawArc, frameIndex, "mamie-jawline-only", {
      color: PALETTE.graphiteDark,
      width: 3.8,
      closed: false
    });
    const bunCenter = [hx - f * 38, hy - 48];
    const bunPts = sampleEllipseArc(bunCenter[0], bunCenter[1], 29, 27, 0, Math.PI * 2, 18);
    drawHandColoredPolygon(ctx, bunPts, frameIndex, "mamie-silver-bun", {
      fillColor: PALETTE.hairSilver,
      hatchColor: PALETTE.hairSilverShade,
      hatchAlpha: 0.28,
      strokeWidth: 3.6,
      occludePaper: true
    });
    drawPencilPolyline(
      ctx,
      [
        [bunCenter[0] - 12, bunCenter[1] + 18],
        [bunCenter[0] + 18, bunCenter[1] - 12]
      ],
      frameIndex,
      "mamie-bun-ribbon",
      { color: PALETTE.bunRibbon, width: 5.5, doublePass: false }
    );
    const hairCapPoly = [
      [hx - headRx * 1.04, hy + 4],
      // tempe gauche
      [hx - headRx * 1.08, hy - 28],
      [hx - headRx * 0.65, hy - headRy * 1.08],
      [hx, hy - headRy * 1.14],
      [hx + headRx * 0.68, hy - headRy * 1.06],
      [hx + headRx * 1.06, hy - 24],
      [hx + headRx * 1.02, hy + 4],
      // tempe droite
      // Frange souple sur le front (ondulation douce sans jamais croiser un trait de crâne)
      [hx + headRx * 0.55, hy - 14],
      [hx + f * 6, hy - 22],
      [hx - headRx * 0.55, hy - 12]
    ];
    drawHandColoredPolygon(ctx, hairCapPoly, frameIndex, "mamie-hair-crown", {
      fillColor: PALETTE.hairSilver,
      hatchColor: PALETTE.hairSilverShade,
      hatchAlpha: 0.28,
      strokeWidth: 3.8,
      occludePaper: true
    });
    drawPencilPolyline(
      ctx,
      [
        [hx - 28, hy - 34],
        [hx, hy - 44],
        [hx + 28, hy - 32]
      ],
      frameIndex,
      "mamie-hair-strand-1",
      { color: PALETTE.graphiteMid, width: 2.2, doublePass: false }
    );
    const cheekL = sampleEllipseArc(hx + f * 24, hy + 14, 11, 7, 0, Math.PI * 2, 10);
    drawHandColoredPolygon(ctx, cheekL, frameIndex, "mamie-cheek-front", {
      fillColor: PALETTE.cheeksRose,
      strokeOutline: false,
      occludePaper: false,
      colorOffsetScale: 2
    });
    const eyeFrontX = hx + f * 21;
    const eyeBackX = hx - f * 5;
    const eyeY = hy + 1;
    for (const [ex, tagEye] of [
      [eyeBackX, "back"],
      [eyeFrontX, "front"]
    ]) {
      const glassPts = sampleEllipseArc(ex, eyeY, 11.5, 10.5, 0, Math.PI * 2, 14);
      drawPencilPolyline(ctx, glassPts, frameIndex, `mamie-glasses-${tagEye}`, {
        color: PALETTE.glassesGold,
        width: 2.6,
        closed: true,
        doublePass: false
      });
      drawHandColoredPolygon(
        ctx,
        sampleEllipseArc(ex + f * 2, eyeY, 3.2, 3.6, 0, Math.PI * 2, 8),
        frameIndex,
        `mamie-pupil-${tagEye}`,
        {
          fillColor: PALETTE.graphiteDark,
          strokeOutline: false,
          occludePaper: false,
          colorOffsetScale: 0.5
        }
      );
      drawPencilPolyline(
        ctx,
        [
          [ex - 8, eyeY - 14],
          [ex, eyeY - 17],
          [ex + 8, eyeY - 13]
        ],
        frameIndex,
        `mamie-brow-${tagEye}`,
        { width: 2.4, doublePass: false }
      );
    }
    drawPencilPolyline(
      ctx,
      [
        [eyeBackX + f * 9, eyeY - 1],
        [eyeFrontX - f * 9, eyeY - 1]
      ],
      frameIndex,
      "mamie-glasses-bridge",
      { color: PALETTE.glassesGold, width: 2.5, doublePass: false }
    );
    drawPencilPolyline(
      ctx,
      [
        [hx + f * 12, eyeY + 3],
        [hx + f * 21, eyeY + 11],
        [hx + f * 12, eyeY + 14]
      ],
      frameIndex,
      "mamie-nose",
      { width: 2.8, doublePass: false }
    );
    if (expression === "calling") {
      const openMouth = sampleEllipseArc(hx + f * 14, hy + 28, 9, 11, 0, Math.PI * 2, 12);
      drawHandColoredPolygon(ctx, openMouth, frameIndex, "mamie-mouth-calling", {
        fillColor: "#A6463C",
        strokeWidth: 3
      });
      for (let w = 1; w <= 2; w++) {
        const rWave = 22 + w * 16 + frameIndex % 6 * 2;
        const waveArc = sampleEllipseArc(
          hx + f * 34,
          hy + 22,
          rWave,
          rWave,
          f === -1 ? Math.PI * 0.72 : -Math.PI * 0.28,
          f === -1 ? Math.PI * 1.28 : Math.PI * 0.28,
          10
        );
        drawPencilPolyline(ctx, waveArc, frameIndex, `mamie-voice-wave-${w}`, {
          color: PALETTE.bunRibbon,
          width: 2.8,
          doublePass: false
        });
      }
    } else {
      drawPencilPolyline(
        ctx,
        [
          [hx + f * 2, hy + 26],
          [hx + f * 13, hy + 33],
          [hx + f * 24, hy + 25]
        ],
        frameIndex,
        "mamie-smile",
        { width: 3.1, doublePass: false }
      );
    }
    const frontArmGeom = drawUnifiedLimb(
      ctx,
      frontShoulder,
      frontIK.mid,
      frontIK.end,
      46,
      38,
      28,
      frameIndex,
      "mamie-front-arm",
      {
        skinColor: PALETTE.skinWarm,
        garmentColor: PALETTE.mamieDress,
        garmentHatchColor: PALETTE.mamieDressShade,
        garmentSplitRatio: 0.56,
        cuffColor: "#7A96B0",
        strokeWidth: 4
      }
    );
    const frontPalm = drawSeamlessHand(ctx, frameIndex, frontArmGeom, "mamie-front-hand", {
      scale: 1.04,
      skinColor: PALETTE.skinWarm,
      mode: frontHandMode
    });
    return {
      leftPalm: f === -1 ? frontPalm : backPalm,
      rightPalm: f === -1 ? backPalm : frontPalm,
      headCenter
    };
  }
  function drawChildCharacter(ctx, frameIndex, pose) {
    const {
      character,
      mode,
      pos,
      scale = 1,
      facing,
      runCycleRad = 0,
      feetSwingRad = 0,
      torsoLeanRad = 0,
      leftHandTarget = null,
      rightHandTarget = null,
      leftHandMode = "open",
      rightHandMode = "open",
      hasCreamOnFinger = false,
      hasCreamOnCheek = false,
      isGiggling = false,
      layerPart = "all"
    } = pose;
    const isLeo = character === "leo";
    const f = facing >= 0 ? 1 : -1;
    const tagPrefix = `${character}-${mode}`;
    const shirtColor = isLeo ? PALETTE.leoShirtAmber : PALETTE.claraShirtPink;
    const bottomColor = isLeo ? PALETTE.leoShortsBlue : PALETTE.claraDressSage;
    const shoeColor = isLeo ? PALETTE.leoShoesRed : PALETTE.claraShoesYellow;
    const hairColor = isLeo ? PALETTE.leoHair : PALETTE.claraHair;
    const bounceY = mode === "running" ? Math.abs(Math.sin(runCycleRad)) * 14 * scale : isGiggling ? Math.abs(Math.sin(frameIndex * 0.65)) * 4 * scale : 0;
    const pelvis = mode === "running" ? [pos[0], pos[1] - 195 * scale - bounceY] : [pos[0], pos[1] - 88 * scale];
    const torsoH = 116 * scale;
    const chest = [
      pelvis[0] + Math.sin(torsoLeanRad) * torsoH,
      pelvis[1] - Math.cos(torsoLeanRad) * torsoH - bounceY * 0.3
    ];
    const neckBase = [
      chest[0] + Math.sin(torsoLeanRad) * 32 * scale,
      chest[1] - Math.cos(torsoLeanRad) * 32 * scale
    ];
    const headCenter = [
      neckBase[0] + f * 5 * scale,
      neckBase[1] - 46 * scale
    ];
    if (layerPart !== "upper") {
      if (mode === "seated") {
        const leftHip = [pos[0] - 20 * scale, pos[1] - 22 * scale];
        const rightHip = [pos[0] + 18 * scale, pos[1] - 22 * scale];
        const leftKnee = [pos[0] - 22 * scale, pos[1] + 6 * scale];
        const rightKnee = [pos[0] + 20 * scale, pos[1] + 6 * scale];
        const shinLen = 112 * scale;
        const swingL = feetSwingRad;
        const swingR = -feetSwingRad;
        const leftAnkle = [
          leftKnee[0] + Math.sin(swingL) * shinLen * 0.85,
          leftKnee[1] + Math.cos(swingL) * shinLen
        ];
        const rightAnkle = [
          rightKnee[0] + Math.sin(swingR) * shinLen * 0.85,
          rightKnee[1] + Math.cos(swingR) * shinLen
        ];
        drawUnifiedLimb(
          ctx,
          leftHip,
          leftKnee,
          leftAnkle,
          30 * scale,
          25 * scale,
          19 * scale,
          frameIndex,
          `${tagPrefix}-seated-leg-L`,
          {
            skinColor: PALETTE.skinShadow,
            garmentColor: bottomColor,
            garmentSplitRatio: 0.36,
            cuffColor: "#FFFFFF",
            strokeWidth: 3.5 * Math.max(0.75, scale)
          }
        );
        drawSeamlessShoe(
          ctx,
          frameIndex,
          leftAnkle,
          1,
          swingL * 0.45,
          shoeColor,
          "#4A3528",
          0.86 * scale,
          `${tagPrefix}-shoe-L`
        );
        drawUnifiedLimb(
          ctx,
          rightHip,
          rightKnee,
          rightAnkle,
          30 * scale,
          25 * scale,
          19 * scale,
          frameIndex,
          `${tagPrefix}-seated-leg-R`,
          {
            skinColor: PALETTE.skinWarm,
            garmentColor: bottomColor,
            garmentSplitRatio: 0.36,
            cuffColor: "#FFFFFF",
            strokeWidth: 3.5 * Math.max(0.75, scale)
          }
        );
        drawSeamlessShoe(
          ctx,
          frameIndex,
          rightAnkle,
          1,
          swingR * 0.45,
          shoeColor,
          "#4A3528",
          0.86 * scale,
          `${tagPrefix}-shoe-R`
        );
      } else {
        const shadowPts = sampleEllipseArc(pos[0], pos[1] + 6 * scale, 48 * scale, 12 * scale, 0, Math.PI * 2, 14);
        ctx.save();
        ctx.fillStyle = "rgba(65, 82, 42, 0.18)";
        ctx.beginPath();
        shadowPts.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        const thighLen = 96 * scale;
        const shinLen = 96 * scale;
        const strideX = 56 * scale;
        const liftY = 38 * scale;
        for (const [isFrontLeg, phaseOffset, legSuffix] of [
          [false, Math.PI, "back"],
          [true, 0, "front"]
        ]) {
          const a = runCycleRad + phaseOffset;
          const hipPt = [pelvis[0] + (isFrontLeg ? f * 6 : -f * 6) * scale, pelvis[1]];
          const targetAnkle = [
            pos[0] + Math.sin(a) * strideX * f,
            pos[1] - 12 * scale - Math.max(0, -Math.cos(a)) * liftY
          ];
          const kneePole = [hipPt[0] + f * 130 * scale, hipPt[1] + 20 * scale];
          const legIK = solveTwoBoneIK(hipPt, targetAnkle, thighLen, shinLen, kneePole);
          drawUnifiedLimb(
            ctx,
            hipPt,
            legIK.mid,
            legIK.end,
            30 * scale,
            24 * scale,
            18 * scale,
            frameIndex,
            `${tagPrefix}-run-leg-${legSuffix}`,
            {
              skinColor: isFrontLeg ? PALETTE.skinWarm : PALETTE.skinShadow,
              garmentColor: bottomColor,
              garmentSplitRatio: 0.44,
              strokeWidth: 3.4 * Math.max(0.7, scale)
            }
          );
          drawSeamlessShoe(
            ctx,
            frameIndex,
            legIK.end,
            f,
            Math.sin(a) * 0.25,
            shoeColor,
            "#4A3528",
            0.84 * scale,
            `${tagPrefix}-run-shoe-${legSuffix}`
          );
        }
      }
    }
    if (layerPart === "lower") {
      return { rightFingertip: headCenter, headCenter };
    }
    const backShoulder = [chest[0] - f * 22 * scale, chest[1] - 10 * scale];
    const frontShoulder = [chest[0] + f * 20 * scale, chest[1] - 8 * scale];
    const defaultSwing = mode === "running" ? Math.sin(runCycleRad) * 42 * scale : 0;
    const resolvedLeftTarget = leftHandTarget || [
      chest[0] - 32 * scale - defaultSwing,
      chest[1] + 54 * scale
    ];
    const resolvedRightTarget = rightHandTarget || [
      chest[0] + 34 * scale + defaultSwing,
      chest[1] + 54 * scale
    ];
    const uArm = 76 * scale;
    const fArm = 74 * scale;
    const leftElbowPole = [backShoulder[0] - 55 * scale, backShoulder[1] + 90 * scale];
    const rightElbowPole = [frontShoulder[0] - f * 50 * scale, frontShoulder[1] + 95 * scale];
    const leftIK = solveTwoBoneIK(backShoulder, resolvedLeftTarget, uArm, fArm, leftElbowPole);
    const rightIK = solveTwoBoneIK(frontShoulder, resolvedRightTarget, uArm, fArm, rightElbowPole);
    const leftArmGeom = drawUnifiedLimb(
      ctx,
      backShoulder,
      leftIK.mid,
      leftIK.end,
      29 * scale,
      24 * scale,
      19 * scale,
      frameIndex,
      `${tagPrefix}-arm-L`,
      {
        skinColor: PALETTE.skinShadow,
        garmentColor: shirtColor,
        garmentSplitRatio: 0.38,
        strokeWidth: 3.4 * Math.max(0.7, scale)
      }
    );
    drawSeamlessHand(ctx, frameIndex, leftArmGeom, `${tagPrefix}-hand-L`, {
      scale: 0.82 * scale,
      skinColor: PALETTE.skinShadow,
      mode: leftHandMode
    });
    const torsoPoly = [
      [neckBase[0] - 20 * scale, neckBase[1] + 4 * scale],
      [neckBase[0] + 20 * scale, neckBase[1] + 4 * scale],
      [chest[0] + 38 * scale, chest[1] + 10 * scale],
      [pelvis[0] + 42 * scale, pelvis[1] + 12 * scale],
      [pelvis[0] - 42 * scale, pelvis[1] + 12 * scale],
      [chest[0] - 38 * scale, chest[1] + 10 * scale]
    ];
    drawHandColoredPolygon(ctx, torsoPoly, frameIndex, `${tagPrefix}-torso`, {
      fillColor: isLeo ? shirtColor : bottomColor,
      hatchColor: isLeo ? "#C47B28" : "#567B5E",
      hatchAlpha: 0.24,
      strokeWidth: 3.6 * Math.max(0.7, scale)
    });
    if (isLeo) {
      for (const ry of [0.32, 0.56, 0.78]) {
        const sy = lerp(neckBase[1] + 10 * scale, pelvis[1], ry);
        drawPencilPolyline(
          ctx,
          [
            [chest[0] - 32 * scale, sy],
            [chest[0] + 32 * scale, sy]
          ],
          frameIndex,
          `${tagPrefix}-stripe-${ry}`,
          {
            color: PALETTE.leoShirtStripe,
            width: 4.2 * scale,
            doublePass: false
          }
        );
      }
    } else {
      drawPencilPolyline(
        ctx,
        [
          [neckBase[0] - 14 * scale, neckBase[1] + 8 * scale],
          [chest[0] - 16 * scale, chest[1] + 34 * scale]
        ],
        frameIndex,
        `${tagPrefix}-strap-L`,
        { color: PALETTE.graphiteDark, width: 2.8 * scale }
      );
      drawPencilPolyline(
        ctx,
        [
          [neckBase[0] + 14 * scale, neckBase[1] + 8 * scale],
          [chest[0] + 16 * scale, chest[1] + 34 * scale]
        ],
        frameIndex,
        `${tagPrefix}-strap-R`,
        { color: PALETTE.graphiteDark, width: 2.8 * scale }
      );
    }
    const neckPoly = [
      [neckBase[0] - 12 * scale, neckBase[1] - 18 * scale],
      [neckBase[0] + 12 * scale, neckBase[1] - 18 * scale],
      [neckBase[0] + 14 * scale, neckBase[1] + 8 * scale],
      [neckBase[0] - 14 * scale, neckBase[1] + 8 * scale]
    ];
    drawHandColoredPolygon(ctx, neckPoly, frameIndex, `${tagPrefix}-neck`, {
      fillColor: PALETTE.skinWarm,
      strokeOutline: false,
      occludePaper: true
    });
    const hx = headCenter[0];
    const hy = headCenter[1];
    const hrx = 40 * scale;
    const hry = 43 * scale;
    const headFull = sampleEllipseArc(hx, hy, hrx, hry, 0, Math.PI * 2, 24);
    drawHandColoredPolygon(ctx, headFull, frameIndex, `${tagPrefix}-face-fill`, {
      fillColor: PALETTE.skinWarm,
      hatchColor: PALETTE.skinShadow,
      hatchAlpha: 0.14,
      strokeOutline: false,
      occludePaper: true
    });
    const childJawArc = sampleEllipseArc(hx, hy, hrx, hry, 0.07 * Math.PI, 0.93 * Math.PI, 18);
    drawPencilPolyline(ctx, childJawArc, frameIndex, `${tagPrefix}-jawline-only`, {
      color: PALETTE.graphiteDark,
      width: 3.5 * Math.max(0.7, scale),
      closed: false
    });
    if (isLeo) {
      const leoHairPoly = [
        [hx - hrx * 1.04, hy + 2 * scale],
        [hx - hrx * 1.1, hy - 22 * scale],
        [hx - hrx * 0.72, hy - hry * 1.16],
        [hx - 4 * scale, hy - hry * 1.24],
        [hx + hrx * 0.45, hy - hry * 1.18],
        [hx + hrx * 0.95, hy - hry * 0.92],
        [hx + hrx * 1.06, hy - 14 * scale],
        [hx + hrx * 1, hy + 2 * scale],
        // Frange ébouriffée sur le front
        [hx + hrx * 0.45, hy - 12 * scale],
        [hx + 4 * scale, hy - 8 * scale],
        [hx - hrx * 0.45, hy - 14 * scale]
      ];
      drawHandColoredPolygon(ctx, leoHairPoly, frameIndex, `${tagPrefix}-leo-hair`, {
        fillColor: hairColor,
        hatchColor: "#482B16",
        hatchAlpha: 0.28,
        strokeWidth: 3.5 * Math.max(0.7, scale),
        occludePaper: true
      });
    } else {
      const pigtailBounce = Math.sin(frameIndex * 0.45) * 6 * scale;
      for (const side of [-1, 1]) {
        const px = hx + side * (hrx + 15 * scale);
        const py = hy - 14 * scale + pigtailBounce * side;
        const tailPts = sampleEllipseArc(px, py, 18 * scale, 24 * scale, 0, Math.PI * 2, 14, side * 0.35);
        drawHandColoredPolygon(ctx, tailPts, frameIndex, `${tagPrefix}-pigtail-${side}`, {
          fillColor: hairColor,
          hatchColor: "#3B2212",
          strokeWidth: 3.2 * Math.max(0.7, scale),
          occludePaper: true
        });
        drawHandColoredPolygon(
          ctx,
          sampleEllipseArc(hx + side * (hrx - 2 * scale), hy - 18 * scale, 7 * scale, 7 * scale, 0, Math.PI * 2, 10),
          frameIndex,
          `${tagPrefix}-ribbon-${side}`,
          { fillColor: PALETTE.claraRibbon, strokeWidth: 2.4 * scale }
        );
      }
      const claraHairCap = [
        [hx - hrx * 1.02, hy + 2 * scale],
        [hx - hrx * 1.05, hy - 24 * scale],
        [hx - hrx * 0.6, hy - hry * 1.1],
        [hx, hy - hry * 1.15],
        [hx + hrx * 0.6, hy - hry * 1.1],
        [hx + hrx * 1.05, hy - 24 * scale],
        [hx + hrx * 1.02, hy + 2 * scale],
        [hx + hrx * 0.45, hy - 12 * scale],
        [hx, hy - 18 * scale],
        [hx - hrx * 0.45, hy - 12 * scale]
      ];
      drawHandColoredPolygon(ctx, claraHairCap, frameIndex, `${tagPrefix}-clara-hair-cap`, {
        fillColor: hairColor,
        hatchColor: "#3B2212",
        hatchAlpha: 0.28,
        strokeWidth: 3.5 * Math.max(0.7, scale),
        occludePaper: true
      });
    }
    const eyeY = hy + 2 * scale;
    for (const ex of [hx - 12 * scale, hx + 14 * scale]) {
      if (isGiggling) {
        drawPencilPolyline(
          ctx,
          [
            [ex - 6 * scale, eyeY + 2 * scale],
            [ex, eyeY - 4 * scale],
            [ex + 6 * scale, eyeY + 2 * scale]
          ],
          frameIndex,
          `${tagPrefix}-laugh-eye-${ex}`,
          { width: 2.8 * scale, doublePass: false }
        );
      } else {
        drawHandColoredPolygon(
          ctx,
          sampleEllipseArc(ex, eyeY, 3.4 * scale, 4 * scale, 0, Math.PI * 2, 8),
          frameIndex,
          `${tagPrefix}-eye-${ex}`,
          {
            fillColor: PALETTE.graphiteDark,
            strokeOutline: false,
            occludePaper: false,
            colorOffsetScale: 0.4
          }
        );
      }
    }
    drawHandColoredPolygon(
      ctx,
      sampleEllipseArc(hx + 20 * scale, hy + 13 * scale, 8 * scale, 5 * scale, 0, Math.PI * 2, 8),
      frameIndex,
      `${tagPrefix}-cheek-R`,
      { fillColor: PALETTE.cheeksRose, strokeOutline: false, occludePaper: false }
    );
    if (hasCreamOnCheek) {
      drawHandColoredPolygon(
        ctx,
        sampleEllipseArc(hx + 22 * scale, hy + 19 * scale, 6.5 * scale, 5 * scale, 0, Math.PI * 2, 10),
        frameIndex,
        `${tagPrefix}-cheek-cream-spot`,
        {
          fillColor: PALETTE.cakeIcing,
          strokeWidth: 2 * scale,
          colorOffsetScale: 1.2
        }
      );
    }
    drawPencilPolyline(
      ctx,
      [
        [hx - 9 * scale, hy + 19 * scale],
        [hx + 2 * scale, hy + 26 * scale],
        [hx + 13 * scale, hy + 18 * scale]
      ],
      frameIndex,
      `${tagPrefix}-smile`,
      { width: 2.9 * Math.max(0.7, scale), doublePass: false }
    );
    const rightArmGeom = drawUnifiedLimb(
      ctx,
      frontShoulder,
      rightIK.mid,
      rightIK.end,
      30 * scale,
      25 * scale,
      19 * scale,
      frameIndex,
      `${tagPrefix}-arm-R`,
      {
        skinColor: PALETTE.skinWarm,
        garmentColor: shirtColor,
        garmentSplitRatio: 0.38,
        strokeWidth: 3.6 * Math.max(0.7, scale)
      }
    );
    const rightFingertip = drawSeamlessHand(ctx, frameIndex, rightArmGeom, `${tagPrefix}-hand-R`, {
      scale: 0.86 * scale,
      skinColor: PALETTE.skinWarm,
      mode: rightHandMode,
      pointTarget: rightHandMode === "point" ? resolvedRightTarget : null,
      hasCreamDab: hasCreamOnFinger
    });
    return { rightFingertip, headCenter };
  }

  // src/animation/scenes.ts
  function drawHandwrittenCallBanner(ctx, frameIndex, alpha) {
    if (alpha <= 0.02) return;
    ctx.save();
    ctx.globalAlpha = clamp(alpha, 0, 1);
    const bx = 435;
    const by = 715;
    const bw = 340;
    const bh = 74;
    const bubblePts = [
      [bx - bw * 0.5, by - bh * 0.5],
      [bx + bw * 0.5, by - bh * 0.5],
      [bx + bw * 0.5 + 8, by + bh * 0.5],
      [bx + 95, by + bh * 0.5],
      [bx + 145, by + bh * 0.5 + 34],
      // flèche de bulle pointant vers Mamie
      [bx + 55, by + bh * 0.5],
      [bx - bw * 0.5 - 6, by + bh * 0.5]
    ];
    drawHandColoredPolygon(ctx, bubblePts, frameIndex, "call-speech-bubble", {
      fillColor: "#FFFDF7",
      hatchColor: "#EFE3CE",
      hatchAlpha: 0.2,
      strokeWidth: 3.4
    });
    ctx.fillStyle = PALETTE.graphiteDark;
    ctx.font = "italic bold 28px Georgia, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("\xAB \xC0 table les enfants ! \xBB", bx, by);
    ctx.restore();
  }
  function renderSceneFrame(ctx, frameIndex, width = FILM_CONFIG.width, height = FILM_CONFIG.height) {
    const f = clamp(Math.floor(frameIndex), 0, FILM_CONFIG.totalFrames - 1);
    drawPaperBackground(ctx, width, height, f);
    let ovenDoorAngle = 0;
    if (f >= 48 && f <= 70) {
      if (f < 54) ovenDoorAngle = lerp(0, 74, easeInOutCubic((f - 48) / 6));
      else if (f <= 63) ovenDoorAngle = 74;
      else ovenDoorAngle = lerp(74, 0, easeInOutCubic((f - 63) / 7));
    } else if (f >= 73 && f <= 94) {
      if (f < 78) ovenDoorAngle = lerp(0, 74, easeInOutCubic((f - 73) / 5));
      else if (f <= 88) ovenDoorAngle = 74;
      else ovenDoorAngle = lerp(74, 0, easeInOutCubic((f - 88) / 6));
    }
    let ovenGlow = 0.1;
    if (f >= 58 && f <= 92) {
      ovenGlow = f <= 78 ? smoothstep(58, 68, f) * 0.95 : lerp(0.95, 0.2, smoothstep(78, 92, f));
    }
    drawKitchenAndGardenBackdrop(ctx, f, ovenGlow);
    const gardenGroundY = 748;
    let ballX = 330;
    let ballY = gardenGroundY - 19;
    let ballSquash = 1;
    if (f < 96) {
      const passPhase = f / 22 * Math.PI;
      const bounceSin = Math.abs(Math.sin(passPhase));
      ballX = lerp(248, 455, (Math.sin(f * 0.14) + 1) * 0.5);
      ballY = gardenGroundY - 19 - bounceSin * 95;
      if (bounceSin < 0.15) {
        ballSquash = 1.18;
      }
    } else {
      const rollT = smoothstep(96, 118, f);
      const dampBounce = Math.abs(Math.sin((f - 96) * 0.35)) * (1 - rollT) * 32;
      ballX = lerp(310, 198, rollT);
      ballY = gardenGroundY - 19 - dampBounce;
    }
    drawGardenBall(ctx, f, ballX, ballY, gardenGroundY, 17, ballSquash);
    if (f < 128) {
      if (f < 100) {
        const gardenMove = Math.sin(f * 0.08) * 36;
        drawChildCharacter(ctx, f, {
          character: "clara",
          mode: "running",
          pos: [455 - gardenMove, 742],
          scale: 0.48,
          facing: Math.cos(f * 0.08) >= 0 ? -1 : 1,
          runCycleRad: f * 0.48
        });
        drawChildCharacter(ctx, f, {
          character: "leo",
          mode: "running",
          pos: [262 + gardenMove, 752],
          scale: 0.5,
          facing: Math.cos(f * 0.08) >= 0 ? 1 : -1,
          runCycleRad: f * 0.52 + 1.2
        });
      } else {
        const runClaraT = easeInOutCubic(clamp((f - 100) / 26, 0, 1));
        const claraPos = lerpPt([385, 755], [242, 1286], runClaraT);
        const claraScale = lerp(0.5, 0.92, runClaraT);
        const runLeoT = easeInOutCubic(clamp((f - 102) / 25, 0, 1));
        const leoPos = lerpPt([310, 765], [438, 1286], runLeoT);
        const leoScale = lerp(0.52, 0.94, runLeoT);
        drawChildCharacter(ctx, f, {
          character: "clara",
          mode: "running",
          pos: claraPos,
          scale: claraScale,
          facing: -1,
          runCycleRad: f * 0.68
        });
        drawChildCharacter(ctx, f, {
          character: "leo",
          mode: "running",
          pos: leoPos,
          scale: leoScale,
          facing: 1,
          runCycleRad: f * 0.68 + Math.PI * 0.5
        });
      }
    }
    if (f >= 46) {
      const settleT = smoothstep(46, 49, f);
      const bowlCounterPos = lerpPt([718, 1020], [728, 754], settleT);
      const bowlScale = lerp(0.92, 0.72, settleT);
      const bAnchors = drawMixingBowl3D(ctx, f, bowlCounterPos[0], bowlCounterPos[1], {
        scale: bowlScale,
        tiltRad: 0,
        batterFill: 0.1
      });
      drawWhiskProp(
        ctx,
        f,
        [bowlCounterPos[0] + 22, bowlCounterPos[1] - 28],
        bAnchors.batterCenter,
        bowlScale
      );
    }
    if (f < 150) {
      drawDessertPlateWithSlice(ctx, f, 876, 758, false, "counter-plate-bottom", 0.82);
      if (f < 144) {
        drawDessertPlateWithSlice(ctx, f, 876, 750, false, "counter-plate-top", 0.82);
      }
    }
    let ovenPanAnchors = getCakePanAnchors(852, 976, 0.84);
    if (f >= 58 && f <= 83) {
      const inOvenT = f <= 62 ? smoothstep(58, 62, f) : f >= 79 ? 1 - smoothstep(79, 83, f) : 1;
      const panPos = lerpPt([775, 1025], [852, 976], inOvenT);
      const bakeProgress = smoothstep(62, 77, f);
      ovenPanAnchors = drawCakeAndPan3D(ctx, f, panPos[0], panPos[1], {
        scale: 0.84,
        batterLevel: 0.88,
        bakeDome: bakeProgress,
        decorated: f >= 74,
        steamAmount: f >= 76 ? 0.5 : 0
      });
    }
    drawOvenDoor3D(ctx, f, ovenDoorAngle, ovenGlow);
    const ovenDoorGeom = getOvenDoorGeometry(ovenDoorAngle);
    drawChildrenChairsBackAndSeat(ctx, f);
    const feetSwingAngle = Math.sin((f - 128) * 0.44) * 0.44;
    const claraFeetSwing = f >= 138 && f <= 153 ? Math.sin((f - 128) * 0.62) * 0.52 : feetSwingAngle * 0.92;
    if (f >= 128) {
      drawChildCharacter(ctx, f, {
        character: "clara",
        mode: "seated",
        pos: [242, 1286],
        scale: 0.92,
        facing: 1,
        feetSwingRad: claraFeetSwing,
        layerPart: "lower"
      });
      drawChildCharacter(ctx, f, {
        character: "leo",
        mode: "seated",
        pos: [438, 1286],
        scale: 0.94,
        facing: 1,
        feetSwingRad: -feetSwingAngle,
        layerPart: "lower"
      });
    }
    const tableBowlPos = f < 32 ? [648, 1170] : [
      lerp(648, 712, smoothstep(32, 38, f)),
      lerp(1170, 1082, smoothstep(32, 38, f))
    ];
    const tableBowlTilt = f >= 32 && f <= 45 ? Math.sin(smoothstep(32, 37, f) * Math.PI * 0.5) * 0.56 : 0;
    const previewBowlAnchors = getMixingBowlAnchors(tableBowlPos[0], tableBowlPos[1], 1, tableBowlTilt);
    let activeCakePos = [792, 1172];
    let activeCakeScale = 1;
    if (f >= 54 && f < 58) {
      const tIn = (f - 54) / 4;
      activeCakePos = lerpPt([792, 1172], [775, 1025], tIn);
      activeCakeScale = lerp(1, 0.86, tIn);
    } else if (f > 83 && f <= 93) {
      const tOut = easeInOutCubic((f - 83) / 10);
      activeCakePos = lerpPt([775, 1025], [582, 1176], tOut);
      activeCakeScale = lerp(0.86, 1.06, tOut);
    } else if (f > 93) {
      activeCakePos = [582, 1176];
      activeCakeScale = 1.06;
    }
    const activeCakeAnchors = getCakePanAnchors(activeCakePos[0], activeCakePos[1], activeCakeScale);
    let mamieFoot = [748, 1568];
    let mamieFacing = -1;
    let mamieLean = 0.04;
    let mamieLeftTarget = previewBowlAnchors.leftRim;
    let mamieRightTarget = [652, 1108];
    let mamieLeftMode = "grip";
    let mamieRightMode = "grip";
    let mamieExpression = "smile";
    let mamieStepPhase = 0;
    const whiskOrbitAngle = f * 0.58;
    const whiskGripPt = [
      previewBowlAnchors.batterCenter[0] + Math.cos(whiskOrbitAngle) * 20 + 8,
      previewBowlAnchors.batterCenter[1] - 58 + Math.sin(whiskOrbitAngle) * 10
    ];
    if (f <= 31) {
      mamieFacing = -1;
      mamieLeftTarget = previewBowlAnchors.leftRim;
      mamieRightTarget = whiskGripPt;
      mamieExpression = "concentrated";
    } else if (f <= 45) {
      mamieFacing = -1;
      mamieLean = 0.08;
      mamieLeftTarget = previewBowlAnchors.leftRim;
      mamieRightTarget = previewBowlAnchors.rightRim;
      mamieExpression = "concentrated";
    } else if (f <= 47) {
      mamieFacing = 1;
      mamieLeftTarget = [710, 756];
      mamieRightTarget = [748, 756];
    } else if (f <= 54) {
      mamieFacing = 1;
      mamieFoot = [740, 1568];
      mamieLeftTarget = activeCakeAnchors.leftHandle;
      mamieRightTarget = ovenDoorGeom.handleCenter;
    } else if (f <= 62) {
      mamieFacing = 1;
      mamieFoot = [742, 1568];
      mamieLean = 0.14;
      const panRef = f < 58 ? activeCakeAnchors : ovenPanAnchors;
      mamieLeftTarget = panRef.leftHandle;
      mamieRightTarget = panRef.rightHandle;
    } else if (f <= 71) {
      mamieFacing = 1;
      mamieFoot = [738, 1568];
      mamieLeftTarget = [705, 1115];
      mamieRightTarget = ovenDoorGeom.handleCenter;
      mamieExpression = "smile";
    } else if (f <= 77) {
      mamieFacing = 1;
      mamieFoot = [738, 1568];
      mamieLeftMode = "mitt";
      mamieRightMode = "mitt";
      mamieLeftTarget = [735, 1020];
      mamieRightTarget = ovenDoorGeom.handleCenter;
    } else if (f <= 93) {
      const tTurn = smoothstep(83, 91, f);
      mamieFacing = tTurn > 0.45 ? -1 : 1;
      mamieFoot = [lerp(738, 725, tTurn), 1568];
      mamieLeftMode = "mitt";
      mamieRightMode = "mitt";
      const panRef = f <= 83 ? ovenPanAnchors : activeCakeAnchors;
      mamieLeftTarget = panRef.leftHandle;
      mamieRightTarget = panRef.rightHandle;
      mamieExpression = "joyful";
    } else if (f <= 107) {
      mamieFacing = -1;
      mamieFoot = [725, 1568];
      mamieLeftMode = "cup-mouth";
      mamieRightMode = "open";
      mamieLeftTarget = [682, 912];
      mamieRightTarget = [615, 1135];
      mamieExpression = "calling";
    } else if (f <= 135) {
      mamieFacing = -1;
      mamieFoot = [735, 1568];
      mamieLeftMode = "open";
      mamieRightMode = "open";
      mamieLeftTarget = [648, 1085 - Math.sin(f * 0.3) * 14];
      mamieRightTarget = [705, 1110];
      mamieExpression = "joyful";
    } else if (f <= 153) {
      mamieFacing = 1;
      mamieFoot = [756, 1568];
      mamieLean = 0.08;
      mamieStepPhase = (f - 136) * 0.35;
      mamieLeftTarget = [848, 756];
      mamieRightTarget = [892, 754];
      mamieExpression = "smile";
    } else if (f <= 160) {
      mamieFacing = -1;
      mamieFoot = [715, 1568];
      const placeT = smoothstep(154, 160, f);
      mamieLeftTarget = lerpPt([640, 1080], [452, 1175], placeT);
      mamieRightTarget = [635, 1135];
      mamieExpression = "smile";
    } else if (f <= 173) {
      mamieFacing = -1;
      mamieFoot = [708, 1568];
      mamieLean = 0.09;
      if (f <= 167) {
        const serveClaraT = smoothstep(161, 167, f);
        mamieLeftTarget = lerpPt([565, 1142], [275, 1168], Math.sin(serveClaraT * Math.PI));
        mamieRightTarget = [625, 1152];
      } else {
        const serveLeoT = smoothstep(168, 173, f);
        mamieLeftTarget = lerpPt([565, 1142], [448, 1168], Math.sin(serveLeoT * Math.PI));
        mamieRightTarget = [625, 1152];
      }
      mamieExpression = "joyful";
    } else {
      mamieFacing = -1;
      mamieFoot = [716, 1568];
      mamieLeftMode = "open";
      mamieRightMode = "open";
      mamieLeftTarget = [632, 1132];
      mamieRightTarget = [722, 1128];
      mamieExpression = "joyful";
    }
    drawMamieColette(ctx, f, {
      footCenter: mamieFoot,
      facing: mamieFacing,
      bodyLeanRad: mamieLean,
      leftHandTarget: mamieLeftTarget,
      rightHandTarget: mamieRightTarget,
      leftHandMode: mamieLeftMode,
      rightHandMode: mamieRightMode,
      expression: mamieExpression,
      stepPhase: mamieStepPhase
    });
    drawFamilyTable3D(ctx, f);
    if (f >= 128) {
      let leoLean = 0.04;
      let leoRightHandTarget = [476, 1168];
      let leoRightMode = "open";
      let leoFingerCream = false;
      if (f >= 138 && f <= 145) {
        const reachT = easeInOutCubic(clamp((f - 138) / 5, 0, 1));
        leoLean = lerp(0.04, 0.28, reachT);
        leoRightMode = "point";
        leoRightHandTarget = lerpPt([476, 1168], activeCakeAnchors.leoTasteSpot, reachT);
        leoFingerCream = f >= 142;
      } else if (f >= 146 && f <= 153) {
        const tasteT = easeInOutCubic(clamp((f - 146) / 4, 0, 1));
        leoLean = lerp(0.28, 0.06, tasteT);
        leoRightMode = "point";
        leoRightHandTarget = lerpPt(activeCakeAnchors.leoTasteSpot, [454, 1024], tasteT);
        leoFingerCream = true;
      }
      const claraGiggling = f >= 139 && f <= 154;
      const claraLeftTarget = claraGiggling ? [248, 1022] : [205, 1168];
      const claraRightTarget = claraGiggling ? [325, 1068] : [278, 1172];
      drawChildCharacter(ctx, f, {
        character: "clara",
        mode: "seated",
        pos: [242, 1286],
        scale: 0.92,
        facing: 1,
        feetSwingRad: claraFeetSwing,
        leftHandTarget: claraLeftTarget,
        rightHandTarget: claraRightTarget,
        leftHandMode: claraGiggling ? "cup-mouth" : "open",
        rightHandMode: claraGiggling ? "point" : "open",
        isGiggling: claraGiggling,
        layerPart: "upper"
      });
      drawChildCharacter(ctx, f, {
        character: "leo",
        mode: "seated",
        pos: [438, 1286],
        scale: 0.94,
        facing: 1,
        feetSwingRad: -feetSwingAngle,
        torsoLeanRad: leoLean,
        leftHandTarget: [398, 1172],
        rightHandTarget: leoRightHandTarget,
        leftHandMode: "open",
        rightHandMode: leoRightMode,
        hasCreamOnFinger: leoFingerCream,
        hasCreamOnCheek: f >= 147,
        // Trace de crème sur la joue de Léo après avoir goûté !
        layerPart: "upper"
      });
    }
    if (f <= 45) {
      const isPouring = f >= 33 && f <= 43;
      const pourProgress = clamp((f - 33) / 10, 0, 1);
      const batterRemaining = isPouring ? lerp(0.84, 0.14, pourProgress) : f > 43 ? 0.12 : 0.84;
      drawMixingBowl3D(ctx, f, tableBowlPos[0], tableBowlPos[1], {
        scale: 1,
        tiltRad: tableBowlTilt,
        batterFill: batterRemaining,
        pouringTo: isPouring ? [792, 1164] : null,
        pouringStrength: isPouring ? Math.sin(pourProgress * Math.PI) : 0
      });
      if (f <= 31) {
        drawWhiskProp(ctx, f, whiskGripPt, previewBowlAnchors.batterCenter, 1);
      }
    }
    if (f < 58 || f > 83) {
      const batterLvl = f < 33 ? 0.12 : f <= 44 ? lerp(0.12, 0.88, (f - 33) / 11) : 0.88;
      const isBaked = f > 83;
      const slicesCut = f >= 170 ? 2 : f >= 163 ? 1 : 0;
      drawCakeAndPan3D(ctx, f, activeCakePos[0], activeCakePos[1], {
        scale: activeCakeScale,
        batterLevel: batterLvl,
        bakeDome: isBaked ? 1 : 0,
        decorated: isBaked,
        steamAmount: isBaked ? clamp(1 - (f - 84) / 95, 0.25, 1) : 0,
        slicesRemoved: slicesCut
      });
    }
    if (f >= 156) {
      const claraHasSlice = f >= 164;
      const leoHasSlice = f >= 171;
      drawDessertPlateWithSlice(ctx, f, 246, 1188, claraHasSlice, "table-plate-clara", 0.95);
      drawDessertPlateWithSlice(ctx, f, 438, 1188, leoHasSlice, "table-plate-leo", 0.95);
    }
    if (f >= 160 && f <= 173) {
      drawPencilPolyline(
        ctx,
        [
          mamieLeftTarget,
          [mamieLeftTarget[0] - 28, mamieLeftTarget[1] + 12]
        ],
        f,
        "cake-server-blade",
        {
          color: PALETTE.panMetal,
          width: 5,
          doublePass: false
        }
      );
    }
    if (f >= 95 && f <= 110) {
      const bannerAlpha = f < 98 ? (f - 95) / 3 : f > 107 ? 1 - (f - 107) / 3 : 1;
      drawHandwrittenCallBanner(ctx, f, bannerAlpha);
    }
    const phase = getPhaseForFrame(f);
    ctx.save();
    ctx.fillStyle = "rgba(54, 40, 28, 0.55)";
    ctx.font = "600 20px Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText(phase.title, width * 0.5, height - 44);
    ctx.restore();
  }

  // src/animation/renderer.ts
  function drawAnimationFrame(ctx, frameIndex, opts = {}) {
    const f = clamp(Math.floor(frameIndex), 0, FILM_CONFIG.totalFrames - 1);
    const { width, height } = FILM_CONFIG;
    ctx.save();
    ctx.clearRect(0, 0, width, height);
    renderSceneFrame(ctx, f, width, height);
    if (opts.onionSkin && f > 0) {
      const offscreen = document.createElement("canvas");
      offscreen.width = width;
      offscreen.height = height;
      const offCtx = offscreen.getContext("2d");
      if (offCtx) {
        renderSceneFrame(offCtx, Math.max(0, f - 1), width, height);
        ctx.save();
        ctx.globalAlpha = 0.22;
        ctx.filter = "sepia(0.9) hue-rotate(-35deg) saturate(2.2)";
        ctx.drawImage(offscreen, 0, 0);
        ctx.restore();
      }
    }
    if (opts.showSafeZone) {
      ctx.save();
      ctx.strokeStyle = "rgba(210, 64, 52, 0.72)";
      ctx.lineWidth = 3;
      ctx.setLineDash([12, 8]);
      ctx.strokeRect(90, 180, 860, 1500);
      ctx.fillStyle = "rgba(210, 64, 52, 0.85)";
      ctx.font = "bold 22px monospace";
      ctx.fillText("SAFE ZONE 9:16 (TikTok / Reels)", 110, 215);
      ctx.restore();
    }
    ctx.restore();
    return f;
  }
  function registerGlobalAnimationBindings(canvas, onFrameRendered) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let currentFrame = 0;
    window.drawFrame = (frameIndex) => {
      currentFrame = drawAnimationFrame(ctx, frameIndex);
      if (onFrameRendered) onFrameRendered(currentFrame);
      return currentFrame;
    };
    window.seek = (timeSeconds) => {
      const idx = clamp(
        Math.round(timeSeconds * FILM_CONFIG.fps),
        0,
        FILM_CONFIG.totalFrames - 1
      );
      return window.drawFrame ? window.drawFrame(idx) : idx;
    };
    window.getAnimationMetadata = () => ({
      title: FILM_CONFIG.title,
      width: FILM_CONFIG.width,
      height: FILM_CONFIG.height,
      fps: FILM_CONFIG.fps,
      totalFrames: FILM_CONFIG.totalFrames,
      durationSeconds: FILM_CONFIG.durationSeconds,
      currentPhase: getPhaseForFrame(currentFrame).title
    });
  }

  // src/standalone-entry.ts
  function initStandalonePreview() {
    const canvas = document.getElementById("animation-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const params = new URLSearchParams(window.location.search);
    const isHeadless = params.get("headless") === "1";
    let currentFrame = 0;
    let isPlaying = !isHeadless;
    let onionSkin = false;
    let showSafeZone = false;
    const scrubber = document.getElementById("timeline-scrubber");
    const timeDisplay = document.getElementById("time-display");
    const frameDisplay = document.getElementById("frame-display");
    const phaseTitleEl = document.getElementById("phase-title");
    const phaseSummaryEl = document.getElementById("phase-summary");
    const btnPlay = document.getElementById("btn-play");
    const btnPause = document.getElementById("btn-pause");
    const btnResume = document.getElementById("btn-resume");
    const btnRestart = document.getElementById("btn-restart");
    const btnPrev = document.getElementById("btn-prev-frame");
    const btnNext = document.getElementById("btn-next-frame");
    const chkOnion = document.getElementById("chk-onion");
    const chkSafe = document.getElementById("chk-safe");
    const keyframesContainer = document.getElementById("keyframes-list");
    if (isHeadless) {
      document.body.classList.add("headless-mode");
    }
    function updateUI(frameIdx) {
      const f = Math.max(0, Math.min(FILM_CONFIG.totalFrames - 1, Math.floor(frameIdx)));
      if (scrubber) scrubber.value = String(f);
      if (timeDisplay) {
        timeDisplay.textContent = `${(f / FILM_CONFIG.fps).toFixed(2)} s / ${FILM_CONFIG.durationSeconds.toFixed(2)} s`;
      }
      if (frameDisplay) {
        frameDisplay.textContent = `Frame ${String(f + 1).padStart(3, "0")} / ${FILM_CONFIG.totalFrames}`;
      }
      const phase = getPhaseForFrame(f);
      if (phaseTitleEl) phaseTitleEl.textContent = phase.title;
      if (phaseSummaryEl) phaseSummaryEl.textContent = `${phase.summary} (${phase.details})`;
    }
    function renderFrameNow(frameIdx) {
      currentFrame = drawAnimationFrame(ctx, frameIdx, {
        onionSkin: isHeadless ? false : onionSkin,
        showSafeZone: isHeadless ? false : showSafeZone
      });
      updateUI(currentFrame);
      return currentFrame;
    }
    registerGlobalAnimationBindings(canvas, (renderedIdx) => {
      currentFrame = renderedIdx;
      updateUI(currentFrame);
    });
    window.drawFrame = (frameIdx) => renderFrameNow(frameIdx);
    window.seek = (timeSeconds) => {
      const idx = Math.round(timeSeconds * FILM_CONFIG.fps);
      return renderFrameNow(idx);
    };
    if (keyframesContainer) {
      keyframesContainer.innerHTML = "";
      KEYFRAME_DOC_LIST.forEach((kf) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "kf-btn";
        btn.textContent = `f.${kf.frame} \u2014 ${kf.label}`;
        btn.addEventListener("click", () => {
          isPlaying = false;
          renderFrameNow(kf.frame);
        });
        keyframesContainer.appendChild(btn);
      });
    }
    if (scrubber) {
      scrubber.max = String(FILM_CONFIG.totalFrames - 1);
      scrubber.addEventListener("input", () => {
        isPlaying = false;
        renderFrameNow(Number(scrubber.value));
      });
    }
    btnPlay?.addEventListener("click", () => {
      isPlaying = true;
    });
    btnPause?.addEventListener("click", () => {
      isPlaying = false;
    });
    btnResume?.addEventListener("click", () => {
      isPlaying = true;
    });
    btnRestart?.addEventListener("click", () => {
      isPlaying = true;
      renderFrameNow(0);
    });
    btnPrev?.addEventListener("click", () => {
      isPlaying = false;
      renderFrameNow((currentFrame - 1 + FILM_CONFIG.totalFrames) % FILM_CONFIG.totalFrames);
    });
    btnNext?.addEventListener("click", () => {
      isPlaying = false;
      renderFrameNow((currentFrame + 1) % FILM_CONFIG.totalFrames);
    });
    chkOnion?.addEventListener("change", () => {
      onionSkin = Boolean(chkOnion.checked);
      renderFrameNow(currentFrame);
    });
    chkSafe?.addEventListener("change", () => {
      showSafeZone = Boolean(chkSafe.checked);
      renderFrameNow(currentFrame);
    });
    renderFrameNow(0);
    if (!isHeadless) {
      let lastTick = performance.now();
      const interval = 1e3 / FILM_CONFIG.fps;
      const tick = (now) => {
        if (isPlaying) {
          const elapsed = now - lastTick;
          if (elapsed >= interval) {
            const steps = Math.max(1, Math.floor(elapsed / interval));
            lastTick = now - elapsed % interval;
            renderFrameNow((currentFrame + steps) % FILM_CONFIG.totalFrames);
          }
        } else {
          lastTick = now;
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initStandalonePreview);
  } else {
    initStandalonePreview();
  }
})();
