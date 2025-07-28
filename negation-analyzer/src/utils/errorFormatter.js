// Format error messages with consistent styling
export const formatErrorMessage = (error) => {
  let errorMessage = '❌ Analysis Error:\n';
  
  if (error.message.includes('Missing HF_TOKEN')) {
    errorMessage += '• Hugging Face token not configured\n';
    errorMessage += '• Please set REACT_APP_HF_TOKEN in environment variables';
  } else if (error.message.includes('Invalid token')) {
    errorMessage += '• Invalid token\n';
    errorMessage += '• Please check your configuration';
  } else if (error.message.includes('Network Error')) {
    errorMessage += '• Network connection error\n';
    errorMessage += '• Please check your internet connection';
  } else if (error.message.includes('429')) {
    errorMessage += '• Rate limit exceeded\n';
    errorMessage += '• Please try again in a few minutes';
  } else {
    errorMessage += `• ${error.message}\n`;
    errorMessage += '• Please check console for details';
  }
  
  return errorMessage;
};
