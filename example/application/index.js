// IMPORTS
const EJS = require('ejs');
const EXPRESS = require('express');

// CONSTANTS
const SERVER_PORT = process.env.SERVER_PORT;
const HOST_NAME = '0.0.0.0';

const THEME = process.env.SERVER_THEME || 'bg-light';
const APP = EXPRESS();

// DEFINITIONS
APP.use(EXPRESS.static('public'));
APP.use('/css', EXPRESS.static(__dirname + 'public/css'));
APP.use('/js', EXPRESS.static(__dirname + 'public/js'));
APP.set('views', './views');
APP.set('view engine', 'ejs');

function blocking() {
  for (let i = 0; i < 100000000; i++) {}
}

async function headOfLineBlocking() {
  await new Promise((resolve) => setTimeout(resolve, 500));
}

// VIEWS
APP.get('', async (req, res) => {
  const processingStartTime = process.hrtime();

  // PROCESSING
  blocking();

  if (Math.random() <= 0.1) {
    await headOfLineBlocking();
  }

  // PROCESSING TIME CALC
  const processingEndTime = process.hrtime(processingStartTime);
  const processingTime = processingEndTime[0] * 1000 + processingEndTime[1] / 1e6;

  // CONTEXT
  res.render('index', {
    port: SERVER_PORT,
    theme: THEME,
    processingTime: processingTime,
  });
});

// START SERVER
APP.listen(SERVER_PORT, HOST_NAME, () => {
  console.info(`Listening on port ${SERVER_PORT}`);
});
