---
name: n8n-code-python
description: Write Python code in n8n Code nodes. Use when writing Python in n8n, using _input/_json/_node syntax, working with standard library, or need to understand Python limitations in n8n Code nodes.
---

# Python Code Node (Beta)

Expert guidance for writing Python code in n8n Code nodes.

---

## ⚠️ Important: JavaScript First

**Recommendation**: Use **JavaScript for 95% of use cases**. Only use Python when:
- You need specific Python standard library functions
- You're significantly more comfortable with Python syntax
- You're doing data transformations better suited to Python

---

## Quick Start

```python
# Basic template for Python Code nodes
items = _input.all()

# Process data
processed = []
for item in items:
    processed.append({
        "json": {
            **item["json"],
            "processed": True,
            "timestamp": datetime.now().isoformat()
        }
    })

return processed
```

### Essential Rules

1. **Consider JavaScript first** - Use Python only when necessary
2. **Access data**: `_input.all()`, `_input.first()`, or `_input.item`
3. **CRITICAL**: Must return `[{"json": {...}}]` format
4. **CRITICAL**: Webhook data is under `_json["body"]` (not `_json` directly)
5. **CRITICAL LIMITATION**: **No external libraries** (no requests, pandas, numpy)
6. **Standard library only**: json, datetime, re, base64, hashlib, urllib.parse, math, random, statistics

---

## Mode Selection Guide

### Run Once for All Items (Recommended - Default)

- **How it works**: Code executes **once** regardless of input count
- **Data access**: `_input.all()` or `_items` array (Native mode)

```python
# Example: Calculate total from all items
all_items = _input.all()
total = sum(item["json"].get("amount", 0) for item in all_items)

return [{
    "json": {
        "total": total,
        "count": len(all_items),
        "average": total / len(all_items) if all_items else 0
    }
}]
```

### Run Once for Each Item

- **How it works**: Code executes **separately** for each input item
- **Data access**: `_input.item` or `_item` (Native mode)

```python
# Example: Add processing timestamp to each item
item = _input.item

return [{
    "json": {
        **item["json"],
        "processed": True,
        "processed_at": datetime.now().isoformat()
    }
}]
```

---

## Python Modes: Beta vs Native

### Python (Beta) - Recommended
- **Use**: `_input`, `_json`, `_node` helper syntax
- **Helpers available**: `_now`, `_today`, `_jmespath()`

### Python (Native) (Beta)
- **Use**: `_items`, `_item` variables only
- **No helpers**: No `_input`, `_now`, etc.

---

## Data Access Patterns

### Pattern 1: _input.all() - Most Common
```python
all_items = _input.all()
valid = [item for item in all_items if item["json"].get("status") == "active"]
return [{"json": {"id": item["json"]["id"]}} for item in valid]
```

### Pattern 2: _input.first() - Very Common
```python
first_item = _input.first()
data = first_item["json"]
```

### Pattern 3: _input.item - Each Item Mode Only
```python
current_item = _input.item
```

### Pattern 4: _node - Reference Other Nodes
```python
webhook_data = _node["Webhook"]["json"]
```

---

## Critical: Webhook Data Structure

**MOST COMMON MISTAKE**: Webhook data is nested under `["body"]`

```python
# ✅ CORRECT - Webhook data is under ["body"]
name = _json["body"]["name"]
email = _json["body"]["email"]

# ✅ SAFER - Use .get() for safe access
webhook_data = _json.get("body", {})
name = webhook_data.get("name")
```

---

## Return Format Requirements

**CRITICAL RULE**: Always return list of dictionaries with `"json"` key

```python
# ✅ Single result
return [{"json": {"result": "success"}}]

# ✅ Multiple results
return [{"json": {"id": 1}}, {"json": {"id": 2}}]
```

---

## Critical Limitation: No External Libraries

**MOST IMPORTANT PYTHON LIMITATION**: Cannot import external packages (No requests, pandas, numpy).
Use **Standard Library only** (json, datetime, re, base64, hashlib, urllib.parse, math, random, statistics).

---

## Best Practices

1. **Always Use .get() for Dictionary Access**
2. **Handle None/Null Values Explicitly**
3. **Use List Comprehensions for Filtering**
4. **Return Consistent Structure**
5. **Debug with print() Statements**

---

## When to Use Python vs JavaScript

### Use Python When:
- ✅ You need `statistics` module
- ✅ You're significantly more comfortable with Python
- ✅ Your logic maps well to list comprehensions

### Use JavaScript When:
- ✅ You need HTTP requests ($helpers.httpRequest())
- ✅ You need advanced date/time (Luxon)
- ✅ **For 95% of use cases** (recommended)

---
