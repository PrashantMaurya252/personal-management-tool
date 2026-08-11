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
              font-family: Arial, sans-serif;
              color: #000;
              margin: 0;
              padding: 0;
          }
      </style>
  </head>
  <body>
      <div style="padding: 10px;">
          ${title ? `<h3>${title}</h3>` : ""}
          ${message}
      </div>
  </body>
  </html>
  `;
};