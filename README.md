
# Pushstart-Widget

This project use Reel-like video feed on your E-commerce store to provide an Immersive, Human & New-Age shopping experience to your customers and increase conversion rates by upto 100%.

## Project Setup Guide

This guide will walk you through the step-by-step process of setting up Pushstart-widget locally and deploying to the Shopify store. By following these instructions, you will be able to develop and test your Pushstart-widget on your local machine before deploying it to a live environment. Let's get started!
### Prerequisites

Before you begin, make sure you have the following installed on your local machine:

- Node.js (version 12 or higher)
- Git
### Step 1: Clone the Repository

    1. Open your terminal or command prompt.
    2. Change the current working directory to the location where you want to clone the repository.
    3. Run the following command to clone the repository:

    git clone https://github.com/Pushstarters/Pushstart-Widget.git

    4. Once the cloning process is complete, navigate into the project directory:

    cd your-repository

 

    


### Step 2: Install Dependencies

    1. In the project directory, run the following command to install the project dependencies:

    npm install


### Step 3: Start the Development Server

    1. Now, the project setup in your local environment is complete. In the terminal, run the following command to start the development server:

    npm run start

    2. Open your browser and navigate to http://localhost:3000 to access your locally hosted Widget. 

### Step 4: Customize and Test

    1. Open your preferred code editor and start customizing files located in the project's directory to add or customize any features.
    2. Make any necessary modifications to the liquid templates, stylesheets, and JavaScript files.
    3. Save your changes and observe the updates in the browser.
    4. Test your project's functionality and ensure everything works as expected.

### Step 5: Deployment to shopify store

    1. Once you are satisfied with your changes and want to deploy your Widget to a live environment, follow these steps:

- Push the changes to your remote repository.
- Run the following command to create the build of the Pushstart-widget Project :

    npm run build 
- It will create a dist folder the repo which will be useful while deploy the widget to shopify store.



