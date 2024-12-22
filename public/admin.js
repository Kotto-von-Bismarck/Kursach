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

    constructComponent('/api/consultationData', RequestForConsultation);
})

// const btnDELETE = document.querySelectorAll('.DELETE');

const consultationRequestStr = document.querySelector('.tableDinamicBody');

consultationRequestStr.addEventListener('click', (event) => {
    if (event.target && event.target.className == 'DELETE') {
        console.log(event.target);
    }
})


// btn.addEventListener('click', (e) => {
//     // if (btn === e.target) {
//         // console.log(btn.parentElement.parentElement.firstChild.innerHTML);
//         console.log('btn');
//     // }
// })