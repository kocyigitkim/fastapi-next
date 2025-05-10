import { WorkflowExecuteContext } from "../WorkflowExecuteContext";
import { WorkflowRoute } from "../WorkflowRoute";
import { WorkflowRouteAction } from "../WorkflowRouteAction";
import { WorkflowRouteActionResult } from "../WorkflowRouteActionResult";

// In-memory limiter storage
interface LimiterRecord {
  count: number;
  resetAt: number;
  lastRequest: number;
}

const limiterStore: Map<string, LimiterRecord> = new Map();

export class LimiterAction extends WorkflowRouteAction {
  private action?: WorkflowRoute;

  constructor(
    private key: string | ((ctx: WorkflowExecuteContext) => string),
    private options: {
      limit: number;
      windowMs: number;
      actionBuilder?: (route: WorkflowRoute) => WorkflowRoute;
      errorMessage?: string;
      errorStatus?: number;
    }
  ) {
    super("limiter");
    if (options.actionBuilder) {
      this.action = options.actionBuilder(new WorkflowRoute(null, ""));
    }
  }

  private getLimiterKey(context: WorkflowExecuteContext): string {
    if (typeof this.key === 'function') {
      return this.key(context);
    }
    return this.key;
  }

  private cleanupExpiredRecords() {
    const now = Date.now();
    for (const [key, record] of limiterStore.entries()) {
      if (record.resetAt < now) {
        limiterStore.delete(key);
      }
    }
  }

  public async execute(context: WorkflowExecuteContext): Promise<WorkflowRouteActionResult> {
    try {
      // Get key for rate limiting
      const limiterKey = this.getLimiterKey(context);
      const now = Date.now();
      
      // Periodically clean up expired records
      if (Math.random() < 0.05) { // 5% chance to clean up
        this.cleanupExpiredRecords();
      }
      
      // Get or create record for this key
      let record = limiterStore.get(limiterKey);
      
      // If record exists but window has passed, reset it
      if (record && record.resetAt <= now) {
        record = undefined;
      }
      
      if (!record) {
        // New record
        record = {
          count: 1,
          resetAt: now + this.options.windowMs,
          lastRequest: now
        };
        limiterStore.set(limiterKey, record);
      } else {
        // Existing record, increment count
        record.count++;
        record.lastRequest = now;
      }
      
      // Check if limit exceeded
      if (record.count > this.options.limit) {
        // Calculate retry after in seconds
        const retryAfterMs = record.resetAt - now;
        const retryAfterSec = Math.ceil(retryAfterMs / 1000);
        
        return new WorkflowRouteActionResult()
          .setError(
            this.options.errorMessage || `Rate limit exceeded. Try again in ${retryAfterSec} seconds.`,
            this.options.errorStatus || 429
          );
      }
      
      // If within limits, execute the action if provided
      if (this.action) {
        const result = await this.action.execute(context.nextContext, context);
        return this.action.buildActionResult(result);
      }
      
      // No action provided, just return success with rate limit info
      return new WorkflowRouteActionResult().setSuccess({
        rateLimit: {
          limit: this.options.limit,
          remaining: this.options.limit - record.count,
          reset: record.resetAt,
          key: limiterKey
        }
      });
    } catch (error) {
      return new WorkflowRouteActionResult().setError(
        `Rate limiter failed: ${error.message}`,
        500
      );
    }
  }
} 