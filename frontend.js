document.addEventListener('DOMContentLoaded', async() => {
    const apiUrl = 'http://localhost:3001/api';
    const inventoryTable = document.getElementById('inventoryTable').querySelector('tbody');
    // Fetch user session data
    /*try
    {
        const response = await fetch('http://localhost:30001/api/session');
        const sessionData = await response.json();
        console.log(sessionData);

        if (sessionData.user) {
            window.location.href = 'index.html';
            // User is logged in
            document.getElementById('welcomeMessage').textContent = `Welcome, ${sessionData.user.email}`;

            // If the user is an admin, show the "Add Item" button
            if (sessionData.user.role === 'admin')
            {
                document.getElementById('addItemButton').style.display = 'block';
            }
        }
        else
        {
            // Redirect to login page if not logged in
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('Error fetching session data:', error);
        window.location.href = 'login.html';
    }
    */

    // Fetch and display inventory items
    const loadInventory = async () => {
        try {
            const response = await fetch(`${apiUrl}/inventory`);
            const items = await response.json();
            inventoryTable.innerHTML = '';
            items.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>${item.price}</td>
                    <td>
                        <button
                        class="btn btn-success"
                        onclick="editItem(this)" 
                            data-id=${item.id} 
                            data-name=${item.name}
                            data-quantity=${item.quantity}
                            data-price=${item.price}>
                            Edit
                        </button>
                        <button class="btn btn-danger" onclick="deleteItem(${item.id})">Delete</button>
                    </td>
                `;
                inventoryTable.appendChild(row);
            });
            // Populate the form with the extracted data
            document.getElementById('itemId').value = "";
            document.getElementById('itemName').value = "";
            document.getElementById('itemQuantity').value = "";
            document.getElementById('itemPrice').value = "";

            // Optionally, switch the form's button to indicate "Add"
            document.getElementById('updateItem').style.display = 'none';
        } catch (error) {
            console.error('Error fetching inventory:', error);
        }
    };
    // Add new item
    document.getElementById('addItem').addEventListener('click', async () => {
        if (document.getElementById('itemId').value == "")
            {
                const name = document.getElementById('itemName').value;
                const quantity = document.getElementById('itemQuantity').value;
                const price = document.getElementById('itemPrice').value;

                try {
                    await fetch(`${apiUrl}/inventory`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name, quantity, price })
                    });
                    window.location.reload();
                }
                catch (error) {
                    console.error('Error adding item:', error);
                }
            }
            
            
        });


    loadInventory();
});

document.getElementById('updateItem').addEventListener('click', async () => {   
    //if (document.getElementById('addItem').textContent === 'Update Item')
    //{
        const id = document.getElementById('itemId').value; // Hidden field for item ID
        const name = document.getElementById('itemName').value;
        const quantity = document.getElementById('itemQuantity').value;
        const price = document.getElementById('itemPrice').value;
        console.log(id);
        const method = 'PUT'; 
        const url = `http://localhost:3001/api/inventory/${id}`;

        await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, quantity, price })
        })
            .then(response => {
                if (!response.ok) throw new Error('Failed to save item');
                alert('Item updated successfully' );
                window.location.reload();
            })
            .catch(error => console.error(error));
   // }
});


function deleteItem(id)
{
    fetch(`http://localhost:3001/api/inventory/${id}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to delete item');
        alert('Item deleted successfully');
        window.location.reload(); 
    })
    .catch(error => console.error(error));
}

function editItem(button)
{
    // Extract data from button attributes
    const id = button.getAttribute('data-id');
    const name = button.getAttribute('data-name');
    const quantity = button.getAttribute('data-quantity');
    const price = button.getAttribute('data-price');

    // Populate the form with the extracted data
    document.getElementById('itemId').value = id; 
    document.getElementById('itemName').value = name;
    document.getElementById('itemQuantity').value = quantity;
    document.getElementById('itemPrice').value = price;

    // Optionally, switch the form's button to indicate "Update"
    document.getElementById('addItem').style.display = 'none';
    document.getElementById('updateItem').style.display = 'block';
}