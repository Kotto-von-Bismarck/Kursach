import express from "express";
import cors from "cors";
import { Sequelize, DataTypes } from "sequelize";
import jwt from 'jsonwebtoken';

const app = express()

app.use(express.static('public'))
app.use(cors())
app.use(express.json())

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
const Customer = sequelize.define(
    'Customer',
    {
        customerID: { 
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
    },
    {
      freezeTableName: true,
    }
)
const Order = sequelize.define(
    'Order',
    {
        orderID: { 
            allowNull: false,
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: Sequelize.UUIDV4
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        productArr: {
            allowNull: false,
            type: DataTypes.STRING,
        }
    },
    {
      freezeTableName: true,
    }
)

// маршрут на обновление записи о клиенте
app.post('/api/customerUpdateData', (req, res) => {

    const {customerUpdateData} = req.body;

    let data = customerUpdateData;
    
    for (let field in data) {
        if ( data[field] === '' ) {
            data[field] = null;
        }
    }
    try {
        Customer.update(
            {
                email: data.email,
                name: data.name,
                phoneNum: data.phoneNum
            },
            {
                where: {
                    customerID: data.id
                }
            }
        )
    } catch (e) {
        console.log(`error: ${e}`);
        data.echo = e;
    }

    res.send(data);
});

// маршрут на создание записи 
app.post('/api/postData', (req, res) => {
    const {itemData} = req.body;

    let data = itemData;
    
    for (let field in data) {
        if ( data[field] === '' ) {
            data[field] = null;
        }
    }
    
    res.send(data);

    if (itemData.tName == 'customer') {
        Customer.create({ 
            email: data.email, 
            name: data.name, 
            phoneNum: data.phoneNum
        });
    } else if (itemData.tName == 'order') {
        Order.create({ 
            name: data.name, 
            productArr: `${data.products}`
        });
    }
});

// маршрут на получение всех клиентов
app.get('/api/customerData', (req, res) => {
    Customer.findAll({raw:true})
    .then(сustomer => {
        res.send(сustomer);
    })
    .catch(e => console.log(`error: ${e}`));
});

// маршрут на получение всех заказов
app.get('/api/orderData', (req, res) => {
    Order.findAll({raw:true})
    .then(order => {
        res.send(order);
    })
    .catch(e => console.log(`error: ${e}`));
});

// маршрут на создание заявки
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
});

// маршрут на получение всех заявок
app.get('/api/consultationData', (req, res) => {
    Message.findAll({raw:true})
    .then(messages => {
        res.send(messages);
    })
    .catch(e => console.log(`error: ${e}`));
});

// маршрут на удаление заявки по id
app.post('/api/deleteData', async (req, res) => {
    console.log(req.headers.table);
    if (req.headers.table == 'request') {
        await Message.destroy({ where: { requestID: req.body.id } });
        res.send(req.body.id);
    } else if (req.headers.table == 'customer') {
        await Customer.destroy({ where: { customerID: req.body.id } });
        res.send(req.body.id);
    }
});



const Admin = sequelize.define('Admin', 
    {
        nickname: {
            type: DataTypes.STRING,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },
    {
      freezeTableName: true,
    }
);

// маршрут на авторизацию администратора
app.post('/login', async (request, response) => {
    if (request.body.jsonWtoken) {
        jwt.verify(request.body.jsonWtoken, "2315", (err, decoded) => {
            if (err) {
                response.send( {res: 'Время сессии истекло, войдите ещё раз!'} )
            } else if (decoded) {
                response.send( {res: 'Добро пожаловать, администратор!'} )
            }

            console.log(request.body.jsonWtoken);
            
        })
        
    } else {
        const { nickname, password } = request.body

        let admin = await Admin.findOne( {where: {nickname: nickname}} )

        if(admin == null){
            return response.sendStatus(404)
        }
        if(admin.password != password){
            return response.sendStatus(400)
        }

        let token = jwt.sign( { nickname: nickname }, "2315", { expiresIn: "1m" } )
        response.send( { token } )
    }
})

sequelize.sync()
app.listen(3000, () => {
    console.log('Сервер запущен')
})

// Admin.create( { nickname: 'Dmitry_admin123', password: 'Ya@Dmin' } )

// await Order.destroy({
//     truncate: true,
//   })