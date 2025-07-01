export interface Operation {
  id: string;
  type: 'ADD_TO_CART' | 'REMOVE_FROM_CART' | 'SAVE_FOR_LATER' | 'MOVE_TO_CART' | 'REMOVE_FROM_SAVED' | 'UPDATE_QUANTITY';
  productId: number;
  payload?: any;
  timestamp: number;
  retryCount?: number;
}

export class RaceConditionManager {
  private operationQueue: Operation[] = [];
  private processingLocks: Set<number> = new Set(); // Product IDs being processed
  private maxRetries = 3;
  private retryDelay = 1000; // 1 second

  // Generate unique operation ID
  private generateOperationId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Check if product is currently being processed
  isProductLocked(productId: number): boolean {
    return this.processingLocks.has(productId);
  }

  // Lock product for processing
  private lockProduct(productId: number): void {
    this.processingLocks.add(productId);
  }

  // Unlock product after processing
  private unlockProduct(productId: number): void {
    this.processingLocks.delete(productId);
  }

  // Add operation to queue
  enqueueOperation(operation: Omit<Operation, 'id' | 'timestamp'>): string {
    const fullOperation: Operation = {
      ...operation,
      id: this.generateOperationId(),
      timestamp: Date.now(),
      retryCount: 0
    };

    this.resolveConflicts(fullOperation);
    
    this.operationQueue.push(fullOperation);
    return fullOperation.id;
  }

  private resolveConflicts(newOperation: Operation): void {
    const conflictingOps = this.operationQueue.filter(op => 
      op.productId === newOperation.productId && 
      this.areOperationsConflicting(op.type, newOperation.type)
    );

    conflictingOps.forEach(op => {
      this.operationQueue = this.operationQueue.filter(queuedOp => queuedOp.id !== op.id);
      console.log(`Resolved conflict: Removed ${op.type} for product ${op.productId}`);
    });
  }

  private areOperationsConflicting(op1: Operation['type'], op2: Operation['type']): boolean {
    const conflicts: Record<Operation['type'], Operation['type'][]> = {
      'ADD_TO_CART': ['REMOVE_FROM_CART'],
      'REMOVE_FROM_CART': ['ADD_TO_CART', 'MOVE_TO_CART', 'UPDATE_QUANTITY'],
      'SAVE_FOR_LATER': ['REMOVE_FROM_SAVED'],
      'MOVE_TO_CART': ['REMOVE_FROM_CART', 'REMOVE_FROM_SAVED'],
      'REMOVE_FROM_SAVED': ['SAVE_FOR_LATER', 'MOVE_TO_CART'],
      'UPDATE_QUANTITY': ['REMOVE_FROM_CART']
    };

    return conflicts[op1]?.includes(op2) || false;
  }

  async processNextOperation(
    executor: (operation: Operation) => Promise<void>
  ): Promise<boolean> {
    const operationIndex = this.operationQueue.findIndex(
      op => !this.isProductLocked(op.productId)
    );

    if (operationIndex === -1) {
      return false; 
    }

    const operation = this.operationQueue[operationIndex];
    this.operationQueue.splice(operationIndex, 1);

    this.lockProduct(operation.productId);

    try {
      await executor(operation);
      console.log(`✅ Operation completed: ${operation.type} for product ${operation.productId}`);
    } catch (error) {
      console.error(`❌ Operation failed: ${operation.type} for product ${operation.productId}`, error);
      
      if ((operation.retryCount || 0) < this.maxRetries) {
        operation.retryCount = (operation.retryCount || 0) + 1;
        
        setTimeout(() => {
          this.operationQueue.unshift(operation);
          console.log(`🔄 Retrying operation: ${operation.type} (attempt ${operation.retryCount})`);
        }, this.retryDelay * operation.retryCount);
      } else {
        console.log(`💥 Operation failed permanently: ${operation.type} for product ${operation.productId}`);
      }
    } finally {
      this.unlockProduct(operation.productId);
    }

    return true;
  }

  // Process all queued operations
  async processAllOperations(
    executor: (operation: Operation) => Promise<void>
  ): Promise<void> {
    while (this.operationQueue.length > 0) {
      const processed = await this.processNextOperation(executor);
      if (!processed) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }

  // Get queue status
  getQueueStatus(): {
    queueLength: number;
    lockedProducts: number[];
    pendingOperations: Array<{type: Operation['type'], productId: number}>
  } {
    return {
      queueLength: this.operationQueue.length,
      lockedProducts: Array.from(this.processingLocks),
      pendingOperations: this.operationQueue.map(op => ({
        type: op.type,
        productId: op.productId
      }))
    };
  }

  clearProductOperations(productId: number): void {
    this.operationQueue = this.operationQueue.filter(op => op.productId !== productId);
    this.unlockProduct(productId);
  }

  clearAllOperations(): void {
    this.operationQueue = [];
    this.processingLocks.clear();
  }
}