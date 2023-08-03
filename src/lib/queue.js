const logger = require('./logger');

class Queue {
  constructor() {
    this.items = [];
    this.isProcessing = false;
    this.processingInterval = null;
  }

  // Add an element to the queue (enqueue)
  enqueue(item) {
    this.items.push(item);
    this.processQueue();
  }

  // Remove and return the first element from the queue (dequeue)
  dequeue() {
    if (this.isEmpty()) {
      return null;
    }
    return this.items.shift();
  }

  // Return the first element from the queue without removing it (peek)
  front() {
    if (this.isEmpty()) {
      return null;
    }
    return this.items[0];
  }

  // Check if the queue is empty
  isEmpty() {
    return this.items.length === 0;
  }

  // Get the size of the queue
  size() {
    return this.items.length;
  }

  async processQueue() {
    if (this.isProcessing) {
      // Already processing, no need to start a new interval
      return;
    }

    this.isProcessing = true;

    // Start processing the queue with a specified interval (in milliseconds)
    const intervalTime = 1000; // 1 second
    this.processingInterval = setInterval(async () => {
      if (this.items.length === 0) {
        // Queue is empty, stop the interval and reset the processing flag
        clearInterval(this.processingInterval);
        this.processingInterval = null;
        this.isProcessing = false;
        logger.info('Queue is empty. Stopping processing.');
        return;
      }

      try {
        // Process the item (e.g., send API request, perform calculations, etc.)
      } catch (error) {
        logger.error('Error processing item:', error);
      }
    }, intervalTime);
  }
}

module.exports = Queue;
