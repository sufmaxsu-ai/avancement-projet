import { FILM_CONFIG, PALETTE, getPhaseForFrame } from './config';
import {
  Point2D,
  clamp,
  drawHandColoredPolygon,
  drawPaperBackground,
  drawPencilPolyline,
  easeInOutCubic,
  lerp,
  lerpPt,
  smoothstep,
} from './pencilEngine';
import {
  drawChildrenChairsBackAndSeat,
  drawFamilyTable3D,
  drawKitchenAndGardenBackdrop,
  drawOvenDoor3D,
  getOvenDoorGeometry,
} from './environment';
import {
  drawCakeAndPan3D,
  drawDessertPlateWithSlice,
  drawGardenBall,
  drawMixingBowl3D,
  drawWhiskProp,
  getCakePanAnchors,
  getMixingBowlAnchors,
} from './props';
import { drawChildCharacter, drawMamieColette } from './characters';

/**
 * Dessine une bulle manuscrite chaleureuse type livre jeunesse lorsque Mamie appelle les enfants.
 */
function drawHandwrittenCallBanner(
  ctx: CanvasRenderingContext2D,
  frameIndex: number,
  alpha: number
): void {
  if (alpha <= 0.02) return;
  ctx.save();
  ctx.globalAlpha = clamp(alpha, 0, 1);

  const bx = 435;
  const by = 715;
  const bw = 340;
  const bh = 74;

  const bubblePts: Point2D[] = [
    [bx - bw * 0.5, by - bh * 0.5],
    [bx + bw * 0.5, by - bh * 0.5],
    [bx + bw * 0.5 + 8, by + bh * 0.5],
    [bx + 95, by + bh * 0.5],
    [bx + 145, by + bh * 0.5 + 34], // flèche de bulle pointant vers Mamie
    [bx + 55, by + bh * 0.5],
    [bx - bw * 0.5 - 6, by + bh * 0.5],
  ];

  drawHandColoredPolygon(ctx, bubblePts, frameIndex, 'call-speech-bubble', {
    fillColor: '#FFFDF7',
    hatchColor: '#EFE3CE',
    hatchAlpha: 0.2,
    strokeWidth: 3.4,
  });

  ctx.fillStyle = PALETTE.graphiteDark;
  ctx.font = 'italic bold 28px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('« À table les enfants ! »', bx, by);
  ctx.restore();
}

/**
 * Rendu déterministe complet de la frame `frameIndex` (0 .. 179).
 */
export function renderSceneFrame(
  ctx: CanvasRenderingContext2D,
  frameIndex: number,
  width: number = FILM_CONFIG.width,
  height: number = FILM_CONFIG.height
): void {
  const f = clamp(Math.floor(frameIndex), 0, FILM_CONFIG.totalFrames - 1);

  // 1. Fond papier grainé chaud
  drawPaperBackground(ctx, width, height, f);

  // Calcul de l'ouverture de la porte du four 3D et de la lueur de cuisson
  let ovenDoorAngle = 0;
  if (f >= 48 && f <= 70) {
    // Ouverture pour enfourner (f 48..54), maintenue ouverte (f 54..63), fermeture (f 63..70)
    if (f < 54) ovenDoorAngle = lerp(0, 74, easeInOutCubic((f - 48) / 6));
    else if (f <= 63) ovenDoorAngle = 74;
    else ovenDoorAngle = lerp(74, 0, easeInOutCubic((f - 63) / 7));
  } else if (f >= 73 && f <= 94) {
    // Ouverture pour sortir le gâteau cuit (f 73..78), sortie (f 78..88), fermeture (f 88..94)
    if (f < 78) ovenDoorAngle = lerp(0, 74, easeInOutCubic((f - 73) / 5));
    else if (f <= 88) ovenDoorAngle = 74;
    else ovenDoorAngle = lerp(74, 0, easeInOutCubic((f - 88) / 6));
  }

  let ovenGlow = 0.1;
  if (f >= 58 && f <= 92) {
    ovenGlow = f <= 78 ? smoothstep(58, 68, f) * 0.95 : lerp(0.95, 0.2, smoothstep(78, 92, f));
  }

  // 2. Décor architectural en perspective 3D (Cuisine + Porte-fenêtre ouverte sur le jardin + Cavité du four)
  drawKitchenAndGardenBackdrop(ctx, f, ovenGlow);

  // 3. ACTION DANS LE JARDIN ET ENTRÉE DES ENFANTS PAR LA PORTE-FENÊTRE
  // Le ballon de jardin reste présent de la frame 0 à la frame 179 (zéro disparition magique !)
  const gardenGroundY = 748;
  let ballX = 330;
  let ballY = gardenGroundY - 19;
  let ballSquash = 1.0;

  if (f < 96) {
    // Les enfants se lancent le ballon dans le jardin selon une trajectoire parabolique soumise à la gravité
    const passPhase = (f / 22) * Math.PI;
    const bounceSin = Math.abs(Math.sin(passPhase));
    ballX = lerp(248, 455, (Math.sin(f * 0.14) + 1) * 0.5);
    ballY = gardenGroundY - 19 - bounceSin * 95;
    if (bounceSin < 0.15) {
      ballSquash = 1.18;
    }
  } else {
    // Quand Mamie appelle (f >= 96), le ballon rebondit une dernière fois et roule doucement sur l'herbe où il s'arrête
    const rollT = smoothstep(96, 118, f);
    const dampBounce = Math.abs(Math.sin((f - 96) * 0.35)) * (1 - rollT) * 32;
    ballX = lerp(310, 198, rollT);
    ballY = gardenGroundY - 19 - dampBounce;
  }
  drawGardenBall(ctx, f, ballX, ballY, gardenGroundY, 17, ballSquash);

  // Si les enfants sont encore au jardin ou en train de courir vers les chaises (f < 128) :
  if (f < 128) {
    if (f < 100) {
      // Léo et Clara courent et jouent dans le jardin ensoleillé (vus par la porte-fenêtre ouverte)
      const gardenMove = Math.sin(f * 0.08) * 36;
      drawChildCharacter(ctx, f, {
        character: 'clara',
        mode: 'running',
        pos: [455 - gardenMove, 742],
        scale: 0.48,
        facing: Math.cos(f * 0.08) >= 0 ? -1 : 1,
        runCycleRad: f * 0.48,
      });
      drawChildCharacter(ctx, f, {
        character: 'leo',
        mode: 'running',
        pos: [262 + gardenMove, 752],
        scale: 0.50,
        facing: Math.cos(f * 0.08) >= 0 ? 1 : -1,
        runCycleRad: f * 0.52 + 1.2,
      });
    } else {
      // f = 100..127 : Les enfants accourent depuis le jardin, franchissent le seuil de la porte-fenêtre
      // et rejoignent leurs chaises respectives avec un cycle de course complet en perspective 3D !
      const runClaraT = easeInOutCubic(clamp((f - 100) / 26, 0, 1));
      const claraPos = lerpPt([385, 755], [242, 1286], runClaraT);
      const claraScale = lerp(0.50, 0.92, runClaraT);

      const runLeoT = easeInOutCubic(clamp((f - 102) / 25, 0, 1));
      const leoPos = lerpPt([310, 765], [438, 1286], runLeoT);
      const leoScale = lerp(0.52, 0.94, runLeoT);

      drawChildCharacter(ctx, f, {
        character: 'clara',
        mode: 'running',
        pos: claraPos,
        scale: claraScale,
        facing: -1,
        runCycleRad: f * 0.68,
      });
      drawChildCharacter(ctx, f, {
        character: 'leo',
        mode: 'running',
        pos: leoPos,
        scale: leoScale,
        facing: 1,
        runCycleRad: f * 0.68 + Math.PI * 0.5,
      });
    }
  }

  // 4. ACCESSOIRES SUR LE COMPTOIR ARRIÈRE (PERMANENCE TOTALE DES OBJETS)
  // Saladier posé sur le comptoir après le versement (f >= 46)
  if (f >= 46) {
    const settleT = smoothstep(46, 49, f);
    const bowlCounterPos = lerpPt([718, 1020], [728, 754], settleT);
    const bowlScale = lerp(0.92, 0.72, settleT);
    const bAnchors = drawMixingBowl3D(ctx, f, bowlCounterPos[0], bowlCounterPos[1], {
      scale: bowlScale,
      tiltRad: 0,
      batterFill: 0.1,
    });
    drawWhiskProp(
      ctx,
      f,
      [bowlCounterPos[0] + 22, bowlCounterPos[1] - 28],
      bAnchors.batterCenter,
      bowlScale
    );
  }

  // Pile d'assiettes en porcelaine sur le comptoir droit avant que Mamie ne les prenne (f < 150)
  if (f < 150) {
    drawDessertPlateWithSlice(ctx, f, 876, 758, false, 'counter-plate-bottom', 0.82);
    if (f < 144) {
      drawDessertPlateWithSlice(ctx, f, 876, 750, false, 'counter-plate-top', 0.82);
    }
  }

  // 5. MOULE À GÂTEAU QUAND IL EST DANS LE FOUR 3D (f = 58 .. 83)
  // Dessiné AVANT la porte du four 3D pour qu'il soit réellement à l'intérieur de la cavité du four !
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
      steamAmount: f >= 76 ? 0.5 : 0,
    });
  }

  // 6. PORTE DU FOUR 3D ARTICULÉE EN PERSPECTIVE
  drawOvenDoor3D(ctx, f, ovenDoorAngle, ovenGlow);
  const ovenDoorGeom = getOvenDoorGeometry(ovenDoorAngle);

  // 7. CHAISES EN BOIS DES ENFANTS ET JAMBES QUI SE BALANCENT SOUS LA TABLE (f >= 128)
  drawChildrenChairsBackAndSeat(ctx, f);

  // Calcul des paramètres d'acting des enfants assis (f >= 128)
  const feetSwingAngle = Math.sin((f - 128) * 0.44) * 0.44;
  const claraFeetSwing =
    f >= 138 && f <= 153
      ? Math.sin((f - 128) * 0.62) * 0.52 // Clara balance ses pieds encore plus vite en riant !
      : feetSwingAngle * 0.92;

  if (f >= 128) {
    // Rendu de la partie basse (cuisses sur l'assise + tibias et chaussures qui se balancent sous la chaise)
    drawChildCharacter(ctx, f, {
      character: 'clara',
      mode: 'seated',
      pos: [242, 1286],
      scale: 0.92,
      facing: 1,
      feetSwingRad: claraFeetSwing,
      layerPart: 'lower',
    });
    drawChildCharacter(ctx, f, {
      character: 'leo',
      mode: 'seated',
      pos: [438, 1286],
      scale: 0.94,
      facing: 1,
      feetSwingRad: -feetSwingAngle,
      layerPart: 'lower',
    });
  }

  // 8. CALCUL ET DESSIN DE MAMIE COLETTE (AVEC CONTACTS MAINS-OBJETS EXACTS)
  // On pré-calcule les ancres des objets sur la table pour que les mains de Mamie les tiennent au pixel près
  const tableBowlPos: Point2D =
    f < 32
      ? [648, 1170]
      : [
          lerp(648, 712, smoothstep(32, 38, f)),
          lerp(1170, 1082, smoothstep(32, 38, f)),
        ];
  const tableBowlTilt =
    f >= 32 && f <= 45 ? Math.sin( smoothstep(32, 37, f) * Math.PI * 0.5 ) * 0.56 : 0;
  const previewBowlAnchors = getMixingBowlAnchors(tableBowlPos[0], tableBowlPos[1], 1.0, tableBowlTilt);

  // Position du moule/gâteau hors du four
  let activeCakePos: Point2D = [792, 1172];
  let activeCakeScale = 1.0;
  if (f >= 54 && f < 58) {
    const tIn = (f - 54) / 4;
    activeCakePos = lerpPt([792, 1172], [775, 1025], tIn);
    activeCakeScale = lerp(1.0, 0.86, tIn);
  } else if (f > 83 && f <= 93) {
    const tOut = easeInOutCubic((f - 83) / 10);
    activeCakePos = lerpPt([775, 1025], [582, 1176], tOut);
    activeCakeScale = lerp(0.86, 1.06, tOut);
  } else if (f > 93) {
    activeCakePos = [582, 1176];
    activeCakeScale = 1.06;
  }
  const activeCakeAnchors = getCakePanAnchors(activeCakePos[0], activeCakePos[1], activeCakeScale);

  // Détermination de la pose exacte de Mamie Colette selon la frame `f`
  let mamieFoot: Point2D = [748, 1568];
  let mamieFacing = -1;
  let mamieLean = 0.04;
  let mamieLeftTarget: Point2D = previewBowlAnchors.leftRim;
  let mamieRightTarget: Point2D = [652, 1108];
  let mamieLeftMode: 'grip' | 'open' | 'cup-mouth' | 'mitt' = 'grip';
  let mamieRightMode: 'grip' | 'open' | 'cup-mouth' | 'mitt' = 'grip';
  let mamieExpression: 'smile' | 'concentrated' | 'calling' | 'joyful' = 'smile';
  let mamieStepPhase = 0;

  const whiskOrbitAngle = f * 0.58;
  const whiskGripPt: Point2D = [
    previewBowlAnchors.batterCenter[0] + Math.cos(whiskOrbitAngle) * 20 + 8,
    previewBowlAnchors.batterCenter[1] - 58 + Math.sin(whiskOrbitAngle) * 10,
  ];

  if (f <= 31) {
    // Phase 1 : Mamie fouette la pâte dans le saladier
    mamieFacing = -1;
    mamieLeftTarget = previewBowlAnchors.leftRim;
    mamieRightTarget = whiskGripPt;
    mamieExpression = 'concentrated';
  } else if (f <= 45) {
    // Phase 2 : Mamie incline le saladier à deux mains pour verser la pâte dans le moule
    mamieFacing = -1;
    mamieLean = 0.08;
    mamieLeftTarget = previewBowlAnchors.leftRim;
    mamieRightTarget = previewBowlAnchors.rightRim;
    mamieExpression = 'concentrated';
  } else if (f <= 47) {
    // Pose le saladier sur le comptoir
    mamieFacing = 1;
    mamieLeftTarget = [710, 756];
    mamieRightTarget = [748, 756];
  } else if (f <= 54) {
    // Phase 3a : Ouvre la porte du four 3D par sa poignée exacte
    mamieFacing = 1;
    mamieFoot = [740, 1568];
    mamieLeftTarget = activeCakeAnchors.leftHandle;
    mamieRightTarget = ovenDoorGeom.handleCenter;
  } else if (f <= 62) {
    // Phase 3b : Porte le moule à deux mains jusque sur la grille du four 3D
    mamieFacing = 1;
    mamieFoot = [742, 1568];
    mamieLean = 0.14;
    const panRef = f < 58 ? activeCakeAnchors : ovenPanAnchors;
    mamieLeftTarget = panRef.leftHandle;
    mamieRightTarget = panRef.rightHandle;
  } else if (f <= 71) {
    // Phase 3c : Referme la porte du four 3D et regarde cuire le gâteau avec bonheur
    mamieFacing = 1;
    mamieFoot = [738, 1568];
    mamieLeftTarget = [705, 1115];
    mamieRightTarget = ovenDoorGeom.handleCenter;
    mamieExpression = 'smile';
  } else if (f <= 77) {
    // Phase 4a : Rouvre la porte du four 3D avec ses maniques
    mamieFacing = 1;
    mamieFoot = [738, 1568];
    mamieLeftMode = 'mitt';
    mamieRightMode = 'mitt';
    mamieLeftTarget = [735, 1020];
    mamieRightTarget = ovenDoorGeom.handleCenter;
  } else if (f <= 93) {
    // Phase 4b : Sort le gâteau doré et fumant du four 3D et le pose au centre de la table
    const tTurn = smoothstep(83, 91, f);
    mamieFacing = tTurn > 0.45 ? -1 : 1;
    mamieFoot = [lerp(738, 725, tTurn), 1568];
    mamieLeftMode = 'mitt';
    mamieRightMode = 'mitt';
    const panRef = f <= 83 ? ovenPanAnchors : activeCakeAnchors;
    mamieLeftTarget = panRef.leftHandle;
    mamieRightTarget = panRef.rightHandle;
    mamieExpression = 'joyful';
  } else if (f <= 107) {
    // Phase 4c : Mamie appelle les enfants vers le jardin (« À table les enfants ! »)
    mamieFacing = -1;
    mamieFoot = [725, 1568];
    mamieLeftMode = 'cup-mouth';
    mamieRightMode = 'open';
    mamieLeftTarget = [682, 912]; // Main en porte-voix près de la bouche
    mamieRightTarget = [615, 1135]; // Main posée près du gâteau
    mamieExpression = 'calling';
  } else if (f <= 135) {
    // Phase 5 : Mamie accueille les enfants qui arrivent en courant et s'installent sur les chaises
    mamieFacing = -1;
    mamieFoot = [735, 1568];
    mamieLeftMode = 'open';
    mamieRightMode = 'open';
    mamieLeftTarget = [648, 1085 - Math.sin(f * 0.3) * 14];
    mamieRightTarget = [705, 1110];
    mamieExpression = 'joyful';
  } else if (f <= 153) {
    // Phase 6 : QUAND MAMIE NE REGARDE PAS !
    // Mamie se tourne vers le comptoir à droite (facing = +1) pour prendre les assiettes et la pelle à tarte
    mamieFacing = 1;
    mamieFoot = [756, 1568];
    mamieLean = 0.08;
    mamieStepPhase = (f - 136) * 0.35;
    mamieLeftTarget = [848, 756];
    mamieRightTarget = [892, 754];
    mamieExpression = 'smile';
  } else if (f <= 160) {
    // Phase 7a : Mamie se retourne vers la table et dépose les assiettes devant Clara et Léo
    mamieFacing = -1;
    mamieFoot = [715, 1568];
    const placeT = smoothstep(154, 160, f);
    mamieLeftTarget = lerpPt([640, 1080], [452, 1175], placeT);
    mamieRightTarget = [635, 1135];
    mamieExpression = 'smile';
  } else if (f <= 173) {
    // Phase 7b : Mamie découpe le gâteau et sert une part à Clara (f 161..167) puis à Léo (f 168..173)
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
    mamieExpression = 'joyful';
  } else {
    // Phase 7c (f 174..179) : Tableau familial final chaleureux
    mamieFacing = -1;
    mamieFoot = [716, 1568];
    mamieLeftMode = 'open';
    mamieRightMode = 'open';
    mamieLeftTarget = [632, 1132];
    mamieRightTarget = [722, 1128];
    mamieExpression = 'joyful';
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
    stepPhase: mamieStepPhase,
  });

  // 9. GRANDE TABLE FAMILIALE 3D EN CHÊNE
  drawFamilyTable3D(ctx, f);

  // 10. BUSTES, TÊTES ET BRAS DES ENFANTS ASSIS À TABLE (f >= 128)
  // Dessinés juste après le plateau de table pour que leurs bras posés sur la table
  // et le doigt de Léo plongeant dans le gâteau soient parfaitement au premier plan !
  if (f >= 128) {
    // Action de Léo : pendant que Mamie a le dos tourné (f 138..152), il penche le buste,
    // trempe son index droit exactement sur `activeCakeAnchors.leoTasteSpot` (f 139..145)
    // puis porte son doigt plein de crème à sa bouche (f 146..153) !
    let leoLean = 0.04;
    let leoRightHandTarget: Point2D = [476, 1168];
    let leoRightMode: 'grip' | 'open' | 'point' | 'cup-mouth' = 'open';
    let leoFingerCream = false;

    if (f >= 138 && f <= 145) {
      const reachT = easeInOutCubic(clamp((f - 138) / 5, 0, 1));
      leoLean = lerp(0.04, 0.28, reachT);
      leoRightMode = 'point';
      leoRightHandTarget = lerpPt([476, 1168], activeCakeAnchors.leoTasteSpot, reachT);
      leoFingerCream = f >= 142;
    } else if (f >= 146 && f <= 153) {
      const tasteT = easeInOutCubic(clamp((f - 146) / 4, 0, 1));
      leoLean = lerp(0.28, 0.06, tasteT);
      leoRightMode = 'point';
      leoRightHandTarget = lerpPt(activeCakeAnchors.leoTasteSpot, [454, 1024], tasteT);
      leoFingerCream = true;
    }

    // Action de Clara : pendant la bêtise de Léo (f 139..153), elle met sa main gauche devant sa bouche
    // en pouffant de rire (`isGiggling = true`) et pointe Léo de la main droite !
    const claraGiggling = f >= 139 && f <= 154;
    const claraLeftTarget: Point2D = claraGiggling ? [248, 1022] : [205, 1168];
    const claraRightTarget: Point2D = claraGiggling ? [325, 1068] : [278, 1172];

    drawChildCharacter(ctx, f, {
      character: 'clara',
      mode: 'seated',
      pos: [242, 1286],
      scale: 0.92,
      facing: 1,
      feetSwingRad: claraFeetSwing,
      leftHandTarget: claraLeftTarget,
      rightHandTarget: claraRightTarget,
      leftHandMode: claraGiggling ? 'cup-mouth' : 'open',
      rightHandMode: claraGiggling ? 'point' : 'open',
      isGiggling: claraGiggling,
      layerPart: 'upper',
    });

    drawChildCharacter(ctx, f, {
      character: 'leo',
      mode: 'seated',
      pos: [438, 1286],
      scale: 0.94,
      facing: 1,
      feetSwingRad: -feetSwingAngle,
      torsoLeanRad: leoLean,
      leftHandTarget: [398, 1172],
      rightHandTarget: leoRightHandTarget,
      leftHandMode: 'open',
      rightHandMode: leoRightMode,
      hasCreamOnFinger: leoFingerCream,
      hasCreamOnCheek: f >= 147, // Trace de crème sur la joue de Léo après avoir goûté !
      layerPart: 'upper',
    });
  }

  // 11. USTENSILES, SALADIER, GÂTEAU 3D ET ASSIETTES SERVIES SUR LA TABLE
  // A. Saladier et fouet sur la table (f = 0 .. 45)
  if (f <= 45) {
    const isPouring = f >= 33 && f <= 43;
    const pourProgress = clamp((f - 33) / 10, 0, 1);
    const batterRemaining = isPouring ? lerp(0.84, 0.14, pourProgress) : f > 43 ? 0.12 : 0.84;

    drawMixingBowl3D(ctx, f, tableBowlPos[0], tableBowlPos[1], {
      scale: 1.0,
      tiltRad: tableBowlTilt,
      batterFill: batterRemaining,
      pouringTo: isPouring ? [792, 1164] : null,
      pouringStrength: isPouring ? Math.sin(pourProgress * Math.PI) : 0,
    });

    if (f <= 31) {
      drawWhiskProp(ctx, f, whiskGripPt, previewBowlAnchors.batterCenter, 1.0);
    }
  }

  // B. Moule à gâteau / Gâteau doré aux fraises sur la table (hors de la période où il est dans le four f 58..83)
  if (f < 58 || f > 83) {
    const batterLvl =
      f < 33 ? 0.12 : f <= 44 ? lerp(0.12, 0.88, (f - 33) / 11) : 0.88;
    const isBaked = f > 83;
    const slicesCut = f >= 170 ? 2 : f >= 163 ? 1 : 0;

    drawCakeAndPan3D(ctx, f, activeCakePos[0], activeCakePos[1], {
      scale: activeCakeScale,
      batterLevel: batterLvl,
      bakeDome: isBaked ? 1.0 : 0.0,
      decorated: isBaked,
      steamAmount: isBaked ? clamp(1 - (f - 84) / 95, 0.25, 1.0) : 0,
      slicesRemoved: slicesCut,
    });
  }

  // C. Assiettes en porcelaine et parts de gâteau servies devant Clara et Léo (f >= 156)
  if (f >= 156) {
    const claraHasSlice = f >= 164;
    const leoHasSlice = f >= 171;
    drawDessertPlateWithSlice(ctx, f, 246, 1188, claraHasSlice, 'table-plate-clara', 0.95);
    drawDessertPlateWithSlice(ctx, f, 438, 1188, leoHasSlice, 'table-plate-leo', 0.95);
  }

  // D. Pelle à tarte tenue par Mamie pendant la découpe et le service (f = 160 .. 173)
  if (f >= 160 && f <= 173) {
    drawPencilPolyline(
      ctx,
      [
        mamieLeftTarget,
        [mamieLeftTarget[0] - 28, mamieLeftTarget[1] + 12],
      ],
      f,
      'cake-server-blade',
      {
        color: PALETTE.panMetal,
        width: 5.0,
        doublePass: false,
      }
    );
  }

  // 12. Bulle manuscrite lorsque Mamie appelle les enfants (f = 95 .. 110)
  if (f >= 95 && f <= 110) {
    const bannerAlpha =
      f < 98 ? (f - 95) / 3 : f > 107 ? 1 - (f - 107) / 3 : 1;
    drawHandwrittenCallBanner(ctx, f, bannerAlpha);
  }

  // 13. Vignette et cartouche discret de numéro de scène/phase en bas (hors zone d'action)
  const phase = getPhaseForFrame(f);
  ctx.save();
  ctx.fillStyle = 'rgba(54, 40, 28, 0.55)';
  ctx.font = '600 20px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(phase.title, width * 0.5, height - 44);
  ctx.restore();
}
