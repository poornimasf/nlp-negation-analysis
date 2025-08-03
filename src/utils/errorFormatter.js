// Format error messages with consistent styling and comprehensive error handling
export const formatErrorMessage = (error) => {
  let errorMessage = '❌ Analysis Error:\n';
  
  // API errors
  if (error.message.includes('429')) {
    errorMessage += '• Rate limit exceeded\n';
    errorMessage += '• Please try again in a few minutes';
  }
  // Token errors
  else if (error.message.includes('Missing HF_TOKEN')) {
    errorMessage += '• API token not configured\n';
    errorMessage += '• Please check your environment variables';
  }
  else if (error.message.includes('Invalid token')) {
    errorMessage += '• Invalid API token\n';
    errorMessage += '• Please check your token configuration';
  }
  // Network errors
  else if (error.message.includes('Failed to fetch') || error.message.includes('Network Error')) {
    errorMessage += '• Network connection error\n';
    errorMessage += '• Please check your internet connection';
  }
  // Analysis errors
  else if (error.message.includes('Invalid input')) {
    errorMessage += '• Invalid text input\n';
    errorMessage += '• Please check your input text';
  }
  else if (error.message.includes('No text provided')) {
    errorMessage += '• No text to analyze\n';
    errorMessage += '• Please enter some text';
  }
  // Training data errors
  else if (error.message.includes('No training data')) {
    errorMessage += '• Training data required\n';
    errorMessage += '• Please upload training examples';
  }
  else if (error.message.includes('Invalid training data')) {
    errorMessage += '• Invalid training data format\n';
    errorMessage += '• Please check your training data file';
  }
  // Mode errors
  else if (error.message.includes('Invalid mode')) {
    errorMessage += '• Invalid analysis mode\n';
    errorMessage += '• Please select a valid mode';
  }
  // Service errors
  else if (error.message.includes('Service unavailable')) {
    errorMessage += '• Service temporarily unavailable\n';
    errorMessage += '• Please try again later';
  }
  // Default error
  else {
    errorMessage += `• ${error.message}\n`;
    errorMessage += '• Please check console for details';
  }
  
  return errorMessage;
};
