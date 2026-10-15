export const StatusLeilao = Object.freeze({
  AO_VIVO: "ao-vivo",
  AGENDADO: "agendado",
  ENCERRADO: "encerrado",
});

export const STATUS_VALIDOS = Object.freeze(Object.values(StatusLeilao));

export function statusEhValido(status) {
  return STATUS_VALIDOS.includes(status);
}
