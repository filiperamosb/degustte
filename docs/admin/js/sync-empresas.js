const API_URL = 'https://api.degustte.com.br/api';

async function salvarEmpresaFromCadastro(dados, plano) {
  try {
    const payload = {
      nomeEmpresa: dados.nomeEmpresa,
      email: dados.email,
      telefone: dados.telefone,
      cnpj: dados.cnpj || '',
      tipo: dados.tipo || 'restaurante',
      nomeResponsavel: dados.nomeResponsavel,
      cpf: dados.cpf || '',
      dataNascimento: dados.dataNascimento || '',
      emailResponsavel: dados.emailResponsavel,
      telefoneResponsavel: dados.telefoneResponsavel,
      plano: plano || 'essencial'
    };

    const response = await fetch(`${API_URL}/empresas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error('Erro ao salvar empresa');
    }

    return await response.json();
  } catch (erro) {
    console.error('Erro ao salvar empresa:', erro);
    throw erro;
  }
}
