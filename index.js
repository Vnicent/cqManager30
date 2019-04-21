const express = require('express');
const dbHelper = require('./libs/dbHelper');
const bodyParser = require('body-parser');
const svgCaptcha = require('svg-captcha');
const cookieSession = require('cookie-session')
const multer = require('multer');
const upload = multer({
    dest: 'views/imgs/'
});
const path = require('path');
const app = express();
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

app.use((req,res,next)=>{
    if(req.url.indexOf('/hero')===0){
        if(req.session.username){
            next();
        }else{
            res.send({
                msg:'请先登录',
                code:400
            })
        }
    }else {
        next();
    }
})

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

app.get('/captcha', function (req, res) {
	var captcha = svgCaptcha.create();
	req.session.vcode = captcha.text;
	// console.log(captcha.text);
	res.type('svg');
	res.status(200).send(captcha.data);
});

app.post('/login',(req,res)=>{
    const username = req.body.username;
    const password = req.body.password;
    const vcode = req.body.vcode;
    if(vcode.toLowerCase()===req.session.vcode.toLowerCase()){
        dbHelper.find('userlist',{
            username,
            password
        },result=>{
            if(result.length!=0){
                req.session.username = username;
                res.send({
                    msg:'登录成功',
                    code:200,
                    username
                })
            }else {
                res.send({
                    msg:'用户名或密码错误,请重新登录',
                    code:400
                })
            }
        })
    }else {
        res.send({
            msg:'验证码错误,重新填写验证码',
            code:401
        })
    }
})

app.get('/logout',(req,res)=>{
    req.session = null;
    res.send({
        msg:'已退出',
        code:200
    })
})
app.listen(8848);