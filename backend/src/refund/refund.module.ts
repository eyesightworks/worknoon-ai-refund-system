import { Module } from '@nestjs/common';
import { RefundController } from './refund.controller';
import { RefundService } from './refund.service';
import { AiService } from '../ai/ai.service';

@Module({
  controllers: [RefundController],
  providers: [RefundService, AiService],
})
export class RefundModule {}