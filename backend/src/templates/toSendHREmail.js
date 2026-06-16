export const generateEmailTemplate = ({
  title,
  message,
}) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
      <meta charset="UTF-8">
      <style>
          body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 20px;
          }

          .container {
              max-width: 600px;
              margin: auto;
              background: #ffffff;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }

          .header {
              background: #2563eb;
              color: white;
              text-align: center;
              padding: 20px;
          }

          .content {
              padding: 30px;
              color: #333;
              line-height: 1.7;
          }

          .footer {
              text-align: center;
              padding: 15px;
              background: #f8f8f8;
              color: #777;
              font-size: 12px;
          }
      </style>
  </head>
  <body>

      <div class="container">
          <div class="header">
              <h2>${title}</h2>
          </div>

          <div class="content">
              ${message}
          </div>

          <div class="footer">
              This email was sent automatically.
          </div>
      </div>

  </body>
  </html>
  `;
};

