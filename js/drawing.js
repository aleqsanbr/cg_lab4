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
        let pointColor = '#8b5cf6'; // фиолетовый по умолчанию

        if (classificationResult) {
            switch (classificationResult.type) {
                case 'INSIDE':
                    pointColor = '#10b981'; // зеленый
                    break;
                case 'OUTSIDE':
                    pointColor = '#ef4444'; // красный
                    break;
            }
        }

        ctx.fillStyle = pointColor;
        ctx.beginPath();
        ctx.arc(testPoint.x, testPoint.y, 6, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawPointToEdgeMode() {
    if (testPoint) {
        const polygon = polygons[selectedPolygonIndex];

        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(testPoint.x, testPoint.y, 6, 0, Math.PI * 2);
        ctx.fill();

        if (selectedEdgeIndex !== -1 && polygon) {
            const edgeStart = polygon.points[selectedEdgeIndex];
            const edgeEnd = polygon.points[(selectedEdgeIndex + 1) % polygon.points.length];

            // Рисуем выделенное ребро
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(edgeStart.x, edgeStart.y);
            ctx.lineTo(edgeEnd.x, edgeEnd.y);
            ctx.stroke();

            // Рисуем проекцию точки на ребро
            const A = testPoint.x - edgeStart.x;
            const B = testPoint.y - edgeStart.y;
            const C = edgeEnd.x - edgeStart.x;
            const D = edgeEnd.y - edgeStart.y;

            const dot = A * C + B * D;
            const lenSq = C * C + D * D;
            const param = Math.max(0, Math.min(1, dot / lenSq));

            const projX = edgeStart.x + param * C;
            const projY = edgeStart.y + param * D;

            // Линия от точки до проекции
            ctx.strokeStyle = '#8b5cf6';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 3]);
            ctx.beginPath();
            ctx.moveTo(testPoint.x, testPoint.y);
            ctx.lineTo(projX, projY);
            ctx.stroke();
            ctx.setLineDash([]);
        }
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