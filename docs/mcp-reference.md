# MCP BudGuide Integration - Quick Reference

> **Purpose**: Hemp product discovery system for AI assistants via Model Context Protocol

---

## 🚀 QUICK START

```json
// MCP Server Config
{
  "mcpServers": {
    "budguide": {
      "command": "python",
      "args": ["-m", "budguide_mcp.server"],
      "env": {
        "BUDGUIDE_API_URL": "http://localhost:8000",
        "BUDGUIDE_API_KEY": "${BUDGUIDE_API_KEY}",
        "DATABASE_URL": "${DATABASE_URL}"
      }
    }
  }
}
```

---

## 🛠️ CORE TOOLS

### Essential Tools (Use These)
```typescript
// Primary search - use for all product discovery
search_products(query: string, filters?: object, limit?: number)

// Product details - when user wants specifics
get_product_details(product_id: string)

// Compliance - REQUIRED before recommendations
check_compliance(product_id: string, user_location?: string, user_age?: number)

// Education - when user needs learning
get_education_content(topic: "CBD"|"CBG"|"CBN"|"dosage"|"safety", user_level?: string)
```

### Context Tools (Use Sparingly)
```typescript
// Only for complex multi-turn conversations
analyze_user_needs(user_input: string, context?: object)
track_conversation(session_id: string, message: string, privacy_level?: number)
```

---

## 📋 USAGE PATTERNS

### Pattern 1: Simple Product Search
```typescript
// User: "CBD for sleep"
await search_products("CBD for sleep", {cannabinoid: "CBN"}, 3)
// Returns: products + intent + suggestions
```

### Pattern 2: Educational Query
```typescript
// User: "What is CBD?"
await get_education_content("CBD", "beginner")
// Returns: content + key_points + faqs
```

### Pattern 3: Compliance Check
```typescript
// Before any recommendation
await check_compliance(product_id, "NC", user_age)
// Returns: is_compliant + restrictions + warnings
```

---

## 🎯 SMART DEFAULTS

### Auto-Applied Filters
```javascript
// Location-based
location: "NC" (North Carolina hemp regulations)
thc_limit: 0.3 // Federal limit
age_verification: true // For THCA products

// Search defaults
limit: 5 // Optimal results count
privacy_level: 1 // Anonymous by default
```

### Intent Classification
```javascript
search_effect: ["help", "need", "looking for"] // → search_products
education: ["what is", "explain", "how does"] // → get_education_content  
safety: ["safe", "legal", "test"] // → check_compliance + education
browse: [default] // → search_products with broad terms
```

---

## ⚡ EFFICIENCY RULES

### When to Use Each Tool
```
✅ search_products: 90% of queries
✅ get_education_content: When user asks "what is" or needs learning
✅ check_compliance: ALWAYS before product recommendations
❌ analyze_user_needs: Only for complex requirements
❌ track_conversation: Only for multi-session interactions
```

### Token Optimization
```typescript
// Efficient query structure
{
  query: "brief natural language",
  filters: {specific_filters_only}, 
  limit: 5 // Never exceed unless requested
}

// Avoid these patterns
- Long conversational queries
- Unnecessary context objects
- Batch operations for simple requests
```

---

## 🚨 COMPLIANCE GUARDRAILS

### NC Hemp Regulations (Auto-Check)
```javascript
thc_limit: 0.3% // Federal/NC limit
age_requirement: 21+ // THCA products
lab_testing: required // Third-party COAs
child_resistant: true // Packaging requirement
```

### Privacy Levels
```
1: Anonymous (default) - No storage
2: Session - Memory only  
3: Local - Browser cache
4: Account - Full features
```

---

## 🔧 ERROR HANDLING

### Common Issues + Fixes
```javascript
// Product not found
if (!product) return {error: "Product unavailable", suggestions: [...]}

// Age verification needed
if (requires_age && !age_verified) return {action: "verify_age"}

// Location restricted  
if (!legal_in_location) return {alternatives: [...]}

// API timeout
catch(timeout) return {message: "Please try again", cached_results: [...]}
```

---

## 📊 PERFORMANCE NOTES

### Caching Strategy
- Product details: 1 hour
- Search results: 15 minutes  
- Educational content: 24 hours
- Compliance rules: 6 hours

### Resource Usage
```
Light: search_products, get_education_content
Medium: get_product_details, check_compliance  
Heavy: analyze_user_needs, track_conversation
```

---

## 🎪 EXAMPLE FLOWS

### Complete Product Discovery (3 calls)
```typescript
// 1. Search
const products = await search_products("sleep aid no grogginess", {cannabinoid: "CBN"}, 3)

// 2. Compliance (for top result)
const compliance = await check_compliance(products.products[0].id, "NC", 25)

// 3. Education (if needed)
const info = await get_education_content("CBN", "beginner")
```

### Educational Response (1 call)
```typescript
// User: "Is CBD safe?"
const safety = await get_education_content("safety", "beginner")
```

---

## 🎯 QUICK DECISION TREE

```
User Query Type:
├── Product search → search_products()
├── "What is..." → get_education_content()  
├── "Is it safe/legal" → check_compliance() + education
├── Complex needs → analyze_user_needs() then search
└── Multi-turn chat → track_conversation()
```

---

**Token Count**: ~800 | **Update Frequency**: As needed | **Status**: Active