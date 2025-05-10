import { WorkflowExecuteContext } from "../WorkflowExecuteContext";
import { WorkflowRoute } from "../WorkflowRoute";
import { WorkflowRouteAction } from "../WorkflowRouteAction";
import { WorkflowRouteActionResult } from "../WorkflowRouteActionResult";

// In-memory cache storage
const cacheStore: Map<string, { 
  data: any;
  expiry: number;
}> = new Map();

export enum CacheMode {
  SET = 'set',
  GET = 'get',
  DELETE = 'delete',
  CLEAR = 'clear'
}

export class CacheAction extends WorkflowRouteAction {
  private action?: WorkflowRoute;

  constructor(
    private key: string | ((ctx: WorkflowExecuteContext) => string),
    private mode: CacheMode = CacheMode.GET,
    private options: {
      ttlMs?: number;
      actionBuilder?: (route: WorkflowRoute) => WorkflowRoute;
      fallbackValue?: any;
    } = {}
  ) {
    super("cache");
    if (options.actionBuilder) {
      this.action = options.actionBuilder(new WorkflowRoute(null, ""));
    }
  }

  private getCacheKey(context: WorkflowExecuteContext): string {
    if (typeof this.key === 'function') {
      return this.key(context);
    }
    return this.key;
  }

  private cleanupExpiredItems() {
    const now = Date.now();
    for (const [key, item] of cacheStore.entries()) {
      if (item.expiry < now) {
        cacheStore.delete(key);
      }
    }
  }

  public async execute(context: WorkflowExecuteContext): Promise<WorkflowRouteActionResult> {
    try {
      const cacheKey = this.getCacheKey(context);
      
      // Periodically clean up expired items
      if (Math.random() < 0.1) { // 10% chance to run cleanup
        this.cleanupExpiredItems();
      }
      
      switch (this.mode) {
        case CacheMode.GET: {
          const cached = cacheStore.get(cacheKey);
          
          // If cache hit and not expired
          if (cached && cached.expiry > Date.now()) {
            return new WorkflowRouteActionResult().setSuccess({
              data: cached.data,
              fromCache: true
            });
          }
          
          // Cache miss, execute action if provided
          if (this.action) {
            const result = await this.action.execute(context.nextContext, context);
            const actionResult = this.action.buildActionResult(result);
            
            if (actionResult.success) {
              // Cache the result if successful
              const ttl = this.options.ttlMs || 60000; // Default to 1 minute
              cacheStore.set(cacheKey, {
                data: actionResult.data,
                expiry: Date.now() + ttl
              });
              
              return new WorkflowRouteActionResult().setSuccess({
                data: actionResult.data,
                fromCache: false
              });
            }
            
            return actionResult;
          }
          
          // No cache hit and no action, return fallback if provided
          if ('fallbackValue' in this.options) {
            return new WorkflowRouteActionResult().setSuccess({
              data: this.options.fallbackValue,
              fromCache: false,
              isFallback: true
            });
          }
          
          return new WorkflowRouteActionResult().setError(
            `Cache miss for key '${cacheKey}' and no action or fallback provided`,
            404
          );
        }
        
        case CacheMode.SET: {
          if (!this.action) {
            return new WorkflowRouteActionResult().setError(
              "Cannot set cache without an action",
              400
            );
          }
          
          const result = await this.action.execute(context.nextContext, context);
          const actionResult = this.action.buildActionResult(result);
          
          if (actionResult.success) {
            const ttl = this.options.ttlMs || 60000; // Default to 1 minute
            cacheStore.set(cacheKey, {
              data: actionResult.data,
              expiry: Date.now() + ttl
            });
          }
          
          return actionResult;
        }
        
        case CacheMode.DELETE: {
          const deleted = cacheStore.delete(cacheKey);
          return new WorkflowRouteActionResult().setSuccess({
            deleted,
            key: cacheKey
          });
        }
        
        case CacheMode.CLEAR: {
          const count = cacheStore.size;
          cacheStore.clear();
          return new WorkflowRouteActionResult().setSuccess({
            cleared: count
          });
        }
        
        default:
          return new WorkflowRouteActionResult().setError(
            `Unknown cache mode: ${this.mode}`,
            400
          );
      }
    } catch (error) {
      return new WorkflowRouteActionResult().setError(
        `Cache action failed: ${error.message}`,
        500
      );
    }
  }
} 