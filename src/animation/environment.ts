// Décors détaillés et géographie cohérente : la cuisine familiale et le jardin d'été

import { FILM_CONFIG, PALETTE } from './config';
import {
  Point,
  clamp,
  drawHandEllipse,
  drawHandRect,
  drawHandShape,
  drawPencilLine,
  drawPencilPolyline,
  drawSteamWisp,
  lerp,
  mulberry32,
} from './pencilEngine';
import { drawCakeMold } from './props';

export interface KitchenState {
  frame: number;
  boilStep: number;
  ovenDoorOpen?: number; // 0 = fermée, 1 = ouverte à l'horizontale
  ovenGlow?: number; // 0..1 lueur chaude de cuisson
  ovenHasMold?: boolean;
  ovenCakeBaked?: number; // 0..1 gonflement du gâteau dans le four
  ovenSteam?: number; // 0..1 vapeur à l'ouverture
  dialAngle?: number; // rotation du thermostat en laiton
  doorToGardenOpen?: number; // ouverture de la porte-fenêtre (Scènes 7 & 8)
}

export const KITCHEN_LAYOUT = {
  floorY: 1435,
  tableTopY: 1040,
  tableBottomY: 1076,
  tableLeftX: 145,
  tableRightX: 935,
  leftChairX: 305,
  rightChairX: 765,
  chairSeatY: 1185,
  ovenX: 735,
  ovenY: 720,
} as const;

/**
 * Dessine l'arrière-plan de la cuisine (murs, boiseries, vieux placards, fenêtre sur le jardin, rayons de soleil et four)
 */
export function drawKitchenBackdrop(ctx: CanvasRenderingContext2D, state: KitchenState): void {
  const {
    frame,
    boilStep,
    ovenDoorOpen = 0,
    ovenGlow = 0.25,
    ovenHasMold = false,
    ovenCakeBaked = 0,
    ovenSteam = 0,
    dialAngle = 0.4,
    doorToGardenOpen = 0.35,
  } = state;

  const W = FILM_CONFIG.width;
  const H = FILM_CONFIG.height;
  const floorY = KITCHEN_LAYOUT.floorY;

  // 1. Mur beige vanille chaleureux
  drawHandRect(ctx, 20, 40, W - 40, floorY - 40, {
    fill: PALETTE.wallCream,
    hatch: true,
    hatchAngle: 0.78,
    hatchSpacing: 22,
    hatchOpacity: 0.06,
    stroke: false,
    seed: 10,
    boilStep,
  });

  // 2. Soubassement en boiserie (lambris)
  const wainscotY = 930;
  drawHandRect(ctx, 24, wainscotY, W - 48, floorY - wainscotY, {
    fill: PALETTE.wainscotBeige,
    hatch: true,
    hatchAngle: 1.57,
    hatchSpacing: 18,
    hatchOpacity: 0.09,
    seed: 11,
    boilStep,
  });
  for (let x = 90; x < W - 60; x += 95) {
    drawPencilLine(ctx, x, wainscotY + 4, x, floorY - 4, {
      color: PALETTE.pencilLight,
      width: 1.5,
      opacity: 0.45,
      seed: 12 + x,
      boilStep,
    });
  }

  // 3. Plancher en bois ancien (y = 1435..1880)
  drawHandRect(ctx, 20, floorY, W - 40, H - floorY - 25, {
    fill: PALETTE.floorPlank,
    hatch: true,
    hatchAngle: 0.03,
    hatchSpacing: 16,
    hatchOpacity: 0.14,
    seed: 15,
    boilStep,
  });
  for (let py = floorY + 55; py < H - 40; py += 62) {
    drawPencilLine(ctx, 28, py, W - 28, py, {
      color: PALETTE.woodDark,
      width: 1.8,
      opacity: 0.48,
      seed: 20 + py,
      boilStep,
    });
  }

  // 4. Grande fenêtre et porte-fenêtre au fond donnant sur le jardin ensoleillé
  const winX = 395;
  const winY = 300;
  const winW = 290;
  const winH = 475;

  // Vue extérieure du jardin à travers la fenêtre
  drawHandRect(ctx, winX, winY, winW, winH, {
    fill: PALETTE.skySoft,
    seed: 30,
    boilStep,
  });
  // Soleil doux et feuillage du pommier dehors
  const breeze = Math.sin(frame * 0.05) * 6;
  drawHandEllipse(ctx, winX + 75 + breeze, winY + 140, 80, 62, {
    fill: PALETTE.foliageWarm,
    stroke: false,
    seed: 31,
    boilStep,
  });
  drawHandEllipse(ctx, winX + 215 - breeze * 0.7, winY + 170, 74, 58, {
    fill: PALETTE.foliageSage,
    stroke: false,
    seed: 32,
    boilStep,
  });
  // Pelouse ensoleillée visible par la porte-fenêtre
  drawHandRect(ctx, winX + 4, winY + 265, winW - 8, winH - 269, {
    fill: PALETTE.grassLight,
    stroke: false,
    seed: 33,
    boilStep,
  });

  // Cadre en bois de la porte-fenêtre (avec battant entrouvert)
  drawHandRect(ctx, winX - 12, winY - 12, winW + 24, winH + 24, {
    fill: undefined,
    width: 4.2,
    color: PALETTE.woodDark,
    seed: 34,
    boilStep,
  });
  const sashOffset = lerp(0, 48, clamp(doorToGardenOpen, 0, 1));
  drawPencilLine(ctx, winX + winW * 0.5 - sashOffset, winY, winX + winW * 0.5 - sashOffset, winY + winH, {
    color: PALETTE.woodDark,
    width: 3.4,
    seed: 35,
    boilStep,
  });
  drawPencilLine(ctx, winX, winY + 210, winX + winW, winY + 210, {
    color: PALETTE.woodDark,
    width: 3.0,
    seed: 36,
    boilStep,
  });

  // Rideaux en lin crème noués de chaque côté de la fenêtre
  drawHandShape(
    ctx,
    [
      [winX - 8, winY - 4],
      [winX + 46, winY - 4],
      [winX + 24, winY + 240],
      [winX + 36, winY + 420],
      [winX - 10, winY + 430],
    ],
    {
      fill: '#FAF4E8',
      hatch: true,
      hatchOpacity: 0.12,
      seed: 37,
      boilStep,
    }
  );
  drawHandShape(
    ctx,
    [
      [winX + winW - 46, winY - 4],
      [winX + winW + 8, winY - 4],
      [winX + winW + 10, winY + 430],
      [winX + winW - 36, winY + 420],
      [winX + winW - 24, winY + 240],
    ],
    {
      fill: '#FAF4E8',
      hatch: true,
      hatchOpacity: 0.12,
      seed: 38,
      boilStep,
    }
  );

  // 5. Vieux placard vaisselier en bois à gauche (x = 75..335, y = 315..930)
  const cupX = 78;
  const cupY = 320;
  const cupW = 248;
  const cupH = 610;
  drawHandRect(ctx, cupX, cupY, cupW, cupH, {
    fill: PALETTE.woodMedium,
    hatch: true,
    hatchAngle: 1.52,
    hatchSpacing: 11,
    hatchOpacity: 0.18,
    radius: 6,
    seed: 40,
    boilStep,
  });
  // Corniche supérieure du vaisselier
  drawHandRect(ctx, cupX - 10, cupY - 16, cupW + 20, 18, {
    fill: PALETTE.woodDark,
    radius: 4,
    seed: 41,
    boilStep,
  });
  // Vitrine haute montrant les piles d'assiettes et bols anciens
  drawHandRect(ctx, cupX + 18, cupY + 24, cupW - 36, 250, {
    fill: '#E9DEC9',
    radius: 4,
    seed: 42,
    boilStep,
  });
  drawPencilLine(ctx, cupX + 18, cupY + 148, cupX + cupW - 18, cupY + 148, {
    color: PALETTE.woodDark,
    width: 3.5,
    seed: 43,
    boilStep,
  });
  // Assiettes et bols sur les étagères du placard
  drawHandEllipse(ctx, cupX + 75, cupY + 132, 34, 10, {
    fill: PALETTE.plateCeramic,
    seed: 44,
    boilStep,
  });
  drawHandEllipse(ctx, cupX + 75, cupY + 124, 32, 9, {
    fill: PALETTE.plateCeramic,
    seed: 45,
    boilStep,
  });
  drawHandEllipse(ctx, cupX + 172, cupY + 130, 26, 16, {
    fill: PALETTE.tileSage,
    seed: 46,
    boilStep,
  });
  // Bocaux sur l'étagère du bas de la vitrine
  for (let j = 0; j < 3; j++) {
    drawHandRect(ctx, cupX + 42 + j * 62, cupY + 206, 36, 58, {
      fill: j === 1 ? '#DF9B6D' : '#F3E7D3',
      radius: 6,
      seed: 47 + j,
      boilStep,
    });
  }

  // 6. Étagère murale et casseroles en cuivre au-dessus du four à droite
  const shX = 720;
  const shY = 370;
  drawHandRect(ctx, shX, shY, 215, 14, {
    fill: PALETTE.woodDark,
    radius: 3,
    seed: 52,
    boilStep,
  });
  // Petites casseroles en cuivre suspendues sous l'étagère
  for (let c = 0; c < 2; c++) {
    const cx = shX + 55 + c * 92;
    const cy = shY + 58;
    drawPencilLine(ctx, cx, shY + 14, cx, cy - 22, {
      color: PALETTE.ovenIron,
      width: 2.2,
      seed: 53 + c,
      boilStep,
    });
    drawHandEllipse(ctx, cx, cy, 24 - c * 3, 22 - c * 3, {
      fill: PALETTE.moldCopper,
      hatch: true,
      hatchOpacity: 0.2,
      seed: 55 + c,
      boilStep,
    });
  }

  // 7. Four traditionnel à droite (x = 720..948, y = 690..1240)
  drawKitchenOven(ctx, {
    x: 720,
    y: 690,
    w: 224,
    h: 535,
    doorOpen: ovenDoorOpen,
    glow: ovenGlow,
    hasMold: ovenHasMold,
    cakeBaked: ovenCakeBaked,
    steam: ovenSteam,
    dialAngle,
    boilStep,
  });

  // 8. Rayons de soleil dorés d'après-midi traversant la cuisine
  ctx.save();
  const beamGrad = ctx.createLinearGradient(winX + 60, winY + 80, 260, 1280);
  beamGrad.addColorStop(0, 'rgba(252, 226, 156, 0.23)');
  beamGrad.addColorStop(0.6, 'rgba(252, 226, 156, 0.11)');
  beamGrad.addColorStop(1, 'rgba(252, 226, 156, 0.0)');
  ctx.fillStyle = beamGrad;
  ctx.beginPath();
  ctx.moveTo(winX + 20, winY + 40);
  ctx.lineTo(winX + winW - 10, winY + 40);
  ctx.lineTo(790, 1340);
  ctx.lineTo(180, 1340);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * Dessine le four ancien avec porte battante articulée, vitre lumineuse, moule intérieur et boutons en laiton
 */
function drawKitchenOven(
  ctx: CanvasRenderingContext2D,
  opts: {
    x: number;
    y: number;
    w: number;
    h: number;
    doorOpen: number;
    glow: number;
    hasMold: boolean;
    cakeBaked: number;
    steam: number;
    dialAngle: number;
    boilStep: number;
  }
): void {
  const { x, y, w, h, doorOpen, glow, hasMold, cakeBaked, steam, dialAngle, boilStep } = opts;

  // Corps en fonte émaillée beige
  drawHandRect(ctx, x, y, w, h, {
    fill: PALETTE.ovenBody,
    hatch: true,
    hatchAngle: 0.4,
    hatchSpacing: 13,
    hatchOpacity: 0.14,
    radius: 10,
    seed: 60,
    boilStep,
  });

  // Bandeau supérieur en fonte et boutons de thermostat en laiton
  drawHandRect(ctx, x + 10, y + 14, w - 20, 62, {
    fill: '#D5C5AA',
    radius: 6,
    seed: 61,
    boilStep,
  });

  // 3 boutons rotatifs dont le thermostat réglé par Mamie en Scène 3
  for (let b = 0; b < 3; b++) {
    const bx = x + 48 + b * 64;
    const by = y + 45;
    drawHandEllipse(ctx, bx, by, 14, 14, {
      fill: PALETTE.ovenBrass,
      seed: 62 + b,
      boilStep,
    });
    const ang = b === 1 ? dialAngle : -0.6 + b * 0.5;
    drawPencilLine(
      ctx,
      bx,
      by,
      bx + Math.cos(ang) * 10,
      by + Math.sin(ang) * 10,
      { color: PALETTE.pencilDark, width: 2.5, seed: 66 + b, boilStep }
    );
  }

  // Cavité intérieure du four (visible derrière la vitre ou quand la porte est ouverte)
  const cavX = x + 22;
  const cavY = y + 96;
  const cavW = w - 44;
  const cavH = 220;

  const cavColor = glow > 0.35 ? '#E89D42' : '#735844';
  drawHandRect(ctx, cavX, cavY, cavW, cavH, {
    fill: cavColor,
    seed: 70,
    boilStep,
  });

  if (glow > 0.1) {
    ctx.save();
    const g = ctx.createRadialGradient(
      cavX + cavW * 0.5,
      cavY + cavH * 0.55,
      10,
      cavX + cavW * 0.5,
      cavY + cavH * 0.55,
      cavW * 0.65
    );
    g.addColorStop(0, `rgba(255, 224, 130, ${0.75 * glow})`);
    g.addColorStop(1, 'rgba(232, 157, 66, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(cavX, cavY, cavW, cavH);
    ctx.restore();
  }

  // Grille métallique intérieure
  const rackY = cavY + 150;
  drawPencilLine(ctx, cavX + 6, rackY, cavX + cavW - 6, rackY, {
    color: PALETTE.ovenIron,
    width: 3.2,
    seed: 71,
    boilStep,
  });

  // Si le moule est dans le four (fin Scène 3 et début Scène 5)
  if (hasMold) {
    ctx.save();
    ctx.translate(cavX + cavW * 0.48, rackY - 12);
    ctx.scale(0.78, 0.78);
    drawCakeMold(ctx, 0, 0, {
      batterLevel: 1,
      bakedRise: cakeBaked,
      boilStep,
    });
    ctx.restore();
  }

  // Porte battante du four articulée sur sa charnière basse (cavY + cavH)
  const hingeY = cavY + cavH;
  const openClamped = clamp(doorOpen, 0, 1);

  if (openClamped < 0.85) {
    // Porte fermée ou en cours d'ouverture (hauteur projetée)
    const doorTopY = lerp(cavY - 6, hingeY - 28, openClamped);
    const perspSkew = openClamped * 24;
    drawHandShape(
      ctx,
      [
        [cavX - 6 - perspSkew, doorTopY],
        [cavX + cavW + 6 + perspSkew * 0.3, doorTopY],
        [cavX + cavW + 6, hingeY + 4],
        [cavX - 6, hingeY + 4],
      ],
      {
        fill: 'rgba(218, 202, 176, 0.86)',
        seed: 73,
        boilStep,
      }
    );
    // Poignée en laiton de la porte du four
    drawHandRect(ctx, cavX + 24 - perspSkew * 0.6, doorTopY + 12, cavW - 48, 10, {
      fill: PALETTE.ovenBrass,
      radius: 4,
      seed: 74,
      boilStep,
    });
  } else {
    // Porte rabattue vers l'avant (ouverte)
    drawHandShape(
      ctx,
      [
        [cavX - 28, hingeY + 4],
        [cavX + cavW + 8, hingeY + 4],
        [cavX + cavW - 14, hingeY + 46],
        [cavX - 52, hingeY + 46],
      ],
      {
        fill: '#CBB89B',
        hatch: true,
        hatchOpacity: 0.22,
        seed: 75,
        boilStep,
      }
    );
  }

  // Vapeur tiède et naturelle s'échappant du four ouvert (Scène 5)
  if (steam > 0.02) {
    for (let i = 0; i < 3; i++) {
      drawSteamWisp(
        ctx,
        cavX + 45 + i * 42,
        cavY + 75,
        75,
        boilStep * 0.14 + i * 1.1,
        boilStep,
        76 + i,
        0.52 * steam
      );
    }
  }
}

/**
 * Dessine les chaises en bois à gauche et à droite de la table
 * L'espace sous les assises (y = 1185..1435) est grand ouvert pour voir les pieds qui se balancent !
 */
export function drawKitchenChair(
  ctx: CanvasRenderingContext2D,
  chairX: number,
  seatY: number,
  facing: 'right' | 'left',
  pullBackOffset = 0,
  boilStep = 0,
  seed = 120
): void {
  const dir = facing === 'right' ? 1 : -1;
  const cx = chairX + pullBackOffset;
  const floorY = KITCHEN_LAYOUT.floorY;
  const seatW = 108;
  const seatH = 16;

  // Dossier à barreaux en bois
  const backX = facing === 'right' ? cx - seatW * 0.46 : cx + seatW * 0.46 - 14;
  drawHandRect(ctx, backX, seatY - 195, 14, 198, {
    fill: PALETTE.woodDark,
    radius: 4,
    seed: seed + 1,
    boilStep,
  });
  // Traverse haute du dossier
  drawHandRect(
    ctx,
    cx - seatW * 0.48,
    seatY - 188,
    seatW * 0.55,
    18,
    {
      fill: PALETTE.woodMedium,
      radius: 4,
      seed: seed + 2,
      boilStep,
    }
  );
  // Barreaux verticaux du dossier
  for (let s = 1; s <= 2; s++) {
    const bx = backX + dir * s * 16;
    drawPencilLine(ctx, bx, seatY - 170, bx, seatY, {
      color: PALETTE.woodDark,
      width: 3.2,
      seed: seed + 3 + s,
      boilStep,
    });
  }

  // Pieds arrière et avant de la chaise (descendent jusqu'au plancher y = 1435)
  const leftLegX = cx - seatW * 0.44;
  const rightLegX = cx + seatW * 0.42;
  drawHandRect(ctx, leftLegX, seatY + seatH, 13, floorY - (seatY + seatH), {
    fill: PALETTE.woodDark,
    radius: 2,
    seed: seed + 6,
    boilStep,
  });
  drawHandRect(ctx, rightLegX, seatY + seatH, 13, floorY - (seatY + seatH), {
    fill: PALETTE.woodDark,
    radius: 2,
    seed: seed + 7,
    boilStep,
  });

  // Assise en bois massif
  drawHandRect(ctx, cx - seatW * 0.5, seatY, seatW, seatH, {
    fill: PALETTE.woodLight,
    hatch: true,
    hatchOpacity: 0.14,
    radius: 4,
    seed: seed + 8,
    boilStep,
  });
}

/**
 * Dessine la grande table familiale en bois massif
 * Les pieds de table sont aux extrémités (x = 175 et x = 890) pour dégager tout le dessous de table !
 */
export function drawKitchenTable(ctx: CanvasRenderingContext2D, boilStep: number): void {
  const { tableLeftX, tableRightX, tableTopY, tableBottomY, floorY } = KITCHEN_LAYOUT;
  const tableW = tableRightX - tableLeftX;

  // Ombre douce au sol sous la table
  drawHandEllipse(ctx, (tableLeftX + tableRightX) * 0.5, floorY + 12, tableW * 0.46, 18, {
    fill: 'rgba(92, 64, 51, 0.13)',
    stroke: false,
    seed: 90,
    boilStep,
  });

  // Pieds de table massifs aux extrémités gauche et droite
  drawHandRect(ctx, tableLeftX + 26, tableBottomY, 26, floorY - tableBottomY, {
    fill: PALETTE.woodMedium,
    hatch: true,
    hatchAngle: 1.5,
    hatchOpacity: 0.2,
    radius: 3,
    seed: 91,
    boilStep,
  });
  drawHandRect(ctx, tableRightX - 52, tableBottomY, 26, floorY - tableBottomY, {
    fill: PALETTE.woodMedium,
    hatch: true,
    hatchAngle: 1.5,
    hatchOpacity: 0.2,
    radius: 3,
    seed: 92,
    boilStep,
  });

  // Ceinture sous le plateau
  drawHandRect(ctx, tableLeftX + 22, tableBottomY - 4, tableW - 44, 22, {
    fill: PALETTE.woodDark,
    radius: 2,
    seed: 93,
    boilStep,
  });

  // Plateau en bois chaud en légère perspective cavalière (pour voir les objets posés dessus)
  drawHandShape(
    ctx,
    [
      [tableLeftX + 28, tableTopY - 38],
      [tableRightX - 28, tableTopY - 38],
      [tableRightX, tableTopY],
      [tableRightX, tableBottomY],
      [tableLeftX, tableBottomY],
      [tableLeftX, tableTopY],
    ],
    {
      fill: PALETTE.woodLight,
      hatch: true,
      hatchAngle: 0.04,
      hatchSpacing: 13,
      hatchOpacity: 0.14,
      seed: 94,
      boilStep,
    }
  );

  // Tranche avant du plateau
  drawPencilLine(ctx, tableLeftX + 4, tableTopY, tableRightX - 4, tableTopY, {
    color: PALETTE.woodDark,
    width: 2.6,
    seed: 95,
    boilStep,
  });
}

/**
 * Dessine le jardin lumineux et vivant des grands-parents (Scènes 4 & 8)
 * Nuages qui glissent, pommier, fleurs, herbe qui bouge avec le vent et maison au fond
 */
export function drawGardenEnvironment(
  ctx: CanvasRenderingContext2D,
  frame: number,
  boilStep: number,
  cameraPanX = 0
): void {
  const W = FILM_CONFIG.width;
  const H = FILM_CONFIG.height;
  const wind = Math.sin(frame * 0.07);

  ctx.save();
  ctx.translate(cameraPanX, 0);

  // 1. Ciel d'été doux et lumineux
  drawHandRect(ctx, -80, 30, W + 160, 880, {
    fill: PALETTE.skySoft,
    stroke: false,
    seed: 700,
    boilStep,
  });

  // Soleil doré d'après-midi (en haut à gauche)
  drawHandEllipse(ctx, 210, 220, 68, 68, {
    fill: '#FAE39C',
    fillOpacity: 0.72,
    stroke: false,
    seed: 701,
    boilStep,
  });

  // 2. Nuages aquarelle qui traversent lentement le ciel
  const cloudDrift = (frame * 0.55) % 420;
  for (let c = 0; c < 3; c++) {
    const cx = 160 + c * 340 + cloudDrift * (0.6 + c * 0.2) - 80;
    const cy = 240 + (c % 2) * 75;
    drawHandEllipse(ctx, cx, cy, 78, 28, {
      fill: PALETTE.cloudCream,
      fillOpacity: 0.88,
      seed: 705 + c,
      boilStep,
    });
    drawHandEllipse(ctx, cx - 32, cy + 8, 48, 22, {
      fill: PALETTE.cloudCream,
      fillOpacity: 0.85,
      stroke: false,
      seed: 710 + c,
      boilStep,
    });
    drawHandEllipse(ctx, cx + 36, cy + 6, 52, 22, {
      fill: PALETTE.cloudCream,
      fillOpacity: 0.85,
      stroke: false,
      seed: 715 + c,
      boilStep,
    });
  }

  // 3. Façade de la maison des grands-parents au second plan à droite (continuité avec la cuisine)
  const houseX = 670;
  const houseY = 470;
  drawHandRect(ctx, houseX, houseY, 340, 410, {
    fill: '#EFE2CB',
    hatch: true,
    hatchOpacity: 0.12,
    radius: 4,
    seed: 720,
    boilStep,
  });
  // Toit en tuiles ocre-rose
  drawHandShape(
    ctx,
    [
      [houseX - 24, houseY + 6],
      [houseX + 170, houseY - 105],
      [houseX + 364, houseY + 6],
    ],
    {
      fill: '#C97B63',
      hatch: true,
      hatchAngle: 0.5,
      hatchSpacing: 10,
      hatchOpacity: 0.22,
      seed: 721,
      boilStep,
    }
  );
  // Porte-fenêtre de la cuisine donnant sur le jardin (éclairée de l'intérieur)
  drawHandRect(ctx, houseX + 75, houseY + 145, 118, 260, {
    fill: '#F7D288',
    radius: 4,
    seed: 722,
    boilStep,
  });
  drawPencilLine(ctx, houseX + 134, houseY + 145, houseX + 134, houseY + 405, {
    color: PALETTE.woodDark,
    width: 3.0,
    seed: 723,
    boilStep,
  });

  // 4. Collines d'herbe tendre et pelouse du jardin (y = 830..1890)
  drawHandShape(
    ctx,
    [
      [-80, 850],
      [340, 815],
      [760, 845],
      [W + 80, 830],
      [W + 80, H - 25],
      [-80, H - 25],
    ],
    {
      fill: PALETTE.grassLight,
      hatch: true,
      hatchAngle: -0.25,
      hatchSpacing: 18,
      hatchOpacity: 0.12,
      seed: 730,
      boilStep,
    }
  );

  // Chemin de pierres plates menant vers la porte de la cuisine
  const stones: [number, number, number, number][] = [
    [540, 1280, 68, 22],
    [615, 1180, 60, 20],
    [680, 1085, 54, 18],
    [735, 995, 48, 16],
    [775, 915, 44, 14],
  ];
  for (let i = 0; i < stones.length; i++) {
    const [sx, sy, rx, ry] = stones[i];
    drawHandEllipse(ctx, sx, sy, rx, ry, {
      fill: PALETTE.pathStone,
      seed: 735 + i,
      boilStep,
    });
  }

  // 5. Grand pommier familial à gauche (tronc et feuillage ondulant dans le vent)
  const treeX = 195;
  const treeBaseY = 1040;
  drawHandShape(
    ctx,
    [
      [treeX - 38, treeBaseY],
      [treeX - 24, treeBaseY - 260],
      [treeX - 65, treeBaseY - 370],
      [treeX - 18, treeBaseY - 350],
      [treeX + 22, treeBaseY - 360],
      [treeX + 68, treeBaseY - 390],
      [treeX + 30, treeBaseY - 250],
      [treeX + 44, treeBaseY],
    ],
    {
      fill: PALETTE.trunkBrown,
      hatch: true,
      hatchAngle: 1.5,
      hatchSpacing: 7,
      hatchOpacity: 0.28,
      seed: 740,
      boilStep,
    }
  );

  // Masses de feuillage qui respirent avec le vent d'été
  const puffs: [number, number, number, number, string][] = [
    [treeX - 45 + wind * 8, 575, 125, 88, PALETTE.foliageSage],
    [treeX + 95 + wind * 10, 595, 130, 84, PALETTE.foliageWarm],
    [treeX + 25 + wind * 12, 485, 138, 92, PALETTE.foliageSage],
    [treeX + 165 + wind * 9, 520, 105, 76, PALETTE.foliageWarm],
  ];
  for (let i = 0; i < puffs.length; i++) {
    const [px, py, rx, ry, col] = puffs[i];
    drawHandEllipse(ctx, px, py, rx, ry, {
      fill: col,
      hatch: true,
      hatchOpacity: 0.14,
      seed: 745 + i,
      boilStep,
    });
  }

  // Quelques pommes rouges dans l'arbre
  const apples: Point[] = [
    [treeX - 25 + wind * 8, 585],
    [treeX + 75 + wind * 10, 540],
    [treeX + 135 + wind * 9, 605],
  ];
  for (let a = 0; a < apples.length; a++) {
    drawHandEllipse(ctx, apples[a][0], apples[a][1], 10, 10, {
      fill: PALETTE.berryRed,
      seed: 755 + a,
      boilStep,
    });
  }

  // 6. Brins d'herbe et fleurs des champs (marguerites et coquelicots) qui oscillent avec le vent
  const rand = mulberry32(7700);
  for (let g = 0; g < 26; g++) {
    const gx = 90 + rand() * 880;
    const gy = 940 + rand() * 460;
    const sway = Math.sin(frame * 0.09 + g * 0.7) * 9;
    drawPencilPolyline(
      ctx,
      [
        [gx, gy],
        [gx + sway * 0.5, gy - 16],
        [gx + sway, gy - 30],
      ],
      {
        color: PALETTE.grassDeep,
        width: 2.1,
        seed: 770 + g,
        boilStep,
      }
    );

    // Une marguerite ou un coquelicot tous les 3 touffes d'herbe
    if (g % 3 === 0) {
      const fx = gx + sway;
      const fy = gy - 32;
      const isPoppy = g % 6 === 0;
      drawHandEllipse(ctx, fx, fy, isPoppy ? 9 : 8, isPoppy ? 7 : 8, {
        fill: isPoppy ? PALETTE.berryRed : '#FFFDF7',
        seed: 810 + g,
        boilStep,
      });
      drawHandEllipse(ctx, fx, fy, 3.5, 3.5, {
        fill: isPoppy ? PALETTE.pencilDark : '#EBBF5B',
        stroke: false,
        seed: 840 + g,
        boilStep,
      });
    }
  }

  ctx.restore();
}
