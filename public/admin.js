window.addEventListener('DOMContentLoaded',async () => {

    if (document.querySelector('.adminPage')) {
        let jsonWtoken = localStorage.getItem('token');

        setInterval(() => {
            if (jsonWtoken) {
                fetch('/login', {
                    method: "POST",
                    body: JSON.stringify({jsonWtoken}),
                    headers: {
                        "Content-Type": 'application/json'
                    }
                }).then(res => {
                    return res.json()
                }).then(res => {
                    if (res.res != 'Добро пожаловать, администратор!') {
                        setTimeout(() => {
                            window.location.replace("http://localhost:3000/auth.html")
                        },1000)
                        return alert(`${ res.res }`)
                    }
                })
            }
        },1500)

        // общая функция запроса данных
        async function fetchData(url) {
            const res = await fetch(url, {
                method: 'GET',
                headers: {'Content-type': 'application/json'}
            })
            if(!res.ok) {
                alert('не удалось загрузить контент');
            }
            return await res.json()
        } 

        const postForm = document.forms.requestForPostData,
              UpdateForm = document.forms.requestForUpdateData;

        // общая функция удаления компонента
        async function deleteComponent (id, tName) {
            await fetch('/api/deleteData', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    'table': `${tName}`
                },
                body: JSON.stringify({id})
            })
            if (tName == 'customer') {
                const data = await fetchData('/api/customerData')
                RequestForCustomers.resetParent();
                data.forEach(item => new RequestForCustomers(item).render())
            } else if (tName == 'request') {
                const data = await fetchData('/api/consultationData')
                RequestForConsultation.resetParent();
                data.forEach(item => new RequestForConsultation(item).render())
            } else if (tName == 'order') {
                const data = await fetchData('/api/orderData')
                RequestForOrders.resetParent();
                data.forEach(item => new RequestForOrders(item).render())
            } else if (tName == 'product') {
                const data = await fetchData('/api/catalogItemData')
                RequestForProducts.resetParent();
                data.forEach(item => new RequestForProducts(item).render())
            }
        }

        // функция открытия окна добавления компонента
        const addOrderBTN = document.querySelector('#addOrderBTN'),
              addCustomerBTN = document.querySelector('#addCustomerBTN'),
              addProductBTN = document.querySelector('#addProductBTN');
        
        function openAddingModal(tName) {
            $('.overlay, #editdata').fadeIn('slow');
            const modalUp = document.querySelector('.overlay #updatedata');
            modalUp.style.cssText='display: none;';

            const Parent = document.forms.requestForPostData,
                  addModalWin = document.querySelector('#editdata'),
                  newFormElem = addModalWin.lastElementChild;
            
            if (tName == 'customer') {

                if (newFormElem.classList.contains('activeModalIMG')) {
                    addModalWin.lastElementChild.innerHTML = '';
                    newFormElem.classList.remove('activeModalIMG');
                }

                Parent.innerHTML = `
                <input required name="name" placeholder="ФИО клиента" type="text">
                <input required name="phone" placeholder="Телефон клиента" type="number">
                <input required name="email" placeholder="E-mail клиента" type="email">
                <button name="customerSub" class="button button_submit"><span>сохранить</span></button>
                `;
            } else if (tName == 'order') {

                if (newFormElem.classList.contains('activeModalIMG')) {
                    addModalWin.lastElementChild.innerHTML = '';
                    newFormElem.classList.remove('activeModalIMG');
                }

                Parent.innerHTML = `
                <input required name="name" placeholder="Клиент (ФИО)" type="text">
                <textarea required name="products" placeholder="Товар(ы) через запятую" type="text"></textarea>
                <button name="orderSub" class="button button_submit"><span>сохранить</span></button>
                `;
            } else if (tName == 'product') {

                Parent.innerHTML = '';

                if (newFormElem.tagName == 'DIV') {

                    newFormElem.classList.add('activeModalIMG')

                    newFormElem.innerHTML = `
                        <form style="margin-top: 0px;" class="feed-form" name="requestForPostCatalogItem" method="post" enctype="multipart/form-data" action="/upload">
                            <div class="input-file-row">
                                <label class="input-file">
                                    <input type="file" name="file">
                                    <span>Выберите фото товара</span>
                                </label>
                                <div class="input-file-list"></div>
                            </div>

                            <label class="modalLabel" for="category">Выберите категорию товара:</label>
                            <select name="category">
                                <option value="fitness">Для фитнеса</option>
                                <option value="triathlon">Для триатлона</option>
                                <option value="running">Для бега</option>
                            </select>
                            <input required name="title" placeholder="Наименование товара (заголовок)" type="text">
                            
                            <input required name="price" placeholder="Цена" type="number">
                            <textarea required name="desc" placeholder="Описание товара" type="text"></textarea>

                            <input class="submitCatItData" name="productSub" type="submit" value="Submit">
                        </form>
                    `;

                    addModalWin.append(newFormElem);
                }
            }
        }
        $('[data-modal=editdata]').on('click', function() {
            $('.overlay, #editdata').fadeIn('slow');
        });
        $('.modal__close').on('click', function() {
            $('.overlay, #consultation, #thanks, #order, #modalError').fadeOut('slow');
        });
        addOrderBTN.addEventListener('click', () => {openAddingModal('order')});
        addCustomerBTN.addEventListener('click', () => {openAddingModal('customer')});

        let uploadImageForm;
        addProductBTN.addEventListener('click', () => {
            openAddingModal('product');
            if (document.querySelector('.input-file input[type=file]')) {
                let dt = new DataTransfer();
                $('.input-file input[type=file]').on('change', function () {
                    uploadImageForm = document.forms.requestForPostCatalogItem;

                    let $files_list = $(this).closest('.input-file').next();
                    $files_list.empty();
                
                    for ( let i = 0; i < this.files.length; i++ ){
                        let file = this.files.item(i);
                        dt.items.add(file);    
                
                        let reader = new FileReader();
                        reader.readAsDataURL(file);
                        reader.onloadend = function(){
                            let new_file_input = `
                            <div class="input-file-list-item">
                                <img max-width='100px' class="input-file-list-img" src="${reader.result}">
                                <span class="input-file-list-name">${file.name}</span>
                            </div>`;
                            $files_list.append(new_file_input); 
                        }
                    };
                    this.files = dt.files;
                });
            }
        });

        

        // функция открытия окна изменения компонента
        const modalAdd = document.querySelector('.overlay #editdata');
        let UpdateItemID = 0;
        let itemParentTable = '';

        function openModal(obj, tName) {
            $('.overlay, #updatedata').fadeIn('slow');
            modalAdd.style.cssText='display: none;';
            
            if (tName == 'customer') {
                UpdateForm.innerHTML = `
                <input required name="name" placeholder="ФИО клиента" type="text">
                <input required name="phone" placeholder="Телефон клиента" type="number">
                <input required name="email" placeholder="E-mail клиента" type="email">
                <button class="button button_submit"><span>сохранить</span></button>
                `;
                
                UpdateForm.elements.name.value = obj.name;
                UpdateForm.elements.email.value = obj.email;
                UpdateForm.elements.phone.value = obj.phone;
                
                UpdateItemID =  obj.id;
                itemParentTable = 'customer';
            } else if (tName == 'order') {
                UpdateForm.innerHTML = `
                <input required name="name" placeholder="Клиент (ФИО)" type="text">
                <textarea required name="products" placeholder="Товар(ы) через запятую" type="text"></textarea>
                <button class="button button_submit"><span>сохранить</span></button>
                `;
                
                UpdateForm.elements.name.value = obj.name;
                UpdateForm.elements.products.value = obj.products;
                
                UpdateItemID =  obj.id;   
                itemParentTable = 'order';
            }
        }

        // шаблонизация данных о товаре
        class RequestForProducts {
            static parent = document.querySelector('.products .ProductsTableDinamicBody')
            
            constructor(data) {
                this.productID = data.catalogItemID
                this.image = data.image;
                this.title = data.title;
                this.category = data.category;
                this.price = data.price;
                this.description = data.description;
            }
            static resetParent() {
                RequestForProducts.parent.innerHTML = '';
            }

            createActionBtn(type, fn) {
                const field = document.createElement('td');
                field.classList.add('TDbtn');
                const btn = document.createElement('button');
                btn.classList.add('button');
                if (type === 'edit') {
                    btn.setAttribute('data-edit', 'customer');
                    btn.classList.add('btnGreen');
                    btn.innerHTML = `<span>изменить запись</span>`;
                } else {
                    btn.setAttribute('data-del', 'customer');
                    btn.innerHTML = `<span>удалить запись</span>`;
                }
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    fn({id: this.productID,
                        title: this.title, 
                        image: this.image, 
                        category: this.category, 
                        price: this.price,
                        description: this.description,});
                })
                field.appendChild(btn);
                return field;
            }
            render() {
                let categoryRusName = '';

                switch (this.category) {
                    case 'fitness':
                        categoryRusName = 'Для фитнеса';
                        break;
                    case 'triathlon':
                        categoryRusName = 'Для триатлона';
                        break;
                    case 'running':
                        categoryRusName = 'Для бега';
                        break;
                }

                const element = document.createElement('tr');
                element.classList.add('parentSTR')
                element.innerHTML = `
                <td class="TDid" scope="row">${this.productID.slice(0,18)}...</td>
                <td class="TDItemC"><img width="120px" src="img/uploadedPrImg/${this.image}" alt="image"></td>
                <td class="TDItemC">${categoryRusName}</td>
                <td class="TDItemC">${this.title}</td>
                <td class="TDItemC">${this.price}</td>
                <td class="TDdesc">${this.description}</td>
                `;
                element.appendChild(this.createActionBtn('create', obj => deleteComponent(obj.id, 'product')))
                RequestForProducts.parent.append(element);
            }
        }

        // шаблонизация данных о заказе
        class RequestForOrders {
            static parent = document.querySelector('.orders .OrdersTableDinamicBody')
            
            constructor(data) {
                this.orderID = data.orderID;
                this.name = data.name;
                this.products = data.productArr;
                this.orderDate = data.createdAt;
            }
            static resetParent() {
                RequestForOrders.parent.innerHTML = '';
            }
            createActionBtn(type, fn) {
                const field = document.createElement('td');
                field.classList.add('TDbtn');
                const btn = document.createElement('button');
                btn.classList.add('button');
                if (type === 'edit') {
                    btn.setAttribute('data-edit', 'customer');
                    btn.classList.add('btnGreen');
                    btn.innerHTML = `<span>изменить запись</span>`;
                } else {
                    btn.setAttribute('data-del', 'customer');
                    btn.innerHTML = `<span>удалить запись</span>`;
                }
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    fn({id: this.orderID,
                        name: this.name, 
                        products: this.products, 
                        date: this.orderDate});
                })
                field.appendChild(btn);
                return field;
            }
            render() {
                const element = document.createElement('tr');
                element.classList.add('parentSTR')
                element.innerHTML = `
                <td class="TDid" scope="row">${this.orderID.slice(0,18)}...</td>
                <td class="TDname">${this.name}</td>
                <td>${this.products.replaceAll(",", ", ")}</td>
                <td>${this.orderDate}</td>
                `;
                element.appendChild(this.createActionBtn('edit', obj => openModal(obj, 'order')))
                element.appendChild(this.createActionBtn('create', obj => deleteComponent(obj.id, 'order')))
                RequestForOrders.parent.append(element);
            }
        }

        // шаблонизация данных о покупателе
        class RequestForCustomers {
            static parent = document.querySelector('.customers .CustomersTableDinamicBody')
            
            constructor(data) {
                this.customerID = data.customerID;
                this.name = data.name;
                this.phoneNum = data.phoneNum;
                this.email = data.email;
            }
            static resetParent() {
                RequestForCustomers.parent.innerHTML = '';
            }
            createActionBtn(type, fn) {
                const field = document.createElement('td');
                field.classList.add('TDbtn');
                const btn = document.createElement('button');
                btn.classList.add('button');
                if (type === 'edit') {
                    btn.setAttribute('data-edit', 'customer');
                    btn.classList.add('btnGreen');
                    btn.innerHTML = `<span>изменить запись</span>`;
                } else {
                    btn.setAttribute('data-del', 'customer');
                    btn.innerHTML = `<span>удалить запись</span>`;
                }
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    fn({id: this.customerID,
                        name: this.name, 
                        phone: this.phoneNum, 
                        email: this.email});
                })
                field.appendChild(btn);
                return field;
            }
            render() {
                const element = document.createElement('tr');
                element.classList.add('parentSTR')
                element.innerHTML = `
                <td class="TDid" scope="row">${this.customerID.slice(0,18)}...</td>
                <td class="TDname">${this.name}</td>
                <td>${this.phoneNum}</td>
                <td>${this.email}</td>
                `;
                element.appendChild(this.createActionBtn('edit', obj => openModal(obj, 'customer')))
                element.appendChild(this.createActionBtn('create', obj => deleteComponent(obj.id, 'customer')))
                RequestForCustomers.parent.append(element);
            }
        }

        // шаблонизация данных о заявке
        class RequestForConsultation {
            static parent = document.querySelector('.incomingMessage .tableDinamicBody')
            
            constructor(data) {
                this.reqID = data.requestID;
                this.name = data.name;
                this.phoneNum = data.phoneNum;
                this.email = data.email;
                this.productID = data.productID;
                this.categoryID = data.categoryID;
                this.parent = document.querySelector('.incomingMessage .tableDinamicBody');
            }
            static resetParent() {
                RequestForConsultation.parent.innerHTML = '';
            }
            createActionBtn(fn) {
                const field = document.createElement('td');
                field.classList.add('TDbtn');
                const btn = document.createElement('button');
                btn.classList.add('button');
                btn.setAttribute('data-del', 'request');
                btn.innerHTML = `<span>удалить запись</span>`;
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    fn(this.reqID);
                })
                field.appendChild(btn);
                return field;
            }
            render() {
                const element = document.createElement('tr');
                element.classList.add('parentSTR')

                element.innerHTML = `
                    <td class="TDid" scope="row">${this.reqID.slice(0,18)}...</td>
                    <td class="TDname">${this.name}</td>
                    <td>${this.phoneNum}</td>
                    <td>${this.email}</td>
                    <td class="TDid">${this.productID}</td>
                    <td class="TDid">${this.categoryID}</td>
                `;
                element.appendChild(this.createActionBtn(id => deleteComponent(id, 'request')))
                RequestForConsultation.parent.append(element);
            }
        }

        // функция отправки данных
        function fetchFormData(itemData) {
            fetch('/api/postData', {
                method: 'POST',
                headers: {'Content-type': 'application/json'},
                body: JSON.stringify({itemData})
            })
            .then(res => res.json())
            .then(async data => {
                postForm.reset()
                $('#editdata').fadeOut("fast")
                $('.overlay').fadeOut('fast');
                
                const customerData = await fetchData('/api/customerData');
                RequestForCustomers.resetParent()
                customerData.forEach(item => new RequestForCustomers(item).render())
                
                const orderData = await fetchData('/api/orderData');
                RequestForOrders.resetParent()
                orderData.forEach(item => new RequestForOrders(item).render())
                
            })
            .catch(err => console.error('error', err));
        }

        postForm.addEventListener('submit', (e) => {
            e.preventDefault();

            let itemData;

            if (postForm.elements.customerSub) {
                const name = postForm.elements.name.value, 
                    email = postForm.elements.email.value, 
                    phone = postForm.elements.phone.value;

                itemData = {
                    tName: 'customer',
                    name: name, 
                    phoneNum: phone, 
                    email: email 
                }

                fetchFormData(itemData)
            } else if (postForm.elements.orderSub) {
                const name = postForm.elements.name.value,
                    products = postForm.elements.products.value;

                const prodArr = products.replaceAll(" ", "").split(',');

                itemData = {
                    tName: 'order',
                    name: name, 
                    products: prodArr 
                }
                
                fetchFormData(itemData)
            } 
        })

        // функция отправки новых данных существующего элемента
        UpdateForm.addEventListener('submit', (e) => {
            e.preventDefault();

            console.log(itemParentTable);        

            let itemUpdateData = {};

            if (itemParentTable == 'customer') {
                const name = UpdateForm.elements.name.value, 
                    email = UpdateForm.elements.email.value, 
                    phone = UpdateForm.elements.phone.value;

                itemUpdateData = {
                    tName: itemParentTable,
                    id: UpdateItemID,
                    name: name, 
                    phoneNum: phone, 
                    email: email 
                }
            } else if (itemParentTable == 'order') {
                const name = UpdateForm.elements.name.value, 
                    products = UpdateForm.elements.products.value;

                itemUpdateData = {
                    tName: itemParentTable,
                    id: UpdateItemID,
                    name: name, 
                    products: products
                }
            }
        
            fetch('/api/itemUpdateData', {
                method: 'POST',
                headers: {'Content-type': 'application/json'},
                body: JSON.stringify({itemUpdateData})
            })
            .then(res => res.json())
            .then(async data => {
                UpdateForm.reset()
                $('#updatedata').fadeOut("fast")
                $('.overlay').fadeOut('fast');

                console.log(data);
                
                const customerData = await fetchData('/api/customerData')
                RequestForCustomers.resetParent();
                customerData.forEach(item => new RequestForCustomers(item).render())
                            
                const orderData = await fetchData('/api/orderData')
                RequestForOrders.resetParent();
                orderData.forEach(item => new RequestForOrders(item).render())
            })
            .catch(err => console.error('error', err));
        })

        const consultationData = await fetchData('/api/consultationData'),
              customerData = await fetchData('/api/customerData'),
              orderData = await fetchData('/api/orderData'),
              catalogItemData = await fetchData('/api/catalogItemData');

        consultationData.forEach((dataObj) => {
            new RequestForConsultation(dataObj).render();
        })
        customerData.forEach((dataObj) => {
            new RequestForCustomers(dataObj).render();
        })
        orderData.forEach((dataObj) => {
            new RequestForOrders(dataObj).render();
        })
        catalogItemData.forEach((dataObj) => {
            new RequestForProducts(dataObj).render();
        })
    }

    if(document.querySelector('.authBody')) {
        let jsonWtoken = localStorage.getItem('token');
        
        if (jsonWtoken) {
            fetch('/login', {
                method: "POST",
                body: JSON.stringify({jsonWtoken}),
                headers: {
                    "Content-Type": 'application/json'
                }
            }).then(res => {
                return res.json()
            }).then(res => {
                if (res.res == 'Добро пожаловать, администратор!') {
                    setTimeout(() => {
                        window.location.replace("http://localhost:3000/adminPage.html")
                    },4000)
                }
                setTimeout(() => {
                    return alert(`${ res.res }`)
                },1000)
            })
        }

        document.getElementById('regButton').addEventListener('click', () => {
            let nickname = document.getElementById('nickname').value
            let password = document.getElementById('password').value
        
            let body = {
                nickname,
                password
            }
        
            fetch('/login', {
                method: "POST",
                body: JSON.stringify(body),
                headers: {
                    "Content-Type": 'application/json'
                }
            }).then(response => {
                if(response.status == 404) {
                    return alert('Пользователь не существует')
                }
                if(response.status == 400) {
                    return alert('Неверный пароль')
                }
                return response.json()
            }).then(json => {
                if(json != undefined || json != null) {
                    localStorage.setItem('token', json.token)
                }
                return json
            }).then((tok) => {
                jsonWtoken = tok.token;
                fetch('/login', {
                    method: "POST",
                    body: JSON.stringify({jsonWtoken}),
                    headers: {
                        "Content-Type": 'application/json'
                    }
                }).then(res => {
                    return res.json()
                }).then(res => {
                    if (res.res == 'Добро пожаловать, администратор!') {
                        setTimeout(() => {
                            window.location.replace("http://localhost:3000/adminPage.html")
                        },4000)
                    }
                    setTimeout(() => {
                        return alert(`${ res.res }`)
                    },1000)
                })
                
            })
        })
    }
})
