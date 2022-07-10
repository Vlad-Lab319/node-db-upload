const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const db = require('./database');

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded(
  {
    extended: true,
  }
));

app.use('./uploads', express.static('uplloads'));

app.get('/', (req, res) => {
  const html = `
  <form action="/uploadfile" enctype="multipart/form-data" method="post">
  <div class="form-group">
    <input id="file-submit" type="file" class="form-control-file" name="dataFile">
    <br/>
    <input type="submit" value="Submit attachement" class="btn btn-default">            
    </div>
    </form>
    `
    // <label for="file-submit" class="btn btn-default">"Attach the file..."</label>
  res.send('NodeJS file upload rest apis'+'\n'+html);
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer(
  {
    storage: storage
  }
);

app.post('/uploadfile', upload.single('dataFile'), (req, res, next) => {

  const file = req.file;

  if (!file) {
    return res.status(400).send(
      {
        message: 'Please upload a file.'
      }
    );
  }

  const sql = "INSERT INTO files(name, id) VALUES ('" + req.file.filename + "', " + Date.now() / 1000 + ");";

  console.log(sql);

  const query = db.query(sql, function (err, result) {
    if (err) throw err;
    console.log("result: ", result);
    return res.send({
      message: 'File uploaded successfully!',
      file
    });
  });


});

app.listen(port, () => {
  console.log('Server started on: ', port);
})