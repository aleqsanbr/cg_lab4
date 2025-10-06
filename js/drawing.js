function drawPolygon(ctx, points, color, isSelected, isCurrent = false) {
    if (points.length === 0) return;

    const lineWidth = isSelected ? 5 : 2;
    const pointRadius = isSelected ? 8 : 4;

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = lineWidth;

    if (points.length === 1) {
        ctx.beginPath();
        ctx.arc(points[0].x, points[0].y, pointRadius, 0, Math.PI * 2);
        ctx.fill();
        return;
    }

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    if (!isCurrent && points.length > 2) {
        ctx.lineTo(points[0].x, points[0].y);
    }
    ctx.stroke();

    points.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, pointRadius, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawCreateMode() {
    if (currentPolygon.length > 0) {
        drawPolygon(ctx, currentPolygon, currentPolygonColor, false, true);
    }
}

function drawIntersectMode() {
    if (intersectEdge.length > 0) {
        ctx.strokeStyle = '#FF5722';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(intersectEdge[0].x, intersectEdge[0].y);
        if (intersectEdge.length === 2) {
            ctx.lineTo(intersectEdge[1].x, intersectEdge[1].y);
        }
        ctx.stroke();

        intersectEdge.forEach(p => {
            ctx.fillStyle = '#FF5722';
            ctx.beginPath();
            ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    if (intersectionPoints.length > 0) {
        intersectionPoints.forEach(point => {
            ctx.fillStyle = '#10b981';
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(point.x, point.y, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        });
    }
}

function drawPointInPolygonMode() {
    if (testPoint) {
        // TODO: выводить инфу в div#resultText updateResultText(text)
        ctx.fillStyle = '#8b5cf6';
        ctx.beginPath();
        ctx.arc(testPoint.x, testPoint.y, 6, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawPointToEdgeMode() {
    if (testPoint) {
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(testPoint.x, testPoint.y, 6, 0, Math.PI * 2);
        ctx.fill();

        // TODO: выводить инфу в div#resultText updateResultText(text)
    }
}

function redraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    polygons.forEach((poly, index) => {
        drawPolygon(ctx, poly.points, poly.color, index === selectedPolygonIndex);
    });

    if (currentMode === MODES.CREATE) {
        drawCreateMode();
    } else if (currentMode === MODES.INTERSECT) {
        drawIntersectMode();
    } else if (currentMode === MODES.POINT_IN_POLYGON) {
        drawPointInPolygonMode();
    } else if (currentMode === MODES.POINT_TO_EDGE) {
        drawPointToEdgeMode();
    }
}