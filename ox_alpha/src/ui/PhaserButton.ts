import type * as Phaser from 'phaser';
import { getPhaser } from '../phaser';

/**
 * Style definition for a {@link PhaserButton}.
 *
 * All values are optional; any omitted (or nullish) property falls back to
 * the corresponding value in {@link DEFAULT_BUTTON_STYLE}.
 */
export interface ButtonStyle {
    /** Normal-state background fill color. */
    bg?: number;
    /** Hover-state background fill color. */
    hover?: number;
    /** Pressed (active)-state background fill color. */
    active?: number;
    /** Disabled-state background fill color. */
    disabled?: number;
    /** Selected-state background fill color. */
    selected?: number;
    /** Border color used when the button is selected. */
    selectedBorder?: number;
    /** Border color used when the button is not selected. */
    border?: number;
    /** Label text color (CSS color string). */
    textColor?: string;
    /** Label font size in pixels. */
    fontSize?: number;
    /** Corner radius of the rounded rectangle in pixels. */
    cornerRadius?: number;
}

/** Fully-resolved style with every property defined. */
type ResolvedButtonStyle = Required<ButtonStyle>;

/** Default style values used when no style (or a partial style) is given. */
const DEFAULT_BUTTON_STYLE: Readonly<ResolvedButtonStyle> = Object.freeze({
    bg: 0x1e4976,
    hover: 0x2a6a9e,
    active: 0x163a5c,
    disabled: 0x2a2a2a,
    selected: 0x4caf50,
    selectedBorder: 0x66bb6a,
    border: 0x1e4976,
    textColor: '#e0e0e0',
    fontSize: 16,
    cornerRadius: 8
});

/** Border thickness in pixels. */
const BORDER_WIDTH = 2;

/**
 * A Phaser-native button rendered as a rounded rectangle with a text label.
 *
 * Provides familiar OS-style visual states: normal, hover, active/pressed,
 * disabled, and selected (for segmented controls like speed buttons).
 * All drawing uses Phaser Graphics and Text; no DOM elements.
 *
 * This class is self-contained: all default colors, font size, and corner
 * radius are hard-coded here. An optional partial {@link ButtonStyle} may be
 * passed to override any subset of these values.
 */
export default class PhaserButton {
    private readonly _scene: Phaser.Scene;
    private readonly _bg: Phaser.GameObjects.Graphics;
    private readonly _text: Phaser.GameObjects.Text;

    private _x: number;
    private _y: number;
    private _width: number;
    private _height: number;
    private _label: string;
    private _style: ResolvedButtonStyle;
    private _enabled = true;
    private _selected = false;
    private _hovered = false;
    private _pressed = false;

    /**
     * Create a button in a scene.
     *
     * @param scene - The Phaser scene owning this button.
     * @param x - Left position.
     * @param y - Top position.
     * @param width - Button width.
     * @param height - Button height.
     * @param label - Button label text.
     * @param onClick - Callback invoked on click (no args).
     * @param style - Optional style overrides. Missing or nullish keys fall
     *   back to {@link DEFAULT_BUTTON_STYLE} values.
     */
    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        width: number,
        height: number,
        label: string,
        onClick?: () => void,
        style: ButtonStyle | null = null
    ) {
        this._scene = scene;
        this._x = x;
        this._y = y;
        this._width = width;
        this._height = height;
        this._label = label;
        this.onClick = onClick;
        this._style = PhaserButton.resolveStyle(style);

        this._bg = scene.add.graphics();
        this._bg.setPosition(x, y);
        this._text = scene.add.text(x + width / 2, y + height / 2, label, {
            fontFamily: 'Arial, sans-serif',
            fontSize: `${this._style.fontSize}px`,
            color: this._style.textColor
        });
        this._text.setOrigin(0.5, 0.5);

        this.setupInput();
        this.draw();
    }

    /** Merge user-supplied overrides over the defaults, skipping nullish values. */
    private static resolveStyle(style: ButtonStyle | null): ResolvedButtonStyle {
        const resolved: ResolvedButtonStyle = { ...DEFAULT_BUTTON_STYLE };
        if (style) {
            for (const key of Object.keys(DEFAULT_BUTTON_STYLE) as Array<keyof ButtonStyle>) {
                const value = style[key];
                if (value !== undefined && value !== null) {
                    // The nullish check above guarantees a defined value.
                    resolved[key] = value as never;
                }
            }
        }
        return resolved;
    }

    /** Left position of the button. */
    public get x(): number {
        return this._x;
    }

    /** Top position of the button. */
    public get y(): number {
        return this._y;
    }

    /** Button width in pixels. */
    public get width(): number {
        return this._width;
    }

    /** Button height in pixels. */
    public get height(): number {
        return this._height;
    }

    /** Current button label text. */
    public get label(): string {
        return this._label;
    }

    public set label(value: string) {
        this._label = value;
        this.draw();
    }

    /** Whether the button responds to pointer input. */
    public get enabled(): boolean {
        return this._enabled;
    }

    public set enabled(value: boolean) {
        this._enabled = value;
        this.draw();
    }

    /** Whether the button is rendered in its selected state. */
    public get selected(): boolean {
        return this._selected;
    }

    public set selected(value: boolean) {
        this._selected = value;
        this.draw();
    }

    /** The scene that owns this button's game objects. */
    protected get scene(): Phaser.Scene {
        return this._scene;
    }

    /** The resolved (fully-populated) style currently in use. */
    public get style(): Readonly<ResolvedButtonStyle> {
        return this._style;
    }

    /**
     * Replace the current style with new overrides.
     *
     * @param value - Partial style; missing or nullish keys fall back to
     *   {@link DEFAULT_BUTTON_STYLE} values.
     */
    public set style(value: ButtonStyle | null) {
        this._style = PhaserButton.resolveStyle(value);
        this.applyTextStyle();
        this.draw();
    }

    /** Callback invoked when the button is clicked while enabled. */
    public onClick?: () => void;

    /** Wire up Phaser pointer events for hover, press, and click. */
    private setupInput(): void {
        const Phaser = getPhaser();
        const hitArea = new Phaser.Geom.Rectangle(0, 0, this._width, this._height);
        this._bg.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

        this._bg.on('pointerover', () => {
            this._hovered = true;
            this.draw();
        });
        this._bg.on('pointerout', () => {
            this._hovered = false;
            this._pressed = false;
            this.draw();
        });
        this._bg.on('pointerdown', () => {
            if (!this._enabled) return;
            this._pressed = true;
            this.draw();
        });
        this._bg.on('pointerup', () => {
            this._pressed = false;
            this.draw();
            if (this._enabled && this.onClick) {
                this.onClick();
            }
        });
    }

    /** Push font-size/text-color changes onto the underlying Text object. */
    private applyTextStyle(): void {
        this._text.setStyle({
            fontSize: `${this._style.fontSize}px`,
            color: this._style.textColor
        });
    }

    /** Render the button background and label according to current state. */
    private draw(): void {
        this._bg.clear();

        let fill = this._style.bg;
        if (!this._enabled) {
            fill = this._style.disabled;
        } else if (this._selected) {
            fill = this._style.selected;
        } else if (this._pressed) {
            fill = this._style.active;
        } else if (this._hovered) {
            fill = this._style.hover;
        }

        const alpha = this._enabled ? 1.0 : 0.5;
        this._bg.fillStyle(fill, alpha);
        this._bg.fillRoundedRect(0, 0, this._width, this._height, this._style.cornerRadius);

        // Border: stronger for selected, subtle otherwise.
        const borderColor = this._selected ? this._style.selectedBorder : this._style.border;
        this._bg.lineStyle(BORDER_WIDTH, borderColor, alpha);
        this._bg.strokeRoundedRect(0, 0, this._width, this._height, this._style.cornerRadius);

        this._text.setText(this._label);
        this._text.setAlpha(this._enabled ? 1.0 : 0.5);
    }

    /**
     * Resize the button and refresh its interactive hit area.
     *
     * @param width - New width.
     * @param height - New height.
     */
    public setSize(width: number, height: number): void {
        this._width = width;
        this._height = height;
        // Update the existing hit area geometry in-place to avoid tearing
        // down and re-creating the interactive setup (which would drop all
        // pointer event listeners wired in setupInput).
        this._bg.input?.hitArea.setTo(0, 0, width, height);
        this.draw();
    }

    /**
     * Move the button to a new position.
     *
     * @param x - New left position.
     * @param y - New top position.
     */
    public setPosition(x: number, y: number): void {
        this._x = x;
        this._y = y;
        this._bg.setPosition(x, y);
        this._text.setPosition(x + this._width / 2, y + this._height / 2);
        this.draw();
    }

    /** Destroy the button's Phaser objects. */
    public destroy(): void {
        this._bg.destroy();
        this._text.destroy();
    }
}
