---
Author:
  - Kumail Rizvi
Author Profile:
  - https://linkedin.com/in/kumail-rizvi
tags:
  - aws
Creation Date: 2025-09-27T16:03:04
Last Date: 2025-09-27T16:03:04
DocID: UN-25
drafts:
References: https://aws.amazon.com/jp/blogs/storage/protecting-encrypted-amazon-rds-instances-with-cross-account-and-cross-region-backups/
description:
Github Link:
---
## Cross-Account Regional Snapshot and Restore of RDS DB in AWS
---
## Architecture Diagram

Before diving into the detailed steps, let’s outline the architecture of the process. This guide demonstrates how to migrate an Amazon RDS database snapshot from Account B in the Singapore region to Account A in the Singapore Region a different AWS region, and then how to restore it within Account B's London region.


![[rds_migrations.png]]

---

## Scenario

In this scenario, you have an encrypted RDS SQL database running in Account B (Singapore region). You want to migrate the snapshot of this RDS database to Account A's  Singapore region and then restore the DB  in Account B's London region. The database snapshot is encrypted using a Customer Managed Key (CMS), which is created in AWS Key Management Service (KMS).

---

## Workflow Overview

### 1. **Sharing the RDS Snapshot with Account A**

- **Ensure Encryption**: The RDS snapshot in Account B is encrypted using a Customer Managed Key (CMS) from AWS KMS.
    
- **Creating the CMS Key**: If you are migrating between accounts, make sure the encryption is based on a Customer Managed Key (CMS). If not already present, you’ll need to create the CMS key in **Account A** via the KMS console.
    
- **Sharing the Snapshot**:
    - Go to Account B (Singapore region) and find the RDS snapshot.
    - Use the “Share Snapshot” feature to share the snapshot with Account A.
    - Make sure the snapshot is encrypted using a CMS Key, and share it via KMS key.

### 2. **Migrating the Snapshot Between Regions**

- **Copy Snapshot in Account A**: After sharing the snapshot, you need to copy the snapshot from Account As Singapore region to Account A’s  London region.
    
- **CLI Command**: Use AWS CLI to copy the snapshot from the  region (Singapore) to Account A’s region ( London) (US-East), while ensuring the encryption key (CMS key) is attached to the copied snapshot , make sure that you have CMS key in Account A as well.

- **AWS CLI & AWS Configure:** Make sure you have AWS CLI installed on your system and aws configured as well properly before doing this process
    
    - CLI Example:
        
        `aws rds copy-db-snapshot \   --source-db-snapshot-identifier arn:aws:rds:ap-southeast-1:123456789012:snapshot:rds-snapshot \   --target-db-snapshot-identifier rds-snapshot-copy \   --kms-key-id arn:aws:kms:us-east-1:123456789012:key/your-kms-key-id \   --source-region ap-southeast-1 \   --region us-east-1`
        

### 3. **Creating CMS Key in Destination Region (Account B)**

- If migrating to another destination region within the same account (Account A in this case, say London), you'll need to create a new CMS key in **Account A** (London region).
- Once this new CMS key is created, you can proceed with the migration process within the same account.
- 
### 4. **Snapshot Visibility in Destination Region**

- After the migration is successful, the snapshot should be visible in **Account A’s Singapore region**.
### 5. **Restoring the Snapshot in the Destination Region**

- **Restoring Snapshot in Account A**:
    
    - Use the **RDS console** or AWS CLI to restore the snapshot in the **London region**.
    - Make sure you select the option "Restore DB from Snapshot" during the restoration process.
    - Ensure that the configuration (instance class, parameter group, username, password, etc.) matches the original RDS database in Singapore.
    - If not configured correctly, the restore process will show the error **"incompatible-restore"**.

- **Configuring the Restore**:
    - Instance Class: Ensure the instance class matches the original database.
    - Parameter Groups: Select the correct parameter group if the default settings do not apply.
    - Username and Password: While these can be adjusted, it’s advisable to set them according to your security policies. These can be stored securely in **AWS Secrets Manager** for better management.

---

## Process in Detail

##### NOTE :- This process is from Account B to Account A , you can perform this process vice versa.

### Step 1: Create CMS Key in Account B (if needed)

1. Open the **KMS Console** in Account B.
2. Create a **new customer-managed key** (CMS) if not already present. This key will be used for encrypting the snapshot and will be used to migrated snapshot to cross region
### Step 2: Share Snapshot from Account B

1. In **Account B**, find the **RDS Snapshot** and select the “Share Snapshot” option.
2. Share it with **Account A** and ensure it’s encrypted with the **CMS Key** created in **Account A**.
3. Sharing of Snapshot would be only under same region but different account through KMS only
### Step 3: Copy the Snapshot to Account A’s Region

1. Use **AWS CLI** to copy the snapshot to the region of your choice.
    - The key takeaway here is using the correct **KMS key** for encryption.
2. Once the copy is done, the snapshot should be available in Account A’s region.
### Step 4: Create CMS Key in Account B (Destination Region)

1. If migrating to another destination region within **Account B**, you must create a new CMS key in the **destination region (e.g., London)**.
### Step 5: Restore Snapshot in Account B (Destination Region)

1. Once the snapshot is copied successfully, initiate the restore process in the **destination region (London)** using the **RDS Console** or **AWS CLI**.
2. During the restore, make sure to match the **instance class, parameter groups**, and other configurations with the original RDS instance in Singapore.    

---

## Key Points to Remember

- **CMS Key Sharing**: Always ensure that the snapshot is encrypted using a **Customer Managed Key** (CMS) in **Account B** and shared properly with **Account A**. For region migration, the KMS key must be available in both accounts.
- **Restoration Configuration**: If the RDS instance configuration (such as instance class, parameters, and DB engine) does not match, the restore process will fail with an **“incompatible-restore”** error.
- **Snapshot Cleanup**: After the successful restoration, delete the snapshot from the interim Singapore region in **Account B** to reduce storage costs and maintain a clean setup.

---

## Takeaways

- **Automation**: You can automate the entire migration process using **GitHub Actions**, **AWS Lambda**, or an **Automation Workflow Runbook**. This will make it easier to run regular migrations or backups with minimal manual intervention.
- **Cost-Efficiency**: While this process might take time, it is a cost-effective alternative to using AWS **Database Migration Service (DMS)**, especially for cross-account regional migrations.
- **Snapshot Frequency**: Enable regular snapshots in **Account B** to minimize **data loss** and achieve a **faster RTO** (Recovery Time Objective).

This guide provides a structured approach for migrating RDS snapshots across accounts and regions in AWS. By following these steps, you can ensure a smooth and secure migration process while maintaining encryption and compliance throughout the procedure.