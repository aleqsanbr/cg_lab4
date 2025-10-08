function applyMatrix(point, matrix) {
    const x = point.x * matrix[0][0] + point.y * matrix[0][1] + matrix[0][2];
    const y = point.x * matrix[1][0] + point.y * matrix[1][1] + matrix[1][2];
    return { x, y };
}

function multiplyMatrices(m1, m2) {
    const result = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
    ];
    for (let i = 0; i < 3; i++)
        for (let j = 0; j < 3; j++)
            for (let k = 0; k < 3; k++)
                result[i][j] += m1[i][k] * m2[k][j];
    return result;
}

function createTranslationMatrix(dx, dy) {
    return [
        [1, 0, dx],
        [0, 1, dy],
        [0, 0, 1]
    ];
}

function createRotationMatrix(angleInDegrees) {
    const rad = angleInDegrees * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    return [
        [cos, -sin, 0],
        [sin, cos, 0],
        [0, 0, 1]
    ];
}

function createScaleMatrix(sx, sy) {
    return [
        [sx, 0, 0],
        [0, sy, 0],
        [0, 0, 1]
    ];
}

function crossProduct(p1, p2, p3) {
    return (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x);
}

function createRotationAroundPointMatrix(angleInDegrees, cx, cy) {
    const t1 = createTranslationMatrix(-cx, -cy);
    const r = createRotationMatrix(angleInDegrees);
    const t2 = createTranslationMatrix(cx, cy);
    return multiplyMatrices(multiplyMatrices(t2, r), t1);
}

function createScaleAroundPointMatrix(sx, sy, cx, cy) {
    const t1 = createTranslationMatrix(-cx, -cy);
    const s = createScaleMatrix(sx, sy);
    const t2 = createTranslationMatrix(cx, cy);
    return multiplyMatrices(multiplyMatrices(t2, s), t1);
}

function getPolygonCenter(points) {
    const sumX = points.reduce((sum, p) => sum + p.x, 0);
    const sumY = points.reduce((sum, p) => sum + p.y, 0);
    return { x: sumX / points.length, y: sumY / points.length };
}

function findLineIntersection(p1, p2, p3, p4) {
    const x1 = p1.x, y1 = p1.y;
    const x2 = p2.x, y2 = p2.y;
    const x3 = p3.x, y3 = p3.y;
    const x4 = p4.x, y4 = p4.y;

    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (Math.abs(denom) < 1e-10) return null;

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
        return {
            x: x1 + t * (x2 - x1),
            y: y1 + t * (y2 - y1)
        };
    }

    return null;
}

function pointInPolygonWinding(polygonPoints, testPoint) {
    if (polygonPoints.length < 3) {
        return { inside: false, type: "NOT_POLYGON", message: "Недостаточно точек для полигона" };
    }

    let windingNumber = 0;
    const n = polygonPoints.length;

    for (let i = 0; i < n; i++) {
        const p1 = polygonPoints[i];
        const p2 = polygonPoints[(i + 1) % n];

        // Вычисляем вклад текущего ребра в winding number
        if (p1.y <= testPoint.y) {
            if (p2.y > testPoint.y && crossProduct(p1, p2, testPoint) > 0) {
                windingNumber++;
            }
        } else {
            if (p2.y <= testPoint.y && crossProduct(p1, p2, testPoint) < 0) {
                windingNumber--;
            }
        }
    }

    const isInside = windingNumber !== 0;

    return {
        inside: isInside,
        type: isInside ? "INSIDE" : "OUTSIDE",
        message: isInside ? "Point inside polygon" : "Point outside polygon",
        windingNumber: windingNumber
    };
}

function classifyPointToEdge(point, edgeStart, edgeEnd) {
    const cross = crossProduct(edgeStart, edgeEnd, point);

    // Определяем положение относительно ребра
    let position;
    if (Math.abs(cross) < 1e-10) {
        position = "ON_LINE";
    } else if (cross > 0) {
        position = "LEFT";
    } else {
        position = "RIGHT";
    }

    return {
        position: position,
        crossProduct: cross,
        message: getPositionMessage(position)
    };
}

function getPositionMessage(position) {
    switch (position) {
        case "LEFT":
            return `Point is to the left from the edge`;
        case "RIGHT":
            return `Point is to the right from the edge`;
        case "ON_LINE":
            return `Point is on the line of the edge`;
        default:
            return "Unknown position";
    }
}

function findClosestEdge(polygonPoints, point) {
    let minDistance = Infinity;
    let closestEdgeIndex = -1;
    let closestEdgePoints = null;

    for (let i = 0; i < polygonPoints.length; i++) {
        const p1 = polygonPoints[i];
        const p2 = polygonPoints[(i + 1) % polygonPoints.length];

        const distance = pointToEdgeDistance(point, p1, p2);

        if (distance < minDistance) {
            minDistance = distance;
            closestEdgeIndex = i;
            closestEdgePoints = [p1, p2];
        }
    }

    return {
        edgeIndex: closestEdgeIndex,
        points: closestEdgePoints,
        distance: minDistance
    };
}

function pointToEdgeDistance(point, edgeStart, edgeEnd) {
    const A = point.x - edgeStart.x;
    const B = point.y - edgeStart.y;
    const C = edgeEnd.x - edgeStart.x;
    const D = edgeEnd.y - edgeStart.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;

    if (lenSq === 0) {
        // Ребро - точка
        return Math.sqrt(A * A + B * B);
    }

    let param = dot / lenSq;

    if (param < 0) {
        // Ближайшая точка - edgeStart
        return Math.sqrt(A * A + B * B);
    } else if (param > 1) {
        // Ближайшая точка - edgeEnd
        return Math.sqrt((point.x - edgeEnd.x) ** 2 + (point.y - edgeEnd.y) ** 2);
    } else {
        // Ближайшая точка на отрезке
        const projX = edgeStart.x + param * C;
        const projY = edgeStart.y + param * D;
        return Math.sqrt((point.x - projX) ** 2 + (point.y - projY) ** 2);
    }
}