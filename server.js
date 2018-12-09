const express = require('express');
const port = process.env.PORT || 8080;
const app = express();

app.use(express.static(__dirname + "/"));
app.get("/", function(req, res){
    res.sendFile(__dirname + "/index.html");
});
app.listen(port);
// /.*/
console.log("Servidor corriendo...")