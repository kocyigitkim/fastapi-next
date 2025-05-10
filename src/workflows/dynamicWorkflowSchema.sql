-- Workflow Routers Table
CREATE TABLE IF NOT EXISTS workflow_routers (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  path VARCHAR(255) NOT NULL,
  description TEXT,
  enabled BOOLEAN NOT NULL DEFAULT 1,
  version VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Workflow Routes Table
CREATE TABLE IF NOT EXISTS workflow_routes (
  id VARCHAR(36) PRIMARY KEY,
  router_id VARCHAR(36) NOT NULL,
  path VARCHAR(255) NOT NULL,
  methods JSON NOT NULL, -- Stores HTTP methods as JSON array ["GET", "POST", etc]
  summary VARCHAR(255),
  description TEXT,
  tags VARCHAR(255),
  is_deprecated BOOLEAN DEFAULT 0,
  enabled BOOLEAN NOT NULL DEFAULT 1,
  version VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (router_id) REFERENCES workflow_routers(id) ON DELETE CASCADE
);

-- Workflow Actions Table
CREATE TABLE IF NOT EXISTS workflow_actions (
  id VARCHAR(36) PRIMARY KEY,
  route_id VARCHAR(36) NOT NULL,
  type VARCHAR(50) NOT NULL, -- Type of action: storedProcedure, map, create, etc.
  config JSON NOT NULL, -- Configuration for the action
  order INT NOT NULL, -- Order of execution
  enabled BOOLEAN NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (route_id) REFERENCES workflow_routes(id) ON DELETE CASCADE
);

-- Workflow Versions Table (for version history)
CREATE TABLE IF NOT EXISTS workflow_versions (
  id VARCHAR(36) PRIMARY KEY,
  entity_type ENUM('router', 'route', 'action') NOT NULL,
  entity_id VARCHAR(36) NOT NULL,
  router_id VARCHAR(36),
  route_id VARCHAR(36),
  version VARCHAR(50) NOT NULL,
  router_data JSON,
  route_data JSON,
  action_data JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_entity_id (entity_id),
  INDEX idx_version_entity_type (entity_type, entity_id),
  INDEX idx_router_route (router_id, route_id)
);

-- Workflow Metrics Table (for tracking performance and usage)
CREATE TABLE IF NOT EXISTS workflow_metrics (
  id VARCHAR(36) PRIMARY KEY,
  route_id VARCHAR(36) NOT NULL,
  total_executions BIGINT DEFAULT 0,
  avg_execution_time_ms FLOAT DEFAULT 0,
  success_rate FLOAT DEFAULT 0,
  last_executed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (route_id) REFERENCES workflow_routes(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_workflow_routes_router_id ON workflow_routes(router_id);
CREATE INDEX idx_workflow_actions_route_id ON workflow_actions(route_id);
CREATE INDEX idx_workflow_actions_order ON workflow_actions(route_id, order);

-- Example router insertion
INSERT INTO workflow_routers (id, name, path, description, enabled) VALUES 
('1', 'API Router', '/api', 'Main API router', 1);

-- Example route insertion
INSERT INTO workflow_routes (id, router_id, path, methods, summary, description, tags, is_deprecated, enabled) VALUES 
('1', '1', '/users', '["GET", "POST"]', 'User Management', 'Endpoints for managing users', 'users', 0, 1);

-- Example actions insertion
INSERT INTO workflow_actions (id, route_id, type, config, order, enabled) VALUES 
-- GET users action (retrieveMany)
('1', '1', 'retrievemany', '{
  "db": "db",
  "table": "users",
  "projection": ["id", "username", "email", "created_at"],
  "searchColumns": ["username", "email"],
  "searchField": "search",
  "filterField": "filter",
  "sortByField": "sort.column",
  "sortDirField": "sort.direction",
  "pageIndexField": "pagination.page",
  "pageSizeField": "pagination.pageSize"
}', 1, 1),

-- POST users action (validate)
('2', '1', 'validate', '{
  "schema": {
    "type": "object",
    "properties": {
      "username": { "type": "string", "min": 3, "max": 50 },
      "email": { "type": "string", "matches": "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$" },
      "password": { "type": "string", "min": 8 }
    },
    "required": ["username", "email", "password"]
  }
}', 1, 1),

-- POST users action (create)
('3', '1', 'create', '{
  "db": "db",
  "table": "users",
  "args": {
    "username": "username",
    "email": "email",
    "password": "password"
  }
}', 2, 1),

-- Example of a cache action
('4', '1', 'cache', '{
  "key": "users_list",
  "mode": "GET",
  "ttlMs": 300000,
  "action": {
    "actions": [
      {
        "type": "retrievemany",
        "config": {
          "db": "db",
          "table": "users",
          "projection": ["id", "username", "email"]
        }
      }
    ]
  }
}', 0, 0);

-- Example of a more complex workflow with conditional logic
INSERT INTO workflow_routes (id, router_id, path, methods, summary, description, tags, enabled) VALUES 
('2', '1', '/auth/login', '["POST"]', 'User Login', 'Authenticate a user and return a token', 'auth', 1);

INSERT INTO workflow_actions (id, route_id, type, config, order, enabled) VALUES 
-- Validate login input
('5', '2', 'validate', '{
  "schema": {
    "type": "object",
    "properties": {
      "username": { "type": "string" },
      "password": { "type": "string" }
    },
    "required": ["username", "password"]
  }
}', 1, 1),

-- Check if user exists
('6', '2', 'storedprocedure', '{
  "name": "auth_validate_user",
  "args": {
    "username": "body.username",
    "password": "body.password"
  }
}', 2, 1),

-- Handle login success/failure with switch
('7', '2', 'switch', '{
  "expression": "lastActionResult.success",
  "source": "lastActionResult",
  "cases": [
    {
      "value": true,
      "handler": {
        "actions": [
          {
            "type": "map",
            "config": {
              "source": "lastActionResult",
              "map": {
                "token": "result.token",
                "user": "result.user"
              }
            }
          }
        ]
      }
    }
  ],
  "defaultCase": {
    "actions": [
      {
        "type": "log",
        "config": {
          "message": "Login failed for user",
          "logLevel": "warn",
          "includeContext": true
        }
      },
      {
        "type": "custom",
        "config": {
          "function": "function(ctx) { return { success: false, error: \"Invalid username or password\", status: 401 }; }"
        }
      }
    ]
  }
}', 3, 1);

-- Rate limiting example on a sensitive endpoint
INSERT INTO workflow_routes (id, router_id, path, methods, summary, description, tags, enabled) VALUES 
('3', '1', '/auth/reset-password', '["POST"]', 'Password Reset', 'Request a password reset link', 'auth', 1);

INSERT INTO workflow_actions (id, route_id, type, config, order, enabled) VALUES 
-- Apply rate limiter
('8', '3', 'limiter', '{
  "key": "ctx.nextContext.ip",
  "limit": 5,
  "windowMs": 3600000,
  "errorMessage": "Too many password reset attempts, please try again later",
  "errorStatus": 429
}', 1, 1),

-- Validate input
('9', '3', 'validate', '{
  "schema": {
    "type": "object",
    "properties": {
      "email": { "type": "string" }
    },
    "required": ["email"]
  }
}', 2, 1),

-- Process password reset
('10', '3', 'storedprocedure', '{
  "name": "auth_request_password_reset",
  "args": {
    "email": "body.email"
  }
}', 3, 1);

-- Example of parallel processing
INSERT INTO workflow_routes (id, router_id, path, methods, summary, description, tags, enabled) VALUES 
('4', '1', '/dashboard/summary', '["GET"]', 'Dashboard Summary', 'Get summary data for dashboard', 'dashboard', 1);

INSERT INTO workflow_actions (id, route_id, type, config, order, enabled) VALUES 
-- Run multiple queries in parallel
('11', '4', 'parallel', '{
  "failFast": false,
  "maxConcurrent": 3,
  "actions": [
    {
      "actions": [
        {
          "type": "storedprocedure",
          "config": {
            "name": "get_user_stats"
          }
        }
      ]
    },
    {
      "actions": [
        {
          "type": "storedprocedure",
          "config": {
            "name": "get_activity_stats"
          }
        }
      ]
    },
    {
      "actions": [
        {
          "type": "storedprocedure",
          "config": {
            "name": "get_system_health"
          }
        }
      ]
    }
  ]
}', 1, 1),

-- Transform the results
('12', '4', 'transform', '{
  "source": "lastActionResult",
  "transformFn": "function(data) { return { userStats: data[0], activityStats: data[1], systemHealth: data[2] }; }"
}', 2, 1); 