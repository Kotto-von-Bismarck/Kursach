import express from "express";
import cors from "cors";

const app = express()

app.use(express.static('public'))
app.use(cors())
app.use(express.json())

import { Sequelize, DataTypes } from "sequelize";

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
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            primaryKey: true 
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
            defaultValue: 'request for consultation',
        },
        categoryID: {
            type: DataTypes.STRING ||  DataTypes.INTEGER,
            defaultValue: 'request for consultation',
        },
    },
    {
      freezeTableName: true,
    }
)

app.post('/api/consultationData', (req, res) => {
    const {consultationData} = req.body;

    let data = { echo: consultationData };
    
    console.log(data.echo.email);
    
    res.send(data);

    Message.create({ email: data.echo.email, name: data.echo.name, phoneNum: data.echo.phoneNum});
});

sequelize.sync()

app.listen(3000, () => {
    console.log('Сервер запущен')
})

// await Message.destroy({
//     truncate: true,
//   })