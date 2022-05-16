# Namma Bangalore - Frontend Server

### Software required:
* Node 14.17.0

### Setup
1. Execute: `npm install`. This will install all the required node modules.
2. The server will run at port 5000 by default. To change it, go to line 6 in `./server/server.js`.
3. In case of any changes to backend server, change the value of `server` variable in `./server/server.js` at line 7.
4. Make the same changes in `./scripts/server_api.js`. Change the value of `server` variable at line 6.

### Steps to view website:
In `./server` folder, run `npm start` to start the frontend server. Visit http://localhost:5000 to view the frontend.

### Before syncing branch:
1. Go to main branch
2. Perform `git pull`
3. Switch to your test branch
4. Execute `git merge main <your-branch>`
5. Sync changes
6. Go to [repository.](https://github.com/IshaanBose2147116/namma-bengaluru-front-end)
7. Compare and pull request. If unavailable, go to your repo and click Contribute and pull request.