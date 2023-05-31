const mongoose = require("mongoose");
const SchemaDB = require("./SchemaDB");

//connecting to database
mongoose
  .connect("mongodb://127.0.0.1:27017/googledocs")
  .then(() => console.log("Connected!")); //connecting to database

//adding cors middleware for backwards compatibility
const io = require("socket.io")(3030, {
  cors: {
    orogin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const defaultValue = ""; // setting default value for the data

//making connection using socket.io as io
io.on("connection", (socket) => {
  socket.on("get-document", async (documentId) => {
    //getting the documentId from the client connection
    const document = await FindorCreateDocument(documentId); //calling function to upodate Database
    socket.join(documentId); // join to existing session
    socket.emit("load-document", document.data); //emiting the document to theclient session
    socket.on("send-changes", (delta) => {
      socket.broadcast.to(documentId).emit("receive-changes", delta); //all users can able to access after broadcasting changes in specific session
    });
    socket.on("save-document", async (data) => {
      await SchemaDB.findByIdAndUpdate(documentId, { data }); // updating contents on mongodb
    });
  });
});

//creating new row on mongodb for new session in clients
const FindorCreateDocument = async (id) => {
  if (id == null) return;

  const document = await SchemaDB.findById(id);
  if (document) return document;
  return await SchemaDB.create({ _id: id, data: defaultValue }); //setting id and setting data as defaultvalue
};
