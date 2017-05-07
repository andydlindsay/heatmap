const express = require('express'),
      path = require('path'),
      port = process.env.PORT || 8080;

const app = express();

// set static folder
app.use(express.static(path.join(__dirname, 'dist')));

// start server
app.listen(port, () => {
    console.info('Server listening on port %s\n', port);
});