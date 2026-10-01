import { Injectable, NotFoundException } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RefundService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  // Create a new refund request
  async createRefund(data: {
    customerId: string;
    orderId: string;
    reason: string;
    customerMessage: string;
  }) {
    // 1. Find the customer
    const customer = await this.prisma.customer.findUnique({
      where: {
        id: data.customerId,
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // 2. Find the order
    const order = await this.prisma.order.findUnique({
      where: {
        id: data.orderId,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // 3. Make sure the order belongs to the selected customer
    if (order.customerId !== customer.id) {
      throw new NotFoundException(
        'Order does not belong to the selected customer',
      );
    }

    // 4. Calculate order age
    const ageInDays =
      (Date.now() - order.orderDate.getTime()) /
      (1000 * 60 * 60 * 24);

    const message = data.customerMessage.toLowerCase();

    // 5. Apply deterministic refund policy
    let status: 'APPROVED' | 'DENIED' | 'ESCALATED';
    let decisionReason: string;

    // Final-sale items are never refundable.
    if (order.finalSale) {
      status = 'DENIED';

      decisionReason =
        'Final-sale items are not eligible for refunds.';
    }

    // Suspicious or conflicting requests require human review.
    else if (
      (order.damaged && order.incorrectItem) ||
      message.includes('ignore previous instructions') ||
      message.includes('system prompt') ||
      message.includes('bypass') ||
      message.includes('override')
    ) {
      status = 'ESCALATED';

      decisionReason =
        'Request contains conflicting or potentially suspicious information and requires human review.';
    }

    // Orders older than 30 days are not refundable.
    else if (ageInDays > 30) {
      status = 'DENIED';

      decisionReason =
        'Orders older than 30 days are outside the refund eligibility period.';
    }

    // Refunds above $500 require human review.
    else if (order.totalAmount > 500) {
      status = 'ESCALATED';

      decisionReason =
        'Refund amount exceeds $500 and requires human review.';
    }

    // Damaged or incorrect items may qualify.
    else if (order.damaged || order.incorrectItem) {
      status = 'APPROVED';

      decisionReason =
        'Item was reported as damaged or incorrect and qualifies for a refund.';
    }

    // Standard eligible request.
    else {
      status = 'APPROVED';

      decisionReason =
        'Order meets the basic refund eligibility policy.';
    }

    // 6. Generate customer-friendly response.
    // The AI does not make the refund decision.
    const aiResponse =
      await this.aiService.generateRefundResponse({
        customerMessage: data.customerMessage,
        status,
        decisionReason,
        order: {
          orderNumber: order.orderNumber,
          itemName: order.itemName,
          totalAmount: order.totalAmount,
        },
      });

    // 7. Save refund request
    const refund = await this.prisma.refundRequest.create({
      data: {
        customerId: customer.id,
        orderId: order.id,
        reason: data.reason,
        customerMessage: data.customerMessage,
        status,
        decisionSource: 'POLICY',
        decisionReason,
        aiResponse,
      },
    });

    // 8. Save audit log
    await this.prisma.auditLog.create({
      data: {
        refundRequestId: refund.id,
        event: 'REFUND_DECISION',
        details: `${status}: ${decisionReason}`,
      },
    });

    // 9. Return result
    return {
      id: refund.id,
      status,
      decisionReason,
      decisionSource: 'POLICY',
      aiResponse,
      order: {
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        itemName: order.itemName,
      },
    };
  }

  // Get all refund requests
  // Used by the admin/support dashboard
  async getRefunds() {
    return this.prisma.refundRequest.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        customer: true,
        order: true,
        auditLogs: true,
      },
    });
  }

  // Get all available orders
  // Used by the customer refund form
  async getOrders() {
    return this.prisma.order.findMany({
      orderBy: {
        orderNumber: 'asc',
      },
      include: {
        customer: true,
      },
    });
  }

  // Get one refund request by ID
  async getRefund(id: string) {
    const refund = await this.prisma.refundRequest.findUnique({
      where: {
        id,
      },
      include: {
        customer: true,
        order: true,
        auditLogs: true,
      },
    });

    if (!refund) {
      throw new NotFoundException(
        'Refund request not found',
      );
    }

    return refund;
  }
}