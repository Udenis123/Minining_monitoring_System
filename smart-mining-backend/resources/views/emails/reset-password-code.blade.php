<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Password Reset Verification Code</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
        .header {
            background-color: #f5f5f5;
            padding: 15px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }
        .content {
            padding: 20px;
        }
        .code {
            font-size: 24px;
            font-weight: bold;
            text-align: center;
            padding: 15px;
            margin: 15px 0;
            background-color: #f9f9f9;
            border: 1px solid #eee;
            border-radius: 5px;
            letter-spacing: 5px;
        }
        .footer {
            margin-top: 30px;
            font-size: 12px;
            color: #777;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Password Reset Verification</h2>
        </div>
        <div class="content">
            <p>Hello {{ $name }},</p>

            <p>We received a request to reset your password. Please use the following verification code to complete the password reset process:</p>

            <div class="code">{{ $code }}</div>

            <p>This code will expire in 30 minutes.</p>

            <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>

            <p>Thanks,<br>
            Smart Mining System Team</p>
        </div>
        <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
        </div>
    </div>
</body>
</html>
