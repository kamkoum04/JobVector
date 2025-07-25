#!/bin/bash

# JobVector API Test Automation Script
# This script automates the complete testing workflow

BASE_URL="http://localhost:8080"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Function to register a user
register_user() {
    local email=$1
    local password=$2
    local nom=$3
    local prenom=$4
    local cin=$5
    local role=$6
    
    local json_data="{
        \"email\": \"$email\",
        \"password\": \"$password\",
        \"nom\": \"$nom\",
        \"prenom\": \"$prenom\",
        \"cin\": \"$cin\",
        \"role\": \"$role\"
    }"
    
    response=$(curl -s -o /tmp/register_response -w "%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -d "$json_data" \
        "$BASE_URL/auth/register")
    
    if [ "$response" = "200" ] || [ "$response" = "201" ]; then
        success "Registered user: $email"
        return 0
    else
        error "Failed to register $email (HTTP $response)"
        cat /tmp/register_response
        return 1
    fi
}

# Function to login and get token
login_user() {
    local email=$1
    local password=$2
    
    local json_data="{
        \"email\": \"$email\",
        \"password\": \"$password\"
    }"
    
    response=$(curl -s -o /tmp/login_response -w "%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -d "$json_data" \
        "$BASE_URL/auth/login")
    
    if [ "$response" = "200" ]; then
        # Try multiple methods to extract token
        token=$(cat /tmp/login_response | jq -r '.token // .accessToken // .data.token // .data.accessToken // empty' 2>/dev/null)
        
        # Fallback if jq method fails
        if [ "$token" = "null" ] || [ -z "$token" ]; then
            token=$(cat /tmp/login_response | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
        fi
        
        # Another fallback pattern
        if [ "$token" = "null" ] || [ -z "$token" ]; then
            token=$(cat /tmp/login_response | sed -n 's/.*"token":"\([^"]*\)".*/\1/p' | head -1)
        fi
        
        # Validate token format (JWT should start with ey)
        if [ ! -z "$token" ] && [ "$token" != "null" ] && [[ "$token" =~ ^ey.* ]]; then
            echo "$token"  # Return ONLY the token
            return 0
        else
            error "Login successful but invalid token for $email" >&2
            if [ ! -z "$token" ]; then
                log "Token received: ${token:0:30}... (not a valid JWT format)" >&2
            else
                log "No token found in response" >&2
            fi
            echo "Login response:" >&2
            cat /tmp/login_response | head -10 >&2
            return 1
        fi
    else
        error "Login failed for $email (HTTP $response)" >&2
        cat /tmp/login_response | head -10 >&2
        return 1
    fi
}

# Function to create job offer
create_job_offer() {
    local token=$1
    local job_json=$2
    
    response=$(curl -s -o /tmp/job_response -w "%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $token" \
        -d "$job_json" \
        "$BASE_URL/api/employer/job-offers")
    
    if [ "$response" = "200" ] || [ "$response" = "201" ]; then
        # Try to extract job ID using jq first
        job_id=$(cat /tmp/job_response | jq -r '.id' 2>/dev/null)
        
        # Fallback method if jq fails
        if [ "$job_id" = "null" ] || [ -z "$job_id" ]; then
            job_id=$(cat /tmp/job_response | grep -o '"id":[0-9]*' | cut -d':' -f2)
        fi
        
        if [ ! -z "$job_id" ] && [ "$job_id" != "null" ]; then
            echo "$job_id"  # Return ONLY the job ID
            return 0
        else
            error "Job created but no ID found" >&2
            cat /tmp/job_response >&2
            return 1
        fi
    else
        error "Failed to create job offer (HTTP $response)" >&2
        cat /tmp/job_response | head -10 >&2
        return 1
    fi
}

# Function to upload CV and wait for completion
upload_cv() {
    local token=$1
    local cv_path=$2
    local email=$3
    
    if [ ! -f "$cv_path" ]; then
        warning "CV file not found: $cv_path for $email"
        return 1
    fi
    
    # Debug: Check if token is not empty and valid format
    if [ -z "$token" ]; then
        error "No token provided for CV upload for $email"
        return 1
    fi
    
    # Validate token format (should start with ey)
    if [[ ! "$token" =~ ^ey.* ]]; then
        error "Invalid token format for $email: ${token:0:20}..."
        return 1
    fi
    
    # Step 1: Check if CV already exists and delete it
    log "🔍 Checking for existing CV for $email..."
    check_response=$(curl -s -o /tmp/cv_check -w "%{http_code}" \
        -X GET \
        -H "Authorization: Bearer $token" \
        "$BASE_URL/api/candidate/cv/my-cv")
    
    if [ "$check_response" = "200" ]; then
        log "📄 Existing CV found, deleting it first..."
        delete_response=$(curl -s -o /tmp/cv_delete -w "%{http_code}" \
            -X DELETE \
            -H "Authorization: Bearer $token" \
            "$BASE_URL/api/candidate/cv/delete")
        
        if [ "$delete_response" = "200" ]; then
            log "✅ Existing CV deleted successfully"
        else
            warning "Failed to delete existing CV (HTTP $delete_response), continuing anyway..."
            cat /tmp/cv_delete | head -5
        fi
    elif [ "$check_response" = "404" ]; then
        log "✅ No existing CV found"
    else
        warning "Error checking existing CV (HTTP $check_response), continuing with upload..."
        cat /tmp/cv_check | head -5
    fi
    
    # Get file size for progress indication
    local file_size=$(stat -c%s "$cv_path" 2>/dev/null || echo "0")
    local file_size_kb=$((file_size / 1024))
    log "📄 Starting CV upload: $(basename "$cv_path") (${file_size_kb} KB)"
    
    # Debug: Show token info
    log "🔑 Using token: ${token:0:10}... (length: ${#token})"
    
    # Upload with timeout and better error handling
    response=$(timeout 240 curl -s -w "%{http_code}" \
        -X POST \
        -H "Authorization: Bearer $token" \
        -H "Accept: application/json" \
        -F "file=@$cv_path" \
        "$BASE_URL/api/candidate/cv/upload" \
        -o /tmp/cv_response 2>/dev/null)
    
    # Handle timeout separately
    if [ $? -eq 124 ]; then
        error "CV upload timed out for $email"
        return 1
    fi
    
    if [ "$response" = "200" ]; then
        success "CV upload completed: $(basename "$cv_path")"
        
        # Additional wait to ensure server processing is complete
        log "⏳ Waiting for server to process CV..."
        sleep 3  # Give server time to process and save CV
        
        success "CV upload and processing completed for $email"
        return 0
    else
        error "Failed to upload CV for $email (HTTP $response)"
        echo "Response details:"
        if [ -f /tmp/cv_response ]; then
            cat /tmp/cv_response | head -10  # Show only first 10 lines of error
        else
            echo "No response file created"
        fi
        echo "Token used: ${token:0:20}..."
        return 1
    fi
}

# Function to apply to job
apply_to_job() {
    local token=$1
    local job_id=$2
    local email=$3
    
    # Validate inputs
    if [ -z "$token" ] || [ -z "$job_id" ] || [ -z "$email" ]; then
        error "Missing parameters for job application: token=$([[ -n "$token" ]] && echo "present" || echo "missing"), job_id=$job_id, email=$email"
        return 1
    fi
    
    # Validate token format
    if [[ ! "$token" =~ ^ey.* ]]; then
        error "Invalid token format for $email: ${token:0:20}..."
        return 1
    fi
    
    log "📝 Applying $email to job $job_id..."
    
    response=$(curl -s -o /tmp/apply_response -w "%{http_code}" \
        -X POST \
        -H "Authorization: Bearer $token" \
        -H "Accept: application/json" \
        "$BASE_URL/api/candidate/job-offers/$job_id/apply")
    
    if [ "$response" = "200" ] || [ "$response" = "201" ]; then
        success "$email applied to job $job_id"
        return 0
    else
        error "Failed to apply $email to job $job_id (HTTP $response)"
        echo "Response details:"
        cat /tmp/apply_response | head -10
        echo "Token used: ${token:0:20}..."
        echo "Job ID: $job_id"
        return 1
    fi
}

main() {
    log "🚀 Starting JobVector Test Automation"
    
    # Check if server is running by testing auth endpoint with a POST request
    server_check=$(curl -s -w "%{http_code}" -X POST -H "Content-Type: application/json" -d '{}' http://localhost:8080/auth/register 2>/dev/null)
    http_code=$(echo "$server_check" | tail -c 4)
    
    if [ "$http_code" != "200" ] && [ "$http_code" != "400" ] && [ "$http_code" != "500" ]; then
        error "Spring Boot application is not running at $BASE_URL (HTTP: $http_code)"
        exit 1
    fi
    
    success "Server is running and responding"
    
    # Step 1: Register users
    log "👥 Registering users..."
    
    # Register candidates
    register_user "ahmed@test.com" "123456" "ahmed" "fridhi" "12315325" "CANDIDATE"
    register_user "jihed@test.com" "123456" "jihed" "kedidi" "12315326" "CANDIDATE"
    register_user "baha@test.com" "123456" "baha" "fatnassi" "12315327" "CANDIDATE"
    register_user "hamza@test.com" "123456" "Hamza" "Kamkoum" "12315328" "CANDIDATE"
    register_user "sami@test.com" "123456" "sami" "amara" "12315329" "CANDIDATE"
    register_user "rayen@test.com" "123456" "rayen" "melki" "12315330" "CANDIDATE"
    
    # Register employer and admin
    register_user "employeur@test.com" "123456" "TechCorp" "" "87654321" "EMPLOYER"
    register_user "admin@test.com" "123456" "Admin" "Système" "00000000" "ADMIN"
    
    sleep 2
    
    # Step 2: Login employer and create job offers ONE BY ONE
    log "💼 Creating job offers ONE BY ONE..."
    employer_token=$(login_user "employeur@test.com" "123456")
    
    if [ -z "$employer_token" ]; then
        error "Could not login employer"
        exit 1
    fi
    
    success "Employer logged in successfully"
    
    # Array to store job IDs
    job_ids=()
    
    # Count total jobs first
    total_jobs=$(cat examples/job_offers_examples.json | jq '. | length')
    log "📋 Creating $total_jobs job offers one by one..."
    
    # Read and create each job offer from the JSON file
    job_counter=1
    while IFS= read -r job_json; do
        # Extract job title for better logging
        job_title=$(echo "$job_json" | jq -r '.titre' 2>/dev/null || echo "Unknown Job")
        log "   Creating job $job_counter/$total_jobs: $job_title"
        
        job_id=$(create_job_offer "$employer_token" "$job_json")
        if [ ! -z "$job_id" ] && [ "$job_id" != "null" ]; then
            job_ids+=("$job_id")
            success "   Job $job_counter created successfully (ID: $job_id)"
        else
            error "   Failed to create job $job_counter"
        fi
        sleep 1  # Important delay between job creations
        ((job_counter++))
    done < <(cat examples/job_offers_examples.json | jq -c '.[]')
    
    # Step 3: Process candidates - Upload CV FIRST, then apply to jobs
    log "📄 Processing candidates - Upload CV first, then apply to jobs..."
    
    # Define CV paths (adjust these paths as needed)
    declare -A cv_paths=(
        ["ahmed@test.com"]="/home/asus/Téléchargements/CV/ahmed.pdf"
        ["baha@test.com"]="/home/asus/Téléchargements/CV/CV_baha_eddine_Fatnassi.pdf"
        ["jihed@test.com"]="/home/asus/Téléchargements/CV/Jihed_Kedidi_Resume.pdf"
        ["rayen@test.com"]="/home/asus/Téléchargements/CV/rayen.pdf"
        ["sami@test.com"]="/home/asus/Téléchargements/CV/sami.pdf"
    )
    
    # Array of candidate emails
    candidates=("ahmed@test.com" "jihed@test.com" "baha@test.com" "hamza@test.com" "sami@test.com" "rayen@test.com")
    
    candidate_counter=1
    total_candidates=${#candidates[@]}
    
    for email in "${candidates[@]}"; do
        log "👤 Processing candidate $candidate_counter/$total_candidates: $email"
        
        # Login candidate
        candidate_token=$(login_user "$email" "123456")
        
        if [ ! -z "$candidate_token" ]; then
            success "   Candidate $email logged in successfully"
            cv_upload_success=false
            
            # STEP 1: Upload CV FIRST (if path exists) and WAIT for completion
            if [ -n "${cv_paths[$email]}" ]; then
                log "   📄 Starting CV upload for $email..."
                if upload_cv "$candidate_token" "${cv_paths[$email]}" "$email"; then
                    cv_upload_success=true
                    log "   ✅ CV upload completed successfully for $email"
                else
                    error "   CV upload failed for $email"
                    echo -n "   ⚠️  CV upload failed for $email. Continue with job applications anyway? (y/n): "
                    read -r continue_anyway
                    if [ "$continue_anyway" != "y" ] && [ "$continue_anyway" != "Y" ]; then
                        warning "   Skipping job applications for $email"
                        ((candidate_counter++))
                        continue
                    fi
                fi
            else
                warning "   No CV path configured for $email"
            fi
            
            # STEP 2: Apply to jobs ONLY AFTER CV upload is COMPLETELY done
            if [ "$cv_upload_success" = true ] || [ -z "${cv_paths[$email]}" ]; then
                log "   📝 Starting job applications for $email..."
                log "   🎯 Applying to ${#job_ids[@]} jobs one by one..."
                
                applications_count=0
                job_counter=1
                for job_id in "${job_ids[@]}"; do
                    log "      Applying to job $job_counter/${#job_ids[@]} (ID: $job_id)"
                    if apply_to_job "$candidate_token" "$job_id" "$email"; then
                        ((applications_count++))
                    fi
                    sleep 1  # Increased delay between applications
                    ((job_counter++))
                done
                
                log "   ✅ $email applied to $applications_count/${#job_ids[@]} jobs successfully"
            else
                warning "   Skipping job applications for $email due to CV upload failure"
            fi
        else
            error "   Could not login $email, skipping..."
        fi
        
        ((candidate_counter++))
    done
    
    log "🎉 Automation completed successfully!"
    log "📊 Summary:"
    log "   - Registered ${#candidates[@]} candidates + 2 other users"
    log "   - Created ${#job_ids[@]} job offers"
    log "   - Processed applications for all candidates"
    
    # Cleanup temp files
    rm -f /tmp/*_response
}

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    error "jq is required but not installed. Please install it: sudo apt-get install jq"
    exit 1
fi

# Run main function
main "$@"
