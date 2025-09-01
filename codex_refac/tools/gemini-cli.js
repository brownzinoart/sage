#!/usr/bin/env node

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Command } = require('commander');
const chalk = require('chalk');
const ora = require('ora');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Create CLI program
const program = new Command();

program
  .name('gemini')
  .description('Gemini AI CLI for Sage project')
  .version('1.0.0');

// Chat command
program
  .command('chat <message>')
  .description('Chat with Gemini AI')
  .option('-m, --model <model>', 'Gemini model to use', 'gemini-1.5-flash')
  .option('-t, --temperature <temp>', 'Temperature (0-1)', '0.7')
  .action(async (message, options) => {
    const spinner = ora('Thinking...').start();
    
    try {
      const model = genAI.getGenerativeModel({ 
        model: options.model,
        generationConfig: {
          temperature: parseFloat(options.temperature),
          maxOutputTokens: 2048,
        }
      });
      
      const result = await model.generateContent(message);
      const response = await result.response;
      const text = response.text();
      
      spinner.succeed(chalk.green('Response received!'));
      console.log('\n' + chalk.cyan('Gemini: ') + text);
    } catch (error) {
      spinner.fail(chalk.red('Error: ' + error.message));
      if (!process.env.GEMINI_API_KEY) {
        console.log(chalk.yellow('\n⚠️  No GEMINI_API_KEY found in environment variables'));
        console.log(chalk.yellow('Add it to your .env file: GEMINI_API_KEY=your_key_here'));
      }
    }
  });

// Analyze code command
program
  .command('analyze <file>')
  .description('Analyze code file with Gemini')
  .option('-f, --feedback', 'Get improvement suggestions')
  .action(async (file, options) => {
    const spinner = ora('Analyzing code...').start();
    
    try {
      const filePath = path.resolve(file);
      const code = await fs.readFile(filePath, 'utf-8');
      const fileName = path.basename(filePath);
      
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const prompt = options.feedback 
        ? `Analyze this ${fileName} file and provide improvement suggestions:\n\n${code}`
        : `Explain what this ${fileName} file does:\n\n${code}`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      spinner.succeed(chalk.green('Analysis complete!'));
      console.log('\n' + chalk.cyan('Analysis:\n') + text);
    } catch (error) {
      spinner.fail(chalk.red('Error: ' + error.message));
    }
  });

// Cannabis product recommendation command
program
  .command('recommend <need>')
  .description('Get cannabis product recommendations')
  .option('-e, --experience <level>', 'Experience level (new/casual/experienced)', 'casual')
  .action(async (need, options) => {
    const spinner = ora('Finding recommendations...').start();
    
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const prompt = `As a cannabis consultant for Premo Cannabis in Keyport, NJ, recommend products for someone who needs help with: ${need}. 
      Their experience level is: ${options.experience}.
      
      Provide 3 specific product recommendations with:
      1. Product type (flower, edibles, vapes, etc.)
      2. Strain type if applicable (indica/sativa/hybrid)
      3. THC percentage or mg
      4. Why it helps for this need
      5. Dosing advice
      
      Include NJ legal compliance reminder.`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      spinner.succeed(chalk.green('Recommendations ready!'));
      console.log('\n' + chalk.cyan('🌿 Cannabis Recommendations:\n') + text);
    } catch (error) {
      spinner.fail(chalk.red('Error: ' + error.message));
    }
  });

// Generate content command
program
  .command('generate <type>')
  .description('Generate content (product-description, blog-post, email)')
  .option('-t, --topic <topic>', 'Topic for content')
  .option('-l, --length <length>', 'Content length (short/medium/long)', 'medium')
  .action(async (type, options) => {
    const spinner = ora('Generating content...').start();
    
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      let prompt = '';
      switch(type) {
        case 'product-description':
          prompt = `Write a ${options.length} product description for a cannabis product: ${options.topic || 'Purple Punch Indica'}. Include effects, THC content, terpenes, and usage suggestions.`;
          break;
        case 'blog-post':
          prompt = `Write a ${options.length} blog post about: ${options.topic || 'Benefits of Terpenes in Cannabis'}. Make it educational and engaging.`;
          break;
        case 'email':
          prompt = `Write a ${options.length} promotional email for Premo Cannabis about: ${options.topic || 'New Product Launch'}. Include call-to-action.`;
          break;
        default:
          prompt = `Generate ${type} content about: ${options.topic || 'cannabis'}`;
      }
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      spinner.succeed(chalk.green('Content generated!'));
      console.log('\n' + chalk.cyan(`Generated ${type}:\n`) + text);
      
      // Option to save
      console.log('\n' + chalk.yellow('Save to file? Add --save flag next time'));
    } catch (error) {
      spinner.fail(chalk.red('Error: ' + error.message));
    }
  });

// Setup command
program
  .command('setup')
  .description('Setup Gemini API key')
  .action(async () => {
    console.log(chalk.cyan('🔧 Gemini CLI Setup\n'));
    
    if (process.env.GEMINI_API_KEY) {
      console.log(chalk.green('✓ API key found in environment'));
    } else {
      console.log(chalk.yellow('⚠️  No API key found\n'));
      console.log('To set up:');
      console.log('1. Get your API key from: https://makersuite.google.com/app/apikey');
      console.log('2. Add to .env file: GEMINI_API_KEY=your_key_here');
      console.log('3. Run any command to test');
    }
    
    console.log('\n' + chalk.cyan('Available commands:'));
    console.log('  gemini chat <message>         - Chat with AI');
    console.log('  gemini analyze <file>         - Analyze code');
    console.log('  gemini recommend <need>       - Get cannabis recommendations');
    console.log('  gemini generate <type>        - Generate content');
  });

// Test command
program
  .command('test')
  .description('Test Gemini connection')
  .action(async () => {
    const spinner = ora('Testing Gemini connection...').start();
    
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent('Say "Hello from Gemini!" if you can read this.');
      const response = await result.response;
      const text = response.text();
      
      spinner.succeed(chalk.green('✓ Connection successful!'));
      console.log('\n' + chalk.cyan('Gemini says: ') + text);
    } catch (error) {
      spinner.fail(chalk.red('✗ Connection failed'));
      console.log(chalk.red('Error: ' + error.message));
      
      if (!process.env.GEMINI_API_KEY) {
        console.log(chalk.yellow('\n⚠️  Missing GEMINI_API_KEY'));
        console.log('Run: gemini setup');
      }
    }
  });

program.parse(process.argv);