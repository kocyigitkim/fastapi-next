# Fast Api Release History

### v1.2.9
- Level based logging system added to Fast Api. You can use this feature via enabling ***options.switchLoggerAsConsole=true***
- Added "NEXT" flag to middleware plugins. You can skip current function execution once with this flag. Works based on express-next function.
- Added error code to failed requests and writes to log