// backend/middleware/debugUpload.js
export const debugUpload = (req, res, next) => {
  console.log("=== DEBUG UPLOAD ===");
  console.log("Content-Type:", req.headers['content-type']);
  console.log("Content-Length:", req.headers['content-length']);
  
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  
  req.on('end', () => {
    console.log("Raw body (first 500 chars):", body.substring(0, 500));
    next();
  });
};