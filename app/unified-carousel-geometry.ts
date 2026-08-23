const TAU = Math.PI * 2;
const PANEL_COUNT = 12;
const ANGULAR_STEP = TAU / PANEL_COUNT;
const IDLE_GAP_ANGLE = 0.032;
const MAX_VISIBLE_ANGLE = Math.PI * 0.64;

type Point = {
  x: number;
  y: number;
};

type Bounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type Projection = Point & {
  scale: number;
};

export type UnifiedPanelGeometry = {
  bounds: Bounds;
  depth: number;
  imageIndex: number;
  path: string;
};

export type UnifiedCarouselGeometry = {
  cardHeight: number;
  panels: UnifiedPanelGeometry[];
  visibleAngle: number;
};

type GeometryInput = {
  expandProgress: number;
  height: number;
  mergeProgress: number;
  orbitPhase: number;
  width: number;
};

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

function normalizeAngle(angle: number) {
  return ((angle + Math.PI) % TAU + TAU) % TAU - Math.PI;
}

function format(value: number) {
  return Number(value.toFixed(2));
}

function pointString(point: Point) {
  return `${format(point.x)} ${format(point.y)}`;
}

function pointDistance(first: Point, second: Point) {
  return Math.hypot(second.x - first.x, second.y - first.y);
}

function createProjection(
  width: number,
  height: number,
  cardHeight: number,
  expandProgress: number,
) {
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = cardHeight * 1.38;
  const perspective = radius;

  return (angle: number, edge: -1 | 1): Projection => {
    const scale = perspective / (perspective + radius * Math.cos(angle));
    const projectedY = centerY + edge * (cardHeight / 2) * scale;
    const expandedY = edge === -1 ? -2 : height + 2;

    return {
      x: centerX + radius * Math.sin(angle) * scale,
      y: projectedY + (expandedY - projectedY) * expandProgress,
      scale,
    };
  };
}

function derivativeAt(
  project: (angle: number, edge: -1 | 1) => Projection,
  angle: number,
  edge: -1 | 1,
) {
  const epsilon = 0.0001;
  const before = project(angle - epsilon, edge);
  const after = project(angle + epsilon, edge);

  return {
    x: (after.x - before.x) / (epsilon * 2),
    y: (after.y - before.y) / (epsilon * 2),
  };
}

function cubicCurve(
  project: (angle: number, edge: -1 | 1) => Projection,
  startAngle: number,
  endAngle: number,
  edge: -1 | 1,
) {
  const start = project(startAngle, edge);
  const end = project(endAngle, edge);
  const startDerivative = derivativeAt(project, startAngle, edge);
  const endDerivative = derivativeAt(project, endAngle, edge);
  const interval = endAngle - startAngle;
  const firstControl = {
    x: start.x + (startDerivative.x * interval) / 3,
    y: start.y + (startDerivative.y * interval) / 3,
  };
  const secondControl = {
    x: end.x - (endDerivative.x * interval) / 3,
    y: end.y - (endDerivative.y * interval) / 3,
  };

  return `C ${pointString(firstControl)} ${pointString(secondControl)} ${pointString(end)}`;
}

function createRoundedPanelPath(
  project: (angle: number, edge: -1 | 1) => Projection,
  leftAngle: number,
  rightAngle: number,
  cornerRadius: number,
) {
  const topLeft = project(leftAngle, -1);
  const topRight = project(rightAngle, -1);
  const bottomLeft = project(leftAngle, 1);
  const bottomRight = project(rightAngle, 1);
  const panelSpan = rightAngle - leftAngle;
  const verticalRadius = Math.min(
    cornerRadius,
    pointDistance(topLeft, bottomLeft) * 0.18,
    pointDistance(topRight, bottomRight) * 0.18,
  );
  const leftDerivative = derivativeAt(project, leftAngle, -1);
  const rightDerivative = derivativeAt(project, rightAngle, -1);
  const leftAngleInset = Math.min(
    panelSpan * 0.22,
    verticalRadius / Math.max(Math.hypot(leftDerivative.x, leftDerivative.y), 1),
  );
  const rightAngleInset = Math.min(
    panelSpan * 0.22,
    verticalRadius / Math.max(Math.hypot(rightDerivative.x, rightDerivative.y), 1),
  );
  const topStartAngle = leftAngle + leftAngleInset;
  const topEndAngle = rightAngle - rightAngleInset;
  const bottomStartAngle = rightAngle - rightAngleInset;
  const bottomEndAngle = leftAngle + leftAngleInset;
  const topStart = project(topStartAngle, -1);
  const bottomStart = project(bottomStartAngle, 1);

  return [
    `M ${format(topLeft.x)} ${format(topLeft.y + verticalRadius)}`,
    `Q ${pointString(topLeft)} ${pointString(topStart)}`,
    cubicCurve(project, topStartAngle, topEndAngle, -1),
    `Q ${pointString(topRight)} ${format(topRight.x)} ${format(topRight.y + verticalRadius)}`,
    `L ${format(bottomRight.x)} ${format(bottomRight.y - verticalRadius)}`,
    `Q ${pointString(bottomRight)} ${pointString(bottomStart)}`,
    cubicCurve(project, bottomStartAngle, bottomEndAngle, 1),
    `Q ${pointString(bottomLeft)} ${format(bottomLeft.x)} ${format(bottomLeft.y - verticalRadius)}`,
    "Z",
  ].join(" ");
}

function createBounds(
  project: (angle: number, edge: -1 | 1) => Projection,
  leftAngle: number,
  rightAngle: number,
): Bounds {
  let minimumX = Number.POSITIVE_INFINITY;
  let minimumY = Number.POSITIVE_INFINITY;
  let maximumX = Number.NEGATIVE_INFINITY;
  let maximumY = Number.NEGATIVE_INFINITY;
  const samples = 16;

  for (let index = 0; index <= samples; index += 1) {
    const angle = leftAngle + ((rightAngle - leftAngle) * index) / samples;
    const top = project(angle, -1);
    const bottom = project(angle, 1);

    minimumX = Math.min(minimumX, top.x, bottom.x);
    minimumY = Math.min(minimumY, top.y, bottom.y);
    maximumX = Math.max(maximumX, top.x, bottom.x);
    maximumY = Math.max(maximumY, top.y, bottom.y);
  }

  return {
    x: format(minimumX),
    y: format(minimumY),
    width: format(Math.max(maximumX - minimumX, 1)),
    height: format(Math.max(maximumY - minimumY, 1)),
  };
}

export function createUnifiedCarouselGeometry({
  expandProgress,
  height,
  mergeProgress,
  orbitPhase,
  width,
}: GeometryInput): UnifiedCarouselGeometry {
  const cardHeight = clamp(height * 0.59, 360, 420);
  const radius = cardHeight * 1.38;
  const overscan = cardHeight * 0.35;
  const visibleAngle = Math.min(
    MAX_VISIBLE_ANGLE,
    2 * Math.atan((width / 2 + overscan) / radius),
  );
  const gapAngle = IDLE_GAP_ANGLE * (1 - mergeProgress);
  const halfSpan = (ANGULAR_STEP - gapAngle) / 2;
  const cornerRadius = clamp(cardHeight * 0.035, 16, 24) * (1 - mergeProgress);
  const project = createProjection(width, height, cardHeight, expandProgress);
  const panels: UnifiedPanelGeometry[] = [];

  for (let imageIndex = 0; imageIndex < PANEL_COUNT; imageIndex += 1) {
    const panelAngle = normalizeAngle(imageIndex * ANGULAR_STEP + orbitPhase);
    const leftAngle = Math.max(panelAngle - halfSpan, -visibleAngle);
    const rightAngle = Math.min(panelAngle + halfSpan, visibleAngle);

    if (leftAngle >= rightAngle) {
      continue;
    }

    panels.push({
      bounds: createBounds(project, leftAngle, rightAngle),
      depth: project(panelAngle, -1).scale,
      imageIndex,
      path: createRoundedPanelPath(project, leftAngle, rightAngle, cornerRadius),
    });
  }

  panels.sort((first, second) => first.depth - second.depth);

  return {
    cardHeight,
    panels,
    visibleAngle,
  };
}
