const initApp = require("./server");
const port = process.env.PORT;

initApp().then((app) => {
  app.listen(port, () => {
    console.log(`App is running on http://localhost:${port}/`);
  });
})
    .catch((error) => {
      console.error("Error init app", error);
    });