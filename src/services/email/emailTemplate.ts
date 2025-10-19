export const emailTemplate = ({
  code,
  name,
  subject,
  message,
  expiryMinutes = 10,
  loginDetails,
}: {
  code?: string | undefined;
  name: string;
  subject: string;
  message: string;
  expiryMinutes?: number;
  loginDetails?:
    | {
        ip: string;
        userAgent: string;
        location?: string;
        time: string;
      }
    | undefined;
}): string => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${subject}</title>
  </head>
  <body
    style="
      margin: 0;
      padding: 0;
      font-family: 'Inter', 'Segoe UI', Roboto, Arial, sans-serif;
      background-color: #0e0b14;
      color: #e4e1ee;
    "
  >
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td align="center" style="padding: 40px 15px;">
          <table
            role="presentation"
            cellspacing="0"
            cellpadding="0"
            border="0"
            width="600"
            style="
              background: #1a1428;
              border-radius: 18px;
              box-shadow: 0 6px 20px rgba(70, 50, 120, 0.35);
              overflow: hidden;
              border: 1px solid rgba(124, 58, 237, 0.2);
            "
          >
            <!-- Header -->
            <tr>
              <td
                align="center"
                style="
                  background: linear-gradient(135deg, #4c2c85, #6a4bb5);
                  padding: 42px 20px;
                "
              >
                <h1
                  style="
                    margin: 0;
                    font-size: 26px;
                    color: #ffffff;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                  "
                >
                  ${subject}
                </h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding: 35px; line-height: 1.7; color: #d8d4e7;">
                <h2
                  style="
                    margin-top: 0;
                    color: #b69cff;
                    font-size: 20px;
                    font-weight: 600;
                  "
                >
                  Hi ${name},
                </h2>

                <p style="margin: 0 0 20px; font-size: 15px; color: #cfcbe0;">
                  ${message}
                </p>

                ${
                  code
                    ? `
                    <!-- Code Box -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 30px auto;">
                      <tr>
                        <td
                          style="
                            background: linear-gradient(145deg, #5b3fa8, #7c5fd1);
                            color: #ffffff;
                            padding: 18px 55px;
                            border-radius: 12px;
                            font-size: 26px;
                            font-weight: bold;
                            text-align: center;
                            letter-spacing: 4px;
                            box-shadow: 0 0 18px rgba(124, 58, 237, 0.4);
                          "
                        >
                          ${code}
                        </td>
                      </tr>
                    </table>

                    <p style="margin: 18px 0 0; font-size: 14px; color: #a78bfa;">
                      This code is valid for <strong>${expiryMinutes} minutes</strong>.
                      Keep it private and secure.
                    </p>
                    `
                    : ""
                }

                ${
                  loginDetails
                    ? `
                    <!-- Login Details Section -->
                    <div style="margin-top: 25px; font-size: 14px; color: #d0c4f0;">
                      <p style="margin-bottom: 8px; color: #a78bfa;">
                        <strong>Login details:</strong>
                      </p>
                      <ul style="list-style: none; padding: 0; margin: 0;">
                        <li><b>IP Address:</b> ${loginDetails.ip}</li>
                        <li><b>Browser:</b> ${loginDetails.userAgent}</li>
                        <li><b>Time:</b> ${loginDetails.time}</li>
                        ${
                          loginDetails.location
                            ? `<li><b>Location:</b> ${loginDetails.location}</li>`
                            : ""
                        }
                      </ul>
                    </div>
                    `
                    : ""
                }

                <p
                  style="
                    margin: 32px 0 0;
                    font-size: 14px;
                    color: #cbb6ff;
                    font-weight: 600;
                  "
                >
                  Best regards, <br />
                  <span style="color: #bfa6ff;">Mohamed Hassan</span>
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td
                align="center"
                style="
                  background: #171225;
                  padding: 25px;
                  font-size: 13px;
                  color: #9b93b8;
                  border-top: 1px solid rgba(167, 139, 250, 0.1);
                "
              >
                <p style="margin: 0">
                  &copy; 2025 <strong style="color: #bfa6ff;">Social App</strong>. All rights reserved.
                </p>
                <p style="margin: 6px 0 0">
                  <a href="#" style="color: #cbb6ff; text-decoration: none;">Privacy Policy</a>
                  &nbsp;·&nbsp;
                  <a href="#" style="color: #a78bfa; text-decoration: none;">Help Center</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
