# AWS EKS Deployment

This project provides a complete infrastructure setup for deploying a CV AI matcher application using AWS services. The architecture includes Amazon EKS for container orchestration, Amazon RDS for PostgreSQL database, and Amazon S3 for storing CV uploads. The deployment is managed using Terraform and CI/CD is implemented with GitHub Actions.

## Project Structure

- **terraform/**: Contains Terraform configuration files and modules for provisioning AWS resources.
  - **main.tf**: The main Terraform configuration file.
  - **variables.tf**: Input variables for the Terraform configuration.
  - **outputs.tf**: Outputs of the Terraform configuration.
  - **providers.tf**: AWS provider configuration.
  - **backend.tf**: Backend configuration for storing Terraform state.
  - **modules/**: Contains reusable Terraform modules.
    - **networking/**: Module for setting up VPC, subnets, and NAT gateways.
    - **eks/**: Module for provisioning the EKS cluster.
    - **rds/**: Module for provisioning the RDS instance.
    - **s3/**: Module for provisioning the S3 bucket.

- **.github/**: Contains GitHub Actions workflows for CI/CD.
  - **workflows/**: Directory for workflow files.
    - **deploy.yml**: Workflow for building and deploying the application.

- **k8s/**: Contains Kubernetes manifests for deploying the application.
  - **deployment.yaml**: Kubernetes deployment configuration.
  - **service.yaml**: Kubernetes service configuration.
  - **ingress.yaml**: Kubernetes ingress configuration.
  - **configmap.yaml**: Kubernetes ConfigMap for application configuration.

## Getting Started

### Prerequisites

- AWS account
- AWS CLI configured with appropriate permissions
- Terraform installed
- Docker installed
- Kubernetes CLI (kubectl) installed
- GitHub account for CI/CD

### Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd aws-eks-deployment
   ```

2. **Configure Terraform**
   - Update the `terraform/variables.tf` file with your desired configurations (e.g., region, instance types).

3. **Initialize Terraform**
   ```bash
   cd terraform
   terraform init
   ```

4. **Plan the Deployment**
   ```bash
   terraform plan
   ```

5. **Apply the Deployment**
   ```bash
   terraform apply
   ```

6. **Deploy the Application**
   - After the infrastructure is provisioned, deploy the application using Kubernetes manifests.
   ```bash
   kubectl apply -f k8s/
   ```

7. **Access the Application**
   - Use the external IP or domain provided by the ingress resource to access the application in your browser.

## CI/CD Pipeline

The CI/CD pipeline is defined in the `.github/workflows/deploy.yml` file. It automates the build and deployment process to EKS whenever changes are pushed to the main branch.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.