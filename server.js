const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');
const date = new Date();

const app = express();
app.set("view engine","ejs")
const PORT = 3000;

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'firmware')));
app.use(fileUpload());

const ALLOWED_EXTENSIONS = ["bin", "svg"];

function allowedFile(filename) {
  const ext = filename.split('.').pop();
  return ALLOWED_EXTENSIONS.includes(ext);
}

app.get('/', (req, res) => {
    var fs = require('fs'); 
  
    // Use fs.readFile() method to read the file 
    fs.readFile('config.json', 'utf8', function(err, data){ 
      
    // Display the file content 
    res.render("new",{artical: data});
    }); 
});

app.get('/config.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'config.json'));
});

app.post('/upload', (req, res) => {
  if (!req.files || !req.files.file) {
    return res.status(400).send('No file uploaded.');
  }

  const file = req.files.file;
  if (!allowedFile(file.name)) {
    return res.status(400).send('File type not allowed.');
  }
  console.log(req.files)
  const filename = `${date.toISOString()}-${file.name}`;
  file.mv(path.join(__dirname, 'firmware', filename), (err) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.sendFile(path.join(__dirname, 'up-success.html'));
  });
});

app.post('/delete', (req, res) => {
  if (!req.files || !req.files.file) {
    return res.status(400).send('No file specified for deletion.');
  }

  const file = req.files.file;
  if (!allowedFile(file.name)) {
    return res.status(400).send('File type not allowed.');
  }

  const filename = `${date.toISOString()}-${file.name}`;
  const filePath = path.join(__dirname, 'firmware', filename);

  if (fs.existsSync(filePath)) {
    fs.unlink(filePath, (err) => {
      if (err) {
        return res.status(500).send('Error deleting the file.');
      }
      res.render("up-success");
    });
  } else {
    res.status(404).send('File not found.');
  }
});

app.post('/config',(req, res)=>{
    let data = req.body
    let config = data.config
    console.log(data,config)
    var fs = require('fs');
    fs.writeFile('config.json', config, function (err) {
      if (err) throw err;
      console.log('Updated!');
    });
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});