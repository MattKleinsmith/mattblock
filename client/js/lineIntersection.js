// https://github.com/Silverwolf90/2d-visibility/blob/master/src/lineIntersection.js

function isIntersection(point) {
    return isFinite(point.x) && isFinite(point.y);
}

const getLineIntersection = (point1, point2, point3, point4) => {
    const s = (
        (point4.x - point3.x) * (point1.y - point3.y) -
        (point4.y - point3.y) * (point1.x - point3.x)
    ) / (
            (point4.y - point3.y) * (point2.x - point1.x) -
            (point4.x - point3.x) * (point2.y - point1.y)
        );

    const intersectionPoint = {
        x: point1.x + s * (point2.x - point1.x),
        y: point1.y + s * (point2.y - point1.y)
    }

    return intersectionPoint;
};

// https://stackoverflow.com/a/328110/3822261
function isOnSegment(a, b, c) {
    // "Return true iff point b intersects the line segment from a to c."
    // (or the degenerate case that all 3 points are coincident)
    return areCollinear(a, b, c) && (a.x != b.x ? isWithin(a.x, c.x, b.x) : isWithin(a.y, c.y, b.y));
}

function areCollinear(a, b, c) {
    // "Return true iff a, b, and c all lie on the same line."
    return (b.x - a.x) * (c.y - a.y) === (c.x - a.x) * (b.y - a.y)
}

function isWithin(x, min, max) {
    return x >= min && x <= max;
}





function isLineSegmentIntersection(lineIntersection, point1, point2, point3, point4) {
    return isOnSegment(lineIntersection, point1, point2) && isOnSegment(lineIntersection, point3, point4)
}

function getLineSegmentIntersection(point1, point2, point3, point4) {
    const lineIntersection = getLineIntersection(point1, point2, point3, point4);
    return isLineSegmentIntersection(lineIntersection) ? lineIntersection : false;
}

console.log(getLineSegmentIntersection(
    { x: 1468.229166666666, y: 350 }, { x: 1466.229166666666, y: 171 },
    { x: -95.83333333334377, y: -911.2500000000568 }, { x: -45.833333333343774, y: -911.2500000000568 }));

/*

- Player has freeze gun 🔫🧊
- Player clicks
- Get click point
    - Convert from screen space click to world space point
    - Current points: 1. Player position + freeze gun offset; 2. Clicked point
- Find closest hit
- If the hit is a player, freeze them 🥶

- Have an un-freeze gun, too. 🔫☀️
    - A player can only hold one type of gun

*/
