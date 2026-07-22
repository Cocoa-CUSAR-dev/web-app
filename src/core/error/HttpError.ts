class HttpError extends Error {
  status: number;
  setCookies?: string[] | null;
  constructor(status: number, message: string, setCookies?: string[] | null) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.setCookies = setCookies;
  }
}

export { HttpError };
