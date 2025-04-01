/**
 * API utility for making requests to the backend
 */

// Base URL for the API - use relative URLs in development, configurable in production
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

// Export constants for common endpoints
export const ENDPOINTS = {
  DEBUG: `${API_BASE_URL}/debug`,
  VIDEOS: `${API_BASE_URL}/videos`,
  VIDEO_UPLOAD: `${API_BASE_URL}/videos/upload`,
  PROJECTS: `${API_BASE_URL}/projects`,
};

/**
 * Fetch API wrapper with common options
 */
export const fetchApi = async (
  endpoint: string,
  options: RequestInit = {},
  userId?: string
): Promise<Response> => {
  // Set default headers if not provided
  const headers = options.headers || {};
  
  // Add user-id header if provided
  if (userId) {
    Object.assign(headers, { 'user-id': userId });
  }
  
  // Add content-type for JSON requests if not set and not FormData
  if (
    !('Content-Type' in headers) && 
    options.body && 
    !(options.body instanceof FormData)
  ) {
    Object.assign(headers, { 'Content-Type': 'application/json' });
  }
  
  // Combine options with headers
  const requestOptions: RequestInit = {
    ...options,
    headers,
  };
  
  try {
    // Log request details in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Request: ${options.method || 'GET'} ${endpoint}`);
      if (options.body) {
        console.log('Request body:', 
          options.body instanceof FormData 
            ? 'FormData (contents not displayed)' 
            : options.body
        );
      }
    }
    
    // Make the request
    const response = await fetch(endpoint, requestOptions);
    
    // Handle non-OK responses
    if (!response.ok) {
      // Try to get error details from response
      let errorDetail = '';
      try {
        const errorData = await response.clone().json();
        errorDetail = errorData.error || errorData.message || '';
      } catch (e) {
        // If not JSON, try to get text
        try {
          errorDetail = await response.clone().text();
        } catch (textError) {
          errorDetail = 'Could not retrieve error details';
        }
      }
      
      throw new Error(`HTTP Error: ${response.status} - ${errorDetail}`);
    }
    
    return response;
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
};

/**
 * Upload a file using XMLHttpRequest with progress tracking
 */
export const uploadFileWithProgress = (
  url: string,
  formData: FormData,
  userId: string,
  onProgress?: (percentage: number) => void
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    // Set up progress tracking
    if (onProgress) {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentage = Math.round((event.loaded / event.total) * 100);
          onProgress(percentage);
        }
      });
    }
    
    // Handle state changes
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('Failed to parse server response'));
          }
        } else {
          reject(new Error(`HTTP Error: ${xhr.status} - ${xhr.responseText || 'No response details'}`));
        }
      }
    };
    
    // Handle network errors
    xhr.onerror = () => {
      reject(new Error('Network error occurred'));
    };
    
    // Send the request
    xhr.open('POST', url, true);
    xhr.setRequestHeader('user-id', userId);
    xhr.send(formData);
  });
};

export default {
  ENDPOINTS,
  fetchApi,
  uploadFileWithProgress,
};