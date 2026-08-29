/**
 * Extrai a mensagem de um erro independente do formato: instâncias de Error
 * (inclusive PostgrestError) e também objetos simples `{ message: "..." }`,
 * formato usado pelo supabase-js para falhas de rede/fetch.
 */
export function getErrorMessage(err: unknown): string | undefined {
  if (err instanceof Error) return err.message;
  if (
    err &&
    typeof err === "object" &&
    "message" in err &&
    typeof (err as { message: unknown }).message === "string"
  ) {
    return (err as { message: string }).message;
  }
  return undefined;
}
