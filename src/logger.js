module.exports = class Logger {
  /**
   * @type {Error[]}
   */
  errors = [];

  /**
   * @type {(error: Error) => void}
   */
  logError = (error) => {
    this.errors.push(error);
  };

  /**
   * @returns {Error[]}
   */
  getLogs = () => this.errors;
};
