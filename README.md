# README for Greddit

## Commands

### To run the dockerized container -

`DOCKER_BUILDKIT=0 docker-compose up --build`, then on your browser go to <localhost:8000> to access the application

### To run it differently -

Open 2 terminals in the frontend an backend directories, run npm install in both terminals to install all the required packages, then in the frontend directory type the command `npm start` and in the backend directory type the command `node server`, then on your browser go to <localhost:3000> to access the application

## Design

1. You will not be allowed to submit an an empty comment

2. You are allowed to submit an empty report

3. While creating a sub-greddit the only required field is its name as that is what is used to uniquely identify it in the database

4. On clicking the report button on the post, a textarea pops up that allows you to enter your concern, clicking the same button again hides the text area.

5. icons without text used for most buttons, are quite self explanatory as to what they are
