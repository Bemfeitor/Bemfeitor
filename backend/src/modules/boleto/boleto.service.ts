import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.service';
import { HttpService } from '@nestjs/axios';
import { CreateBoletoDto } from './dto/create-boleto.dto';
import { BradescoApiService } from './bradesco-api.service';
import { firstValueFrom } from 'rxjs';
import { addDays, format } from 'date-fns';
import { gerarCodigoBarrasELinhaDigitavel, calcularFatorVencimento } from './boleto.utils';

@Injectable()
export class BoletoService {
    private readonly logger = new Logger(BoletoService.name);

    constructor(
        private prisma: PrismaService,
        private bradescoApi: BradescoApiService,
    ) { }

    async emitir(dto: CreateBoletoDto, configId: string = 'default') {
        const config = await this.prisma.configuracaoCobranca.findFirst();
        if (!config) throw new BadRequestException('Configuração não encontrada');

        const cliente = await this.prisma.clientePagador.findUnique({
            where: { id: dto.clienteId },
        });
        if (!cliente) throw new BadRequestException('Cliente não encontrado');

        // Prepara payload Bradesco (Novo Schema do Usuário)
        const payload = {
            registraTitulo: 1,
            nuCPFCNPJ: parseInt(config.cnpjRaiz || '0'),
            filialCPFCNPJ: parseInt(config.filial || '0'),
            ctrlCPFCNPJ: parseInt(config.controle || '0'),
            cdTipoAcesso: 2,
            clubBanco: 0,
            cdTipoContrato: 0,
            nuSequenciaContrato: 0,
            idProduto: parseInt(config.carteira || '9'), // 9 conforme exemplo
            nuNegociacao: parseInt(config.negociacao || '0'), // ex: 399500000000075557
            cdBanco: 237,
            nuSequenciaContrato2: 0,
            tpRegistro: 1,
            cdProduto: 1730, // fixo conforme exemplo ou config?
            nuTitulo: 0, // 0 para gerar novo
            nuCliente: dto.seuNumero || "WEBSERVICE",
            dtEmissaoTitulo: format(new Date(), 'dd.MM.yyyy'),
            dtVencimentoTitulo: format(new Date(dto.dataVencimento), 'dd.MM.yyyy'),
            tpVencimento: 0,
            vlNominalTitulo: Math.round(dto.valor * 100), // Valor em centavos? Exemplo mostra 6050 para R$ 60,50? 
            // O exemplo mostra vlNominalTitulo: 6050, e vlTitulo: 6050 na resposta.
            // Se for R$ 60.50, então é centavos. Se for R$ 6050.00, é valor direto.
            // CNAB geralmente é centavos sem ponto. O retorno tem vlTitulo: 6050.
            // Vamos assumir centavos.
            cdEspecieTitulo: parseInt(dto.especie || '01'), // 01=CH, 02=DM
            tpProtestoAutomaticoNegativacao: 0,
            prazoProtestoAutomaticoNegativacao: 0,
            controleParticipante: "",
            cdPagamentoParcial: "",
            qtdePagamentoParcial: 0,
            percentualJuros: 0,
            vlJuros: 0,
            qtdeDiasJuros: 0,
            percentualMulta: 0,
            vlMulta: 0,
            qtdeDiasMulta: 0,
            percentualDesconto1: 0,
            vlDesconto1: 0,
            dataLimiteDesconto1: "",
            percentualDesconto2: 0,
            vlDesconto2: 0,
            dataLimiteDesconto2: "",
            percentualDesconto3: 0,
            vlDesconto3: 0,
            dataLimiteDesconto3: "",
            prazoBonificacao: 0,
            percentualBonificacao: 0,
            vlBonificacao: 0,
            dtLimiteBonificacao: "",
            vlAbatimento: 0,
            vlIOF: 0,
            nomePagador: cliente.nome.substring(0, 70),
            logradouroPagador: cliente.logradouro.substring(0, 40),
            nuLogradouroPagador: cliente.numero.substring(0, 10),
            complementoLogradouroPagador: cliente.complemento?.substring(0, 15) || "",
            cepPagador: parseInt(cliente.cep.substring(0, 5)),
            complementoCepPagador: parseInt(cliente.cep.substring(5, 8) || '000'),
            bairroPagador: cliente.bairro.substring(0, 40),
            municipioPagador: cliente.cidade.substring(0, 30),
            ufPagador: cliente.uf,
            cdIndCpfcnpjPagador: cliente.tipoDocumento === '1' ? 1 : 2, // 1=CPF
            nuCpfcnpjPagador: parseInt(cliente.documento.replace(/\D/g, '')),
            endEletronicoPagador: cliente.email || "",
            nomeSacadorAvalista: "",
            logradouroSacadorAvalista: "",
            nuLogradouroSacadorAvalista: "",
            complementoLogradouroSacadorAvalista: "",
            cepSacadorAvalista: 0,
            complementoCepSacadorAvalista: 0,
            bairroSacadorAvalista: "",
            municipioSacadorAvalista: "",
            ufSacadorAvalista: "",
            cdIndCpfcnpjSacadorAvalista: 0,
            nuCpfcnpjSacadorAvalista: 0,
            enderecoSacadorAvalista: ""
        };

        try {
            const retorno = await this.bradescoApi.registrarBoleto(payload);

            // Mapeia retorno específico do novo layout
            let linhaDigitavel = retorno.linhaDigitavel;
            let codigoBarras = retorno.cdBarras || retorno.codigoBarras; // Fallback
            const nossoNumero = retorno.nuTituloGerado;
            
            // Se o Bradesco não retornar código de barras/linha digitável, calculamos
            if (!codigoBarras || !linhaDigitavel) {
                const calculado = gerarCodigoBarrasELinhaDigitavel(
                    dto.valor,
                    new Date(dto.dataVencimento),
                    config.agencia,
                    config.carteira,
                    String(nossoNumero),
                    config.conta,
                    '237',
                    '9'
                );
                codigoBarras = calculado.codigoBarras;
                linhaDigitavel = calculado.linhaDigitavel;
            }

            const boleto = await this.prisma.boleto.create({
                data: {
                    configuracaoId: config.id,
                    clienteId: cliente.id,
                    nossoNumero: String(nossoNumero),
                    seuNumero: dto.seuNumero,
                    valorNominal: dto.valor,
                    dataEmissao: new Date(),
                    dataVencimento: new Date(dto.dataVencimento),
                    especieDocumento: dto.especie || '02',
                    linhaDigitavel: linhaDigitavel,
                    codigoBarras: codigoBarras,
                    statusCodigo: '01',
                    statusDescricao: 'A VENCER',
                    notificadoEmissao: true,
                },
                include: { cliente: true, configuracao: true },
            });

            return {
                sucesso: true,
                boleto: {
                    id: boleto.id,
                    nossoNumero: boleto.nossoNumero,
                    linhaDigitavel: boleto.linhaDigitavel,
                    valor: boleto.valorNominal,
                    vencimento: boleto.dataVencimento,
                    cliente: boleto.cliente.nome,
                    qrCode: "" // Específico se houver Pix
                }
            };

        } catch (error) {
            this.logger.error('Erro ao emitir boleto', error);
            throw error;
        }
    }

    async consultar(nossoNumero: string) {
        const boleto = await this.prisma.boleto.findUnique({
            where: { nossoNumero },
            include: { configuracao: true }
        });

        if (!boleto) throw new BadRequestException('Boleto não encontrado para consulta');

        const config = boleto.configuracao;
        const payload = {
            cpfCnpj: {
                cpfCnpj: parseInt(config.cnpjRaiz || '0'),
                filial: parseInt(config.filial || '0'),
                controle: parseInt(config.controle || '0')
            },
            produto: parseInt(config.carteira || '9'),
            negociacao: parseInt(config.negociacao || '0'),
            nossoNumero: parseInt(boleto.nossoNumero),
            sequencia: 0,
            status: 0
        };

        return this.bradescoApi.consultarBoleto(payload);
    }

    async alterar(nossoNumero: string, dadosAlteracao: any = {}) {
        const boleto = await this.prisma.boleto.findUnique({
            where: { nossoNumero },
            include: { configuracao: true, cliente: true }
        });

        if (!boleto) throw new BadRequestException('Boleto não encontrado para alteração');

        const config = boleto.configuracao;
        const cliente = boleto.cliente;

        // Constrói payload hierárquico
        const payload = {
            cpfCnpj: {
                cpfCnpj: parseInt(config.cnpjRaiz || '0'),
                filial: parseInt(config.filial || '0'),
                controle: parseInt(config.controle || '0')
            },
            produto: parseInt(config.carteira || '9'),
            negociacao: parseInt(config.negociacao || '0'),
            nossoNumero: parseInt(boleto.nossoNumero),
            dadosPagador: {
                sacado: cliente.nome.substring(0, 40),
                cpfCnpjSacado: {
                    cpfCnpj: parseInt(cliente.documento.replace(/\D/g, '')),
                    filial: 0,
                    controle: 0 // Simplificado
                },
                endereco: cliente.logradouro.substring(0, 40),
                cep: parseInt(cliente.cep.replace(/\D/g, '')),
                sufixo: 0, // Sufixo CEP?
                nomeSacador: "", // Não temos sacador avalista no modelo simples
                aceite: "S",
                cpfCnpjSacador: { cpfCnpj: 0, filial: 0, controle: 0 },
                emailSacado: cliente.email || ""
            },
            dadosTitulo: {
                seuNumero: boleto.seuNumero,
                dataEmissao: parseInt(format(boleto.dataEmissao, 'ddMMyyyy')),
                especie: boleto.especieDocumento,
                vencimento: {
                    dataVencimento: parseInt(format(dadosAlteracao.vencimento ? new Date(dadosAlteracao.vencimento) : boleto.dataVencimento, 'ddMMyyyy')),
                    tipoVencimento: 0
                },
                // Campos opcionais/zerados por padrão para manutenção
                protesto: { codInstrucaoProtesto: 0, qtdeDiasProtesto: 0 },
                decurso: { codDecursoPrazo: 0, diasDecursoPrazo: 0 },
                abatimento: { tipoAbatimento: 0, valorAbatimento: 0 },
                dataDesc1: 0, valDesc1: 0, codValDe1: 0, tipoDesc1: 0,
                // ... incluir outros campos se necessário
                codigoControleParticipante: "",
                indicadorAvisoSacado: "",
                comissaoPermanencia: { diasComissaoPermanencia: 0, valorComissaoPermanencia: 0, codigoComissaoPermanencia: 0 },
                codigoMulta: 0, diasMulta: 0, valorMulta: 0,
                codigoNegativacao: 0, diasNegativacao: 0,
                pagamentoParcial: "", qtdePagamentoParcial: 0
            }
        };

        return this.bradescoApi.alterarBoleto(payload);
    }

    async baixar(nossoNumero: string, motivo: string) {
        const boleto = await this.prisma.boleto.findUnique({
            where: { nossoNumero },
            include: { configuracao: true }
        });

        if (!boleto) throw new BadRequestException('Boleto não encontrado para baixa/estorno');

        const config = boleto.configuracao;

        // Construção do payload conforme layout de estorno fornecido
        const payload = {
            cpfCnpj: {
                cpfCnpj: parseInt(config.cnpjRaiz || '0'),
                filial: parseInt(config.filial || '0'),
                controle: parseInt(config.controle || '0')
            },
            produto: parseInt(config.carteira || '9'),
            negociacao: parseInt(config.negociacao || '0'),
            nossoNumero: parseInt(boleto.nossoNumero),
            sequencia: 0,
            horaSolicitacao: format(new Date(), 'yyyy-MM-dd-HH.mm.ss.SSSSSS'), // Ex: "2023-07-26-11.24.21.752018"
            status: 57, // Conforme exemplo
            statusAnterior: 1 // Conforme exemplo
        };

        return this.bradescoApi.baixarBoleto(payload);
    }

    async listarPendentes() {
        return this.prisma.boleto.findMany({
            where: {
                statusCodigo: '01',
                baixado: false,
                dataVencimento: { gte: new Date() },
            },
            include: { cliente: true },
            orderBy: { dataVencimento: 'asc' },
        });
    }

    async listarAtrasados() {
        return this.prisma.boleto.findMany({
            where: {
                statusCodigo: '01',
                dataVencimento: { lt: new Date() },
                baixado: false,
            },
            include: { cliente: true },
        });
    }

    async simularPagamento(nossoNumero: string) {
        const boleto = await this.prisma.boleto.update({
            where: { nossoNumero },
            data: {
                statusCodigo: '61',
                statusDescricao: 'PAGO',
                dataPagamento: new Date(),
                valorPago: { increment: 0 }, // mantém valor original
            },
            include: { cliente: true },
        });

        // Dispara webhook local (simulação)
        await this.prisma.webhookRecebido.create({
            data: {
                tipoEvento: 'liquidacao',
                nossoNumero,
                payload: JSON.stringify({ nossoNumero, valorPago: boleto.valorNominal, data: new Date() }),
            }
        });

        return { mensagem: 'Pagamento simulado com sucesso', boleto };
    }

    async gerarPdf(nossoNumero: string): Promise<Buffer> {
        const boleto = await this.prisma.boleto.findUnique({
            where: { nossoNumero },
            include: { cliente: true, configuracao: true },
        });

        if (!boleto) throw new BadRequestException('Boleto não encontrado');

        // Calcula código de barras e linha digitável conforme padrão FEBRABAN
        const { codigoBarras, linhaDigitavel } = gerarCodigoBarrasELinhaDigitavel(
            boleto.valorNominal,
            boleto.dataVencimento,
            boleto.configuracao.agencia,
            boleto.configuracao.carteira,
            boleto.nossoNumero,
            boleto.configuracao.conta,
            '237', // Código do Bradesco
            '9'    // Real
        );

        // Atualiza o boleto com os valores calculados
        await this.prisma.boleto.update({
            where: { nossoNumero },
            data: { codigoBarras, linhaDigitavel }
        });

        // Formata CNPJ
        const cnpj = `${boleto.configuracao.cnpjRaiz}.${boleto.configuracao.filial}.${boleto.configuracao.controle}`;
        
        // Formata valores
        const valorFormatado = boleto.valorNominal.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Boleto de Cobrança - Bradesco</title>
    <style>
        @page { size: A4; margin: 0; }
        body {
            font-family: 'Courier New', monospace;
            font-size: 10px;
            margin: 0;
            padding: 10px;
            background: white;
        }
        .boleto {
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
            border: 1px solid #000;
        }
        .linha {
            display: flex;
            border-bottom: 1px solid #000;
        }
        .campo {
            padding: 3px 5px;
            border-right: 1px solid #000;
            flex: 1;
        }
        .campo:last-child { border-right: none; }
        .label {
            font-size: 7px;
            text-transform: uppercase;
            color: #333;
            display: block;
        }
        .valor {
            font-size: 10px;
            font-weight: bold;
        }
        .linha-digitavel {
            font-size: 14px;
            letter-spacing: 1px;
            padding: 8px;
            text-align: center;
            border-bottom: 1px solid #000;
            background: #f5f5f5;
        }
        .codigo-barras {
            height: 50px;
            margin: 10px 0;
            display: flex;
            justify-content: center;
            align-items: flex-end;
        }
        .barra {
            background: #000;
            margin: 0 1px;
        }
        .logo {
            font-size: 16px;
            font-weight: bold;
            color: #c00;
        }
        .banco-codigo {
            font-size: 18px;
            font-weight: bold;
            padding: 5px 15px;
        }
        .cabecalho {
            display: flex;
            align-items: center;
            border-bottom: 1px solid #000;
            padding: 5px;
        }
        .recibo {
            border-bottom: 2px dashed #000;
            margin-bottom: 20px;
            padding-bottom: 10px;
        }
        .ficha-compensacao {
            padding: 10px;
        }
    </style>
</head>
<body>
    <!-- RECIBO DO PAGADOR -->
    <div class="recibo">
        <div class="cabecalho">
            <span class="logo">BRADESCO</span>
            <span class="banco-codigo">237-9</span>
            <span class="linha-digitavel" style="flex:1; background:none; border:none;">${linhaDigitavel}</span>
        </div>
        <div class="linha">
            <div class="campo" style="flex: 3;">
                <span class="label">Beneficiário</span>
                <span class="valor">${boleto.configuracao.descricao}</span>
            </div>
            <div class="campo">
                <span class="label">CNPJ</span>
                <span class="valor">${cnpj}</span>
            </div>
            <div class="campo">
                <span class="label">Agência/Código Beneficiário</span>
                <span class="valor">${boleto.configuracao.agencia} / ${boleto.configuracao.conta}</span>
            </div>
        </div>
        <div class="linha">
            <div class="campo">
                <span class="label">Nosso Número</span>
                <span class="valor">${boleto.nossoNumero}</span>
            </div>
            <div class="campo">
                <span class="label">Nº Documento</span>
                <span class="valor">${boleto.seuNumero || boleto.nossoNumero}</span>
            </div>
            <div class="campo">
                <span class="label">Vencimento</span>
                <span class="valor">${format(boleto.dataVencimento, 'dd/MM/yyyy')}</span>
            </div>
            <div class="campo">
                <span class="label">Valor Documento</span>
                <span class="valor">R$ ${valorFormatado}</span>
            </div>
        </div>
        <div class="linha">
            <div class="campo" style="flex: 2;">
                <span class="label">Pagador</span>
                <span class="valor">${boleto.cliente.nome} - CPF/CNPJ: ${boleto.cliente.documento}</span>
            </div>
            <div class="campo">
                <span class="label">Endereço</span>
                <span class="valor">${boleto.cliente.logradouro}, ${boleto.cliente.numero}</span>
            </div>
        </div>
    </div>

    <!-- FICHA DE COMPENSAÇÃO -->
    <div class="ficha-compensacao">
        <div class="cabecalho">
            <span class="logo">BRADESCO</span>
            <span class="banco-codigo">237-9</span>
            <span class="linha-digitavel" style="flex:1; background:none; border:none;">${linhaDigitavel}</span>
        </div>
        
        <div class="linha">
            <div class="campo" style="flex: 3;">
                <span class="label">Local de Pagamento</span>
                <span class="valor">Pagável preferencialmente na Rede Bradesco ou Bradesco Expresso</span>
            </div>
            <div class="campo">
                <span class="label">Vencimento</span>
                <span class="valor">${format(boleto.dataVencimento, 'dd/MM/yyyy')}</span>
            </div>
        </div>
        
        <div class="linha">
            <div class="campo" style="flex: 3;">
                <span class="label">Beneficiário</span>
                <span class="valor">${boleto.configuracao.descricao} - CNPJ: ${cnpj}</span>
            </div>
            <div class="campo">
                <span class="label">Agência/Código Beneficiário</span>
                <span class="valor">${boleto.configuracao.agencia} / ${boleto.configuracao.conta}</span>
            </div>
        </div>
        
        <div class="linha">
            <div class="campo">
                <span class="label">Data do Documento</span>
                <span class="valor">${format(boleto.dataEmissao, 'dd/MM/yyyy')}</span>
            </div>
            <div class="campo">
                <span class="label">Nº Documento</span>
                <span class="valor">${boleto.seuNumero || boleto.nossoNumero}</span>
            </div>
            <div class="campo">
                <span class="label">Espécie Doc</span>
                <span class="valor">DM</span>
            </div>
            <div class="campo">
                <span class="label">Aceite</span>
                <span class="valor">N</span>
            </div>
            <div class="campo">
                <span class="label">Data Processamento</span>
                <span class="valor">${format(boleto.dataEmissao, 'dd/MM/yyyy')}</span>
            </div>
            <div class="campo">
                <span class="label">Nosso Número</span>
                <span class="valor">${boleto.nossoNumero}</span>
            </div>
        </div>
        
        <div class="linha">
            <div class="campo">
                <span class="label">Uso do Banco</span>
                <span class="valor"></span>
            </div>
            <div class="campo">
                <span class="label">Carteira</span>
                <span class="valor">${boleto.configuracao.carteira}</span>
            </div>
            <div class="campo">
                <span class="label">Espécie</span>
                <span class="valor">R$</span>
            </div>
            <div class="campo">
                <span class="label">Quantidade</span>
                <span class="valor"></span>
            </div>
            <div class="campo">
                <span class="label">Valor</span>
                <span class="valor"></span>
            </div>
            <div class="campo">
                <span class="label">(=) Valor Documento</span>
                <span class="valor">R$ ${valorFormatado}</span>
            </div>
        </div>
        
        <div class="linha">
            <div class="campo" style="flex: 5; min-height: 60px;">
                <span class="label">Instruções (Texto de responsabilidade do beneficiário)</span>
                <span class="valor" style="white-space: pre-line;">Após o vencimento cobrar multa de 2% + juros de 1% ao mês.
Não receber após 60 dias do vencimento.</span>
            </div>
            <div class="campo" style="flex: 1;">
                <span class="label">(-) Desconto/Abatimento</span>
                <span class="valor"></span>
            </div>
        </div>
        
        <div class="linha">
            <div class="campo" style="flex: 5;">
                <span class="label">Pagador</span>
                <span class="valor">${boleto.cliente.nome}</span>
                <span class="valor">${boleto.cliente.logradouro}, ${boleto.cliente.numero} - ${boleto.cliente.bairro}</span>
                <span class="valor">${boleto.cliente.cep} - ${boleto.cliente.cidade}/${boleto.cliente.uf}</span>
                <span class="valor">CNPJ/CPF: ${boleto.cliente.documento}</span>
            </div>
            <div class="campo" style="flex: 1;">
                <span class="label">(-) Outras Deduções</span>
                <span class="valor"></span>
            </div>
        </div>
        
        <div class="linha">
            <div class="campo" style="flex: 5;">
                <span class="label">Sacador/Avalista</span>
                <span class="valor"></span>
            </div>
            <div class="campo" style="flex: 1;">
                <span class="label">(+) Mora/Multa</span>
                <span class="valor"></span>
            </div>
        </div>
        
        <div class="linha">
            <div class="campo" style="flex: 5;"></div>
            <div class="campo" style="flex: 1;">
                <span class="label">(=) Valor Cobrado</span>
                <span class="valor"></span>
            </div>
        </div>
        
        <div style="margin-top: 15px; padding: 10px;">
            <div class="label" style="font-size: 9px; margin-bottom: 5px;">Código de Barras (padrão FEBRABAN 44 posições)</div>
            <div style="font-family: monospace; font-size: 12px; letter-spacing: 2px; word-break: break-all; background: #f5f5f5; padding: 8px; border: 1px solid #ccc;">
                ${codigoBarras}
            </div>
            <div style="font-size: 8px; margin-top: 5px; color: #666;">
                Banco: ${codigoBarras.substring(0,3)} | Moeda: ${codigoBarras.substring(3,4)} | DV: ${codigoBarras.substring(4,5)} | 
                Fator Venc.: ${codigoBarras.substring(5,9)} | Valor: ${codigoBarras.substring(9,19)} | 
                Campo Livre: ${codigoBarras.substring(19,44)}
            </div>
        </div>
        
        <div style="margin-top: 15px; padding: 10px; background: #f9f9f9; border: 1px solid #ddd;">
            <div class="label" style="font-size: 9px; margin-bottom: 5px;">Informações Técnicas</div>
            <div style="font-size: 8px; color: #666; line-height: 1.5;">
                <strong>Código de Barras (44 posições):</strong> ${codigoBarras}<br>
                <strong>Linha Digitável (47 posições):</strong> ${linhaDigitavel}<br>
                <strong>Agência:</strong> ${boleto.configuracao.agencia} | 
                <strong>Carteira:</strong> ${boleto.configuracao.carteira} | 
                <strong>Nosso Número:</strong> ${boleto.nossoNumero} | 
                <strong>Conta:</strong> ${boleto.configuracao.conta}<br>
                <strong>Fator de Vencimento:</strong> ${calcularFatorVencimento(boleto.dataVencimento)}
            </div>
        </div>
    </div>
</body>
</html>`;

        return Buffer.from(html);
    }
}
