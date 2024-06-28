document.addEventListener('DOMContentLoaded', function () {
    // Otel isimlerini almak için istek gönder
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
            hotelSelect.innerHTML = ''; // Önceki seçenekleri temizle
            data.forEach(hotel => {
                let option = document.createElement('option');
                option.value = hotel.name;
                option.textContent = hotel.name;
                hotelSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching hotels:', error));

    // Otel seçildiğinde oda seçeneklerini almak için istek gönder
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
                    if (!data || !Array.isArray(data.roomOptions)) {
                        throw new Error('Invalid JSON format');
                    }
                    const roomOptionSelect = document.getElementById('roomOption');
                    roomOptionSelect.innerHTML = ''; // Önceki seçenekleri temizle
                    data.roomOptions.forEach(roomOption => {
                        let option = document.createElement('option');
                        option.value = roomOption.roomName;
                        option.textContent = roomOption.roomName;
                        roomOptionSelect.appendChild(option);
                    });

                    // Oda tipi seçeneği için oda seçenekleri seçildiğinde odaları güncelle
                    roomOptionSelect.addEventListener('change', function () {
                        const selectedRoomOption = this.value;
                        const selectedRoom = data.roomOptions.find(ro => ro.roomName === selectedRoomOption);
                        const roomTypeSelect = document.getElementById('roomType');
                        roomTypeSelect.innerHTML = ''; // Önceki seçenekleri temizle
                        selectedRoom.roomTypes.forEach(roomType => {
                            let option = document.createElement('option');
                            option.value = roomType.name;
                            option.textContent = `${roomType.name} - ${roomType.price} TL`;
                            roomTypeSelect.appendChild(option);
                        });
                    });
                })
                .catch(error => console.error('Error fetching hotel room info:', error));
        }
    });

    // Fiyat hesaplama işlemi
    document.getElementById('calculatePriceButton').addEventListener('click', function () {
        const hotelName = document.getElementById('hotel').value;
        const roomOption = document.getElementById('roomOption').value;
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

        const startDate = new Date(document.getElementById('startDate').value);
        const endDate = new Date(document.getElementById('endDate').value);

        if (hotelName && roomOption && roomType && !isNaN(adults) && childrenAges.length === childrenCount && startDate && endDate) {
            const request = {
                hotelName: hotelName,
                roomOption: roomOption,
                roomType: roomType,
                adults: adults,
                childrenAges: childrenAges,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString()
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

    // Dinamik çocuk yaşları giriş alanları oluşturma
    document.getElementById('childrenCount').addEventListener('change', function () {
        const childrenCount = parseInt(this.value);
        const childrenAgesDiv = document.getElementById('childrenAges');
        childrenAgesDiv.innerHTML = ''; // Önceki alanları temizle

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
document.addEventListener('DOMContentLoaded', function () {
    // Otel isimlerini almak için istek gönder
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
            hotelSelect.innerHTML = ''; // Önceki seçenekleri temizle
            data.forEach(hotel => {
                let option = document.createElement('option');
                option.value = hotel.name;
                option.textContent = hotel.name;
                hotelSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching hotels:', error));

    // Otel seçildiğinde oda seçeneklerini almak için istek gönder
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
                    if (!data || !Array.isArray(data.roomOptions)) {
                        throw new Error('Invalid JSON format');
                    }
                    const roomOptionSelect = document.getElementById('roomOption');
                    roomOptionSelect.innerHTML = ''; // Önceki seçenekleri temizle
                    data.roomOptions.forEach(roomOption => {
                        let option = document.createElement('option');
                        option.value = roomOption.roomName;
                        option.textContent = roomOption.roomName;
                        roomOptionSelect.appendChild(option);
                    });

                    // Oda tipi seçeneği için oda seçenekleri seçildiğinde odaları güncelle
                    roomOptionSelect.addEventListener('change', function () {
                        const selectedRoomOption = this.value;
                        const selectedRoom = data.roomOptions.find(ro => ro.roomName === selectedRoomOption);
                        const roomTypeSelect = document.getElementById('roomType');
                        roomTypeSelect.innerHTML = ''; // Önceki seçenekleri temizle
                        selectedRoom.roomTypes.forEach(roomType => {
                            let option = document.createElement('option');
                            option.value = roomType.name;
                            option.textContent = `${roomType.name} - ${roomType.price} TL`;
                            roomTypeSelect.appendChild(option);
                        });
                    });
                })
                .catch(error => console.error('Error fetching hotel room info:', error));
        }
    });

    // Fiyat hesaplama işlemi
    document.getElementById('calculatePriceButton').addEventListener('click', function () {
        const hotelName = document.getElementById('hotel').value;
        const roomOption = document.getElementById('roomOption').value;
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

        const startDate = new Date(document.getElementById('startDate').value);
        const endDate = new Date(document.getElementById('endDate').value);

        if (hotelName && roomOption && roomType && !isNaN(adults) && childrenAges.length === childrenCount && startDate && endDate) {
            const request = {
                hotelName: hotelName,
                roomOption: roomOption,
                roomType: roomType,
                adults: adults,
                childrenAges: childrenAges,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString()
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

    // Dinamik çocuk yaşları giriş alanları oluşturma
    document.getElementById('childrenCount').addEventListener('change', function () {
        const childrenCount = parseInt(this.value);
        const childrenAgesDiv = document.getElementById('childrenAges');
        childrenAgesDiv.innerHTML = ''; // Önceki alanları temizle

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
