/**
 * File: js/config.js
 * ------------------
 * Defines configuration constants for the Room Layout Planner application.
 * Includes canvas dimensions, colors, object definitions, and interaction settings.
 *
 * Version History:
 * - v1.0 - Initial creation. Defines canvas size, colors, rotation, and sample object library.
 * - v1.1 - Added CUSTOM_OBJECT_DEFAULTS.
 */

// Canvas Configuration
export const CANVAS_MAX_WIDTH = 1000; // Maximum pixel width for the canvas
export const CANVAS_MAX_HEIGHT = 700; // Maximum pixel height for the canvas
export const PIXELS_PER_UNIT = 50; // Default scale: e.g., 50 pixels per meter

// Color Configuration (used by CanvasRenderer)
export const ROOM_COLOR = '#FFFFFF'; // White fill for the room area
export const ROOM_BORDER_COLOR = '#333333'; // Dark border for the room
export const OBJECT_DEFAULT_COLOR = '#4a90e2'; // Blue fill for objects
export const OBJECT_BORDER_COLOR = '#333333'; // Dark border for objects
export const OBJECT_SELECTED_COLOR = '#6aa9e9'; // Lighter blue for selected objects
export const OBJECT_SELECTED_BORDER_COLOR = '#f5a623'; // Orange border for selected
export const OBJECT_LABEL_COLOR = '#FFFFFF'; // White text for contrast
export const OBJECT_LABEL_FONT = 'bold 12px sans-serif'; // Font style for labels
// Interaction Configuration
export const ROTATION_INCREMENT = 10; // Degrees for each rotation step
export const SELECTION_THRESHOLD = 5; // Pixel distance threshold for selecting an object

// --- START CHANGE ---
// Default properties for custom objects
export const CUSTOM_OBJECT_DEFAULTS = {
    name: 'Custom Block',
    color: '#888888' // Grey color for custom blocks
};
// --- END CHANGE ---

// Object Library Definition (No longer used for adding, but kept for potential future reference)
// Dimensions are in the same units as the room (e.g., meters)
export const OBJECT_LIBRARY = [
    { id: 'sofa', name: 'Sofa', width: 2, length: 0.9, color: '#e91e63' }, // Pink
    { id: 'armchair', name: 'Armchair', width: 0.8, length: 0.8, color: '#9c27b0' }, // Purple
    { id: 'coffee-table', name: 'Coffee Table', width: 1.2, length: 0.6, color: '#795548' }, // Brown
    { id: 'dining-table', name: 'Dining Table', width: 1.6, length: 0.9, color: '#009688' }, // Teal
    { id: 'chair', name: 'Chair', width: 0.45, length: 0.45, color: '#ff9800' }, // Orange
    { id: 'bed-queen', name: 'Bed (Queen)', width: 1.6, length: 2.1, color: '#2196f3' }, // Blue
    { id: 'dresser', name: 'Dresser', width: 1.5, length: 0.5, color: '#607d8b' }, // Blue Grey
    { id: 'desk', name: 'Desk', width: 1.4, length: 0.7, color: '#4caf50' }, // Green
];


/*
// --- Usage Example ---
// import { CANVAS_MAX_WIDTH, CUSTOM_OBJECT_DEFAULTS } from './config.js';
//
// console.log(`Max canvas width: ${CANVAS_MAX_WIDTH}`);
// console.log(`Default custom object name: ${CUSTOM_OBJECT_DEFAULTS.name}`);
*/