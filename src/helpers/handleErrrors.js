class CustomError extends Error {
  constructor(message, statusCode, context, data = {}) {
    super(message);
    this.statusCode = statusCode;
    this.context = [context]
    this.data = data;
  }

  addContext (context) {
    this.context.push(context);
        return this;
  }
  getContext() {
    return this.context.join(' -> ')
  }

  getMessage () {
    return `Error en ${this.getContext()}: ${this.message}`
  }
}

exports.CustomError = CustomError;