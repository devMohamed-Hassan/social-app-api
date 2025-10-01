export const emailTemplate = ({
  code,
  name,
  subject,
  message,
  expiryMinutes = 10,
}: {
  code: string;
  name: string;
  subject: string;
  message: string;
  expiryMinutes: number;
}): string => `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${subject}</title>
  </head>
  <body
    style="
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Roboto, Arial, sans-serif;
    "
  >
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td align="center" style="padding: 30px 15px">
          <table
            role="presentation"
            cellspacing="0"
            cellpadding="0"
            border="0"
            width="600"
            style="
              max-width: 600px;
              background: #ffffff;
              border: 1px solid #e6e6e6;
              border-radius: 12px;
              box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
              overflow: hidden;
            "
          >
            <!-- Header -->
            <tr>
              <td
                align="center"
                style="
                  background: linear-gradient(135deg, #008080, #20c997);
                  padding: 28px 20px;
                "
              >
                <h1
                  style="
                    margin: 0;
                    font-size: 24px;
                    color: #ffffff;
                    font-weight: 600;
                    letter-spacing: 0.5px;
                  "
                >
                  ${subject}
                </h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding: 30px; color: #333333; line-height: 1.7">
                <h2
                  style="
                    margin-top: 0;
                    color: #008080;
                    font-size: 20px;
                    font-weight: 600;
                  "
                >
                  Hi ${name},
                </h2>
                <p style="margin: 0 0 18px; font-size: 15px; color: #555555">
                  ${message}
                </p>

                <!-- Code Box -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 28px auto">
                  <tr>
                    <td
                      style="
                        background: #008080;
                        color: #ffffff;
                        padding: 16px 50px;
                        border-radius: 10px;
                        font-size: 24px;
                        font-weight: bold;
                        text-align: center;
                        letter-spacing: 4px;
                        box-shadow: 0 3px 8px rgba(0, 128, 128, 0.25);
                      "
                    >
                      ${code}
                    </td>
                  </tr>
                </table>

                <p style="margin: 18px 0 0; font-size: 14px; color: #666666">
                  This code is valid for the next <strong>${expiryMinutes} minutes</strong>.
                  Please do not share it with anyone.
                </p>

                <p style="margin: 25px 0 0; font-size: 14px; color: #555555">
                  If you didn’t request this, you can safely ignore this email.
                </p>

                <p
                  style="
                    margin: 28px 0 0;
                    font-size: 14px;
                    color: #555555;
                    font-weight: 500;
                  "
                >
                  Best regards, <br />
                  <span>Developer, Mohamed Hassan</span>
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td
                align="center"
                style="
                  background: #f9fafc;
                  padding: 22px;
                  font-size: 13px;
                  color: #888888;
                  border-top: 1px solid #e4eaf0;
                "
              >
                <p style="margin: 0">
                  &copy; 2025 <strong>Social App</strong>. All rights reserved.
                </p>
                <p style="margin: 6px 0 0">
                  <a href="#" style="color: #008080; text-decoration: none"
                    >Privacy Policy</a
                  >
                  ·
                  <a href="#" style="color: #008080; text-decoration: none"
                    >Help Center</a
                  >
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
