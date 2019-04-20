const express = require('express');
const dbHelper = require('./libs/dbHelper');
const multer = require('multer');
const upload = multer({
    dest: 'views/imgs/'
});
const path = require('path');
const app = express();

app.use(express.static('views'));

app.get('/heroList', (req, res) => {
    const pagenum = req.query.pagenum;
    const pagesize = req.query.pagesize;
    const query = req.query.query;
    dbHelper.find('cqlist', {}, result => {
        const queryList = result.filter(v => {
            if (v.heroName.indexOf(query) != -1 || v.skillName.indexOf(query) != -1) {
                return true;
            }
        })
        const list = [];
        const startIndex = (pagenum - 1) * pagesize;
        const endIndex = parseInt(startIndex) + parseInt(pagesize);
        for (var i = startIndex; i < endIndex; i++) {
            if (queryList[i]) {
                list.push(queryList[i]);
            }
        }
        const totalPage = Math.ceil(queryList.length / pagesize);
        res.send({
            totalPage,
            list
        })
    })
})

app.get('/heroDetail', (req, res) => {
    const id = req.query.id;
    dbHelper.find('cqlist', {
        _id: dbHelper.ObjectId(id)
    }, result => {
        res.send(result);
    })
})

app.get('/heroDelete', (req, res) => {
    const id = req.query.id;
    dbHelper.deleteOne('cqlist', {
        _id: dbHelper.ObjectId(id)
    }, result => {
        res.send({
            msg: "删除成功",
            code: 200
        })
    })
})

app.post('/heroAdd', upload.single('heroIcon'), (req, res) => {
    const heroName = req.query.heroName;
    const skillName = req.query.skillName;
    const heroIcon = path.join('imgs', req.file.filename);
    dbHelper.insertOne('cqlist',{heroName,skillName,heroIcon},result=>{
        res.send({
            code:200,
            msg:"添加成功"
        })
    })
})
app.listen(8848);