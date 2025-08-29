# Gemini CLI for Sage Cannabis Platform

A powerful command-line interface for interacting with Google's Gemini AI, customized for the Sage cannabis consultation platform.

## Setup

1. **Get your Gemini API Key**
   - Visit: https://makersuite.google.com/app/apikey
   - Or: https://ai.google.dev/
   - Create a new API key

2. **Configure Environment**
   ```bash
   # Create .env file
   echo "GEMINI_API_KEY=your_api_key_here" > .env
   ```

3. **Test Connection**
   ```bash
   node gemini-cli.js test
   ```

## Available Commands

### 💬 Chat with Gemini
```bash
node gemini-cli.js chat "What are the benefits of terpenes?"

# With options
node gemini-cli.js chat "Explain THC vs CBD" --model gemini-pro --temperature 0.5
```

### 🌿 Cannabis Recommendations
```bash
node gemini-cli.js recommend "sleep problems"
node gemini-cli.js recommend "chronic pain" --experience experienced
node gemini-cli.js recommend "anxiety" --experience new
```

### 📝 Generate Content
```bash
# Product descriptions
node gemini-cli.js generate product-description --topic "Purple Punch Indica"

# Blog posts
node gemini-cli.js generate blog-post --topic "Terpene Profiles Guide" --length long

# Marketing emails
node gemini-cli.js generate email --topic "420 Sale Event"
```

### 🔍 Analyze Code
```bash
# Explain code
node gemini-cli.js analyze src/components/SageApp.tsx

# Get improvement suggestions
node gemini-cli.js analyze backend/api/products.py --feedback
```

## Examples

### Cannabis Consultation
```bash
# Get strain recommendations for specific needs
node gemini-cli.js recommend "need energy and focus for work"

# Beginner-friendly options
node gemini-cli.js recommend "first time user curious" --experience new

# Medical use cases
node gemini-cli.js recommend "arthritis pain relief" --experience experienced
```

### Content Creation
```bash
# Create product listing
node gemini-cli.js generate product-description --topic "Sour Diesel Sativa 24.8% THC"

# Educational content
node gemini-cli.js generate blog-post --topic "How to Choose Your First Cannabis Product"

# Promotional content
node gemini-cli.js generate email --topic "New Live Resin Concentrates Launch"
```

### Development Help
```bash
# Understand code
node gemini-cli.js analyze demos/premo-cannabis-nj/integration.py

# Get optimization tips
node gemini-cli.js analyze frontend/src/app/api/sage/route.ts --feedback

# Quick AI assistance
node gemini-cli.js chat "How do I implement age verification in React?"
```

## Features

- 🚀 **Fast Response Times** - Direct Gemini API integration
- 🌿 **Cannabis-Focused** - Specialized prompts for dispensary operations
- 📊 **Code Analysis** - Review and improve your codebase
- 📝 **Content Generation** - Create product descriptions, blogs, emails
- 🎯 **Personalized Recommendations** - Strain and product suggestions
- 🔒 **Secure** - API key stored locally in .env

## Integration with Sage

This CLI is designed to work alongside the Sage platform:

1. **Product Data Generation**
   ```bash
   # Generate product descriptions for database
   node gemini-cli.js generate product-description --topic "New strain name"
   ```

2. **Customer Support Training**
   ```bash
   # Generate FAQ responses
   node gemini-cli.js chat "Common questions about THC dosing"
   ```

3. **Development Assistance**
   ```bash
   # Help with implementation
   node gemini-cli.js chat "Best practices for cannabis ecommerce"
   ```

## Environment Variables

```env
# Required
GEMINI_API_KEY=your_api_key_here

# Optional
GEMINI_MODEL=gemini-pro        # Model to use
GEMINI_TEMPERATURE=0.7         # Response creativity (0-1)
GEMINI_MAX_TOKENS=2048         # Max response length
```

## Troubleshooting

### No API Key Error
```bash
# Check setup
node gemini-cli.js setup

# Verify .env file exists
cat .env
```

### Connection Issues
```bash
# Test connection
node gemini-cli.js test

# Check API key validity
node gemini-cli.js chat "Hello"
```

## Advanced Usage

### Batch Processing
```bash
# Process multiple files
for file in src/components/*.tsx; do
  node gemini-cli.js analyze "$file" --feedback > "reviews/$(basename $file).md"
done
```

### Custom Prompts
```bash
# Complex queries
node gemini-cli.js chat "Compare the terpene profiles of Purple Punch, Sour Diesel, and Blue Dream for sleep effectiveness"
```

### Integration Scripts
```javascript
// Use in your Node.js scripts
const { exec } = require('child_process');

exec('node gemini-cli.js recommend "pain relief"', (error, stdout) => {
  if (!error) {
    console.log('Recommendations:', stdout);
  }
});
```

## License

Part of the Sage Cannabis Platform - Powered by Premo Cannabis, Keyport NJ