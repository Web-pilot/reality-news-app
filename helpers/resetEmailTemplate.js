const emailTemplate = (url) => {
  return `<html>
   <body>
    <p><a href="${url}">Click this link to reset your password</a></p>
    <strong>Note:</strong> if you didn't see any link, copy the message in bold print below 👇 and paste it in your browser <br>
    <p>
    <strong>${url}</strong>
    </p>
    <p>This link expires within one day!</p>
   </body>
 </html>,
   `;
};

module.exports = emailTemplate;
