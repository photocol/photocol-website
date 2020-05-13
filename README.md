# Photocol Website
React frontend for the Photocol webapp. The following instructions are to run the Photocol website standalone (i.e., for development). If you want to run the whole project configuration using `docker-compose` containers along with the rest of the project, see the instructions at [photocol-DB_SETUP][1].

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### Installation instructions

###### npm packages
Make sure npm and nodejs are installed. Install the packages:
```shell script
npm i
``` 

### Run instructions (run test server)
Make sure to set the environment variable `REACT_APP_SERVER_URL` to the URL of the server. (The default is `REACT_APP_SERVER_URL=http://localhost:4567` if running on the same machine.)

```shell script
npm start
```


### Compile instructions (create optimized static build)
Make sure to set the environment variable `REACT_APP_SERVER_URL` to the URL of the server. (The default is `REACT_APP_SERVER_URL=http://localhost:4567` if running on the same machine.)
```shell script
npm run build
```

[1]: https://github.com/photocol/photocol-DB_SETUP