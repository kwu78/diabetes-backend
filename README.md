# diabetes-fighter-backend

### Background

This is the backend repository of project Diabetes Fighter, developed by team 39 of CS6440 Fall 2024.

This repository is also stored in a Gatech Enterprise Github repository at https://github.gatech.edu/yyang986/diabetes-fighter-backend. 

We use this personal Github Repo because the free online server (Render) we use to host the service cannot work on enterprise github (e.g. gatech enterprise github). Therefore, we have one copy in the public github and duplicate a copy in the Gatech github for grading purposes.

### App
- The app is hosted at https://github.gatech.edu/pages/kwu339/diabetes-dashboard/.
- The app demo is at https://www.youtube.com/watch?v=35TVdFmKpyQ

One can use the following credentials to log in as a mock user
- Healthy person:
  - username: ID_a
  - password: ID_a_password
- Diabetes patient
  - username: ID_b
  - password: ID_b_password
- Diabetes-prone person
  - username: ID_c
  - password: ID_c_password
  
### Frontend
The frontend repository sits at https://github.gatech.edu/kwu339/diabetes-dashboard.

### Backend
There are 2 key APIs connecting the frontend and the backend.
- login() which conducts login authentication
- get_patient_info_by_id() which retrives patient data by FHIR standards and predicts the likelihood of developing diabetes via a pre-trained machine learning model
