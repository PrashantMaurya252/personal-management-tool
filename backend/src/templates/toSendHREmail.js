export const generateEmailTemplate = ({
  title,
  message,
}) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title || ""}</title>
      <style>
          body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #111827;
              margin: 0;
              padding: 0;
              line-height: 1.6;
              background-color: #ffffff;
          }
          .wrapper {
              width: 100%;
              padding: 24px 16px;
          }
          .container {
              max-width: 600px;
              margin: 0 auto;
          }
          .content {
              font-size: 15px;
              color: #1f2937;
          }
          .content h1 {
              font-size: 18px;
              font-weight: 600;
              color: #111827;
              margin: 0 0 16px 0;
          }
          a {
              color: #2563eb;
              text-decoration: none;
          }
          a:hover {
              text-decoration: underline;
          }
      </style>
  </head>
  <body>
      <div class="wrapper">
          <div class="container">
              <div class="content">
                  ${title ? `<h1>${title}</h1>` : ""}
                  ${message}
              </div>
          </div>
      </div>
  </body>
  </html>
  `;
};