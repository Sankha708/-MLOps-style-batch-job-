# Technical Assessment: MLOps Task 

This project demonstrates a minimal MLOps-style batch job environment built with React, Express, and TypeScript.

## Core Features
- **Reproducibility**: The job runner uses a custom seeded pseudo-random number generator. Running a job with the same seed will always yield identical training paths and final metrics.
- **Observability**:
    - **Visual Metrics**: Real-time charts showing Loss and Accuracy curves using Recharts.
    - **System Logs**: Comprehensive stdout simulation showing job progress, configuration, and completion.
    - **Machine Metrics**: Final summary including MSE, Accuracy, and duration.
- **Deployment Readiness**: The "Deployment" tab provides a Dockerfile template and a verification checklist for MLOps best practices.

## Technical Stack
- **Frontend**: React 19, Vite, Recharts, Framer Motion, Tailwind CSS.
- **Backend**: Node.js, Express (API for running the batch jobs).
- **Design**: Technical dashboard aesthetic inspired by "Recipe 1: Technical Dashboard" from professional design guidelines.

## How to Verify Reproducibility
1. Run a job with Seed `42`. Note the final accuracy.
2. Change the seed to `123`. Note the different results.
3. Change the seed back to `42`. Observe that the results are identical to the first run.
