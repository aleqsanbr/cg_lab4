const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const finishBtn = document.getElementById('finishPolygon');
const clearBtn = document.getElementById('clearAll');
const currentPointsSpan = document.getElementById('currentPoints');
const polygonsDiv = document.getElementById('polygons');

const MODES = { CREATE: 'create', INTERSECT: 'intersect', POINT_IN_POLYGON: 'pointInPolygon', POINT_TO_EDGE: 'pointToEdge' };
let currentMode = MODES.CREATE;

let polygons = [];
let currentPolygon = [];
let selectedPolygonIndex = -1;

let intersectEdge = [];
let intersectionPoints = [];
let testPoint = null;
let classificationResult = null;

const currentPolygonColor = '#FF5722';
const colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#ef4444', '#f97316', '#84cc16', '#3b82f6'];
let colorIndex = 0;

function init() {
    clearScene()

    canvas.addEventListener('click', onCanvasClick);
    finishBtn.addEventListener('click', finishPolygon);
    clearBtn.addEventListener('click', clearScene);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && currentPolygon.length > 0) finishPolygon();
    });

    document.getElementById('modeCreate').addEventListener('click', () => switchMode(MODES.CREATE));
    document.getElementById('modeIntersect').addEventListener('click', () => switchMode(MODES.INTERSECT));
    document.getElementById('modePointInPolygon').addEventListener('click', () => switchMode(MODES.POINT_IN_POLYGON));
    document.getElementById('modePointToEdge').addEventListener('click', () => switchMode(MODES.POINT_TO_EDGE));

    document.getElementById('translateBtn').addEventListener('click', handleTranslate);
    document.getElementById('rotatePointBtn').addEventListener('click', handleRotateAroundPoint);
    document.getElementById('rotateCenterBtn').addEventListener('click', handleRotateAroundCenter);
    document.getElementById('scalePointBtn').addEventListener('click', handleScaleAroundPoint);
    document.getElementById('scaleCenterBtn').addEventListener('click', handleScaleAroundCenter);

    redraw();
}

function switchMode(mode) {
    currentMode = mode;
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));

    const resultPanel = document.getElementById('resultPanel');
    const resultText = document.getElementById('resultText');

    if (mode === MODES.CREATE) {
        document.getElementById('modeCreate').classList.add('active');
        resultPanel.style.display = 'none';
    } else if (mode === MODES.INTERSECT) {
        document.getElementById('modeIntersect').classList.add('active');
        resultPanel.style.display = 'block';
        resultText.innerHTML = 'Выберите полигон и создайте линию пересечения';
    } else if (mode === MODES.POINT_IN_POLYGON) {
        document.getElementById('modePointInPolygon').classList.add('active');
        resultPanel.style.display = 'block';
        resultText.innerHTML = 'Выберите полигон и кликните точку';
    } else if (mode === MODES.POINT_TO_EDGE) {
        document.getElementById('modePointToEdge').classList.add('active');
        resultPanel.style.display = 'block';
        resultText.innerHTML = 'Выберите полигон и кликните точку';
    }

    currentPolygon = [];
    currentPointsSpan.textContent = '0';
    intersectEdge = [];
    intersectionPoints = [];
    testPoint = null;
    classificationResult = null;
    updatePolygonList();
    redraw();
}

function updateResultText(text) {
    const panel = document.getElementById('resultPanel');
    const resultText = document.getElementById('resultText');

    if (text) {
        panel.style.display = 'block';
        resultText.innerHTML = text;
    } else {
        panel.style.display = 'none';
        resultText.innerHTML = '';
    }
}

function onCanvasClick(e) {
    const rect = canvas.getBoundingClientRect();
    const point = { x: e.clientX - rect.left, y: e.clientY - rect.top };

    if (currentMode === MODES.CREATE) {
        handleCreateClick(point);
    } else if (currentMode === MODES.INTERSECT) {
        handleIntersectClick(point);
    } else if (currentMode === MODES.POINT_IN_POLYGON) {
        handlePointInPolygonClick(point);
    } else if (currentMode === MODES.POINT_TO_EDGE) {
        handlePointToEdgeClick(point);
    }
}

function handleCreateClick(point) {
    currentPolygon.push(point);
    currentPointsSpan.textContent = currentPolygon.length.toString();
    redraw();
}

function handleIntersectClick(point) {
    if (selectedPolygonIndex === -1) {
        alert('Выберите полигон!');
        return;
    }

    if (intersectEdge.length === 2) {
        intersectEdge = [];
        intersectionPoints = [];
    }

    intersectEdge.push(point);

    if (intersectEdge.length === 2) {
        calculateIntersection();
    }

    redraw();
}

function handlePointInPolygonClick(point) {
    if (selectedPolygonIndex === -1) {
        alert('Выберите полигон!');
        return;
    }

    testPoint = point;
    // TODO: Проверка принадлежит ли заданная пользователем (с помощью мыши) точка выпуклому и невыпуклому полигонам
    // checkPointInPolygon();
    redraw();
}

function handlePointToEdgeClick(point) {
    if (selectedPolygonIndex === -1) {
        alert('Выберите полигон!');
        return;
    }

    testPoint = point;
    // TODO: Классифицировать положение точки относительно ребра (справа или слева)
    // classifyPointToEdges();
    redraw();
}

function calculateIntersection() {
    const polygon = polygons[selectedPolygonIndex];
    intersectionPoints = [];

    for (let i = 0; i < polygon.points.length; i++) {
        const p1 = polygon.points[i];
        const p2 = polygon.points[(i + 1) % polygon.points.length];

        if (polygon.points.length === 2 && i > 0) break;

        const intersection = findLineIntersection(p1, p2, intersectEdge[0], intersectEdge[1]);
        if (intersection) {
            intersectionPoints.push(intersection); // Добавляем в массив, не break!
        }
    }

    redraw();
}

function finishPolygon() {
    if (currentPolygon.length === 0) return;

    polygons.push({ points: [...currentPolygon], color: colors[colorIndex % colors.length] });
    colorIndex++;
    currentPolygon = [];
    currentPointsSpan.textContent = '0';

    updatePolygonList();
    redraw();
}

function clearScene() {
    polygons = [];
    currentPolygon = [];
    selectedPolygonIndex = -1;
    colorIndex = 0;
    currentPointsSpan.textContent = '0';
    intersectEdge = [];
    intersectionPoints = [];
    testPoint = null;
    classificationResult = null;
    updateResultText(null);
    updatePolygonList();
    redraw();
    switchMode(MODES.CREATE)
}

function updatePolygonList() {
    if (polygons.length === 0) {
        polygonsDiv.innerHTML = '<em style="color: #999;">Нет полигонов</em>';
        return;
    }

    polygonsDiv.innerHTML = polygons.map((polygon, index) => {
        const type = polygon.points.length === 1 ? 'Точка' : polygon.points.length === 2 ? 'Ребро' : `Полигон (${polygon.points.length})`;

        return `<div class="polygon-item ${index === selectedPolygonIndex ? 'selected' : ''}" onclick="selectPolygon(${index})" style="border-left: 4px solid ${polygon.color}">
                    ${index + 1}. ${type}
                </div>`;
    }).join('');
}

function selectPolygon(index) {
    if (currentMode === MODES.INTERSECT) {
        selectedPolygonIndex = index;
        intersectEdge = [];
        intersectionPoints = [];
    } else {
        selectedPolygonIndex = selectedPolygonIndex === index ? -1 : index;
    }

    updatePolygonList();
    redraw();
}

function handleTranslate() {
    const dx = parseFloat(document.getElementById('dx').value) || 0;
    const dy = parseFloat(document.getElementById('dy').value) || 0;
    const matrix = createTranslationMatrix(dx, dy);
    transformPolygon(selectedPolygonIndex, matrix);
}

function handleRotateAroundPoint() {
    const angle = parseFloat(document.getElementById('rotateAngle').value) || 0;
    const cx = parseFloat(document.getElementById('rotateCx').value) || 0;
    const cy = parseFloat(document.getElementById('rotateCy').value) || 0;
    const matrix = createRotationAroundPointMatrix(angle, cx, cy);
    transformPolygon(selectedPolygonIndex, matrix);
}

function handleRotateAroundCenter() {
    if (selectedPolygonIndex < 0 || selectedPolygonIndex >= polygons.length) return;

    const angle = parseFloat(document.getElementById('rotateCenterAngle').value) || 0;
    const center = getPolygonCenter(polygons[selectedPolygonIndex].points);
    const matrix = createRotationAroundPointMatrix(angle, center.x, center.y);
    transformPolygon(selectedPolygonIndex, matrix);
}

function handleScaleAroundPoint() {
    const sx = parseFloat(document.getElementById('scaleSx').value) || 1;
    const sy = parseFloat(document.getElementById('scaleSy').value) || 1;
    const cx = parseFloat(document.getElementById('scaleCx').value) || 0;
    const cy = parseFloat(document.getElementById('scaleCy').value) || 0;
    const matrix = createScaleAroundPointMatrix(sx, sy, cx, cy);
    transformPolygon(selectedPolygonIndex, matrix);
}

function handleScaleAroundCenter() {
    if (selectedPolygonIndex < 0 || selectedPolygonIndex >= polygons.length) return;

    const sx = parseFloat(document.getElementById('scaleCenterSx').value) || 1;
    const sy = parseFloat(document.getElementById('scaleCenterSy').value) || 1;
    const center = getPolygonCenter(polygons[selectedPolygonIndex].points);
    const matrix = createScaleAroundPointMatrix(sx, sy, center.x, center.y);
    transformPolygon(selectedPolygonIndex, matrix);
}

function transformPolygon(polygonIndex, matrix) {
    if (polygonIndex < 0 || polygonIndex >= polygons.length) return;

    const polygon = polygons[polygonIndex];
    polygon.points = polygon.points.map(p => applyMatrix(p, matrix));
    redraw();
}

init();