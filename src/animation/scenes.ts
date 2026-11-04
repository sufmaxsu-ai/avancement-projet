// Chorégraphie image par image des 10 scènes obligatoires de « Le Gâteau de Mamie » (1080 frames / 45.0s)

import { FILM_CONFIG, PALETTE, SAFE_ZONE, getSceneForFrame } from './config';
import {
  Point,
  clamp,
  drawHandEllipse,
  drawHandRect,
  drawHandShape,
  drawPencilLine,
  drawPencilPolyline,
  easeInOutCubic,
  easeInOutQuad,
  easeOutCubic,
  getBoilStep,
  lerp,
  mulberry32,
} from './pencilEngine';
import {
  KITCHEN_LAYOUT,
  drawGardenEnvironment,
  drawKitchenBackdrop,
  drawKitchenChair,
  drawKitchenTable,
} from './environment';
import {
  drawCakeMold,
  drawCrackingEgg,
  drawGardenBall,
  drawGoldenCake,
  drawIngredientsOnTable,
  drawMixingBowl,
  drawPlateWithCakeSlice,
  drawTableFlourTraces,
  drawWhisk,
} from './props';
import {
  drawChildSeatedUpperBody,
  drawChildStandingOrRunning,
  drawChildSwingingLegsUnderChair,
  drawMamieArms,
  drawMamieTorsoAndHead,
} from './characters';

/**
 * Rendu d'une frame unique (0..1079) sur le contexte Canvas 2D (1080x1920)
 */
export function renderSceneAtFrame(ctx: CanvasRenderingContext2D, frame: number): void {
  const { scene, localFrame, progress } = getSceneForFrame(frame);
  const boilStep = getBoilStep(frame, false);

  switch (scene.id) {
    case 1:
      renderScene1Preparation(ctx, frame, localFrame, progress, boilStep);
      break;
    case 2:
      renderScene2Batter(ctx, frame, localFrame, progress, boilStep);
      break;
    case 3:
      renderScene3Baking(ctx, frame, localFrame, progress, boilStep);
      break;
    case 4:
      renderScene4GardenPlay(ctx, frame, localFrame, progress, boilStep);
      break;
    case 5:
      renderScene5OutOfOven(ctx, frame, localFrame, progress, boilStep);
      break;
    case 6:
      renderScene6Decoration(ctx, frame, localFrame, progress, boilStep);
      break;
    case 7:
      renderScene7TheCall(ctx, frame, localFrame, progress, boilStep);
      break;
    case 8:
      renderScene8TheRun(ctx, frame, localFrame, progress, boilStep);
      break;
    case 9:
      renderScene9TableAndSwingingFeet(ctx, frame, localFrame, progress, boilStep);
      break;
    case 10:
      renderScene10SnackAndServing(ctx, frame, localFrame, progress, boilStep);
      break;
  }

  // Fondus enchaînés très doux aux changements de lieu (Cuisine <-> Jardin)
  renderLocationTransitions(ctx, frame);
}

// ============================================================================
// SCÈNE 1 — PRÉPARATION (Frames 0..107 | 0.0s..4.5s)
// ============================================================================
function renderScene1Preparation(
  ctx: CanvasRenderingContext2D,
  frame: number,
  localFrame: number,
  _progress: number,
  boilStep: number
): void {
  const tableY = KITCHEN_LAYOUT.tableTopY;

  drawKitchenBackdrop(ctx, {
    frame,
    boilStep,
    ovenDoorOpen: 0,
    ovenGlow: 0.15,
    dialAngle: -0.6,
  });

  // Progression des actions calmes de la Scène 1 :
  // 0..27 : Ajuste son tablier
  // 28..56 : Retrousse ses manches (gauche puis droite)
  // 57..82 : Déplace la cuillère en bois et rapproche les ingrédients
  // 83..107 : Prend le saladier et le pose devant elle au centre
  const apronAdjust = localFrame < 28 ? Math.sin((localFrame / 28) * Math.PI) : 0;
  const sleeveRoll = clamp((localFrame - 24) / 30, 0, 1);
  const gatherProgress = easeInOutQuad(clamp((localFrame - 54) / 26, 0, 1));
  const spoonOffset = lerp(0, 42, easeInOutQuad(clamp((localFrame - 52) / 18, 0, 1)));
  const bowlPlaceT = easeInOutCubic(clamp((localFrame - 80) / 24, 0, 1));

  const bowlX = lerp(635, 520, bowlPlaceT);
  const bowlY = tableY - 36 - Math.sin(bowlPlaceT * Math.PI) * 18;

  // Cibles des mains de Mamie selon l'étape
  let leftHand: Point = [475, 955];
  let rightHand: Point = [565, 955];
  let headTurn = 0;
  let lookAt: Point = [520, 1000];

  if (localFrame < 28) {
    // Ajuste son tablier à la taille
    const w = Math.sin((localFrame / 28) * Math.PI * 2) * 16;
    leftHand = [472 - w, 965];
    rightHand = [568 + w, 965];
    lookAt = [520, 980];
  } else if (localFrame < 56) {
    // Retrousse la manche gauche avec la main droite, puis l'inverse
    if (localFrame < 42) {
      leftHand = [465, 910];
      rightHand = [472, 895];
      headTurn = -0.25;
      lookAt = [465, 900];
    } else {
      leftHand = [568, 895];
      rightHand = [575, 910];
      headTurn = 0.25;
      lookAt = [575, 900];
    }
  } else if (localFrame < 80) {
    // Déplace la cuillère et rapproche les ingrédients
    const t = (localFrame - 56) / 24;
    leftHand = [lerp(420, 365, Math.sin(t * Math.PI)), tableY - 12];
    rightHand = [lerp(640, 705, Math.sin(t * Math.PI)), tableY - 18];
    headTurn = Math.sin(t * Math.PI * 2) * 0.35;
    lookAt = [520 + headTurn * 180, tableY - 20];
  } else {
    // Saisit le saladier à deux mains et le pose au centre devant elle
    leftHand = [bowlX - 68, bowlY - 6];
    rightHand = [bowlX + 68, bowlY - 6];
    headTurn = (1 - bowlPlaceT) * 0.3;
    lookAt = [bowlX, bowlY];
  }

  // Mamie derrière la table
  const mamiePose = {
    x: 520,
    y: 985,
    bodyLean: Math.sin(frame * 0.05) * 0.02,
    headTilt: Math.sin(frame * 0.04) * 0.04,
    headTurn,
    lookAt,
    expression: 'smile' as const,
    sleeveRoll,
    apronAdjust,
    flourOnApron: 0,
    leftHandTarget: leftHand,
    rightHandTarget: rightHand,
    frame,
    boilStep,
  };

  drawMamieTorsoAndHead(ctx, mamiePose);
  drawKitchenTable(ctx, boilStep);
  drawKitchenChair(ctx, KITCHEN_LAYOUT.leftChairX, KITCHEN_LAYOUT.chairSeatY, 'right', 0, boilStep, 120);
  drawKitchenChair(ctx, KITCHEN_LAYOUT.rightChairX, KITCHEN_LAYOUT.chairSeatY, 'left', 0, boilStep, 140);

  // Moule vide posé à droite sur la table
  drawCakeMold(ctx, 665, tableY - 14, { batterLevel: 0, boilStep });

  // Ingrédients sur la table
  drawIngredientsOnTable(ctx, {
    tableY,
    gatherProgress,
    eggsRemaining: 3,
    spoonOffset,
    boilStep,
  });

  // Saladier posé devant Mamie
  drawMixingBowl(ctx, bowlX, bowlY, {
    batterStage: 0,
    boilStep,
  });

  // Bras et mains de Mamie au premier plan
  drawMamieArms(ctx, mamiePose);
}

// ============================================================================
// SCÈNE 2 — LA PÂTE (Frames 108..251 | 4.5s..10.5s)
// ============================================================================
function renderScene2Batter(
  ctx: CanvasRenderingContext2D,
  frame: number,
  localFrame: number,
  _progress: number,
  boilStep: number
): void {
  const tableY = KITCHEN_LAYOUT.tableTopY;
  const bowlX = 520;
  const bowlY = tableY - 36;

  drawKitchenBackdrop(ctx, {
    frame,
    boilStep,
    ovenDoorOpen: 0,
    ovenGlow: 0.25,
    dialAngle: -0.4,
  });

  // Sous-étapes de la Scène 2 (144 frames) :
  // 0..27   : Prend le 1er œuf, le tape sur le bord du saladier, ouvre la coquille, jaune tombe
  // 28..53  : Recommence avec le 2e œuf
  // 54..89  : Ajoute sucre (54..65), farine avec traces (66..77), lait & beurre fondu (78..89)
  // 90..143 : Prend le fouet et mélange énergiquement (bras/poignet/main + pâte qui évolue)

  const flourAmount = clamp((localFrame - 68) / 14, 0, 1);
  const batterStage = clamp(localFrame / 132, 0, 1);
  const swirlPhase = localFrame > 88 ? (localFrame - 88) * 0.28 : 0;

  let leftHand: Point = [bowlX - 72, bowlY - 8];
  let rightHand: Point = [bowlX + 55, bowlY - 45];
  let rightPose: 'open' | 'pinch' | 'grip' = 'open';
  let leftPose: 'open' | 'pinch' | 'grip' = 'open';
  let headTurn = 0;

  if (localFrame < 54) {
    // Cassage du 1er œuf (0..27) puis du 2e œuf (28..53)
    const eggLocal = localFrame < 28 ? localFrame / 27 : (localFrame - 28) / 25;
    leftPose = 'pinch';
    rightPose = 'pinch';
    if (eggLocal < 0.35) {
      // Prend l'œuf dans le panier et l'approche du bord du saladier
      const u = eggLocal / 0.35;
      rightHand = [lerp(365, bowlX - 42, u), lerp(tableY - 38, bowlY - 46, u)];
      leftHand = [bowlX - 74, bowlY - 6];
      headTurn = -0.15;
    } else if (eggLocal < 0.58) {
      // Tape délicatement contre le rebord du saladier
      const tap = Math.sin(((eggLocal - 0.35) / 0.23) * Math.PI);
      rightHand = [bowlX - 46, bowlY - 42 + tap * 10];
      leftHand = [bowlX - 66, bowlY - 38];
    } else {
      // Ouvre la coquille à deux mains au-dessus du saladier
      const openU = (eggLocal - 0.58) / 0.42;
      leftHand = [bowlX - 24 - openU * 14, bowlY - 76];
      rightHand = [bowlX + 18 + openU * 14, bowlY - 76];
    }
  } else if (localFrame < 90) {
    // Verse sucre (54..65), farine (66..77), lait & beurre (78..89)
    const step = localFrame - 54;
    rightPose = 'grip';
    const pourArc = Math.sin(((step % 12) / 12) * Math.PI);
    rightHand = [bowlX + 42 - pourArc * 18, bowlY - 88 - pourArc * 12];
    leftHand = [bowlX - 72, bowlY - 8];
  } else {
    // Fouettage circulaire : mouvement du bras, du poignet et de la main
    rightPose = 'grip';
    leftPose = 'grip';
    const wAng = (localFrame - 90) * 0.38;
    leftHand = [bowlX - 74, bowlY - 4];
    rightHand = [bowlX + 26 + Math.cos(wAng) * 28, bowlY - 86 + Math.sin(wAng) * 14];
  }

  const mamiePose = {
    x: 520,
    y: 985,
    bodyLean: localFrame >= 90 ? Math.sin(localFrame * 0.38) * 0.03 : 0.02,
    headTilt: 0.06,
    headTurn,
    lookAt: [bowlX, bowlY - 25] as Point,
    expression: (localFrame > 128 ? 'smile' : 'concentrate') as 'smile' | 'concentrate',
    sleeveRoll: 1,
    flourOnApron: flourAmount * 0.85,
    leftHandTarget: leftHand,
    rightHandTarget: rightHand,
    leftHandPose: leftPose,
    rightHandPose: rightPose,
    frame,
    boilStep,
  };

  drawMamieTorsoAndHead(ctx, mamiePose);
  drawKitchenTable(ctx, boilStep);
  drawKitchenChair(ctx, KITCHEN_LAYOUT.leftChairX, KITCHEN_LAYOUT.chairSeatY, 'right', 0, boilStep, 120);
  drawKitchenChair(ctx, KITCHEN_LAYOUT.rightChairX, KITCHEN_LAYOUT.chairSeatY, 'left', 0, boilStep, 140);

  // Traces de farine sur la table
  drawTableFlourTraces(ctx, bowlX, tableY, flourAmount, boilStep);

  // Moule et ingrédients
  drawCakeMold(ctx, 665, tableY - 14, { batterLevel: 0, boilStep });
  const eggsLeft = localFrame < 10 ? 3 : localFrame < 36 ? 2 : 1;
  drawIngredientsOnTable(ctx, {
    tableY,
    gatherProgress: 1,
    eggsRemaining: eggsLeft,
    spoonOffset: 42,
    boilStep,
  });

  // Saladier et pâte en évolution
  drawMixingBowl(ctx, bowlX, bowlY, {
    batterStage,
    swirlPhase,
    boilStep,
  });

  // Animation de l'œuf qui se casse ou des ingrédients versés
  if (localFrame < 54) {
    const eggLocal = localFrame < 28 ? localFrame / 27 : (localFrame - 28) / 25;
    if (eggLocal < 0.38) {
      drawCrackingEgg(ctx, rightHand[0] - 8, rightHand[1] + 4, 'whole', 0, boilStep);
    } else if (eggLocal < 0.58) {
      drawCrackingEgg(ctx, bowlX - 48, bowlY - 38, 'cracked', 0, boilStep);
    } else {
      const openU = (eggLocal - 0.58) / 0.42;
      drawCrackingEgg(ctx, bowlX - 2, bowlY - 72, 'opening', openU, boilStep);
    }
  } else if (localFrame < 90) {
    // Jet d'ingrédient versé dans le saladier (sucre, nuage de farine, filet de lait/beurre)
    const isFlour = localFrame >= 66 && localFrame < 78;
    const isMilkOrButter = localFrame >= 78;
    const streamColor = isFlour
      ? PALETTE.flourWhite
      : isMilkOrButter
      ? PALETTE.butterYellow
      : '#FAF3E3';
    drawPencilLine(ctx, rightHand[0] - 12, rightHand[1] + 8, bowlX, bowlY - 26, {
      color: streamColor,
      width: isFlour ? 12 : 6.5,
      opacity: 0.85,
      seed: 2500 + localFrame,
      boilStep,
    });
    if (isFlour) {
      // Petit nuage de farine au-dessus du saladier
      drawHandEllipse(ctx, bowlX, bowlY - 38, 32, 14, {
        fill: PALETTE.flourWhite,
        fillOpacity: 0.65,
        stroke: false,
        seed: 2510,
        boilStep,
      });
    }
  } else {
    // Fouet tenu par la main droite de Mamie et plongeant dans la pâte du saladier
    const wAng = (localFrame - 90) * 0.38;
    const tipX = bowlX + Math.cos(wAng + 0.6) * 28;
    const tipY = bowlY - 24 + Math.sin(wAng + 0.6) * 7;
    drawWhisk(ctx, rightHand[0], rightHand[1], tipX, tipY, swirlPhase, boilStep);
  }

  drawMamieArms(ctx, mamiePose);
}

// ============================================================================
// SCÈNE 3 — CUISSON (Frames 252..359 | 10.5s..15.0s)
// ============================================================================
function renderScene3Baking(
  ctx: CanvasRenderingContext2D,
  frame: number,
  localFrame: number,
  _progress: number,
  boilStep: number
): void {
  const tableY = KITCHEN_LAYOUT.tableTopY;

  // Sous-étapes de la Scène 3 (108 frames) :
  // 0..38  : Incline le saladier, verse la pâte progressivement dans le moule et racle à la spatule
  // 39..68 : Pose le saladier, porte le moule vers le four à droite, ouvre la porte du four
  // 69..92 : Place le moule à l'intérieur du four et retire ses mains
  // 93..107: Referme doucement la porte et règle le bouton en laiton du four

  const pourT = clamp(localFrame / 34, 0, 1);
  const carryT = easeInOutCubic(clamp((localFrame - 40) / 34, 0, 1));
  const doorOpen =
    localFrame < 48
      ? 0
      : localFrame < 66
      ? easeInOutQuad((localFrame - 48) / 18)
      : localFrame < 88
      ? 1
      : 1 - easeInOutQuad(clamp((localFrame - 88) / 12, 0, 1));

  const moldInOven = localFrame >= 76;
  const dialTurn =
    localFrame >= 95 ? lerp(-0.4, 0.85, clamp((localFrame - 95) / 11, 0, 1)) : -0.4;

  drawKitchenBackdrop(ctx, {
    frame,
    boilStep,
    ovenDoorOpen: doorOpen,
    ovenGlow: lerp(0.3, 0.75, clamp((localFrame - 75) / 30, 0, 1)),
    ovenHasMold: moldInOven,
    ovenCakeBaked: 0.05,
    dialAngle: dialTurn,
  });

  // Déplacement de Mamie de la table (x=520) vers le four (x=650)
  const mamieX = lerp(520, 648, carryT);
  const bowlX = localFrame < 38 ? lerp(485, 515, Math.sin(pourT * Math.PI)) : 445;
  const bowlY =
    localFrame < 38 ? tableY - 36 - Math.sin(pourT * Math.PI) * 58 : tableY - 36;
  const bowlTilt = localFrame < 38 ? Math.sin(pourT * Math.PI) * 0.68 : 0;

  const moldX = lerp(615, 810, carryT);
  const moldY = lerp(tableY - 14, 922, carryT) - Math.sin(carryT * Math.PI) * 28;

  let leftHand: Point = [bowlX - 62, bowlY - 12];
  let rightHand: Point = [bowlX + 58, bowlY - 18];
  let headTurn = carryT * 0.45;

  if (localFrame < 38) {
    // Tient le saladier incliné de la main gauche et racle avec la spatule de la main droite
    leftHand = [bowlX - 54, bowlY - 14];
    rightHand = [bowlX + 38, bowlY + 8];
  } else if (localFrame < 76) {
    // Porte le moule avec précaution vers le four et ouvre la porte
    if (localFrame >= 48 && localFrame < 62) {
      leftHand = [moldX - 52, moldY];
      rightHand = [765, lerp(805, 995, doorOpen)];
    } else {
      leftHand = [moldX - 52, moldY];
      rightHand = [moldX + 52, moldY];
    }
  } else if (localFrame < 95) {
    // Retire ses mains et referme doucement la porte du four
    const closeU = clamp((localFrame - 84) / 11, 0, 1);
    leftHand = [615, 960];
    rightHand = [775, lerp(1000, 800, closeU)];
  } else {
    // Règle le bouton de thermostat en laiton sur le bandeau du four
    leftHand = [610, 965];
    rightHand = [832, 735];
    headTurn = 0.5;
  }

  const mamiePose = {
    x: mamieX,
    y: 985,
    bodyLean: carryT * 0.06,
    headTilt: 0.05,
    headTurn,
    lookAt: (localFrame < 38 ? [615, tableY - 20] : [810, 860]) as Point,
    expression: (localFrame > 94 ? 'smile' : 'concentrate') as 'smile' | 'concentrate',
    sleeveRoll: 1,
    flourOnApron: 0.85,
    leftHandTarget: leftHand,
    rightHandTarget: rightHand,
    leftHandPose: 'grip' as const,
    rightHandPose: 'grip' as const,
    frame,
    boilStep,
  };

  drawMamieTorsoAndHead(ctx, mamiePose);
  drawKitchenTable(ctx, boilStep);
  drawKitchenChair(ctx, KITCHEN_LAYOUT.leftChairX, KITCHEN_LAYOUT.chairSeatY, 'right', 0, boilStep, 120);
  drawKitchenChair(ctx, KITCHEN_LAYOUT.rightChairX, KITCHEN_LAYOUT.chairSeatY, 'left', 0, boilStep, 140);
  drawTableFlourTraces(ctx, 520, tableY, 0.85, boilStep);

  drawIngredientsOnTable(ctx, {
    tableY,
    gatherProgress: 1,
    eggsRemaining: 1,
    spoonOffset: 42,
    boilStep,
  });

  // Saladier qui se vide progressivement
  drawMixingBowl(ctx, bowlX, bowlY, {
    tiltAngle: bowlTilt,
    batterStage: Math.max(0.08, 1 - pourT * 0.9),
    boilStep,
  });

  // Ruban de pâte dorée qui coule du saladier dans le moule + spatule
  if (localFrame >= 4 && localFrame < 35) {
    drawHandShape(
      ctx,
      [
        [bowlX + 54, bowlY + 4],
        [bowlX + 68, bowlY + 8],
        [618, tableY - 18],
        [604, tableY - 18],
      ],
      {
        fill: PALETTE.batterSmooth,
        stroke: false,
        seed: 2600,
        boilStep,
      }
    );
    // Spatule en bois dans la main droite de Mamie qui racle la pâte
    drawPencilLine(ctx, rightHand[0], rightHand[1], bowlX + 46, bowlY + 6, {
      color: PALETTE.woodDark,
      width: 4.5,
      seed: 2601,
      boilStep,
    });
  }

  // Moule rempli de pâte (tant qu'il n'est pas encore déposé dans le four)
  if (!moldInOven) {
    drawCakeMold(ctx, moldX, moldY, {
      batterLevel: pourT,
      boilStep,
    });
  }

  drawMamieArms(ctx, mamiePose);
}

// ============================================================================
// SCÈNE 4 — LES ENFANTS AU JARDIN (Frames 360..479 | 15.0s..20.0s)
// ============================================================================
function renderScene4GardenPlay(
  ctx: CanvasRenderingContext2D,
  frame: number,
  localFrame: number,
  progress: number,
  boilStep: number
): void {
  drawGardenEnvironment(ctx, frame, boilStep, 0);

  const groundY = 1265;

  // Mouvements joyeux et spontanés de Clara (5 ans) et Léo (7 ans) dans la zone sûre (x: 160..860) :
  // - 0..44  : Course et échange du ballon rayé
  // - 45..84 : Clara saute de joie et tourne sur elle-même pendant que Léo court autour
  // - 85..119: Poursuite joyeuse et nouvelle passe de ballon

  const claraX = 330 + Math.sin(progress * Math.PI * 2.2) * 125;
  const leoX = 685 - Math.cos(progress * Math.PI * 2.4) * 135;

  const isClaraJumping = localFrame >= 42 && localFrame < 68;
  const isClaraSpinning = localFrame >= 68 && localFrame < 92;
  const claraJumpH = isClaraJumping
    ? Math.sin(((localFrame - 42) / 26) * Math.PI) * 58
    : 0;

  const claraFacing = isClaraSpinning
    ? Math.floor(localFrame / 6) % 2 === 0
      ? 'right'
      : 'left'
    : claraX < leoX
    ? 'right'
    : 'left';

  drawChildStandingOrRunning(ctx, {
    who: 'clara',
    x: claraX,
    groundY: groundY + 12,
    facing: claraFacing,
    mode: isClaraJumping ? 'jump' : isClaraSpinning ? 'spin' : 'run',
    cyclePhase: localFrame * 0.34,
    jumpOffset: claraJumpH,
    frame,
    boilStep,
  });

  drawChildStandingOrRunning(ctx, {
    who: 'leo',
    x: leoX,
    groundY: groundY - 8,
    facing: leoX > claraX ? 'left' : 'right',
    mode: localFrame >= 75 && localFrame < 95 ? 'jump' : 'run',
    cyclePhase: localFrame * 0.36 + 1.4,
    jumpOffset:
      localFrame >= 75 && localFrame < 95
        ? Math.sin(((localFrame - 75) / 20) * Math.PI) * 48
        : 0,
    frame,
    boilStep,
  });

  // Ballon rayé rouge et crème qui rebondit et vole entre les deux enfants
  const ballCycle = (localFrame % 48) / 48;
  const ballFromTo = Math.floor(localFrame / 48) % 2 === 0 ? ballCycle : 1 - ballCycle;
  const ballX = lerp(claraX + 35, leoX - 35, easeInOutQuad(ballFromTo));
  const arc = Math.sin(ballCycle * Math.PI);
  const ballY = groundY - 65 - arc * 195;
  const squash = arc < 0.12 ? 1.15 : 1.0;

  drawGardenBall(
    ctx,
    ballX,
    ballY,
    26,
    localFrame * 0.16,
    squash,
    1 / squash,
    boilStep
  );
}

// ============================================================================
// SCÈNE 5 — SORTIE DU FOUR (Frames 480..575 | 20.0s..24.0s)
// ============================================================================
function renderScene5OutOfOven(
  ctx: CanvasRenderingContext2D,
  frame: number,
  localFrame: number,
  _progress: number,
  boilStep: number
): void {
  const tableY = KITCHEN_LAYOUT.tableTopY;

  // Sous-étapes de la Scène 5 (96 frames) :
  // 0..24  : Mamie s'approche du four, prend ses maniques, ouvre la porte (vapeur chaude)
  // 25..62 : Saisit le moule avec précaution, sort le gâteau doré et le porte vers la table
  // 63..95 : Pose le gâteau sur la table, referme le four et sourit avec satisfaction

  const doorOpen =
    localFrame < 8
      ? 0
      : localFrame < 24
      ? easeInOutQuad((localFrame - 8) / 16)
      : localFrame < 66
      ? 1
      : 1 - easeInOutQuad(clamp((localFrame - 66) / 14, 0, 1));

  const cakeStillInOven = localFrame < 32;
  const carryToTableT = easeInOutCubic(clamp((localFrame - 32) / 34, 0, 1));
  const steamAmount = localFrame >= 16 ? clamp(1 - (localFrame - 70) / 40, 0.35, 1) : 0;

  drawKitchenBackdrop(ctx, {
    frame,
    boilStep,
    ovenDoorOpen: doorOpen,
    ovenGlow: 0.85,
    ovenHasMold: cakeStillInOven,
    ovenCakeBaked: 1,
    ovenSteam: doorOpen * 0.85,
    dialAngle: 0.85,
  });

  const mamieX =
    localFrame < 32
      ? lerp(540, 650, easeOutCubic(localFrame / 24))
      : lerp(650, 525, carryToTableT);

  const cakeX = lerp(805, 530, carryToTableT);
  const cakeY = lerp(918, tableY - 22, carryToTableT) - Math.sin(carryToTableT * Math.PI) * 24;

  let leftHand: Point = [mamieX - 45, 945];
  let rightHand: Point = [mamieX + 55, 945];

  if (localFrame < 24) {
    leftHand = [615, 935];
    rightHand = [775, lerp(800, 995, doorOpen)];
  } else if (localFrame < 68) {
    leftHand = [cakeX - 64, cakeY + 2];
    rightHand = [cakeX + 64, cakeY + 2];
  } else {
    leftHand = [445, tableY - 12];
    rightHand = [615, tableY - 12];
  }

  const mamiePose = {
    x: mamieX,
    y: 985,
    bodyLean: (1 - carryToTableT) * 0.05,
    headTilt: localFrame > 68 ? -0.06 : 0.04,
    headTurn: (1 - carryToTableT) * 0.45,
    lookAt: (cakeStillInOven ? [805, 890] : [cakeX, cakeY]) as Point,
    expression: (localFrame > 68 ? 'proud' : 'smile') as 'proud' | 'smile',
    sleeveRoll: 1,
    flourOnApron: 0.85,
    leftHandTarget: leftHand,
    rightHandTarget: rightHand,
    leftHandPose: (localFrame >= 20 && localFrame < 72 ? 'potholder' : 'open') as
      | 'potholder'
      | 'open',
    rightHandPose: (localFrame >= 20 && localFrame < 72 ? 'potholder' : 'open') as
      | 'potholder'
      | 'open',
    frame,
    boilStep,
  };

  drawMamieTorsoAndHead(ctx, mamiePose);
  drawKitchenTable(ctx, boilStep);
  drawKitchenChair(ctx, KITCHEN_LAYOUT.leftChairX, KITCHEN_LAYOUT.chairSeatY, 'right', 0, boilStep, 120);
  drawKitchenChair(ctx, KITCHEN_LAYOUT.rightChairX, KITCHEN_LAYOUT.chairSeatY, 'left', 0, boilStep, 140);

  if (!cakeStillInOven) {
    drawGoldenCake(ctx, cakeX, cakeY, {
      inMold: localFrame < 68,
      sugarProgress: 0,
      berriesCount: 0,
      steamAmount,
      boilStep,
    });
  }

  drawMamieArms(ctx, mamiePose);
}

// ============================================================================
// SCÈNE 6 — DÉCORATION (Frames 576..671 | 24.0s..28.0s)
// ============================================================================
function renderScene6Decoration(
  ctx: CanvasRenderingContext2D,
  frame: number,
  localFrame: number,
  _progress: number,
  boilStep: number
): void {
  const tableY = KITCHEN_LAYOUT.tableTopY;
  const cakeX = 530;
  const cakeY = tableY - 22;

  drawKitchenBackdrop(ctx, {
    frame,
    boilStep,
    ovenDoorOpen: 0,
    ovenGlow: 0.3,
    dialAngle: -0.6,
  });

  // Sous-étapes de la Scène 6 (96 frames) :
  // 0..14  : Mamie attend quelques instants que le gâteau tiédisse, prend le petit bol
  // 15..48 : Saupoudre délicatement le sucre glace (sugarProgress 0 -> 1, jamais instantané)
  // 49..82 : Dépose une par une les 6 fraises en couronne puis la 7e au centre
  // 83..95 : Ajuste délicatement la fraise centrale du bout des doigts et sourit

  const sugarProgress = clamp((localFrame - 14) / 34, 0, 1);
  const berriesCount =
    localFrame < 48 ? 0 : clamp(Math.floor(((localFrame - 48) / 34) * 7) + 1, 0, 7);

  let leftHand: Point = [395, tableY - 28];
  let rightHand: Point = [cakeX + 65, tableY - 24];
  let rightPose: 'open' | 'pinch' | 'grip' = 'open';

  if (localFrame >= 14 && localFrame < 48) {
    // Tient la petite cuillère-tamis au-dessus du gâteau et la déplace de gauche à droite
    rightPose = 'grip';
    const sweep = Math.sin(((localFrame - 14) / 34) * Math.PI * 3) * 44;
    rightHand = [cakeX + sweep + 24, cakeY - 82];
    leftHand = [390, tableY - 36];
  } else if (localFrame >= 48 && localFrame < 83) {
    // Prend une fraise dans le ramequin et la dépose sur le dôme du gâteau
    rightPose = 'pinch';
    const bCycle = ((localFrame - 48) % 6) / 6;
    const fromX = 395;
    const fromY = tableY - 38;
    const targetX = cakeX + Math.cos(berriesCount * 0.9) * 28;
    const targetY = cakeY - 26;
    rightHand = [
      lerp(fromX, targetX, Math.sin(bCycle * Math.PI)),
      lerp(fromY, targetY, Math.sin(bCycle * Math.PI)) - Math.sin(bCycle * Math.PI) * 32,
    ];
  } else if (localFrame >= 83) {
    // Ajuste délicatement le détail central du bout de l'index puis recule légèrement la main
    rightPose = 'pinch';
    const adjustT = (localFrame - 83) / 12;
    rightHand = [
      lerp(cakeX + 6, cakeX + 75, easeInOutQuad(adjustT)),
      lerp(cakeY - 32, tableY - 26, easeInOutQuad(adjustT)),
    ];
  }

  const mamiePose = {
    x: 525,
    y: 985,
    bodyLean: 0.03,
    headTilt: 0.06,
    headTurn: 0,
    lookAt: [cakeX, cakeY - 20] as Point,
    expression: (localFrame >= 82 ? 'proud' : 'smile') as 'proud' | 'smile',
    sleeveRoll: 1,
    flourOnApron: 0.85,
    leftHandTarget: leftHand,
    rightHandTarget: rightHand,
    leftHandPose: 'grip' as const,
    rightHandPose: rightPose,
    frame,
    boilStep,
  };

  drawMamieTorsoAndHead(ctx, mamiePose);
  drawKitchenTable(ctx, boilStep);
  drawKitchenChair(ctx, KITCHEN_LAYOUT.leftChairX, KITCHEN_LAYOUT.chairSeatY, 'right', 0, boilStep, 120);
  drawKitchenChair(ctx, KITCHEN_LAYOUT.rightChairX, KITCHEN_LAYOUT.chairSeatY, 'left', 0, boilStep, 140);

  // Petit récipient de sucre glace et coupelle de fraises fraîches à gauche du gâteau
  drawHandEllipse(ctx, 390, tableY - 22, 34, 16, {
    fill: '#F5EBDC',
    seed: 2701,
    boilStep,
  });
  drawHandEllipse(ctx, 330, tableY - 16, 28, 12, {
    fill: '#E8B8AE',
    seed: 2702,
    boilStep,
  });

  // Gâteau doré qui se pare progressivement de sucre glace et de ses 7 fraises
  drawGoldenCake(ctx, cakeX, cakeY, {
    inMold: false,
    sugarProgress,
    berriesCount,
    steamAmount: Math.max(0, 0.35 - localFrame * 0.004),
    boilStep,
  });

  // Pluie fine de sucre glace tombant de la cuillère-tamis pendant le saupoudrage
  if (localFrame >= 15 && localFrame < 47) {
    const sx = rightHand[0] - 22;
    const sy = rightHand[1] + 6;
    drawPencilLine(ctx, rightHand[0], rightHand[1], sx, sy, {
      color: PALETTE.woodDark,
      width: 3.5,
      seed: 2710,
      boilStep,
    });
    drawHandEllipse(ctx, sx, sy, 14, 7, {
      fill: '#D8CFC2',
      seed: 2711,
      boilStep,
    });
    const rand = mulberry32(2720 + localFrame);
    ctx.save();
    ctx.fillStyle = PALETTE.sugarPowder;
    for (let p = 0; p < 18; p++) {
      const px = sx - 16 + rand() * 32;
      const py = sy + 6 + rand() * 48;
      ctx.beginPath();
      ctx.arc(px, py, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawMamieArms(ctx, mamiePose);
}

// ============================================================================
// SCÈNE 7 — L'APPEL (Frames 672..755 | 28.0s..31.5s)
// « À table, les enfants ! Le gâteau est prêt ! »
// ============================================================================
function renderScene7TheCall(
  ctx: CanvasRenderingContext2D,
  frame: number,
  localFrame: number,
  _progress: number,
  boilStep: number
): void {
  const tableY = KITCHEN_LAYOUT.tableTopY;
  const cakeX = 530;
  const cakeY = tableY - 22;

  const turnT = easeInOutQuad(clamp(localFrame / 18, 0, 1));

  drawKitchenBackdrop(ctx, {
    frame,
    boilStep,
    ovenDoorOpen: 0,
    ovenGlow: 0.2,
    doorToGardenOpen: lerp(0.35, 0.95, turnT),
  });

  // Synchronisation labiale naturelle sur les syllabes de :
  // « À table, les enfants ! Le gâteau est prêt ! » (frames localFrame 18..76)
  let mouthOpen = 0;
  if (localFrame >= 18 && localFrame <= 76) {
    const talkPhase = (localFrame - 18) * 0.42;
    mouthOpen = Math.max(0.12, Math.abs(Math.sin(talkPhase)) * Math.sin(((localFrame - 18) / 58) * Math.PI));
  }

  // Mamie se tourne vers la porte-fenêtre du jardin et porte sa main gauche près de sa joue (sans masquer son visage)
  const leftHand: Point = [
    lerp(450, 434, turnT),
    lerp(tableY - 18, 764, turnT),
  ];
  const rightHand: Point = [595, tableY - 18];

  const mamiePose = {
    x: 525,
    y: 985,
    bodyLean: -0.04 * turnT,
    headTilt: -0.05 * turnT,
    headTurn: -0.45 * turnT,
    lookAt: [420, 680] as Point,
    expression: (localFrame >= 16 ? 'calling' : 'smile') as 'calling' | 'smile',
    mouthOpen,
    sleeveRoll: 1,
    flourOnApron: 0.85,
    leftHandTarget: leftHand,
    rightHandTarget: rightHand,
    leftElbowDir: -1 as const,
    leftHandPose: 'cup_call' as const,
    rightHandPose: 'open' as const,
    frame,
    boilStep,
  };

  drawMamieTorsoAndHead(ctx, mamiePose);
  drawKitchenTable(ctx, boilStep);
  drawKitchenChair(ctx, KITCHEN_LAYOUT.leftChairX, KITCHEN_LAYOUT.chairSeatY, 'right', 0, boilStep, 120);
  drawKitchenChair(ctx, KITCHEN_LAYOUT.rightChairX, KITCHEN_LAYOUT.chairSeatY, 'left', 0, boilStep, 140);

  // Le gâteau terminé (dôme doré + sucre glace + 7 fraises) trône sur la table
  drawGoldenCake(ctx, cakeX, cakeY, {
    inMold: false,
    sugarProgress: 1,
    berriesCount: 7,
    steamAmount: 0.15,
    boilStep,
  });

  drawMamieArms(ctx, mamiePose);

  // Ondes acoustiques dessinées au crayon et phylactère livre de contes DANS LA ZONE SÛRE (x: 110..910, y: 310..445)
  if (localFrame >= 14) {
    const callAlpha = clamp((localFrame - 14) / 10, 0, 1) * clamp((83 - localFrame) / 8, 0, 1);

    // Petits arcs d'appel près de Mamie
    for (let w = 0; w < 3; w++) {
      const r = 26 + w * 16 + ((localFrame * 1.5) % 12);
      drawPencilPolyline(
        ctx,
        [
          [445 - r, 735 - r * 0.45],
          [445 - r * 1.15, 735],
          [445 - r, 735 + r * 0.45],
        ],
        {
          color: PALETTE.cardiganShade,
          width: 2.2,
          opacity: callAlpha * (0.75 - w * 0.2),
          seed: 2800 + w,
          boilStep,
        }
      );
    }

    // Cartouche livre d'histoires dans la zone de sécurité 9:16 (x = 125..895, y = 320..440)
    ctx.save();
    ctx.globalAlpha = callAlpha;
    drawHandRect(ctx, 125, 320, 770, 118, {
      fill: '#FCF6E8',
      color: PALETTE.woodDark,
      width: 2.8,
      radius: 18,
      seed: 2810,
      boilStep,
    });
    // Queue du phylactère dirigée vers Mamie
    drawHandShape(
      ctx,
      [
        [475, 436],
        [515, 436],
        [485, 488],
      ],
      {
        fill: '#FCF6E8',
        color: PALETTE.woodDark,
        width: 2.6,
        seed: 2811,
        boilStep,
      }
    );

    ctx.fillStyle = PALETTE.pencilDark;
    ctx.textAlign = 'center';
    ctx.font = 'italic bold 31px Georgia, "Times New Roman", serif';
    ctx.fillText('« À table, les enfants !', 510, 368);
    ctx.fillText('Le gâteau est prêt ! »', 510, 412);
    ctx.restore();
  }
}

// ============================================================================
// SCÈNE 8 — LA COURSE (Frames 756..851 | 31.5s..35.5s)
// ============================================================================
function renderScene8TheRun(
  ctx: CanvasRenderingContext2D,
  frame: number,
  localFrame: number,
  _progress: number,
  boilStep: number
): void {
  // Scène 8 en deux plans fluides :
  // Plan 8A (localFrame 0..63) : Au jardin, les enfants entendent Mamie, s'arrêtent, se regardent avec enthousiasme,
  //                              abandonnent le ballon et courent vers la porte de la maison (à droite).
  // Plan 8B (localFrame 64..95): Ils franchissent la porte et entrent en courant dans la cuisine chaleureuse !

  if (localFrame < 64) {
    drawGardenEnvironment(ctx, frame, boilStep, 0);
    const groundY = 1265;

    if (localFrame < 22) {
      // Interrompent immédiatement leur jeu, se redressent et se regardent avec enthousiasme
      drawChildStandingOrRunning(ctx, {
        who: 'clara',
        x: 285,
        groundY: groundY + 10,
        facing: 'right',
        mode: 'surprised_look',
        cyclePhase: localFrame * 0.2,
        frame,
        boilStep,
      });
      drawChildStandingOrRunning(ctx, {
        who: 'leo',
        x: 495,
        groundY: groundY - 10,
        facing: 'left',
        mode: 'surprised_look',
        cyclePhase: localFrame * 0.2,
        frame,
        boilStep,
      });
      // Ballon laissé au sol qui roule doucement
      drawGardenBall(ctx, 390 + localFrame * 1.4, groundY - 22, 26, localFrame * 0.08, 1, 1, boilStep);
    } else {
      // Ils se retournent et courent joyeusement vers la maison (foulées avec contact au sol)
      const runU = easeInOutQuad((localFrame - 22) / 41);
      const claraX = lerp(285, 760, runU);
      const leoX = lerp(495, 845, runU);
      const claraY = lerp(groundY + 10, 1020, runU);
      const leoY = lerp(groundY - 10, 985, runU);
      const perspectiveScale = lerp(1.0, 0.78, runU);

      // Ballon abandonné sur l'herbe au premier plan
      drawGardenBall(ctx, 422, groundY - 22, 26, 1.8, 1, 1, boilStep);

      drawChildStandingOrRunning(ctx, {
        who: 'leo',
        x: leoX,
        groundY: leoY,
        scale: perspectiveScale,
        facing: 'right',
        mode: 'run',
        cyclePhase: (localFrame - 22) * 0.55,
        frame,
        boilStep,
      });
      drawChildStandingOrRunning(ctx, {
        who: 'clara',
        x: claraX,
        groundY: claraY,
        scale: perspectiveScale,
        facing: 'right',
        mode: 'run',
        cyclePhase: (localFrame - 22) * 0.55 + 0.9,
        frame,
        boilStep,
      });
    }
  } else {
    // Entrée joyeuse des enfants dans la cuisine (localFrame 64..95)
    const enterU = easeOutCubic((localFrame - 64) / 31);
    const tableY = KITCHEN_LAYOUT.tableTopY;

    drawKitchenBackdrop(ctx, {
      frame,
      boilStep,
      ovenDoorOpen: 0,
      ovenGlow: 0.15,
      doorToGardenOpen: 1.0,
    });

    const mamiePose = {
      x: 525,
      y: 985,
      bodyLean: 0,
      headTilt: 0.04,
      headTurn: lerp(-0.3, 0, enterU),
      lookAt: [420, 1080] as Point,
      expression: 'smile' as const,
      sleeveRoll: 1,
      flourOnApron: 0.85,
      leftHandTarget: [435, tableY - 26] as Point,
      rightHandTarget: [615, tableY - 26] as Point,
      frame,
      boilStep,
    };

    drawMamieTorsoAndHead(ctx, mamiePose);
    drawKitchenTable(ctx, boilStep);
    drawKitchenChair(ctx, KITCHEN_LAYOUT.leftChairX, KITCHEN_LAYOUT.chairSeatY, 'right', -18, boilStep, 120);
    drawKitchenChair(ctx, KITCHEN_LAYOUT.rightChairX, KITCHEN_LAYOUT.chairSeatY, 'left', 18, boilStep, 140);

    drawGoldenCake(ctx, 530, tableY - 22, {
      inMold: false,
      sugarProgress: 1,
      berriesCount: 7,
      steamAmount: 0.12,
      boilStep,
    });
    drawMamieArms(ctx, mamiePose);

    // Clara et Léo arrivent en courant dans la cuisine jusqu'aux chaises
    drawChildStandingOrRunning(ctx, {
      who: 'clara',
      x: lerp(140, 275, enterU),
      groundY: 1395,
      scale: 0.92,
      facing: 'right',
      mode: 'run',
      cyclePhase: localFrame * 0.5,
      frame,
      boilStep,
    });
    drawChildStandingOrRunning(ctx, {
      who: 'leo',
      x: lerp(890, 785, enterU),
      groundY: 1395,
      scale: 0.92,
      facing: 'left',
      mode: 'run',
      cyclePhase: localFrame * 0.5 + 1.2,
      frame,
      boilStep,
    });
  }
}

// ============================================================================
// SCÈNE 9 — INSTALLATION À TABLE & PIEDS QUI BALANCENT (Frames 852..959 | 35.5s..40.0s)
// DÉTAIL ESSENTIEL : Leurs jambes trop courtes pendent et balancent sous les chaises !
// ============================================================================
function renderScene9TableAndSwingingFeet(
  ctx: CanvasRenderingContext2D,
  frame: number,
  localFrame: number,
  _progress: number,
  boilStep: number
): void {
  const tableY = KITCHEN_LAYOUT.tableTopY;
  const seatY = KITCHEN_LAYOUT.chairSeatY; // 1185 (sol à 1435)
  const leftChairX = KITCHEN_LAYOUT.leftChairX; // 305
  const rightChairX = KITCHEN_LAYOUT.rightChairX; // 765

  drawKitchenBackdrop(ctx, {
    frame,
    boilStep,
    ovenDoorOpen: 0,
    ovenGlow: 0.12,
    doorToGardenOpen: 0.6,
  });

  // Sous-étapes de la Scène 9 (108 frames / 4.5s) :
  // 0..24  : Les enfants tirent leurs chaises et grimpent dessus en regardant le gâteau
  // 25..107: Assis sur les chaises, leurs petits pieds pendent bien au-dessus du sol
  //          et se balancent joyeusement d'avant en arrière sous la table !

  const settleT = easeOutCubic(clamp(localFrame / 24, 0, 1));
  const chairSlide = (1 - settleT) * 24;

  const mamiePose = {
    x: 530,
    y: 985,
    bodyLean: 0.02,
    headTilt: Math.sin(localFrame * 0.08) * 0.04,
    headTurn: Math.sin(localFrame * 0.06) * 0.22,
    lookAt: [530 + Math.sin(localFrame * 0.06) * 180, 1060] as Point,
    expression: 'smile' as const,
    sleeveRoll: 1,
    flourOnApron: 0.85,
    leftHandTarget: [435, tableY - 16] as Point,
    rightHandTarget: [625, tableY - 16] as Point,
    frame,
    boilStep,
  };

  drawMamieTorsoAndHead(ctx, mamiePose);

  // Chaises de Clara (à gauche) et Léo (à droite)
  drawKitchenChair(ctx, leftChairX, seatY, 'right', -chairSlide, boilStep, 120);
  drawKitchenChair(ctx, rightChairX, seatY, 'left', chairSlide, boilStep, 140);

  // Phase de balancement joyeux des pieds (environ 1.6 cycle par seconde)
  const swingPhaseClara = localFrame * 0.28;
  const swingPhaseLeo = localFrame * 0.31 + 0.8;

  const claraSeatedPose = {
    who: 'clara' as const,
    chairX: leftChairX - chairSlide,
    seatY: seatY + (1 - settleT) * 18,
    facingCenter: 'right' as const,
    swingPhase: swingPhaseClara,
    swingAmplitude: lerp(0.18, 0.52, settleT),
    excitementBounce: 1.0,
    frame,
    boilStep,
  };

  const leoSeatedPose = {
    who: 'leo' as const,
    chairX: rightChairX + chairSlide,
    seatY: seatY + (1 - settleT) * 18,
    facingCenter: 'left' as const,
    swingPhase: swingPhaseLeo,
    swingAmplitude: lerp(0.18, 0.5, settleT),
    excitementBounce: 1.0,
    frame,
    boilStep,
  };

  // Haut du corps des enfants assis
  drawChildSeatedUpperBody(ctx, claraSeatedPose);
  drawChildSeatedUpperBody(ctx, leoSeatedPose);

  // Grande table familiale en bois
  drawKitchenTable(ctx, boilStep);

  // Assiettes vides prêtes devant Clara et Léo + le gâteau décoré au centre
  drawPlateWithCakeSlice(ctx, 385, tableY - 12, false, boilStep, 510);
  drawPlateWithCakeSlice(ctx, 675, tableY - 12, false, boilStep, 530);

  drawGoldenCake(ctx, 530, tableY - 22, {
    inMold: false,
    sugarProgress: 1,
    berriesCount: 7,
    steamAmount: 0.08,
    boilStep,
  });

  drawMamieArms(ctx, mamiePose);

  // PREMIER PLAN SOUS LA TABLE : Les jambes trop courtes qui pendent et les petits pieds qui balancent !
  drawChildSwingingLegsUnderChair(ctx, claraSeatedPose);
  drawChildSwingingLegsUnderChair(ctx, leoSeatedPose);
}

// ============================================================================
// SCÈNE 10 — LE GOÛTER (Frames 960..1079 | 40.0s..45.0s)
// Découpe réelle du gâteau au couteau, service de chaque enfant et souvenir précieux final
// ============================================================================
function renderScene10SnackAndServing(
  ctx: CanvasRenderingContext2D,
  frame: number,
  localFrame: number,
  _progress: number,
  boilStep: number
): void {
  const tableY = KITCHEN_LAYOUT.tableTopY;
  const seatY = KITCHEN_LAYOUT.chairSeatY;
  const leftChairX = KITCHEN_LAYOUT.leftChairX;
  const rightChairX = KITCHEN_LAYOUT.rightChairX;
  const cakeX = 530;
  const cakeY = tableY - 22;

  drawKitchenBackdrop(ctx, {
    frame,
    boilStep,
    ovenDoorOpen: 0,
    ovenGlow: 0.1,
    doorToGardenOpen: 0.5,
  });

  // Sous-étapes de la Scène 10 (120 frames / 5.0s) :
  // 0..29  : Mamie prend le couteau et découpe réellement la 1re part (mouvement de scie, séparation)
  // 30..57 : Elle dépose la 1re part dans l'assiette de Clara (à gauche)
  // 58..85 : Elle découpe la 2e part et la dépose dans l'assiette de Léo (à droite)
  // 86..119: Chaque part est visible dans l'assiette, les enfants regardent Mamie et leur part avec bonheur,
  //          leurs pieds balancent doucement, Mamie sourit tendrement — image finale chaleureuse et paisible.

  const cut1Progress = clamp(localFrame / 26, 0, 1);
  const serve1T = easeInOutCubic(clamp((localFrame - 28) / 26, 0, 1));
  const claraServed = localFrame >= 50;

  const cut2Progress = clamp((localFrame - 56) / 16, 0, 1);
  const serve2T = easeInOutCubic(clamp((localFrame - 70) / 18, 0, 1));
  const leoServed = localFrame >= 85;

  const slicesRemoved = leoServed ? 2 : claraServed ? 1 : 0;

  let leftHand: Point = [445, tableY - 18];
  let rightHand: Point = [cakeX + 35, cakeY - 32];
  let headTurn = 0;
  let lookAt: Point = [cakeX, cakeY];

  if (localFrame < 28) {
    // Mouvement de découpe du couteau dans le gâteau (1re part)
    const saw = Math.sin(localFrame * 0.7) * 8;
    rightHand = [cakeX + 32 + saw, cakeY - 38 + cut1Progress * 18];
    leftHand = [cakeX - 68, cakeY - 6];
  } else if (localFrame < 56) {
    // Porte la 1re part vers l'assiette de Clara (x = 385)
    const arc = Math.sin(serve1T * Math.PI);
    rightHand = [
      lerp(cakeX + 24, 395, Math.sin(serve1T * Math.PI * 0.5)),
      cakeY - 22 - arc * 34,
    ];
    leftHand = [lerp(445, 365, Math.sin(serve1T * Math.PI)), tableY - 14];
    headTurn = -0.32 * Math.sin(serve1T * Math.PI);
    lookAt = [345, 1020];
  } else if (localFrame < 70) {
    // Découpe la 2e part au couteau
    const saw = Math.sin(localFrame * 0.7) * 8;
    rightHand = [cakeX + 36 + saw, cakeY - 36 + cut2Progress * 18];
    leftHand = [cakeX - 68, cakeY - 6];
  } else if (localFrame < 88) {
    // Sert la 2e part dans l'assiette de Léo (x = 675)
    const arc = Math.sin(serve2T * Math.PI);
    rightHand = [
      lerp(cakeX + 28, 665, Math.sin(serve2T * Math.PI * 0.5)),
      cakeY - 22 - arc * 34,
    ];
    leftHand = [455, tableY - 16];
    headTurn = 0.32 * Math.sin(serve2T * Math.PI);
    lookAt = [715, 1020];
  } else {
    // Moment final paisible et tendre : Mamie pose le couteau et regarde ses petits-enfants avec amour
    const restT = easeOutCubic((localFrame - 88) / 31);
    leftHand = [lerp(455, 445, restT), tableY - 14];
    rightHand = [lerp(650, 615, restT), tableY - 14];
    headTurn = Math.sin((localFrame - 88) * 0.08) * 0.14;
    lookAt = [530 + headTurn * 220, 1040];
  }

  const mamiePose = {
    x: 530,
    y: 985,
    bodyLean: 0.02,
    headTilt: localFrame >= 88 ? -0.05 : 0.03,
    headTurn,
    lookAt,
    expression: (localFrame >= 88 ? 'tender' : 'smile') as 'tender' | 'smile',
    sleeveRoll: 1,
    flourOnApron: 0.85,
    leftHandTarget: leftHand,
    rightHandTarget: rightHand,
    leftHandPose: 'open' as const,
    rightHandPose: (localFrame < 88 ? 'grip' : 'open') as 'grip' | 'open',
    frame,
    boilStep,
  };

  drawMamieTorsoAndHead(ctx, mamiePose);

  drawKitchenChair(ctx, leftChairX, seatY, 'right', 0, boilStep, 120);
  drawKitchenChair(ctx, rightChairX, seatY, 'left', 0, boilStep, 140);

  // Balancement joyeux des pieds qui s'apaise tout doucement dans les dernières secondes
  const calmFactor = localFrame >= 92 ? lerp(1.0, 0.68, (localFrame - 92) / 27) : 1.0;
  const claraSeatedPose = {
    who: 'clara' as const,
    chairX: leftChairX,
    seatY,
    facingCenter: 'right' as const,
    swingPhase: frame * 0.25,
    swingAmplitude: 0.48 * calmFactor,
    excitementBounce: calmFactor,
    frame,
    boilStep,
  };
  const leoSeatedPose = {
    who: 'leo' as const,
    chairX: rightChairX,
    seatY,
    facingCenter: 'left' as const,
    swingPhase: frame * 0.27 + 1.1,
    swingAmplitude: 0.46 * calmFactor,
    excitementBounce: calmFactor,
    frame,
    boilStep,
  };

  drawChildSeatedUpperBody(ctx, claraSeatedPose);
  drawChildSeatedUpperBody(ctx, leoSeatedPose);

  drawKitchenTable(ctx, boilStep);

  // Assiettes de Clara et Léo avec leurs parts de gâteau servies
  drawPlateWithCakeSlice(ctx, 385, tableY - 12, claraServed, boilStep, 510);
  drawPlateWithCakeSlice(ctx, 675, tableY - 12, leoServed, boilStep, 530);

  // Gâteau au centre avec ouverture réelle des parts découpées
  drawGoldenCake(ctx, cakeX, cakeY, {
    inMold: false,
    sugarProgress: 1,
    berriesCount: 7,
    slicesRemoved,
    cutProgress: localFrame < 28 ? cut1Progress : localFrame >= 56 && localFrame < 70 ? cut2Progress : 0,
    steamAmount: 0.05,
    boilStep,
  });

  // Couteau à gâteau (et part en transit sur la lame pendant le service !)
  if (localFrame < 88) {
    const carryingSlice =
      (localFrame >= 28 && localFrame < 50) || (localFrame >= 70 && localFrame < 85);
    drawKnifeAndTransitSlice(
      ctx,
      rightHand[0],
      rightHand[1],
      carryingSlice,
      boilStep
    );
  } else {
    // Couteau posé sur le bord du plat
    drawPencilLine(ctx, 595, tableY - 8, 645, tableY - 4, {
      color: '#8C8B88',
      width: 4.0,
      seed: 2950,
      boilStep,
    });
  }

  drawMamieArms(ctx, mamiePose);

  // Les petits pieds de Clara et Léo qui se balancent sous les chaises !
  drawChildSwingingLegsUnderChair(ctx, claraSeatedPose);
  drawChildSwingingLegsUnderChair(ctx, leoSeatedPose);

  // Halo doré chaleureux de souvenir d'enfance sur le tableau final (frames 1045..1079)
  if (localFrame >= 85) {
    const memoryGlow = easeInOutQuad((localFrame - 85) / 34);
    ctx.save();
    const grad = ctx.createRadialGradient(
      FILM_CONFIG.width * 0.5,
      1080,
      180,
      FILM_CONFIG.width * 0.5,
      1040,
      860
    );
    grad.addColorStop(0, `rgba(255, 235, 180, ${0.14 * memoryGlow})`);
    grad.addColorStop(1, `rgba(110, 74, 42, ${0.18 * memoryGlow})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, FILM_CONFIG.width, FILM_CONFIG.height);
    ctx.restore();
  }
}

function drawKnifeAndTransitSlice(
  ctx: CanvasRenderingContext2D,
  handX: number,
  handY: number,
  carryingSlice: boolean,
  boilStep: number
): void {
  // Manche en bois du couteau dans la main de Mamie
  drawHandRect(ctx, handX - 8, handY - 5, 28, 10, {
    fill: PALETTE.woodDark,
    radius: 3,
    seed: 2901,
    boilStep,
  });
  // Lame argentée du couteau à gâteau
  drawHandShape(
    ctx,
    [
      [handX - 8, handY - 3],
      [handX - 64, handY + 12],
      [handX - 58, handY + 21],
      [handX - 8, handY + 5],
    ],
    {
      fill: '#D8D9D6',
      seed: 2902,
      boilStep,
    }
  );

  // Si Mamie transporte une part de gâteau vers l'assiette d'un enfant
  if (carryingSlice) {
    const sx = handX - 38;
    const sy = handY + 8;
    drawHandShape(
      ctx,
      [
        [sx - 18, sy],
        [sx + 16, sy - 12],
        [sx + 16, sy + 4],
      ],
      { fill: PALETTE.cakeCrumb, seed: 2903, boilStep }
    );
    drawHandShape(
      ctx,
      [
        [sx - 18, sy],
        [sx + 4, sy - 20],
        [sx + 18, sy - 12],
      ],
      { fill: PALETTE.cakeCrust, seed: 2904, boilStep }
    );
    drawHandEllipse(ctx, sx + 4, sy - 18, 6.5, 7.5, {
      fill: PALETTE.berryRed,
      seed: 2905,
      boilStep,
    });
  }
}

/**
 * Transitions douces couleur papier crème entre Cuisine et Jardin (Scènes 3->4, 4->5, 7->8)
 */
function renderLocationTransitions(ctx: CanvasRenderingContext2D, frame: number): void {
  const cutFrames = [360, 480, 756, 820];
  for (const cf of cutFrames) {
    const dist = Math.abs(frame - cf);
    if (dist <= 6) {
      const alpha = (1 - dist / 7) * 0.55;
      ctx.save();
      ctx.fillStyle = PALETTE.paperBase;
      ctx.globalAlpha = alpha;
      ctx.fillRect(0, 0, FILM_CONFIG.width, FILM_CONFIG.height);
      ctx.restore();
    }
  }
}

/**
 * Superposition visuelle de la Zone de Sécurité 9:16 (pour le contrôle qualité et le mode studio)
 */
export function drawSafeZoneOverlay(ctx: CanvasRenderingContext2D): void {
  const W = FILM_CONFIG.width;
  const { xMin, xMax, yMin, yMax, width, height, bottom, left, right } = SAFE_ZONE;

  ctx.save();
  // Zones masquées par les interfaces TikTok / Reels / Shorts
  ctx.fillStyle = 'rgba(42, 26, 18, 0.34)';
  ctx.fillRect(0, 0, W, yMin); // Haut (250 px)
  ctx.fillRect(0, yMax, W, bottom); // Bas (450 px)
  ctx.fillRect(0, yMin, left, height); // Gauche (64 px)
  ctx.fillRect(xMax, yMin, right, height); // Droite (130 px)

  // Cadre pointillé de la zone sûre (64..950 x 250..1470)
  ctx.strokeStyle = '#10B981';
  ctx.lineWidth = 3;
  ctx.setLineDash([12, 8]);
  ctx.strokeRect(xMin, yMin, width, height);

  // Repères et étiquettes techniques
  ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(16, 185, 129, 0.92)';
  ctx.fillRect(xMin + 12, yMin + 12, 460, 38);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 19px monospace';
  ctx.fillText(
    `ZONE SÛRE 9:16 : x[${xMin}..${xMax}] y[${yMin}..${yMax}]`,
    xMin + 24,
    yMin + 37
  );
  ctx.restore();
}
