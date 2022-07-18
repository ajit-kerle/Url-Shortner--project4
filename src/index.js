const express = require("express");
const bodyParser = require("body-parser");
const route = require("./route/route");
const mongoose = require("mongoose");
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
mongoose.connect("mongodb+srv://AkshayMakwana:Akshay123@cluster0.zmta9.mongodb.net/project2-DB?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
    }
  )
  .then(() => console.log("MongoDB is connected successfully........"))
  .catch((err) => console.log(err));

app.use("/", route);

app.listen(process.env.PORT || 3000, function () {
  console.log(`Server connected on PORT ${(process.env.PORT || 3000)} ✅✅✅`);
});