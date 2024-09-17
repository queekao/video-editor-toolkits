const cluster = require("cluster");
const JobQueue = require("../lib/JobQueue");
const jobQueue = new JobQueue();
/**
 * 1. Problem: If you are running cluster mode the resize JobQueue will horizontally increase whenever you increase your process
 * 2. Solution: We wanna make only parent `enqueue` the operation from child message
 */
if (cluster.isPrimary) {
  coreCount = require("os").availableParallelism();
  for (let i = 0; i < coreCount; i++) {
    cluster.fork();
  }
  cluster.on("message", (worker, message) => {
    // The parent receive the message from child and `enqueue` the jobQueue
    switch (message.messageType) {
      case "new-resize":
        const { video, height, width } = message.data;
        jobQueue.enqueue({
          type: "resize",
          video,
          width,
          height,
        });
        break;
      default:
        break;
    }
  });
  cluster.on("exit", (worker, code, signal) => {
    // Process error handling
    console.log(
      `Worker ${worker.process.pid} died (${signal} | ${code}). Restarting...`
    );
    cluster.fork();
  });
} else {
  require("./index");
}
