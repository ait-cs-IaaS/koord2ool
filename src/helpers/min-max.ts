export class MinMax<T = number> {
  min?: T;
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
    if (!this.min || value < this.min) {
      this.min = value;
    }
    if (!this.max || value > this.max) {
      this.max = value;
    }
  }
}
