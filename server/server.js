import express from "express"
import cors from "cors"
import path from "path"
import url from "url"

import {getUnitData,getUnits,getImagesList} from "./units.js"
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
let app = express()
app.use(cors());
let port = process.env.PORT || process.argv[3] || 3000
app.listen(port)
console.log('server started ' + port)

function response(req, res, data){
  if(req.query.beautify !== undefined){
    res.setHeader('content-type', 'text/plain');
    res.send(JSON.stringify(data, null, 2));
  }
  else{
    res.json(data)
  }
}


app.use('/icon/:icon', (req, res) => {
  res.sendFile(`${__dirname}/icons/${req.params.icon}.png`)
})

app.get('/data/icons', (req, res) =>{
  response(req, res, getImagesList)
});

app.get('/data/unit/:unit', (req, res) => {
  response(req, res, getUnitData(req.params.unit))
});
app.get('/data/units', (req, res) =>{
  response(req, res, getUnits(req.params))
});

