export class CreateOrderDto {
  customerId: number;
  orderNumber: string;
  issueDate: Date;
  notes?: string;
  items: {
    productId: number;
    quantity: number;
    price: number;
  }[];
}
