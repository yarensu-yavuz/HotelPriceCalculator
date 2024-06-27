document.addEventListener('DOMContentLoaded', function () {

    fetch('/Hotel/GetHotels')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (!Array.isArray(data)) {
                throw new Error('Invalid JSON format');
            }
            const hotelSelect = document.getElementById('hotel');
            hotelSelect.innerHTML = ''; 
            data.forEach(hotel => {
                let option = document.createElement('option');
                option.value = hotel.name;
                option.textContent = hotel.name;
                hotelSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching hotels:', error));

    document.getElementById('hotel').addEventListener('change', function () {
        const hotelName = this.value;
        if (hotelName) {
            fetch(`/Hotel/GetHotelRoomInfo?hotelName=${encodeURIComponent(hotelName)}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    if (!data || !Array.isArray(data.roomTypes)) {
                        throw new Error('Invalid JSON format');
                    }
                    const roomTypeSelect = document.getElementById('roomType');
                    roomTypeSelect.innerHTML = ''; 
                    data.roomTypes.forEach(roomType => {
                        let option = document.createElement('option');
                        option.value = roomType.name;
                        option.textContent = `${roomType.name} - ${roomType.price} TL`;
                        roomTypeSelect.appendChild(option);
                    });
                })
                .catch(error => console.error('Error fetching hotel room info:', error));
        }
    });

    // Fiyat hesaplama işlemi
    document.getElementById('calculatePriceButton').addEventListener('click', function () {
        const hotelName = document.getElementById('hotel').value;
        const roomType = document.getElementById('roomType').value;
        const adults = parseInt(document.getElementById('adults').value);
        const childrenCount = parseInt(document.getElementById('childrenCount').value);
        const childrenAges = [];

        for (let i = 1; i <= childrenCount; i++) {
            const age = parseInt(document.getElementById(`childAge${i}`).value);
            if (!isNaN(age)) {
                childrenAges.push(age);
            }
        }

        if (hotelName && roomType && !isNaN(adults) && childrenAges.length === childrenCount) {
            const request = {
                hotelName: hotelName,
                roomType: roomType,
                adults: adults,
                childrenAges: childrenAges
            };

            fetch('/Hotel/CalculatePrice', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(request)
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(totalPrice => {
                    document.getElementById('totalPrice').textContent = `Toplam Fiyat: ${totalPrice} TL`;
                })
                .catch(error => console.error('Error calculating price:', error));
        } else {
            alert('Lütfen tüm alanları doldurun ve geçerli değerler girin.');
        }
    });


    document.getElementById('childrenCount').addEventListener('change', function () {
        const childrenCount = parseInt(this.value);
        const childrenAgesDiv = document.getElementById('childrenAges');
        childrenAgesDiv.innerHTML = ''; 

        for (let i = 1; i <= childrenCount; i++) {
            const label = document.createElement('label');
            label.for = `childAge${i}`;
            label.textContent = `Çocuk ${i} Yaşı:`;

            const input = document.createElement('input');
            input.type = 'number';
            input.id = `childAge${i}`;
            input.min = '0';

            childrenAgesDiv.appendChild(label);
            childrenAgesDiv.appendChild(input);
            childrenAgesDiv.appendChild(document.createElement('br'));
        }
    });
});
