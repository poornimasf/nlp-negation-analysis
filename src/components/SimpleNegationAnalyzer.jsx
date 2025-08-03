  // Expected JSON structure:
  // [
  //   {
  //     "text": string (required),
  //     "has_expletive_ne": boolean (required),
  //     "classification": boolean (required),
  //     "trigger": string (defaults to ""),
  //     "ne_position": integer or null (defaults to null)
  //   }
  // ]
  const handleFileUpload = async (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    setUploadError(null);

    if (!file) return;

    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const content = e.target.result;
          let jsonData;

          if (file.name.endsWith('.json')) {
            const rawData = JSON.parse(content);
            
            // Validate array structure
            if (!Array.isArray(rawData)) {
              throw new Error('JSON must be an array of objects.');
            }

            // Validate each object has required fields with correct types
            const validData = rawData.every(item => 
              item && 
              typeof item === 'object' &&
              typeof item.text === 'string' &&
              typeof item.has_expletive_ne === 'boolean' &&
              typeof item.classification === 'boolean'
            );

            if (!validData) {
              throw new Error('Each item must have: text (string), has_expletive_ne (boolean), and classification (boolean).');
            }

            // Process data with defaults for optional fields
            const processedData = rawData.map(item => ({
              text: item.text,
              has_expletive_ne: item.has_expletive_ne,
              classification: item.classification,
              trigger: item.trigger || "",
              ne_position: item.ne_position ? Math.round(Number(item.ne_position)) : null
            }));

            jsonData = { examples: processedData };
          } else {
            throw new Error('Please upload a JSON file.');
          }
          
          setTrainingData(jsonData);
          setUseTrainingEnhancement(true);
        } catch (err) {
          console.error('Error processing file:', err);
          setUploadError(formatErrorMessage(err));
        }
      };

      reader.onerror = () => {
        setUploadError('Error reading file');
      };

      reader.readAsText(file);
    } catch (error) {
      console.error('File upload error:', error);
      setUploadError(formatErrorMessage(error));
    }
  };
