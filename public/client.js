window.addEventListener('DOMContentLoaded', () => {

    const consultationForm = document.forms.requestForConsultation;

    consultationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = consultationForm.elements.name.value, 
                email = consultationForm.elements.email.value, 
                phone = consultationForm.elements.phone.value;

        let consultationData = {
            name: name, 
            phoneNum: phone, 
            email: email 
        }
    
        fetch('/api/consultationData', {
            method: 'POST',
            headers: {'Content-type': 'application/json'},
            body: JSON.stringify({consultationData})
        })
        .then(res => res.json())
        .then(data => {
            console.log(data.echo);
            
            consultationForm.reset()
            $('#consultation, #order, #modalError').fadeOut("fast")
            $('.overlay, #thanks').fadeIn('slow')
        })
        .catch(err => console.error('error', err));
    })
})