// Sistema de sincronização de empresas
// Salva dados do cadastro no painel admin

function salvarEmpresaFromCadastro(passo1Data, planoSelecionado) {
    if (!passo1Data || !passo1Data.nomeEmpresa) return;

    const empresas = JSON.parse(localStorage.getItem('empresas') || '[]');

    // Criar slug único
    let slug = passo1Data.nomeEmpresa
        .toLowerCase()
        .replace(/\s+/g, '')
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 20);

    // Garantir unicidade do slug
    let slugOriginal = slug;
    let contador = 1;
    while (empresas.some(e => e.slug === slug)) {
        slug = slugOriginal + contador;
        contador++;
    }

    // Verificar se empresa já existe
    const empresaExistente = empresas.find(e =>
        e.email === passo1Data.emailResponsavel &&
        e.cnpj === passo1Data.cnpj
    );

    if (empresaExistente) {
        // Atualizar empresa existente
        empresaExistente.status = 'pendente_revisao';
        empresaExistente.plano = planoSelecionado;
        empresaExistente.ultimaAtualizacao = new Date().toISOString();
        empresaExistente.dados = passo1Data;
    } else {
        // Criar nova empresa
        empresas.push({
            id: Date.now().toString(),
            nomeEmpresa: passo1Data.nomeEmpresa,
            email: passo1Data.emailResponsavel,
            telefone: passo1Data.telefoneResponsavel,
            cnpj: passo1Data.cnpj,
            tipo: passo1Data.tipo,
            nomeResponsavel: passo1Data.nomeResponsavel,
            cpf: passo1Data.cpf,
            dataNascimento: passo1Data.dataNascimento,
            plano: planoSelecionado,
            status: 'pendente_revisao', // pendente_revisao, autorizada, ativa, bloqueada
            slug: slug,
            url: `degustte.com.br/${slug}`,
            dataCadastro: new Date().toISOString(),
            dados: passo1Data,
            cardapio: {
                categorias: [],
                produtos: []
            }
        });
    }

    localStorage.setItem('empresas', JSON.stringify(empresas));
    return slug;
}

// Chamar isto após confirmação de plano
window.addEventListener('beforeunload', () => {
    // Se estamos na página de pagamento (passo 2)
    if (window.location.pathname.includes('cadastro-passo2')) {
        const planoSelecionado = localStorage.getItem('planoSelecionado');
        const passo1Data = JSON.parse(localStorage.getItem('passo1Data') || 'null');

        if (planoSelecionado && passo1Data) {
            salvarEmpresaFromCadastro(passo1Data, planoSelecionado);
        }
    }
});
