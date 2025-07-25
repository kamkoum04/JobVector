#!/usr/bin/env python3
"""
JobVector Test Automation Script
This script automates the complete testing process:
1. Drop and recreate database
2. Register users (candidates, employer, admin)
3. Create job offers
4. Upload CVs for candidates
5. Apply candidates to all jobs
"""

import requests
import json
import os
import time
from pathlib import Path

class JobVectorTestAutomation:
    def __init__(self, base_url="http://localhost:8080"):
        self.base_url = base_url
        self.tokens = {}
        self.job_offers = []
        
    def log(self, message):
        """Print timestamped log message"""
        print(f"[{time.strftime('%H:%M:%S')}] {message}")
        
    def reset_database(self):
        """Reset the database by changing ddl-auto to create-drop and back to update"""
        self.log("🔄 Resetting database...")
        
        # Read current application.properties
        props_file = "src/main/resources/application.properties"
        with open(props_file, 'r') as f:
            content = f.read()
        
        # Change to create-drop
        content = content.replace(
            "spring.jpa.hibernate.ddl-auto=update",
            "spring.jpa.hibernate.ddl-auto=create-drop"
        )
        
        with open(props_file, 'w') as f:
            f.write(content)
        
        self.log("📝 Changed ddl-auto to create-drop")
        
        # Restart application (you'll need to do this manually or via your IDE)
        input("⚠️  Please restart your Spring Boot application and press Enter when ready...")
        
        # Change back to update
        content = content.replace(
            "spring.jpa.hibernate.ddl-auto=create-drop",
            "spring.jpa.hibernate.ddl-auto=update"
        )
        
        with open(props_file, 'w') as f:
            f.write(content)
        
        self.log("📝 Changed ddl-auto back to update")
        input("⚠️  Please restart your Spring Boot application again and press Enter when ready...")
        
    def register_user(self, user_data):
        """Register a single user"""
        try:
            response = requests.post(f"{self.base_url}/auth/register", json=user_data)
            if response.status_code == 200 or response.status_code == 201:
                self.log(f"✅ Registered user: {user_data['email']}")
                return True
            else:
                self.log(f"❌ Failed to register {user_data['email']}: {response.text}")
                return False
        except Exception as e:
            self.log(f"❌ Error registering {user_data['email']}: {e}")
            return False
    
    def login_user(self, email, password):
        """Login user and return token"""
        try:
            login_data = {"email": email, "password": password}
            response = requests.post(f"{self.base_url}/auth/login", json=login_data)
            if response.status_code == 200:
                response_json = response.json()
                token = response_json.get('token')
                if token:
                    self.tokens[email] = token
                    self.log(f"✅ Logged in: {email}")
                    self.log(f"🔑 Token received (length: {len(token)})")
                    return token
                else:
                    self.log(f"❌ Login successful but no token found for {email}")
                    self.log(f"Response: {response_json}")
                    return None
            else:
                self.log(f"❌ Failed to login {email} (HTTP {response.status_code}): {response.text}")
                return None
        except Exception as e:
            self.log(f"❌ Error logging in {email}: {e}")
            return None
    
    def create_job_offer(self, job_data, employer_token):
        """Create a job offer"""
        try:
            headers = {"Authorization": f"Bearer {employer_token}"}
            response = requests.post(f"{self.base_url}/api/employer/job-offers", 
                                   json=job_data, headers=headers)
            if response.status_code == 200 or response.status_code == 201:
                job_id = response.json().get('id')
                self.job_offers.append(job_id)
                self.log(f"✅ Created job offer: {job_data['titre']} (ID: {job_id})")
                return job_id
            else:
                self.log(f"❌ Failed to create job offer: {response.text}")
                return None
        except Exception as e:
            self.log(f"❌ Error creating job offer: {e}")
            return None
    
    def upload_cv(self, cv_path, candidate_token):
        """Upload CV for a candidate and wait for completion"""
        try:
            if not candidate_token:
                self.log(f"❌ No token provided for CV upload")
                return False
                
            headers = {"Authorization": f"Bearer {candidate_token}"}
            
            if not os.path.exists(cv_path):
                self.log(f"❌ CV file not found: {cv_path}")
                return False
            
            # Step 1: Check if CV already exists and delete it
            self.log("🔍 Checking for existing CV...")
            try:
                check_response = requests.get(f"{self.base_url}/api/candidate/cv/my-cv", 
                                            headers=headers, timeout=10)
                if check_response.status_code == 200:
                    self.log("📄 Existing CV found, deleting it first...")
                    delete_response = requests.delete(f"{self.base_url}/api/candidate/cv/delete", 
                                                    headers=headers, timeout=10)
                    if delete_response.status_code == 200:
                        self.log("✅ Existing CV deleted successfully")
                    else:
                        self.log("⚠️ Failed to delete existing CV, continuing anyway...")
                else:
                    self.log("✅ No existing CV found")
            except Exception as e:
                self.log(f"⚠️ Error checking existing CV: {e}, continuing with upload...")
            
            # Get file size for progress indication
            file_size = os.path.getsize(cv_path)
            self.log(f"📄 Starting CV upload: {os.path.basename(cv_path)} ({file_size/1024:.1f} KB)")
            self.log(f"🔑 Using token: {candidate_token[:10]}...")
            
            # Upload with timeout to handle large files
            with open(cv_path, 'rb') as cv_file:
                files = {'file': cv_file}  # Parameter name should be 'file', not 'cv'
                response = requests.post(f"{self.base_url}/api/candidate/cv/upload", 
                                       files=files, headers=headers, timeout=240)
                
            if response.status_code == 200:
                self.log(f"✅ CV upload completed: {os.path.basename(cv_path)}")
                
                # Additional wait to ensure server processing is complete
                self.log("⏳ Waiting for server to process CV...")
                time.sleep(2)  # Give server time to process and save CV
                
                # Verify upload by checking if CV exists (optional verification)
                self.log("✅ CV upload and processing completed")
                return True
            else:
                self.log(f"❌ Failed to upload CV (HTTP {response.status_code})")
                # Show limited error details (first 200 chars)
                error_text = response.text[:200] + "..." if len(response.text) > 200 else response.text
                self.log(f"Error details: {error_text}")
                return False
        except requests.exceptions.Timeout:
            self.log(f"❌ CV upload timed out for {cv_path}")
            return False
        except Exception as e:
            self.log(f"❌ Error uploading CV: {e}")
            return False
    
    def apply_to_job(self, job_id, candidate_token):
        """Apply candidate to a specific job"""
        try:
            headers = {"Authorization": f"Bearer {candidate_token}"}
            response = requests.post(f"{self.base_url}/api/candidate/job-offers/{job_id}/apply", 
                                   headers=headers)
            if response.status_code == 200:
                self.log(f"✅ Applied to job ID: {job_id}")
                return True
            else:
                self.log(f"❌ Failed to apply to job {job_id}: {response.text}")
                return False
        except Exception as e:
            self.log(f"❌ Error applying to job {job_id}: {e}")
            return False
    
    def run_full_automation(self, skip_db_reset=False):
        """Run the complete automation process"""
        self.log("🚀 Starting JobVector Test Automation")
        
        # Step 1: Reset database (optional)
        if not skip_db_reset:
            self.reset_database()
        
        # Step 2: Register users
        self.log("👥 Registering users...")
        
        # Candidates
        candidates = [
            {
                "email": "ahmed@test.com",
                "password": "123456",
                "nom": "ahmed",
                "prenom": "fridhi",
                "cin": "12315325",
                "role": "CANDIDATE"
            },
            {
                "email": "jihed@test.com",
                "password": "123456",
                "nom": "jihed",
                "prenom": "kedidi",
                "cin": "12315326",
                "role": "CANDIDATE"
            },
            {
                "email": "baha@test.com",
                "password": "123456",
                "nom": "baha",
                "prenom": "fatnassi",
                "cin": "12315327",
                "role": "CANDIDATE"
            },
            {
                "email": "hamza@test.com",
                "password": "123456",
                "nom": "Hamza",
                "prenom": "Kamkoum",
                "cin": "12315328",
                "role": "CANDIDATE"
            },
            {
                "email": "sami@test.com",
                "password": "123456",
                "nom": "sami",
                "prenom": "amara",
                "cin": "12315329",
                "role": "CANDIDATE"
            },
            {
                "email": "rayen@test.com",
                "password": "123456",
                "nom": "rayen",
                "prenom": "melki",
                "cin": "12315330",
                "role": "CANDIDATE"
            }
        ]
        
        # Employer and Admin
        other_users = [
            {
                "email": "employeur@test.com",
                "password": "123456",
                "nom": "TechCorp",
                "cin": "87654321",
                "role": "EMPLOYER"
            },
            {
                "email": "admin@test.com",
                "password": "123456",
                "nom": "Admin",
                "prenom": "Système",
                "cin": "00000000",
                "role": "ADMIN"
            }
        ]
        
        # Register all users
        for user in candidates + other_users:
            self.register_user(user)
        
        time.sleep(2)  # Wait a bit between operations
        
        # Step 3: Login employer and create job offers ONE BY ONE
        self.log("💼 Creating job offers ONE BY ONE...")
        employer_token = self.login_user("employeur@test.com", "123456")
        
        if employer_token:
            # Load job offers from JSON file
            with open("examples/job_offers_examples.json", 'r', encoding='utf-8') as f:
                job_offers_data = json.load(f)
            
            self.log(f"📋 Creating {len(job_offers_data)} job offers one by one...")
            for i, job_data in enumerate(job_offers_data, 1):
                self.log(f"   Creating job {i}/{len(job_offers_data)}: {job_data['titre']}")
                self.create_job_offer(job_data, employer_token)
                time.sleep(1)  # Delay between job creations to avoid overwhelming server
        
        # Step 4: Process each candidate - Upload CV FIRST, then apply to jobs
        self.log("📄 Processing candidates - Upload CV first, then apply to jobs...")
        
        # CV file mappings (you'll need to adjust paths)
        cv_mappings = {
            "ahmed@test.com": "/home/asus/Téléchargements/CV/ahmed.pdf",
            "baha@test.com": "/home/asus/Téléchargements/CV/CV_baha_eddine_Fatnassi.pdf",
            "jihed@test.com": "/home/asus/Téléchargements/CV/Jihed_Kedidi_Resume.pdf",
            "rayen@test.com": "/home/asus/Téléchargements/CV/rayen.pdf",
            "sami@test.com": "/home/asus/Téléchargements/CV/sami.pdf",
            "hamza@test.com": "/home/asus/Téléchargements/CV/hamza.pdf"  # You might need to add this
        }
        
        for i, candidate in enumerate(candidates, 1):
            email = candidate["email"]
            self.log(f"👤 Processing candidate {i}/{len(candidates)}: {email}")
            
            # Login candidate
            candidate_token = self.login_user(email, "123456")
            
            if candidate_token:
                cv_upload_success = False
                
                # STEP 1: Upload CV FIRST (if path exists) and WAIT for completion
                if email in cv_mappings:
                    cv_path = cv_mappings[email]
                    self.log(f"   📄 Uploading CV for {email}...")
                    cv_upload_success = self.upload_cv(cv_path, candidate_token)
                    
                    if cv_upload_success:
                        self.log(f"   ✅ CV upload completed successfully for {email}")
                    else:
                        self.log(f"   ❌ CV upload failed for {email}")
                        # Ask user if they want to continue with applications despite CV upload failure
                        continue_anyway = input(f"   ⚠️  CV upload failed for {email}. Continue with job applications anyway? (y/n): ").lower().strip()
                        if continue_anyway != 'y':
                            self.log(f"   ⏭️  Skipping job applications for {email}")
                            continue
                else:
                    self.log(f"   ⚠️  No CV path configured for {email}")
                
                # STEP 2: Apply to jobs ONLY AFTER CV upload is COMPLETELY done
                if cv_upload_success or email not in cv_mappings:
                    self.log(f"   📝 Starting job applications for {email}...")
                    self.log(f"   🎯 Applying to {len(self.job_offers)} jobs one by one...")
                    
                    applications_count = 0
                    for i, job_id in enumerate(self.job_offers, 1):
                        self.log(f"      Applying to job {i}/{len(self.job_offers)} (ID: {job_id})")
                        if self.apply_to_job(job_id, candidate_token):
                            applications_count += 1
                        time.sleep(1)  # Increased delay between applications
                    
                    self.log(f"   ✅ {email} applied to {applications_count}/{len(self.job_offers)} jobs successfully")
                else:
                    self.log(f"   ⏭️  Skipping job applications for {email} due to CV upload failure")
            else:
                self.log(f"   ❌ Could not login {email}, skipping...")
        
        self.log("🎉 Automation completed successfully!")
        
        # Summary
        self.log(f"📊 Summary:")
        self.log(f"   - Registered {len(candidates)} candidates + 2 other users")
        self.log(f"   - Created {len(self.job_offers)} job offers")
        self.log(f"   - Processed applications for all candidates")

def main():
    automation = JobVectorTestAutomation()
    
    print("JobVector Test Automation")
    print("========================")
    print("1. Full automation (with database reset)")
    print("2. Quick automation (skip database reset)")
    print("3. Exit")
    
    choice = input("Choose an option (1-3): ").strip()
    
    if choice == "1":
        automation.run_full_automation(skip_db_reset=False)
    elif choice == "2":
        automation.run_full_automation(skip_db_reset=True)
    elif choice == "3":
        print("Goodbye!")
    else:
        print("Invalid choice!")

if __name__ == "__main__":
    main()
