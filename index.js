const express = require('express')

const bodyparser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash')
const { name } = require('ejs');
const { get } = require('express/lib/response');

const app = express()

app.use(bodyparser.urlencoded({ extended: true }))

// using ejs with express

app.set('view engine', 'ejs');


app.use(express.static('views')) // getting the styles from the view folder

mongoose.connect('mongodb://localhost:27017/todolistDB', { useNewUrlParser: true });


const todoitemschema = new mongoose.Schema({
    name: String
})

const todoitem = mongoose.model('todoitems', todoitemschema);

const first = new todoitem({
    name: 'mango'
})
const second = new todoitem({
    name: 'apple'
})
const third = new todoitem({
    name: 'grape'
})

const defaultitem = ([first, second, third])

const listschema = new mongoose.Schema({
    name: String,
    todoitems: [todoitemschema]
})

const list = mongoose.model('list', listschema)

const aboutContent = 'created by will'



// todoitems.insertMany(defaultitem, function(err) {
//     if (err) {
//         console.log(err)
//     } else {
//         console.log('added')
//     }
// })



// putting the items in an array


// display content in home root

app.get('/', function(req, res) {

    // let today = new Date()

    // // getting the day of the week
    // let currentday = today.getDay()
    //     // setting the type of date formats
    // var options = {
    //     weekday: 'long',
    //     day: 'numeric',
    //     month: 'long'
    // }
    // var day = today.toLocaleDateString('en-us', options)
    // using (render) to display content when using ejs

    todoitem.find({}, function(err, foundlist) {
        if (foundlist.length === 0) {
            todoitem.insertMany(defaultitem, function(err) {
                if (err) {
                    console.log(err)
                } else {
                    console.log('added')
                }
            })

            res.redirect('/')

        } else {
            console.log('successfully saved items')
        }
        res.render('list', {
            kind: 'today',
            newlistitems: foundlist
        })
    })




})

// posting the items back from our array(server) to the home root

app.post('/', function(req, res) {
    var itemname = req.body.inputitem
    var listname = req.body.lists

    const myitems = new todoitem({
            name: itemname
        })
        // using conditional statement to post items on either our home or custom route
    if (req.body.lists === 'today') {

        // pushing our items to the custom(userid) from input
        myitems.save()
        res.redirect('/')
    } else {
        list.findOne({ name: listname }, function(err, foundlist) {
            foundlist.todoitems.push(myitems)
            foundlist.save()
            res.redirect('/' + listname)
        })

    }




})

app.post('/delete', function(req, res) {
    const deleteitems = req.body.checkbox
    const listname = req.body.listname



    // todoitem.findByIdAndRemove(deleteitems, function(err) {
    //     if (!err) {
    //         console.log('successfully deleted')
    //         res.redirect('/')
    //     }
    // })


    if (listname === 'today') {
        todoitem.findByIdAndRemove(deleteitems, function(err) {
            if (!err) {
                console.log('successfully deleted checked item')
                res.redirect('/')
            }
        })
    } else {
        list.findOneAndUpdate({ name: listname }, { $pull: { todoitems: { _id: deleteitems } } }, function(err) {
            if (!err) {
                res.redirect('/' + listname)

            }
        })

    }



})

//

// initializing our coding route by also doing,using the same styling

// app.get('/coding', function(req, res) {
//     res.render('list', { kind: 'work', newlistitems: worklist })
// })

app.get('/:userid', function(req, res) {

    const userid = _.lowerCase(req.params.userid)

    list.findOne({ name: userid }, function(err, foundlist) {
        if (!err) {
            if (!foundlist) {
                // console.log('doesnt exist')
                const mylist = new list({
                    name: userid,
                    todoitems: defaultitem
                })
                mylist.save()
                res.redirect('/' + userid)

            } else {
                // console.log('exist!')
                res.render('list', {
                    kind: foundlist.name,
                    newlistitems: foundlist.todoitems
                })
            }
        }
    })



})

app.get('/about', function(req, res) {
    res.render('about', { about: aboutContent })
})


app.listen(2000, function() {
    console.log('started')
})