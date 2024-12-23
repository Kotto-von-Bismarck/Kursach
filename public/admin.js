window.addEventListener('DOMContentLoaded', () => {

    // общая функция запроса данных
    const constructComponent = function(url, constructorName) {
        const getData = async (url) => {
            const res = await fetch(url, {
                method: 'GET',
                headers: {'Content-type': 'application/json'}
            })
            if(!res.ok) {
                alert('не удалось загрузить контент');
            }
            return await res.json();
        };

        getData(url).then(data => {
            console.log(data);
            
            data.forEach((dataObj) => {
                new constructorName (dataObj).render();
            });
        });
    }

    // шаблонизация данных о заказе
    class RequestForConsultation {
        constructor(data) {
            this.reqID = data.requestID;
            this.name = data.name;
            this.phoneNum = data.phoneNum;
            this.email = data.email;
            this.productID = data.productID;
            this.categoryID = data.categoryID;
            this.parent = document.querySelector('.incomingMessage .tableDinamicBody');
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
                <td class="TDbtn">
                    <button class="button DELETE" onclick="deleteComponent()">
                        <span>удалить запись</span>
                    </button>
                </td>
            `;
            this.parent.append(element);
        }
    }

    if (document.querySelector('.adminPage')) {
        constructComponent('/api/consultationData', RequestForConsultation);
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
