# Fast Api Release History
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