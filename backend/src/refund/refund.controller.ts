import {
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { RefundService } from './refund.service';

@Controller('refund')
export class RefundController {
  constructor(private readonly refundService: RefundService) {}

  // Create a new refund request
  @Post()
  async createRefund(
    @Body()
    body: {
      customerId: string;
      orderId: string;
      reason: string;
      customerMessage: string;
    },
  ) {
    return this.refundService.createRefund(body);
  }

  // Get all refund requests
  // Used by the admin/support dashboard
  @Get()
  async getRefunds() {
    return this.refundService.getRefunds();
  }

  // Get all available orders
  // Used by the customer refund form
  @Get('orders')
  async getOrders() {
    return this.refundService.getOrders();
  }

  // Get one refund request by ID
  @Get(':id')
  async getRefund(@Param('id') id: string) {
    return this.refundService.getRefund(id);
  }
}
