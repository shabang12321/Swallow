export const handleFirebaseError = (error, context) => {
  console.error(`${context} error:`, {
    code: error.code,
    message: error.message,
    isFirebaseError: error.name === 'FirebaseError'
  });
  return getErrorMessage(error);
}; 