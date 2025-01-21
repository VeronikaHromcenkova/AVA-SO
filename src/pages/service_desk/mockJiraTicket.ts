export const mockJiraTicket = {
  id: "JIRA-1234",
  key: "JIRA-1234",
  title: "Fix login button not responding",
  description:
    "Users report that the login button on the homepage is unresponsive. \n\n#### Steps to Reproduce:\n1. Open the homepage.\n2. Enter valid credentials.\n3. Click the login button.\n\n**Expected Result:** User is logged in.\n\n**Actual Result:** Nothing happens.",
  status: "In Progress",
  priority: "High",
  assignee: {
    id: "user_001",
    name: "John Doe",
    avatarUrl: "https://example.com/avatar/john_doe.jpg"
  },
  reporter: {
    id: "user_002",
    name: "Jane Smith",
    avatarUrl: "https://example.com/avatar/jane_smith.jpg"
  },
  created_at: "2023-12-20T14:35:00Z",
  updated_at: "2023-12-21T09:45:00Z",
  attachments: [
    {
      id: "att_001",
      filename: "error_log.txt",
      url: "https://example.com/attachments/error_log.txt",
      size: "14 KB",
      uploaded_by: "John Doe",
      uploaded_at: "2023-12-20T15:00:00Z"
    },
    {
      id: "att_002",
      filename: "screenshot.png",
      url: "https://example.com/attachments/screenshot.png",
      size: "245 KB",
      uploaded_by: "Jane Smith",
      uploaded_at: "2023-12-20T15:10:00Z"
    }
  ],
  comments: [
    {
      id: "comment_001",
      author: {
        id: "user_002",
        name: "AVA",
        avatarUrl: "https://example.com/avatar/jane_smith.jpg",
        avatarColor: "#42bbd9"
      },
      content:
        "## Request for Setting Permissions for Thomas Riethmann in IRS System\n\n### Step 1: Connect to the IRS Database\nLog in to the IRS database using SQL Developer on a current PC. Ensure you have the necessary DBA permissions to make changes to the IRS schema.\n\n**Sources:**\n[Connecting to IRS Database](#)\n\n---\n\n### Step 2: Verify Existing User\nCheck if the user Thomas Riethmann already exists in the IRS_USER table. Use the following SQL query to verify:\n\n```sql\nSELECT * FROM IRS.IRS_USER \nWHERE TXT_NAME = 'Riethmann' \n  AND TXT_VORNAME = 'Thomas';\n```\n\n**Sources:**\n[User Verification](#)\n\n---\n\n### Step 3: Insert User Roles\nInsert the required roles for Thomas Riethmann into the IRS.ROLE_TO_USER table. Use the following SQL statements for each role and organizational unit combination provided in the Jira ticket:\n\n```sql\nINSERT INTO IRS.ROLE_TO_USER \n(TXT_IDENT, KEY_GESELLSCHAFT, KEY_PERSBEREICH, KEY_MANDANT, KEY_ROLE, TXT_EMAIL, TXT_SMS, KEY_ORGEINHEIT, TXT_UPD_USER, DAT_UPD_DATE)\nVALUES ('UPQW00', '80000163', '9999', 'HSEQ', 'Thomas.Riethmann@currenta.biz', NULL, 'LEV', 'EUZS', SYSDATE);\n\nINSERT INTO IRS.ROLE_TO_USER \n(TXT_IDENT, KEY_GESELLSCHAFT, KEY_PERSBEREICH, KEY_MANDANT, KEY_ROLE, TXT_EMAIL, TXT_SMS, KEY_ORGEINHEIT, TXT_UPD_USER, DAT_UPD_DATE)\nVALUES ('UPQW00', '80000163', '9999', 'HSEQ', 'Thomas.Riethmann@currenta.biz', NULL, 'DOR', 'EUZS', SYSDATE);\n\n-- Repeat for all other roles and organizational units.\n```\n\n**Sources:**\n[Assigning User Roles](#)\n\n---\n\n### Step 4: Commit Changes\nAfter inserting all the required roles, commit the changes to the database to ensure they are saved:\n\n```sql\nCOMMIT;\n```\n\n**Sources:**\n[Committing Changes](#)\n\n---\n\n### Step 5: Verify Permissions\nVerify that the permissions have been correctly assigned by querying the IRS.ROLE_TO_USER table:\n\n```sql\nSELECT * FROM IRS.ROLE_TO_USER \nWHERE TXT_IDENT = 'UPQW00';\n```\n\n**Sources:**\n[Verifying Permissions](#)",
      created_at: "2024-12-02T16:00:00Z"
    },
    {
      id: "comment_002",
      author: {
        id: "user_003",
        name: "System",
        avatarUrl: "https://example.com/avatar/alice_johnson.jpg",
        avatarColor: "#e90f40"
      },
      content: "This might be caused by the recent update to the authentication service. ",
      created_at: "2024-12-20T16:30:00Z"
    }
  ],
  labels: ["bug", "frontend", "high-priority"]
};
