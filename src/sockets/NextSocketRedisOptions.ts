// Burada tip hiyerarşisini kullanmak yerine daha genel bir yaklaşım benimsiyoruz
// Bu sayede redis sürümleri arasındaki uyumsuzluklar sorun yaratmayacak

export class NextSocketRedisOptions {
    public enabled = false;
    public redisOptions: any = {};
    public prefix = 'next:socket:';
    
    constructor(options?: Partial<NextSocketRedisOptions>) {
        if (options) {
            Object.assign(this, options);
        }
    }
    
    public static fromEnv(): NextSocketRedisOptions {
        const options = new NextSocketRedisOptions();
        
        if (process.env.NEXT_SOCKET_REDIS_ENABLED === 'true') {
            options.enabled = true;
            options.redisOptions = {
                url: process.env.NEXT_SOCKET_REDIS_URL || `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || '6379'}`,
                password: process.env.NEXT_SOCKET_REDIS_PASSWORD || process.env.REDIS_PASSWORD
            };
            
            if (process.env.NEXT_SOCKET_REDIS_PREFIX) {
                options.prefix = process.env.NEXT_SOCKET_REDIS_PREFIX;
            }
        }
        
        return options;
    }
} 