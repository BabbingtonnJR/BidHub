const { ValidacaoError } = require("../../domain/errors/DomainError");

// tipo do erro -> status http
const STATUS_POR_TIPO = {
  validacao: 400,
  "nao-encontrado": 404,
  "regra-de-negocio": 422,
};

// envolve os handlers pra não repetir try/catch em todas as rotas
function comTratamentoDeErros(mensagemFalha, handler) {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (err) {
      const status = STATUS_POR_TIPO[err.tipo];
      if (status) {
        return { status, jsonBody: { erro: err.message } };
      }
      context.error(err);
      return { status: 500, jsonBody: { erro: mensagemFalha, detalhe: err.message } };
    }
  };
}

function lerId(request) {
  const id = Number(request.params.id);
  if (!Number.isInteger(id)) {
    throw new ValidacaoError("id inválido");
  }
  return id;
}

// json inválido agora volta 400 em vez de estourar 500
async function lerCorpoJson(request) {
  try {
    const corpo = await request.json();
    return corpo && typeof corpo === "object" ? corpo : {};
  } catch {
    throw new ValidacaoError("Corpo da requisição deve ser um JSON válido");
  }
}

module.exports = { comTratamentoDeErros, lerId, lerCorpoJson, STATUS_POR_TIPO };
