# Fast Api Release History
### v1.5.3
- Dependency versions upgraded
  - Express.js upgraded to v5.1.0
  - Redis client upgraded to v5.0.1
  - UUID upgraded to v11.1.0
  - Validator upgraded to v13.15.0
  - WS upgraded to v8.18.2
  - YAML upgraded to v2.7.1
  - YUP upgraded to v1.6.1
  - TypeScript upgraded to v5.8.3
- New dependencies added:
  - @sendgrid/mail v8.1.5
  - axios v1.9.0 
  - bcrypt v5.1.1
  - node-vault v0.10.2
- New services added:
  - SendGridMailService for email notifications using SendGrid
  - WebhookNotificationService for webhook integrations
- Enhanced password utilities (PasswordUtils)
- Added Redis Socket.io adapter (NextSocketRedisAdapter)

### v1.5.2
- Added dynamic configuration capabilities:
  - Dynamic Config Loader
  - Dynamic Config Integration
  - Support for HashiCorp Vault configuration source
  - Application settings management
- Improved workflow router with new actions:
  - CacheAction for response caching
  - LimiterAction for rate limiting
  - LogAction for logging
  - ParallelAction for parallel execution
  - RetryAction for automatic retries
  - SwitchAction for conditional branching
  - TransformAction for data transformations
- Dynamic workflow loading capabilities
- Added workflow admin routes

### v1.5.1
- Added custom function execution support to workflow router
- If condition support added to workflow router
- Bug fixes on authentication protocols
- Bug fixes on authorization
- Session manager improvements
### v1.5.0
- Workflow router added
- Swagger UI bugs fixed
- OpenApi document generation problems solved and security protocols added
- Realtime config support integrated
### v1.4.5
- Object router update method bug fixed
### v1.4.3
- Object Router update method bug fixed
### v1.4.1
- Added multiple object router support
### v1.4.0
- Object Router added
### v1.3.20
- "registerAction" added to Route Manager
### v1.3.17
- added socket message parameter to sessionIdResolved
### v1.3.16
- Added sessionIdResolver to Socket programming
### v1.3.15
- Added disposeInstance method to NextPlugin
- Response message changed for /health/ready function 
### v1.3.14
- Depended middleware support added.
- Added new response methods to NextRouteResponse
### v1.3.13
- CORS preflightContinue set as false when cors is disabled
### v1.3.12
- Session bug fixed.
### v1.3.11
- Socket communication bugs fixed
### v1.3.10
- Swagger ui support added. Currently working on response models & authentication methods.
- Client parameters added to web sockets.
### v1.3.9
- Parameter assign support added to Socket Client.
### v1.3.8
- Jwt token generation bug fixed when unauthorized user signing in.
### v1.3.7
- Authentication plugin verify bug fixed
### v1.3.6
- Added jwt access token generation for authentication methods
- Bearer token & Session Id required when enabling jwt & session in same time
### v1.3.5
- Bug fix applied to yupvisitor when detecting undefined yup schema
### v1.3.4
- Removed clean session line when login auth method executed.
### v1.3.3
- Basic Authentication user retrieve bug fixed
### v1.3.2
- Set cookie enabled default value as false
### v1.3.1
- Added /fastapi/types endpoint to provide typescript definitions of api services for access to api service on client side.
    - Added cli feature:
        - "**fastapi client update**": Fetch current api client & types for improve client side development
### v1.3.0
- Notification Services added
- SMTP Mail Notification Service added
- FireBase Push Notification Service added
- Twilio SMS Notification Service added
- Authentication Method support added. We are providing google, microsoft, github and more authentication methods by passport library. Also you can define database based user authentication via enabling basic/2fa authentication method. Also we are created a helper method for retrieving user info, roles and permissions from database easily. This feature still in progress.
- Added cookie based session management. (Still testing)
- Added "callback_sid" search query parameter for catching session id from query string for callback functions
- Added dynamically session provider registration. You can use this feature via defining registerSession
### v1.2.9
- Level based logging system added to Fast Api. You can use this feature via enabling ***options.switchLoggerAsConsole=true***
- Added "NEXT" flag to middleware plugins. You can skip current function execution once with this flag. Works based on express-next function.
- Added error code to failed requests and writes to log