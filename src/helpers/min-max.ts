/**
 * This is a helper class to track minimum and maximum values.
 */
export class MinMax<T = number> {
  /**
   * The observed minimum.
   */
  min?: T;

  /**
   * The observed maximum.
   */
  max?: T;

  constructor();
  constructor(min: T, max: T);
  constructor(min?: T, max?: T) {
    if (typeof min !== "undefined" && typeof max !== "undefined") {
      this.min = min;
      this.max = max;
    }
  }

  /**
   * Evaluates the given value and adjusts {@link min} and {@link max}
   * accordingly.
   *
   * If this is the first observed value, and {@link min} and/or {@link max}
   * is unknown, these values will be initialized with the given value.
   *
   * @param value the value to observe.
   */
  observe(value: T): void {
    if (typeof this.min === "undefined" || value < this.min) {
      this.min = value;
    }
    if (typeof this.max === "undefined" || value > this.max) {
      this.max = value;
    }
  }
}
