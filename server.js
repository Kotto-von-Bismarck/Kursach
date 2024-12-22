import express from "express";
import cors from "cors";
import { Sequelize, DataTypes } from "sequelize";
import bodyParser from "body-parser";

// const bodyParser = require('body-parser');
const app = express();


app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(cors());
app.use(express.json());

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "public/pulseDB.sqlite",
});

try {
    await sequelize.authenticate()
    console.log('Соединение с БД было успешно установлено')
} catch (e) {
    console.log('Невозможно выполнить подключение к БД: ', e)
}

const Message = sequelize.define(
    'Message',
    {
        requestID: { 
            allowNull: false,
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: Sequelize.UUIDV4
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        phoneNum: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        productID: {
            type: DataTypes.STRING,
            defaultValue: 'заявка на бесплатную консультацию',
        },
        categoryID: {
            type: DataTypes.STRING ||  DataTypes.INTEGER,
            defaultValue: 'заявка на бесплатную консультацию',
        },
    },
    {
      freezeTableName: true,
    }
)

app.post('/api/consultationData', (req, res) => {
    const {consultationData} = req.body;

    let data = { echo: consultationData };
    
    for (let field in data.echo) {
        if ( data.echo[field] === '' ) {
            data.echo[field] = null;
        }
    }
    
    res.send(data);

    try {
        Message.create({ email: data.echo.email, name: data.echo.name, phoneNum: data.echo.phoneNum});
    } catch (e) {
        console.log(`error: ${e}`);
        data.echo = e;
    }

    
    console.log(data.echo);
});

sequelize.sync()

// маршруты

// app.get('/add-product', async (req, res) => {
//     const categories = await Category.findAll();
//     const suppliers = await Supplier.findAll();
//     res.render('add-product', { categories, suppliers });
//   });


app.listen(3000, () => {
    console.log('Сервер запущен')
})

// await Message.destroy({
//     truncate: true,
//   })