export const enum Constants {
  /**
   * MAX SMI (SMall Integer) as defined in v8.
   * one bit is lost for boxing/unboxing flag.
   * one bit is lost for sign flag.
   * See https://thibaultlaurens.github.io/javascript/2013/04/29/how-the-v8-engine-works/#tagged-values
   */
  MAX_SAFE_SMALL_INTEGER = 1 << 30,

  /**
   * MIN SMI (SMall Integer) as defined in v8.
   * one bit is lost for boxing/unboxing flag.
   * one bit is lost for sign flag.
   * See https://thibaultlaurens.github.io/javascript/2013/04/29/how-the-v8-engine-works/#tagged-values
   */
  MIN_SAFE_SMALL_INTEGER = -(1 << 30),
}
