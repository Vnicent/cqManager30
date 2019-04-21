const express = require('express');
const dbHelper = require('./libs/dbHelper');
const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer({
    dest: 'views/imgs/'
});
const path = require('path');
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('views'));

app.get('/heroList', (req, res) => {
    const pagenum = req.query.pagenum;
    const pagesize = req.query.pagesize;
    const query = req.query.query;
    dbHelper.find('cqlist', {}, result => {
        result = result.reverse();
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
    const heroName = req.body.heroName;
    const skillName = req.body.skillName;
    const heroIcon = path.join('imgs', req.file.filename);
    dbHelper.insertOne('cqlist', {
        heroName,
        skillName,
        heroIcon
    }, result => {
        res.send({
            code: 200,
            msg: "添加成功"
        })
    })
})

app.post('/heroUpdate', upload.single('heroIcon'), (req, res) => {
    const heroName = req.body.heroName;
    const skillName = req.body.skillName;
    const id = req.body.id;
    let updateData = {
        heroName,
        skillName
    };
    if (req.file) {
        const heroIcon = path.join('imgs', req.file.filename);
        updateData.heroIcon = heroIcon;
    }
    dbHelper.updateOne('cqlist', {
        _id: dbHelper.ObjectId(id)
    }, updateData, result => {
        res.send({
            msg: "修改成功",
            code: 200
        })
    })
})

app.post('/register',(req,res)=>{
    dbHelper.find('userlist',{username:req.body.username},result=>{
        if(result.length===0){
            dbHelper.insertOne('userlist',req.body,result=>{
                res.send({
                    msg:'注册成功',
                    code:200
                })
            })
        }else {
            res.send({
                msg:'该账号已存在,请重新注册',
                code:400
            })
        }
    })
})
app.listen(8848);