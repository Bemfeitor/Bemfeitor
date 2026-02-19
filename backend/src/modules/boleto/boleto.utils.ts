/**
 * Utilitários para cálculo de Código de Barras e Linha Digitável
 * Padrão FEBRABAN 44 posições - Bradesco
 */

export interface BoletoData {
    codigoBanco: string;      // 3 dígitos (237 = Bradesco)
    codigoMoeda: string;      // 1 dígito (9 = Real)
    fatorVencimento: string;  // 4 dígitos
    valor: number;            // Valor em reais
    agencia: string;          // 4 dígitos (sem DV)
    carteira: string;         // 2 dígitos
    nossoNumero: string;      // 11 dígitos (sem DV)
    conta: string;            // 7 dígitos (sem DV)
}

/**
 * Calcula o fator de vencimento
 * Número de dias entre a data base (07/10/1997) e a data de vencimento
 */
export function calcularFatorVencimento(dataVencimento: Date): string {
    const dataBase = new Date('1997-10-07');
    const diffTime = dataVencimento.getTime() - dataBase.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays.toString().padStart(4, '0');
}

/**
 * Formata o valor para 10 posições (sem vírgulas ou pontos)
 * Ex: R$ 60,50 -> 0000006050
 */
export function formatarValor(valor: number): string {
    const valorCentavos = Math.round(valor * 100);
    return valorCentavos.toString().padStart(10, '0');
}

/**
 * Calcula o dígito verificador pelo Módulo 11
 * Usado para o dígito verificador geral do código de barras (posição 5)
 * 
 * Pesos: 2 a 9 (da direita para a esquerda, repetindo)
 * 
 * Regra do Bradesco:
 * - Se resto = 0, 1 ou 10 → DV = 1
 * - Se resto = 10 → DV = 1
 * - Caso contrário → DV = 11 - resto
 */
export function calcularDVModulo11(campo: string): string {
    let peso = 2;
    let soma = 0;

    // Percorre da direita para a esquerda
    for (let i = campo.length - 1; i >= 0; i--) {
        const digito = parseInt(campo[i]);
        soma += digito * peso;
        peso = peso === 9 ? 2 : peso + 1;
    }

    const resto = soma % 11;
    
    if (resto === 0 || resto === 1 || resto === 10) {
        return '1';
    }
    
    return (11 - resto).toString();
}

/**
 * Calcula o dígito verificador pelo Módulo 10
 * Usado para os campos 1, 2 e 3 da linha digitável
 * 
 * Pesos: 1 e 2 (alternados, da direita para a esquerda)
 * Se resultado > 9, subtrai 9 (ou soma os dígitos)
 */
export function calcularDVModulo10(campo: string): string {
    let peso = 2;
    let soma = 0;

    // Percorre da direita para a esquerda
    for (let i = campo.length - 1; i >= 0; i--) {
        let digito = parseInt(campo[i]) * peso;
        
        // Se resultado > 9, soma os dígitos (ex: 12 -> 1+2 = 3)
        if (digito > 9) {
            digito = Math.floor(digito / 10) + (digito % 10);
        }
        
        soma += digito;
        peso = peso === 2 ? 1 : 2;
    }

    const resto = soma % 10;
    const dv = resto === 0 ? 0 : 10 - resto;
    
    return dv.toString();
}

/**
 * Monta o Campo Livre (25 posições) do Bradesco
 * 
 * Posições:
 * 01-04: Agência (4 dígitos, sem DV)
 * 05-06: Carteira (2 dígitos)
 * 07-17: Nosso Número (11 dígitos, sem DV)
 * 18-24: Conta do Beneficiário (7 dígitos, sem DV)
 * 25-25: Zero Fixo (1 dígito = 0)
 */
export function montarCampoLivre(
    agencia: string,
    carteira: string,
    nossoNumero: string,
    conta: string
): string {
    const campoLivre = 
        agencia.padStart(4, '0') +
        carteira.padStart(2, '0') +
        nossoNumero.padStart(11, '0') +
        conta.padStart(7, '0') +
        '0'; // Zero fixo
    
    return campoLivre;
}

/**
 * Monta o Código de Barras (44 posições)
 * 
 * Posições:
 * 01-03: Código do Banco (3)
 * 04-04: Código da Moeda (1)
 * 05-05: DV Geral do Código de Barras (1)
 * 06-09: Fator de Vencimento (4)
 * 10-19: Valor (10)
 * 20-44: Campo Livre (25)
 */
export function montarCodigoBarras(data: BoletoData): string {
    const campoLivre = montarCampoLivre(
        data.agencia,
        data.carteira,
        data.nossoNumero,
        data.conta
    );
    
    const fatorVencimento = data.fatorVencimento;
    const valorFormatado = formatarValor(data.valor);
    
    // Monta as 4 primeiras partes (sem o DV)
    const codigoSemDV = 
        data.codigoBanco +
        data.codigoMoeda +
        fatorVencimento +
        valorFormatado +
        campoLivre;
    
    // Calcula o DV geral (módulo 11)
    const dvGeral = calcularDVModulo11(codigoSemDV);
    
    // Monta o código de barras final (44 posições)
    // Posição 5 é o DV geral
    const codigoBarras = 
        data.codigoBanco +
        data.codigoMoeda +
        dvGeral +
        fatorVencimento +
        valorFormatado +
        campoLivre;
    
    return codigoBarras;
}

/**
 * Monta a Linha Digitável (47 posições)
 * 
 * Formato: AAAAA.AAAABD BBBBB.BBBBBD CCCCC.CCCCCD D EEEEEEEEEEEEEE
 * 
 * Campo 1: Código Banco (3) + Moeda (1) + Campo Livre pos 1-5 + DV Mod10
 * Campo 2: Campo Livre pos 6-15 + DV Mod10
 * Campo 3: Campo Livre pos 16-25 + DV Mod10
 * Campo 4: DV Geral do Código de Barras
 * Campo 5: Fator Vencimento (4) + Valor (10)
 */
export function montarLinhaDigitavel(codigoBarras: string): string {
    // Extrai componentes do código de barras
    const codigoBanco = codigoBarras.substring(0, 3);
    const codigoMoeda = codigoBarras.substring(3, 4);
    const dvGeral = codigoBarras.substring(4, 5);
    const fatorVencimento = codigoBarras.substring(5, 9);
    const valor = codigoBarras.substring(9, 19);
    const campoLivre = codigoBarras.substring(19, 44);
    
    // Campo 1: Banco(3) + Moeda(1) + CampoLivre(1-5) + DV
    const campo1Base = codigoBanco + codigoMoeda + campoLivre.substring(0, 5);
    const campo1DV = calcularDVModulo10(campo1Base);
    const campo1 = campo1Base.substring(0, 5) + '.' + campo1Base.substring(5) + campo1DV;
    
    // Campo 2: CampoLivre(6-15) + DV
    const campo2Base = campoLivre.substring(5, 15);
    const campo2DV = calcularDVModulo10(campo2Base);
    const campo2 = campo2Base.substring(0, 5) + '.' + campo2Base.substring(5) + campo2DV;
    
    // Campo 3: CampoLivre(16-25) + DV
    const campo3Base = campoLivre.substring(15, 25);
    const campo3DV = calcularDVModulo10(campo3Base);
    const campo3 = campo3Base.substring(0, 5) + '.' + campo3Base.substring(5) + campo3DV;
    
    // Campo 4: DV Geral
    const campo4 = dvGeral;
    
    // Campo 5: Fator + Valor
    const campo5 = fatorVencimento + valor;
    
    // Monta a linha digitável formatada
    return `${campo1} ${campo2} ${campo3} ${campo4} ${campo5}`;
}

/**
 * Gera representação numérica da linha digitável (44 posições, sem formatação)
 * Útil para cálculos e validações
 */
export function linhaDigitavelNumerica(codigoBarras: string): string {
    const linhaFormatada = montarLinhaDigitavel(codigoBarras);
    return linhaFormatada.replace(/[.\s]/g, '');
}

/**
 * Função completa para gerar código de barras e linha digitável
 */
export function gerarCodigoBarrasELinhaDigitavel(
    valor: number,
    dataVencimento: Date,
    agencia: string,
    carteira: string,
    nossoNumero: string,
    conta: string,
    codigoBanco: string = '237',
    codigoMoeda: string = '9'
): { codigoBarras: string; linhaDigitavel: string } {
    const data: BoletoData = {
        codigoBanco,
        codigoMoeda,
        fatorVencimento: calcularFatorVencimento(dataVencimento),
        valor,
        agencia,
        carteira,
        nossoNumero,
        conta,
    };
    
    const codigoBarras = montarCodigoBarras(data);
    const linhaDigitavel = montarLinhaDigitavel(codigoBarras);
    
    return { codigoBarras, linhaDigitavel };
}
