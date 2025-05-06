/**
 * File: js/models/PlacedObject.js
 * -------------------------------
 * Defines the PlacedObject class, representing an item placed within the room.
 * Stores object type, dimensions, position, rotation, selection state, and label.
 *
 * Version History:
 * - v1.0 - Initial creation. Constructor and basic properties.
 * - v1.1 - Added label property.
 */

import { ROTATION_INCREMENT } from '../config.js';

let objectCounter = 0; // Simple unique ID generator

export class PlacedObject {
    /**
     * Creates a PlacedObject instance.
     * @param {object} objectDefinition - The object definition (contains id, name, width, length, color, label).
     * @param {number} x - Initial x-coordinate on the canvas (center).
     * @param {number} y - Initial y-coordinate on the canvas (center).
     * @param {number} scale - The current room scale (pixels per unit).
     */
    constructor(objectDefinition, x, y, scale) {
        this.uniqueId = `obj-${objectCounter++}`; // Unique identifier for this instance
        this.typeId = objectDefinition.id || 'custom'; // e.g., 'sofa', 'custom'
        this.name = objectDefinition.name || `Object ${this.uniqueId}`; // Internal name/fallback
        this.widthUnits = objectDefinition.width;   // Width in real-world units (e.g., meters)
        this.lengthUnits = objectDefinition.length; // Length in real-world units (e.g., meters)
        this.color = objectDefinition.color || '#cccccc'; // Default color if not specified
        this.label = objectDefinition.label || ''; // Store the display label

        this.x = x; // Center x-coordinate in pixels on canvas
        this.y = y; // Center y-coordinate in pixels on canvas
        this.rotation = 0; // Angle in degrees (0, 90, 180, 270)
        this.isSelected = false;

        this.updateScale(scale); // Calculate initial pixel dimensions
    }

    /**
     * Updates the object's pixel dimensions based on a new scale factor.
     * @param {number} newScale - The new scale factor (pixels per unit).
     */
    updateScale(newScale) {
        this.scale = newScale;
        this.widthPixels = this.widthUnits * this.scale;
        this.lengthPixels = this.lengthUnits * this.scale;
    }

    /**
     * Rotates the object by the configured increment.
     */
    rotate() {
        this.rotation = (this.rotation + ROTATION_INCREMENT) % 360;
    }

    /**
     * Sets the position of the object's center.
     * @param {number} x - New center x-coordinate in pixels.
     * @param {number} y - New center y-coordinate in pixels.
     */
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * Gets the bounding box coordinates (top-left corner) for drawing.
     * @returns {{drawX: number, drawY: number}} The top-left coordinates.
     */
    getDrawingCoords() {
        return {
            drawX: this.x - this.widthPixels / 2,
            drawY: this.y - this.lengthPixels / 2,
        };
    }

    /**
     * Gets the dimensions in pixels.
     * @returns {{width: number, height: number}} Pixel dimensions.
     */
    getPixelDimensions() {
        return {
            width: this.widthPixels,
            height: this.lengthPixels,
        };
    }
}

/*
// --- Updated Usage Example ---
// const def = { id: 'custom-1', name: 'Custom 1', width: 1, length: 1, color: '#eee', label: 'My Desk' };
// const obj = new PlacedObject(def, 100, 100, 50);
// console.log(obj.label); // Output: My Desk
*/
