/**
 * Morphing Effect Module
 * Part of the KDE project.
 * @copyright 2012 Martin Gräßlin <mgraesslin@kde.org>
 * @copyright 2016 Marco Martin <mart@kde.org>
 * @license GPL-2.0-or-later
 */

const morphingEffect = {
  duration: null,

  /**
   * Initialize animation time
   * @private
   * @param {number} defaultTime
   * @returns {number}
   */
  _animationTime(defaultTime) {
    return defaultTime;
  },

  /**
   * Load configuration settings
   */
  loadConfig() {
    this.duration = this._animationTime(150);
  },

  /**
   * Handle frame geometry changes before they occur
   * @param {Window} window - Window object to animate
   */
  handleFrameGeometryAboutToChange(window) {
    if (window.fadeAnimation && this._retarget(window.fadeAnimation[0], 1.0)) {
      return;
    }

    window.fadeAnimation = this._animate({
      window,
      duration: this.duration,
      curve: QEasingCurve.InOutCubic,
      animations: [
        {
          type: Effect.CrossFadePrevious,
          to: 1.0,
          from: 0.0,
        },
      ],
    });
  },

  /**
   * Handle frame geometry changes after they occur
   * @param {Window} window - Window object to animate
   * @param {Object} oldGeometry - Previous geometry state
   */
  handleFrameGeometryChanged(window, oldGeometry) {
    const newGeometry = window.geometry;

    window.setData(Effect.WindowForceBackgroundContrastRole, true);
    window.setData(Effect.WindowForceBlurRole, true);

    if (this._handleExistingAnimation(window, newGeometry)) {
      return;
    }

    const finalOldGeometry = oldGeometry ?? newGeometry;
    this._createNewAnimation(window, newGeometry, finalOldGeometry);
  },

  /**
   * Handle existing animation if present
   * @private
   * @param {Window} window
   * @param {Object} newGeometry
   * @returns {boolean} Whether existing animation was handled
   */
  _handleExistingAnimation(window, newGeometry) {
    if (!window.moveAnimation) {
      return false;
    }

    const sizeRetarget =
      window.moveAnimation[0] &&
      this._retarget(
        window.moveAnimation[0],
        {
          value1: newGeometry.width,
          value2: newGeometry.height,
        },
        this.duration
      );

    const positionRetarget =
      sizeRetarget &&
      window.moveAnimation[1] &&
      this._retarget(
        window.moveAnimation[1],
        {
          value1: newGeometry.x + newGeometry.width / 2,
          value2: newGeometry.y + newGeometry.height / 2,
        },
        this.duration
      );

    return sizeRetarget && positionRetarget;
  },

  /**
   * Create new animation
   * @private
   * @param {Window} window
   * @param {Object} newGeometry
   * @param {Object} oldGeometry
   */
  _createNewAnimation(window, newGeometry, oldGeometry) {
    window.moveAnimation = this._animate({
      window,
      duration: this.duration,
      curve: QEasingCurve.InOutCubic,
      animations: [
        {
          type: Effect.Size,
          to: {
            value1: newGeometry.width,
            value2: newGeometry.height,
          },
          from: {
            value1: oldGeometry.width,
            value2: oldGeometry.height,
          },
        },
        {
          type: Effect.Position,
          to: {
            value1: newGeometry.x + newGeometry.width / 2,
            value2: newGeometry.y + newGeometry.height / 2,
          },
          from: {
            value1: oldGeometry.x + oldGeometry.width / 2,
            value2: oldGeometry.y + oldGeometry.height / 2,
          },
        },
      ],
    });
  },

  /**
   * Check if window is eligible for effects
   * @private
   * @param {Window} window
   * @returns {boolean}
   */
  _isEligibleWindow(window) {
    return window.tooltip || window.notification || window.criticalNotification;
  },

  /**
   * Manage window animations
   * @param {Window} window
   */
  manage(window) {
    if (!this._isEligibleWindow(window)) {
      return;
    }

    window.windowFrameGeometryAboutToChange.connect(
      this.handleFrameGeometryAboutToChange.bind(this)
    );
    window.windowFrameGeometryChanged.connect(
      this.handleFrameGeometryChanged.bind(this)
    );
  },

  /**
   * Initialize the effect
   */
  init() {
    this.duration = this._animationTime(150);

    effect.configChanged.connect(this.loadConfig.bind(this));
    effects.windowAdded.connect(this.manage.bind(this));

    for (const window of effects.stackingOrder) {
      this.manage(window);
    }
  },

  /**
   * Retarget animation
   * @private
   */
  _retarget(animation, target, duration) {
    // Implementation of retarget function
    return retarget(animation, target, duration);
  },

  /**
   * Create animation
   * @private
   */
  _animate(config) {
    // Implementation of animate function
    return animate(config);
  },
};

// Initialize the effect
morphingEffect.init();