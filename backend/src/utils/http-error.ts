/**
 * Error con código HTTP. Los controladores lo lanzan y el manejador
 * global de errores (src/index.ts) lo convierte en la respuesta JSON.
 */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = 'HttpError';
  }
}
