/**
 * File: js/models/Room.js
 * -----------------------
 * Defines the Room class/model, responsible for holding the room's dimensions
 * and calculating the scale factor for rendering on the canvas.
 *
 * Version History:
 * - v1.0 - Initial creation. Basic constructor and scale calculation.
 */

import { CANVAS_MAX_WIDTH, CANVAS_MAX_HEIGHT } from '../config.js';

export class Room {
    /**
     * Creates a Room instance.
     * @param {number} width - The actual width of the room (e.g., in meters).
     * @param {number} length - The actual length (depth) of the room (e.g., in meters).
     */
    constructor(width, length) {
        if (width <= 0 || length <= 0) {
            throw new Error("Room dimensions must be positive.");
        }
        this.width = width; // Actual width (e.g., meters)
        this.length = length; // Actual length (e.g., meters)
        this.scale = this.calculateScale(); // Pixels per unit (e.g., pixels/meter)
        this.canvasWidth = this.width * this.scale; // Calculated canvas width
        this.canvasHeight = this.length * this.scale; // Calculated canvas height
    }

    /**
     * Calculates the appropriate scale factor to fit the room within the max canvas dimensions.
     * @returns {number} The scale factor (pixels per unit).
     * @private
     */
    calculateScale() {
        const scaleX = CANVAS_MAX_WIDTH / this.width;
        const scaleY = CANVAS_MAX_HEIGHT / this.length;
        // Use the smaller scale factor to ensure the whole room fits
        return Math.min(scaleX, scaleY);
    }

    /**
     * Converts a dimension from real-world units to canvas pixels.
     * @param {number} dimensionInUnits - The dimension in real-world units (e.g., meters).
     * @returns {number} The corresponding dimension in pixels.
     */
    toPixels(dimensionInUnits) {
        return dimensionInUnits * this.scale;
    }

    /**
     * Converts a coordinate from canvas pixels to real-world units.
     * @param {number} pixels - The coordinate or dimension in pixels.
     * @returns {number} The corresponding value in real-world units.
     */
    toUnits(pixels) {
        if (this.scale === 0) return 0; // Avoid division by zero
        return pixels / this.scale;
    }

    /**
     * Gets the room dimensions in pixels for drawing on the canvas.
     * @returns {{width: number, height: number}} Object containing canvas width and height.
     */
    getPixelDimensions() {
        return {
            width: this.canvasWidth,
            height: this.canvasHeight
        };
    }
}

/*
// --- Usage Example ---
// import { Room } from './models/Room.js';
//
// try {
//   const myRoom = new Room(5, 4); // 5 meters wide, 4 meters long
//   console.log(`Calculated scale: ${myRoom.scale} px/m`);
//   const pixelDims = myRoom.getPixelDimensions();
//   console.log(`Canvas dimensions: ${pixelDims.width}px x ${pixelDims.height}px`);
//   const widthInPixels = myRoom.toPixels(2); // Convert 2 meters to pixels
//   console.log(`2 meters is ${widthInPixels} pixels`);
// } catch (error) {
//   console.error(error.message);
// }
*/