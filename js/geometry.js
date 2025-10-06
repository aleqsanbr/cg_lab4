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