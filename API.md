# API for The Backend and Frontend Interaction
### 1\. Authentication & User Management

**Manage parent access to the platform.**

#### **Login**

  * **Route:** `POST /api/auth/login`
  * **Input:**
    ```json
    {
      "email": "parent@example.com",
      "password": "password123"
    }
    ```
  * **Output:**
    ```json
    {
      "token": "jwt_access_token_here",
      "user": { "id": "uuid", "name": "John Doe", "email": "parent@example.com" }
    }
    ```

#### **Sign Up**

  * **Route:** `POST /api/auth/register`
  * **Input:**
    ```json
    {
      "name": "John Doe",
      "email": "parent@example.com",
      "password": "securePassword123"
    }
    ```
  * **Output:**
    ```json
    {
      "message": "Account created successfully",
      "token": "jwt_access_token_here",
      "user": { "id": "uuid", "name": "John Doe", "email": "parent@example.com" }
    }
    ```

-----

### 2\. Child & Account Management

**Connect and manage the Reddit accounts being monitored.**

#### **Get Monitored Children**

  * **Route:** `GET /api/children`
  * **Input:** None (uses Auth token)
  * **Output:**
    ```json
    [
      { "id": "emma", "name": "Emma", "age": 14, "avatar": "E", "redditUsername": "emma_cool_123" },
      { "id": "lucas", "name": "Lucas", "age": 12, "avatar": "L", "redditUsername": "lucas_gamer" }
    ]
    ```

#### **Connect Child Account (Add Child)**

  * **Route:** `POST /api/children`
  * **Input:**
    ```json
    {
      "name": "Emma",
      "age": 14,
      "redditUsername": "emma_cool_123"
    }
    ```
  * **Output:**
    ```json
    {
      "id": "uuid",
      "name": "Emma",
      "status": "connected",
      "message": "Reddit account verified and monitoring started."
    }
    ```

#### **Remove Child Account**

  * **Route:** `DELETE /api/children/:childId`
  * **Input:** None
  * **Output:**
    ```json
    { "success": true, "message": "Child removed from monitoring." }
    ```

-----

### 3\. Monitoring & Activity (Core Feature)

**Powers the `ChildMonitoring.tsx` component.**

#### **Get Activity Interactions**

  * **Route:** `GET /api/children/:childId/interactions`
  * **Input (Query Params):**
      * `search`: string (keyword filter)
      * `risk`: string (`"all" | "high" | "medium" | "low"`)
      * `dateRange`: string (`"today" | "7days" | "30days" | "all"`)
      * `subreddit`: string (specific subreddit filter)
      * `page`: number (for pagination)
  * **Output:**
    ```json
    {
      "interactions": [
        {
          "id": 1,
          "type": "comment", 
          "content": "I love playing Minecraft...",
          "subreddit": "r/minecraft",
          "timestamp": "2023-10-27T14:30:00Z",
          "sentiment": "Positive",
          "risk": "low",
          "url": "https://reddit.com/..."
        }
      ],
      "total": 45,
      "page": 1
    }
    ```

#### **Get Subreddit Analysis**

  * **Route:** `GET /api/children/:childId/subreddits`
  * **Input (Query Params):**
      * `filter`: string (`"all" | "top5" | "top10"`)
  * **Output:**
    ```json
    [
      {
        "name": "r/gaming",
        "activityLevel": 23, // posts/day or total interactions
        "riskLevel": "low",
        "riskScore": 9,
        "riskRationale": "General gaming discussions...",
        "dominantTopics": ["Game Reviews", "Tips & Tricks"],
        "url": "https://reddit.com/r/gaming"
      }
    ]
    ```

#### **Generate Activity Report**

  * **Route:** `POST /api/children/:childId/report`
  * **Input:**
    ```json
    {
      "format": "pdf", // or "csv"
      "dateRange": "30days",
      "anonymize": false
    }
    ```
  * **Output:** (Binary file stream or JSON with download URL)
    ```json
    {
      "downloadUrl": "https://api.redditmonitor.com/reports/report-12345.pdf"
    }
    ```

-----

### 4\. Alerts System

**Powers the `AlertsPage.tsx` component.**

#### **Get Alerts**

  * **Route:** `GET /api/alerts`
  * **Input (Query Params):**
      * `status`: string (`"unread" | "acknowledged" | "all"`)
      * `risk`: string (`"all" | "high" | "medium"`)
      * `search`: string
  * **Output:**
    ```json
    [
      {
        "id": 1,
        "childId": "emma",
        "childName": "Emma",
        "childAvatar": "E",
        "severity": "high",
        "category": "Self-Harm",
        "title": "High-risk content detected",
        "description": "Posted in r/depression...",
        "timestamp": "2 hours ago",
        "url": "https://reddit.com/...",
        "acknowledged": false,
        "muted": false
      }
    ]
    ```

#### **Acknowledge Alert**

  * **Route:** `PUT /api/alerts/:alertId/acknowledge`
  * **Input:** None
  * **Output:** `{ "success": true, "alertId": 1, "status": "acknowledged" }`

#### **Mute Alert**

  * **Route:** `PUT /api/alerts/:alertId/mute`
  * **Input:**
    ```json
    { "muted": true }
    ```
  * **Output:** `{ "success": true, "alertId": 1, "muted": true }`

-----

### 5\. Trends & Recommendations

**Powers the `TrendsCenter.tsx` component.**

#### **Get Emerging Trends**

  * **Route:** `GET /api/trends/global`
  * **Input:** None
  * **Output:**
    ```json
    [
      {
        "id": 1,
        "name": "Blackout Challenge",
        "severity": "high",
        "communities": 12,
        "mentions": 234,
        "change": "+89%",
        "description": "Dangerous viral challenge...",
        "data": [ { "name": "Mon", "value": 12 }, ... ] // Chart data
      }
    ]
    ```

#### **Get Recommendations & Resources**

  * **Route:** `GET /api/recommendations`
  * **Input:** None
  * **Output:**
    ```json
    {
      "conversationStarters": [
        {
          "category": "Mental Health",
          "starters": ["I noticed you've been spending time..."]
        }
      ],
      "resources": [
        {
          "title": "Crisis Text Line",
          "link": "https://www.crisistextline.org/",
          "type": "Emergency"
        }
      ]
    }
    ```

-----

### 6\. Settings

**Powers the `SettingsPage.tsx` component.**

#### **Get Notification Preferences**

  * **Route:** `GET /api/settings/notifications`
  * **Input:** None
  * **Output:**
    ```json
    {
      "inApp": true,
      "email": true,
      "highSeverity": true,
      "mediumSeverity": true,
      "lowSeverity": false,
      "selfHarmOnly": false,
      "frequency": "instant"
    }
    ```

#### **Update Notification Preferences**

  * **Route:** `PUT /api/settings/notifications`
  * **Input:**
    ```json
    {
      "inApp": true,
      "email": false,
      "frequency": "daily"
      // ... other fields
    }
    ```
  * **Output:** `{ "success": true, "message": "Preferences updated" }`
