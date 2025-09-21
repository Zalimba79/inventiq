#!/usr/bin/env node

// Test script for AI product analysis API
// Usage: node scripts/test-ai-api.js

async function testAIAnalysis() {
  console.log('🧪 Testing AI Product Analysis API...\n');

  // Sample base64 image of an iPhone (small test image of a real product)
  // This is a small sample image that should be recognized as a phone
  const testImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCABAAEADASIAAhEBAxEB/8QAGwAAAgMBAQEAAAAAAAAAAAAAAAUDBAYCBwH/xAA2EAACAQMCBAMFBgUFAAAAAAABAgMABBEFIRIxQVEGE2EUIjJxgQeRobHB8BUjQlLhM2Jy0fH/xAAZAQACAwEAAAAAAAAAAAAAAAABAgADBAX/xAAjEQACAgICAgEFAAAAAAAAAAAAAQIRAyESMQRBURMiYaGx/9oADAMBAAIRAxEAPwDf6tFFbRieVgFdU94nlgnG9V/tGvH0P7PtdvI5OGQwGJSOhc8Cn61T8X6vb6Tps0kzqGaI5yRt8PIfMGs3438QnWfsjsbu3lRZmMJBwQSWHUbjl1rLHNbRnzOLdeyTwtrOo+Ltdm8Q6zNI1vGhjiTG2eu3QY5D1p5rFjczS2t5p7yJIgdQVJAKsBg/LfevPPBXi+Hw34cCy6jFA4dyIgCWkyTgBF3NaXTPH+naxZSadbR30d5IjKkN3ayRAuvwniYcJ+RoyySgm0Y2qCHVL03UFnqMUSIJN3CtzxvudgT6GmMdxb3cPmwsGQ53HavPvEl9Lp2qokWpWcEoUO0Fy+Vb0GME0x8I61c31/JaMqSo0YdnRcKxzjBPoKqXkOUHKQ7lRv57bzNLnQjJEZA+6vOI724vNOa2bS1klkiJE+RxKTnce8efb0r0aMzTaNOIJ1jmZD5ch5KevSsjZ3F5o+mvdXpBihjdpRjJkGDgjvyp1kSkgR5STBfanpWqaNc3OoXMkSxxsWEg93IHTGx+VZm1gu/4KpuYZEaVTJH5iliE7/EQflnrTTxX4gj124W5ktVUzQEq4yOEqNt/Q/nVfT9el1A2Vja23+mgQSAbKoAyc/4rXgvHPk+jZn+pF8YnjUrDX/C5sbiRIkkbzU4D7jAbYwc9/nWg8Pa7eaDrOn65BLE0sQMe6krwsMNgHqN6Sa9bLaazc20blo43KqT1GelVZozGwGNj+P8AgCrfOWP6ibW/7/guUj3zT/HnhzUrcyvfJazzDDS28vmJ9V5j6ik2o+J/DumF7Gzdr11ypQxFIlbtuQT9BXk1tBHJzWppoLaP4VriWT6dUejN+1+S+14KCWQD/cf3NCLDotwmo2gZxagqJ5JGcBxgn3jt1O2arzzQSyFpEVqSy8AbiJyarj0qIZRzRSWy5YLrsczadpOryLcIWspW5o2Si/Ld/hJUbetQp4evLGddStrwQFfgCAMJBtkFWO+33etCinFpaA5NPRqNSgNnpEjqxjcqEwfMC4PIYLA59MZ70iuvENpJosmkOjXBdGQBMuUHNQc435dqFWxVnSxQikYJxuR//9k=';

  const requestBody = {
    images: [testImage],
    sessionId: 'test-session-001',
    options: {
      useOpenAI: true,
      confidenceThreshold: 0.7
    }
  };

  try {
    console.log('📤 Sending request to API...');
    const response = await fetch('http://localhost:3000/api/ai/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log('✅ API Response Success!\n');
      console.log('📊 Analysis Results:');
      console.log('  Product Name:', data.analysis?.name || 'N/A');
      console.log('  Brand:', data.analysis?.brand || 'N/A');
      console.log('  Category:', data.analysis?.category || 'N/A');
      console.log('  Confidence:', data.analysis?.confidence || 'N/A');
      console.log('\n💯 Confidence Scores:');
      console.log('  Overall:', data.confidenceScores?.overall || 'N/A');
      console.log('  Name:', data.confidenceScores?.name || 'N/A');
      console.log('  Category:', data.confidenceScores?.category || 'N/A');
      console.log('\n⏱️  Processing Time:', data.processingTime || 'N/A', 'ms');
      console.log('🆔 Session ID:', data.sessionId);
    } else {
      console.error('❌ API Error:', data.error || 'Unknown error');
      if (data.details) {
        console.error('Details:', data.details);
      }
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
    console.error('\n⚠️  Make sure the dev server is running on http://localhost:3000');
  }
}

// Run the test
testAIAnalysis();