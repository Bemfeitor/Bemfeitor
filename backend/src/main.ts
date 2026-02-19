import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.enableCors({ origin: '*' });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

    const config = new DocumentBuilder()
        .setTitle('API Cobrança Bradesco')
        .setDescription('Sistema de gestão de boletos')
        .setVersion('1.0')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    const port = process.env.PORT || 3002;
    await app.listen(port);
    console.log(`🚀 API rodando em http://localhost:${port}`);
    console.log(`📚 Swagger em http://localhost:${port}/api`);
    console.log('🎭 Modo Mock:', process.env.MOCK_BRADESCO === 'true' ? 'ATIVADO' : 'DESATIVADO');
}
bootstrap();
