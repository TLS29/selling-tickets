API Gateway + Lambda → your backend (replaces the always-on Express server). Pay per request, idle = $0.

- DynamoDB → your database. Pay per read/write, idle = $0. Perfect for now like you said.
- S3 → ticket files (PDF/QR) + event images. You already know it. ✅
- Cognito → user login/signup. Free tier is generous (50k monthly users free).
- SQS → queue for the "buy ticket" flow so you don't oversell. Practically free at your volume.
- SES → email the tickets/receipts. Pennies.
- CloudWatch → logs/debugging. Cheap.
- IAM → glue/permissions. Free.

REDIS
TERRAFORM
DATADOG
grafna
