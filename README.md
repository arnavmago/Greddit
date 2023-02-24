# README for Greddit

## Commands

### To run the dockerized container -

In the home directory (i.e the directory you get after downloading and unziping the files, should contain the backend and frontend folders within it) run the `DOCKER_BUILDKIT=0 docker-compose up --build` to run the docker container, then on your browser go to <localhost:8000> to access and interact with the application

### To run it differently (without docker container) -

Open 2 terminals in the frontend and backend directories, run `npm install` in both terminals to install all the required packages, then in the frontend directory type the command `npm start` to host the frontend on port 3000 and in the backend directory type the command `node server` to start the server, then on your browser go to <localhost:3000> to access and interact with the application the application.

## Design choices

1. You will not be allowed to submit an an empty comment

2. You are allowed to submit an empty report

3. While creating a sub-greddit the only required field is its name as that is what is used to uniquely identify it in the database

4. On clicking the report button on the post, a textarea pops up that allows you to enter your concern, clicking the same button again hides the text area.

5. Icons without text used for most buttons, they are quite self explanatory as to what they are for (i.e. you can identify ehich button is to delete, which ti expand and which to open)

6. The website reloads after most submission based actions to ensure their completion before any further changes, thus if you submit something that casues a reload then try to make more changes before the reload completes, all those changes will be undone.
