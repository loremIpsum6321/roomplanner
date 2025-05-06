/**
 * File: js/services/CanvasRenderer.js
 * ----------------------------------
 * Defines the CanvasRenderer class, responsible for all drawing operations
 * on the HTML canvas element, including the room outline and placed objects.
 *
 * Version History:
 * - v1.0 - Initial creation. Includes setup, clearing, drawing room, and drawing objects.
 * - v1.1 - Added object label drawing.
 */

import {
    ROOM_COLOR, ROOM_BORDER_COLOR,
    OBJECT_DEFAULT_COLOR, OBJECT_BORDER_COLOR,
    OBJECT_SELECTED_COLOR, OBJECT_SELECTED_BORDER_COLOR,
    // --- START CHANGE ---
    OBJECT_LABEL_COLOR, OBJECT_LABEL_FONT // Import label config
    // --- END CHANGE ---
} from '../config.js';
import { degreesToRadians } from '../utils.js';

export class CanvasRenderer {
    /**
     * Creates a CanvasRenderer instance.
     * @param {HTMLCanvasElement} canvasElement - The canvas element to draw on.
     */
    constructor(canvasElement) {
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            throw new Error("Could not get 2D rendering context from canvas.");
        }
        this.currentRoom = null; // Will hold the current Room object
        this.objectManager = null; // Will hold the ObjectManager instance
    }

    /**
     * Sets the Room object to be used for drawing context.
     * @param {Room} room - The Room object.
     */
    setRoom(room) {
        this.currentRoom = room;
        const dims = room.getPixelDimensions();
        this.canvas.width = dims.width;
        this.canvas.height = dims.height;
    }

    /**
     * Sets the ObjectManager instance to get objects for drawing.
     * @param {ObjectManager} objectManager - The ObjectManager instance.
     */
    setObjectManager(objectManager) {
        this.objectManager = objectManager;
    }

    /**
     * Clears the entire canvas.
     */
    clearCanvas() {
        if (!this.currentRoom) return;
        const dims = this.currentRoom.getPixelDimensions();
        this.ctx.clearRect(0, 0, dims.width, dims.height);
    }

    /**
     * Draws the room outline based on the currentRoom dimensions.
     */
    drawRoom() {
        if (!this.currentRoom) return;

        const dims = this.currentRoom.getPixelDimensions();
        this.ctx.fillStyle = ROOM_COLOR;
        this.ctx.strokeStyle = ROOM_BORDER_COLOR;
        this.ctx.lineWidth = 1;

        this.ctx.fillRect(0, 0, dims.width, dims.height);
        this.ctx.strokeRect(0, 0, dims.width, dims.height);
    }

    /**
     * Draws a single placed object onto the canvas, including its label.
     * @param {PlacedObject} obj - The PlacedObject instance to draw.
     */
    drawObject(obj) {
        const { width, height } = obj.getPixelDimensions();
        const { drawX, drawY } = obj.getDrawingCoords();

        this.ctx.save();

        // Translate context to object's center for rotation
        this.ctx.translate(obj.x, obj.y);
        this.ctx.rotate(degreesToRadians(obj.rotation));

        // Set fill and stroke styles based on selection state
        this.ctx.fillStyle = obj.isSelected ? OBJECT_SELECTED_COLOR : obj.color || OBJECT_DEFAULT_COLOR;
        this.ctx.strokeStyle = obj.isSelected ? OBJECT_SELECTED_BORDER_COLOR : OBJECT_BORDER_COLOR;
        this.ctx.lineWidth = obj.isSelected ? 2 : 1;

        // Draw the rectangle (centered around the origin of the transformed context)
        this.ctx.fillRect(-width / 2, -height / 2, width, height);
        this.ctx.strokeRect(-width / 2, -height / 2, width, height);

        // --- START CHANGES: Draw Label ---
        if (obj.label) {
            this.ctx.fillStyle = OBJECT_LABEL_COLOR;
            this.ctx.font = OBJECT_LABEL_FONT;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(obj.label, 0, 0); // Draw text at the origin
        }
        // --- END CHANGES ---

        this.ctx.restore();
    }

    /**
     * Draws all objects currently managed by the ObjectManager.
     */
    drawAllObjects() {
        if (!this.objectManager) return;

        const objects = this.objectManager.getAllObjects();
        objects.forEach(obj => this.drawObject(obj));
    }

    /**
     * Performs a full redraw of the canvas (clears, draws room, draws objects).
     */
    redraw() {
        if (!this.currentRoom) return;

        this.clearCanvas();
        this.drawRoom();
        this.drawAllObjects();
    }
}
