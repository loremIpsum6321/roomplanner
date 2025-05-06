/**
 * File: js/utils.js
 * -----------------
 * Provides utility functions for common tasks within the application,
 * such as geometric calculations, DOM manipulation helpers, or data formatting.
 *
 * Version History:
 * - v1.0 - Initial creation. Includes basic geometry and DOM helpers.
 */

/**
 * Clamps a number between a minimum and maximum value.
 * @param {number} value - The number to clamp.
 * @param {number} min - The minimum allowed value.
 * @param {number} max - The maximum allowed value.
 * @returns {number} The clamped value.
 */
export function clamp(value, min, max) {
    return Math.max(min, Math.min(value, max));
}

/**
 * Calculates the distance between two points.
 * @param {number} x1 - x-coordinate of the first point.
 * @param {number} y1 - y-coordinate of the first point.
 * @param {number} x2 - x-coordinate of the second point.
 * @param {number} y2 - y-coordinate of the second point.
 * @returns {number} The distance between the points.
 */
export function distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Converts degrees to radians.
 * @param {number} degrees - The angle in degrees.
 * @returns {number} The angle in radians.
 */
export function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * Checks if a point (px, py) is inside a rectangle defined by (rx, ry, rWidth, rHeight).
 * Takes into account rotation of the rectangle around its center.
 * @param {number} px - Point x-coordinate.
 * @param {number} py - Point y-coordinate.
 * @param {number} rx - Rectangle top-left x-coordinate (before rotation).
 * @param {number} ry - Rectangle top-left y-coordinate (before rotation).
 * @param {number} rWidth - Rectangle width.
 * @param {number} rHeight - Rectangle height.
 * @param {number} rAngleDegrees - Rectangle rotation angle in degrees.
 * @returns {boolean} True if the point is inside the rotated rectangle.
 */
export function isPointInRotatedRectangle(px, py, rx, ry, rWidth, rHeight, rAngleDegrees) {
    const angleRad = -degreesToRadians(rAngleDegrees); // Rotate point opposite direction
    const centerX = rx + rWidth / 2;
    const centerY = ry + rHeight / 2;

    // Translate point to origin relative to rectangle center
    const translatedX = px - centerX;
    const translatedY = py - centerY;

    // Rotate point
    const rotatedX = translatedX * Math.cos(angleRad) - translatedY * Math.sin(angleRad);
    const rotatedY = translatedX * Math.sin(angleRad) + translatedY * Math.cos(angleRad);

    // Translate point back
    const finalX = rotatedX + centerX;
    const finalY = rotatedY + centerY;

    // Check if the rotated point is within the non-rotated rectangle bounds
    return finalX >= rx && finalX <= rx + rWidth &&
           finalY >= ry && finalY <= ry + rHeight;
}


/**
 * A simple debounce function.
 * @param {Function} func - The function to debounce.
 * @param {number} wait - The debounce delay in milliseconds.
 * @returns {Function} The debounced function.
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/*
// --- Usage Example ---
// import { clamp, degreesToRadians, isPointInRotatedRectangle } from './utils.js';
//
// const clampedValue = clamp(150, 0, 100); // clampedValue = 100
// const radians = degreesToRadians(90); // radians = Math.PI / 2
//
// const isInside = isPointInRotatedRectangle(55, 55, 50, 50, 20, 30, 45);
*/