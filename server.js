import express from "express";
import cors from "cors";
import { Sequelize, DataTypes } from "sequelize";
import jwt from 'jsonwebtoken';

import http from "http";
import path from "path";

import {fileURLToPath} from 'url';

import fs from "fs";
import multer from "multer";

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT;

httpServer.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
const __filename = fileURLToPath(import.meta.url),
      __dirname = path.dirname(__filename);

// // //
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
// // //

const handleError = (err, res) => {
  res
    .status(500)
    .contentType("text/plain")
    .end("Oops! Something went wrong!");
};

const upload = multer({
  dest: "/public/img/uploadedPrImg"
});

const CatalogItem = sequelize.define(
    'CatalogItem',
    {
        catalogItemID: { 
            allowNull: false,
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: Sequelize.UUIDV4
        },
        image: {
            type: DataTypes.STRING,
            allowNull: false
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        category: {
            type: DataTypes.STRING,
            allowNull: false
        },
        price: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
      freezeTableName: true,
    }
)
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

// маршрут на добавление товара в каталог
app.post(
    "/upload",  
    upload.single("file"),
     (req, res) => {
        const tempPath = req.file.path,
              targetPath = path.join(__dirname, `./uploads/${req.file.originalname}`);  
  
        if (path.extname(req.file.originalname).toLowerCase() === ".png") {
            fs.rename(tempPath, targetPath, err => {
                if (err) {
                    console.log(err);
                    return handleError(err, res);
                }
    
                CatalogItem.create({ 
                    image: req.file.originalname, 
                    title: req.body.title, 
                    category: req.body.category,
                    price: req.body.price,
                    description: req.body.desc
                });

                fs.rename(targetPath, (path.join(__dirname, `./public/img/uploadedPrImg/${req.file.originalname}`)), err => {
                    if (err) {
                        console.log(err);
                        return handleError(err, res);
                    }

                    res
                        .status(200)
                        .contentType("text/plain")
                        .end(`Успешно добавлен товар : ${req.body.title}`);
                });
            });
        } else {
            fs.unlink(tempPath, err => {
                if (err) return handleError(err, res);
        
                res
                    .status(403)
                    .contentType("text/plain")
                    .end("Only .png files are allowed!");
            });
        }
    }
);

// маршрут на обновление записи
app.post('/api/itemUpdateData', (req, res) => {

    const {itemUpdateData} = req.body;

    let data = itemUpdateData;
    
    for (let field in data) {
        if ( data[field] === '' ) {
            data[field] = null;
        }
    }
    if (data.tName == 'customer') {
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
    } else if (data.tName == 'order') {
        Order.update(
            {
                name: data.name,
                productArr: data.products
            },
            {
                where: {
                    orderID: data.id
                }
            }
        )
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
    } else if (itemData.tName == 'products') {
        console.log(data);
    }

    res.send(data);
});

// маршрут на получение всех товаров
app.get('/api/catalogItemData', (req, res) => {
    CatalogItem.findAll({raw:true})
    .then(catalogItem => {
        res.send(catalogItem);
    })
    .catch(e => console.log(`error: ${e}`));
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

// маршрут на получение всех заявок
app.get('/api/consultationData', (req, res) => {
    Message.findAll({raw:true})
    .then(messages => {
        res.send(messages);
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

// маршрут на удаление элемента по id
app.post('/api/deleteData', async (req, res) => {
    console.log(req.headers.table);
    if (req.headers.table == 'request') {
        await Message.destroy({ where: { requestID: req.body.id } });
        res.send(req.body.id);
    } else if (req.headers.table == 'customer') {
        await Customer.destroy({ where: { customerID: req.body.id } });
        res.send(req.body.id);
    } else if (req.headers.table == 'order') {
        await Order.destroy({ where: { orderID: req.body.id } });
        res.send(req.body.id);
    }else if (req.headers.table == 'product') {
        await CatalogItem.destroy({ where: { catalogItemID: req.body.id } });
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

        let token = jwt.sign( { nickname: nickname }, "2315", { expiresIn: "30m" } )
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