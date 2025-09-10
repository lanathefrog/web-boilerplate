document.addEventListener('DOMContentLoaded', () => {


    const addTeacherBtns = document.querySelectorAll('.add-teacher');
    const addModal = document.getElementById('addModal');
    const viewModal = document.getElementById('viewModal');
    const addCloseBtn = document.querySelector('.add-close');
    const viewCloseBtn = document.querySelector('.view-close');

    addTeacherBtns.forEach(button => {
        button.addEventListener('click', () => {
            addModal.style.display = 'block';
        });
    });

    addCloseBtn.addEventListener('click', () => {
        addModal.style.display = 'none';
    });

    viewCloseBtn.addEventListener('click', () => {
        viewModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === addModal) {
            addModal.style.display = 'none';
        }
        if (event.target === viewModal) {
            viewModal.style.display = 'none';
        }
    });


    const teacherCards = document.querySelectorAll('.teacher-card');
    const viewPhoto = document.getElementById('teacherPhoto');
    const viewName = document.getElementById('teacherName');
    const viewSpeciality = document.getElementById('teacherSpeciality');
    const viewLocation = document.getElementById('teacherLocation');
    const viewAgeGender = document.getElementById('teacherAgeGender');
    const viewEmail = document.getElementById('teacherEmail');
    const viewPhone = document.getElementById('teacherPhone');
    const viewNotes = document.getElementById('teacherNotes');

    teacherCards.forEach(card => {
        const avatarWrapper = card.querySelector('.avatar-wrapper');
        const nameElement = card.querySelector('h2');

        card.addEventListener('click', () => {
            let imgEl = card.querySelector('.avatar-wrapper img');
            let imgSrc = '';
            if (imgEl && imgEl.src) {
                imgSrc = imgEl.src;
            } else {
                imgSrc = 'images/white.png';
            }

            const name = nameElement.innerText.replace('\n', ' ');
            const speciality = card.querySelector('.field').innerText;
            const country = card.querySelector('.country').innerText;

            const age = '35';
            const gender = 'Male';
            const email = 'lalala@iwannakms.com';
            const phone = '+1234567890';
            const notes = 'This is a great teacher with a lot of experience.';

            viewPhoto.src = imgSrc;
            viewName.textContent = name;
            viewSpeciality.textContent = speciality;
            viewLocation.textContent = country;
            viewAgeGender.textContent = `${age}, ${gender}`;
            viewEmail.textContent = email;
            viewPhone.textContent = phone;
            viewNotes.textContent = notes;

            viewModal.style.display = 'block';
        });

        nameElement.addEventListener('click', (e) => {
            e.stopPropagation();
            card.click();
        });
    });



    const addTeacherForm = document.getElementById('addTeacherForm');

    addTeacherForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const speciality = document.getElementById('speciality').value;
        const country = document.getElementById('country').value;
        const city = document.getElementById('city').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const dob = document.getElementById('dob').value;
        const sex = document.querySelector('input[name="sex"]:checked').value;
        const bgcolor = document.getElementById('bgcolor').value;
        const notes = document.getElementById('notes').value;

        console.log({
            name,
            speciality,
            country,
            city,
            email,
            phone,
            dob,
            sex,
            bgcolor,
            notes
        });

        alert(`Teacher ${name} has been added successfully!`);

        addModal.style.display = 'none';
        addTeacherForm.reset();
    });



});