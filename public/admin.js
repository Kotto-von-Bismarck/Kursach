window.addEventListener('DOMContentLoaded',async () => {

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
          UpdateForm = document.forms.requestForUpdateData

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
            console.log('request');
            
            const data = await fetchData('/api/consultationData')
            RequestForConsultation.resetParent();
            data.forEach(item => new RequestForConsultation(item).render())
        }
    }

    // функция изменения компонента

    const modalAdd = document.querySelector('.overlay #editdata');

    let UpdateCustomerID = 0;

    function openCustomerModal(obj) {
        $('.overlay, #updatedata').fadeIn('slow');
        modalAdd.style.cssText='display: none;';
        
        UpdateForm.elements.name.value = obj.name;
        UpdateForm.elements.email.value = obj.email;
        UpdateForm.elements.phone.value = obj.phone;
        
        UpdateCustomerID =  obj.id;
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
            <td class="TDid" scope="row">${this.customerID}</td>
            <td class="TDname">${this.name}</td>
            <td>${this.phoneNum}</td>
            <td>${this.email}</td>
            `;
            element.appendChild(this.createActionBtn('edit', obj => openCustomerModal(obj)))
            element.appendChild(this.createActionBtn('create', obj => deleteComponent(obj.id, 'customer')))
            RequestForCustomers.parent.append(element);
        }
    }

    // шаблонизация данных о заказе
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
                <td class="TDid" scope="row">${this.reqID}</td>
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

    if (document.querySelector('.adminPage')) {
        const consultationData = await fetchData('/api/consultationData');
        const customerData = await fetchData('/api/customerData');
        consultationData.forEach((dataObj) => {
            new RequestForConsultation(dataObj).render();
        })
        customerData.forEach((dataObj) => {
            new RequestForCustomers(dataObj).render();
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

    // функция отправки данных
    postForm.addEventListener('submit', (e) => {
        e.preventDefault();

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
                
                // const res = await fetchData('/api/customerData');
                // RequestForCustomers.resetParent()
                // res.forEach(item => new RequestForCustomers(item).render())
                
                const res = await fetchData('/api/orderData');
                RequestForCustomers.resetParent()
                res.forEach(item => new RequestForCustomers(item).render())

                res.forEach(item => console.log(item.createdAt));
                
            })
            .catch(err => console.error('error', err));
        }

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

            console.log(itemData);
            
            fetchFormData(itemData)
        }
    })

    // функция отправки данных существующего клиента
    UpdateForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = UpdateForm.elements.name.value, 
              email = UpdateForm.elements.email.value, 
              phone = UpdateForm.elements.phone.value;

        let customerUpdateData = {
            id: UpdateCustomerID,
            name: name, 
            phoneNum: phone, 
            email: email 
        }
    
        fetch('/api/customerUpdateData', {
            method: 'POST',
            headers: {'Content-type': 'application/json'},
            body: JSON.stringify({customerUpdateData})
        })
        .then(res => res.json())

        .then(async data => {
            UpdateForm.reset()
            $('#updatedata').fadeOut("fast")
            $('.overlay').fadeOut('fast');

            console.log(data);
            
            const res = await fetchData('/api/customerData');
            console.log(res);
            

            RequestForCustomers.resetParent()
            res.forEach(item => new RequestForCustomers(item).render())
        })
        .catch(err => console.error('error', err));
    })
})
