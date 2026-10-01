import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { RefundModule } from './refund/refund.module';
import { AiService } from './ai/ai.service';

@Module({
  imports: [PrismaModule, RefundModule],
  controllers: [AppController],
  providers: [AppService, AiService],
})
export class AppModule {}