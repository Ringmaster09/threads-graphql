const { isValidEmail } = require('./helpers');

/**
 * Validate user registration input
 */
const validateRegisterInput = (input) => {
  const errors = {};
  
  // Validate username
  if (!input.username || input.username.trim() === '') {
    errors.username = 'Username is required';
  } else if (input.username.length < 3) {
    errors.username = 'Username must be at least 3 characters long';
  } else if (!/^[a-zA-Z0-9_]+$/.test(input.username)) {
    errors.username = 'Username can only contain letters, numbers, and underscores';
  }
  
  // Validate email
  if (!input.email || input.email.trim() === '') {
    errors.email = 'Email is required';
  } else if (!isValidEmail(input.email)) {
    errors.email = 'Email is invalid';
  }
  
  // Validate password
  if (!input.password || input.password.trim() === '') {
    errors.password = 'Password is required';
  } else if (input.password.length < 6) {
    errors.password = 'Password must be at least 6 characters long';
  }
  
  // Validate name
  if (!input.name || input.name.trim() === '') {
    errors.name = 'Name is required';
  }
  
  return {
    errors,
    valid: Object.keys(errors).length === 0
  };
};

/**
 * Validate login input
 */
const validateLoginInput = (input) => {
  const errors = {};
  
  // Validate email
  if (!input.email || input.email.trim() === '') {
    errors.email = 'Email is required';
  } else if (!isValidEmail(input.email)) {
    errors.email = 'Email is invalid';
  }
  
  // Validate password
  if (!input.password || input.password.trim() === '') {
    errors.password = 'Password is required';
  }
  
  return {
    errors,
    valid: Object.keys(errors).length === 0
  };
};

/**
 * Validate post content
 */
const validatePostContent = (content) => {
  const errors = {};
  
  if (!content || content.trim() === '') {
    errors.content = 'Post content is required';
  } else if (content.length > 500) {
    errors.content = 'Post content cannot exceed 500 characters';
  }
  
  return {
    errors,
    valid: Object.keys(errors).length === 0
  };
};

/**
 * Validate comment content
 */
const validateCommentContent = (content) => {
  const errors = {};
  
  if (!content || content.trim() === '') {
    errors.content = 'Comment content is required';
  } else if (content.length > 300) {
    errors.content = 'Comment content cannot exceed 300 characters';
  }
  
  return {
    errors,
    valid: Object.keys(errors).length === 0
  };
};

/**
 * Validate user update input
 */
const validateUserUpdateInput = (input) => {
  const errors = {};
  
  if (input.name && input.name.trim() === '') {
    errors.name = 'Name cannot be empty';
  }
  
  if (input.bio && input.bio.length > 160) {
    errors.bio = 'Bio cannot exceed 160 characters';
  }
  
  return {
    errors,
    valid: Object.keys(errors).length === 0
  };
};

module.exports = {
  validateRegisterInput,
  validateLoginInput,
  validatePostContent,
  validateCommentContent,
  validateUserUpdateInput
};