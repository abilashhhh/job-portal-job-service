export const applicationStatusUpdateTemplate = (jobTitle: string) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>Application Status Update</title>

<style>
@media only screen and (max-width: 640px) {
.responsive-table {
width: 100% !important;
max-width: 100% !important;
}
.mobile-padding {
padding: 24px 16px !important;
}
.mobile-header-padding {
padding: 24px 16px !important;
}
.mobile-text {
font-size: 14px !important;
}
}

@media only screen and (max-width: 480px) {
.mobile-padding {
padding: 20px 12px !important;
}
}
</style>

</head>

<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">

<!-- Preview -->
<div style="display:none;max-height:0;overflow:hidden;">
Your job application status has been updated.
</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;">
<tr>
<td>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="responsive-table" style="background:#ffffff;overflow:hidden;">

<!-- Header -->
<tr>
<td style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:45px 20px;text-align:center;" class="mobile-header-padding">

<div style="margin-bottom:16px;">
<div style="display:inline-block;width:60px;height:60px;background:rgba(255,255,255,0.2);border-radius:50%;line-height:60px;">
<span style="font-size:28px;color:#ffffff;">📄</span>
</div>
</div>

<h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:600;">
Application Status Update
</h1>

<p style="margin:12px 0 0;color:#e0d7ff;font-size:15px;">
Your job application has a new update
</p>

</td>
</tr>

<!-- Body -->
<tr>
<td style="padding:48px 40px;" class="mobile-padding">

<p style="margin:0 0 18px;font-size:16px;color:#111827;">
Hi there,
</p>

<p style="margin:0 0 26px;font-size:16px;line-height:1.7;color:#374151;">
Your application for the position of 
<strong style="color:#111827;">${jobTitle}</strong> 
has been updated.
</p>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ede9fe;border-left:4px solid #667eea;margin-bottom:28px;">
<tr>
<td style="padding:20px;">
<p style="margin:0 0 8px;font-size:15px;font-weight:600;color:#3730a3;">
📢 Application Update
</p>
<p style="margin:0;font-size:14px;color:#4338ca;line-height:1.6;">
Please log in to your JobSeeker account to view the latest status of your job application.
</p>
</td>
</tr>
</table>

<!-- CTA -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:30px;">
<tr>
<td align="center">

<table role="presentation" cellpadding="0" cellspacing="0">
<tr>
<td style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:4px;">
<a href="#" target="_blank" style="display:inline-block;padding:14px 40px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">
View Application
</a>
</td>
</tr>
</table>

</td>
</tr>
</table>

<p style="margin:0;font-size:14px;color:#4b5563;line-height:1.6;">
Thank you for applying and being part of our hiring process.
</p>

<p style="margin:18px 0 0;font-size:14px;color:#4b5563;">
<strong style="color:#1f2937;">JobSeeker Team</strong>
</p>

</td>
</tr>

<!-- Footer -->
<tr>
<td style="background:#fafafa;padding:28px 40px;border-top:1px solid #e5e7eb;" class="mobile-padding">

<p style="margin:0 0 10px;font-size:12px;color:#6b7280;text-align:center;">
This is an automated message. Please do not reply.
</p>

<p style="margin:0;font-size:11px;color:#9ca3af;text-align:center;">
© ${new Date().getFullYear()} JobSeeker. All rights reserved.
</p>

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;
};
