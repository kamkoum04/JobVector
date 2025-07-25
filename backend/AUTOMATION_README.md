# JobVector Test Automation

This directory contains automation scripts to simplify testing the JobVector application.

## Scripts Available

### 1. `automation_test.py` - Python Automation Script
A comprehensive Python script that automates the entire testing workflow.

**Features:**
- User registration (candidates, employer, admin)
- Job offer creation
- CV upload for candidates
- Automatic job applications

**Usage:**
```bash
python3 automation_test.py
```

**Requirements:**
- Python 3.6+
- `requests` library: `pip install requests`

### 2. `automation_test.sh` - Bash Automation Script
A bash script version that does the same automation using curl commands.

**Features:**
- No Python dependencies
- Colorized output
- Same functionality as Python script
- Uses `jq` for JSON processing

**Usage:**
```bash
./automation_test.sh
```

**Requirements:**
- `curl`
- `jq`: `sudo apt-get install jq`

### 3. `reset_database.sh` - Database Reset Script
A helper script to reset the database by changing hibernate.ddl-auto properties.

**Usage:**
```bash
./reset_database.sh
```

## Complete Testing Workflow

### Option 1: Full Reset + Automation
1. Run the database reset script:
   ```bash
   ./reset_database.sh
   ```
   - Choose option 1 (Reset database)
   - Restart your Spring Boot application when prompted
   - Restart again when prompted

2. Run the automation script:
   ```bash
   ./automation_test.sh
   ```

### Option 2: Quick Automation (without DB reset)
If you just want to populate data without resetting:
```bash
./automation_test.sh
```

## What the Automation Does

### ⚠️ IMPORTANT: Correct Workflow Order

The automation follows the **CORRECT** workflow:

1. **Registers Users:**
   - 6 candidates: ahmed, jihed, baha, hamza, sami, rayen
   - 1 employer: employeur@test.com
   - 1 admin: admin@test.com

2. **Creates Job Offers ONE BY ONE:**
   - Reads from `examples/job_offers_examples.json`
   - Creates all 8 job offers **sequentially** with 1-second delays
   - **NOT all at once** - creates them one by one to avoid server overload

3. **Processes Each Candidate (CORRECT ORDER WITH PROPER WAITING):**
   - Logs in the candidate
   - **FIRST**: Uploads their CV (if file exists) 
   - **WAITS**: For CV upload to complete fully (with timeout protection)
   - **THEN**: Applies to ALL job offers (only after CV upload is 100% done)
   - Adds 1-second delays between applications (increased for stability)

### 🔄 The Complete Process Per Candidate:
```
1. Login candidate → Get token
2. Upload CV → Wait for HTTP response → Wait for server processing (3s) → Verify completion
3. ✅ CV FULLY UPLOADED AND PROCESSED
4. Apply to Job 1 → Wait 1s
5. Apply to Job 2 → Wait 1s
6. Apply to Job 3 → Wait 1s
... (continues for all jobs)
```

### ⏳ **CV Upload Process Details:**
- Shows file size before upload
- Monitors upload progress
- Waits for server HTTP response (200 OK)
- Additional 2-3 second wait for server processing
- Timeout protection (60 seconds max)
- Option to skip applications if CV upload fails

## CV File Paths
The scripts expect **PDF files** at these locations:
- Ahmed: `/home/asus/Téléchargements/CV/ahmed.pdf`
- Baha: `/home/asus/Téléchargements/CV/CV_baha_eddine_Fatnassi.pdf`
- Jihed: `/home/asus/Téléchargements/CV/Jihed_Kedidi_Resume.pdf`
- Rayen: `/home/asus/Téléchargements/CV/rayen.pdf`
- Sami: `/home/asus/Téléchargements/CV/sami.pdf`

⚠️ **IMPORTANT**: 
- **Only PDF files are accepted** by the CV upload endpoint
- Files must be **valid PDF format** (not just renamed text files)
- Maximum file size: 10MB
- If CV files don't exist, the script will skip upload but continue with applications

## Customization

### Change CV Paths
Edit the `cv_paths` array in `automation_test.sh`:
```bash
declare -A cv_paths=(
    ["ahmed@test.com"]="/path/to/your/cvs/ahmed.pdf"
    ["baha@test.com"]="/path/to/your/cvs/baha.pdf"
    # ... etc
)
```

### Change Base URL
If your application runs on a different port:
```bash
BASE_URL="http://localhost:9090"  # Change port
```

### Add More Users
Edit the candidates array and registration calls in either script.

## Troubleshooting

1. **Server not running:**
   ```
   ❌ Spring Boot application is not running at http://localhost:8080
   ```
   - Make sure your Spring Boot application is running
   - Check if it's on port 8080

2. **CV files not found:**
   ```
   ⚠️ CV file not found: /path/to/cv.pdf
   ```
   - Check if the CV files exist at the specified paths
   - Update the paths in the script

3. **CV upload failed - Invalid file type:**
   ```
   ❌ Failed to upload CV for candidate@test.com (HTTP 400)
   {"message":"Seuls les fichiers PDF sont acceptés"}
   ```
   - Make sure all CV files are in **PDF format**
   - Don't use text files renamed as .pdf - they must be real PDFs

4. **CV upload failed - Invalid PDF:**
   ```
   ❌ Failed to upload CV for candidate@test.com (HTTP 400)
   {"message":"Le fichier PDF est invalide ou corrompu"}
   ```
   - The PDF file is corrupted or not a valid PDF
   - Try opening the file in a PDF viewer to verify it works

3. **Registration failures:**
   - Check if users already exist in database
   - Reset database if needed

4. **Token issues:**
   - Make sure JWT configuration is correct
   - Check application logs for authentication errors

5. **CV upload taking too long:**
   ```
   ❌ CV upload timed out for candidate@test.com
   ```
   - Check your internet connection
   - Verify CV file isn't corrupted or too large (>10MB)
   - The script has 60-second timeout protection

6. **Applications failing after CV upload:**
   - Make sure CV upload completed successfully first
   - Check server logs for any processing errors
   - Verify the candidate token is still valid

## Example Output

```
[10:30:15] 🚀 Starting JobVector Test Automation
✅ Server is running
[10:30:16] 👥 Registering users...
✅ Registered user: ahmed@test.com
✅ Registered user: jihed@test.com
...
[10:30:20] 💼 Creating job offers ONE BY ONE...
✅ Logged in: employeur@test.com
[10:30:21] 📋 Creating 8 job offers one by one...
[10:30:21]    Creating job 1/8: Développeur Full Stack Java/React - Senior
✅ Created job offer (ID: 1)
[10:30:22]    Creating job 2/8: Data Scientist - Machine Learning & IA
✅ Created job offer (ID: 2)
...
```
[10:30:30] 📄 Processing candidates - Upload CV first, then apply to jobs...
[10:30:30] 👤 Processing candidate 1/6: ahmed@test.com
✅ Logged in: ahmed@test.com
[10:30:31]    📄 Starting CV upload for ahmed@test.com...
[10:30:31] 📄 Starting CV upload: ahmed.pdf (245 KB)
✅ CV upload completed: ahmed.pdf
[10:30:33] ⏳ Waiting for server to process CV...
✅ CV upload and processing completed for ahmed@test.com
[10:30:33]    ✅ CV upload completed successfully for ahmed@test.com
[10:30:33]    📝 Starting job applications for ahmed@test.com...
[10:30:33]    🎯 Applying to 8 jobs one by one...
[10:30:33]       Applying to job 1/8 (ID: 1)
✅ ahmed@test.com applied to job 1
[10:30:34]       Applying to job 2/8 (ID: 2)
✅ ahmed@test.com applied to job 2
...
[10:30:42]    ✅ ahmed@test.com applied to 8/8 jobs successfully
[10:30:42] 👤 Processing candidate 2/6: jihed@test.com
...
[10:32:30] 🎉 Automation completed successfully!
```
```

## Tips

- Run automation after each database reset
- Use the Python version if you're more comfortable with Python
- Use the bash version for faster execution
- Check application logs if something fails
- The scripts include delays to avoid overwhelming the server
