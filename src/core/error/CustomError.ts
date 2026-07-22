class CustomError extends Error {
  type: string;
  constructor(type: string, message: string) {
    super(message);
    this.type = type;
  }
}

class CustomRedirectError extends CustomError {
  constructor(path: string) {
    super("REDIRECT_ERROR", path);
  }
}

export { CustomError, CustomRedirectError };
