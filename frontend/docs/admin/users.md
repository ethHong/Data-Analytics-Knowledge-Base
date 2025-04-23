---
title: User Management
---

<div class="admin-container">
    <h1>User Management</h1>
    
    <div class="user-list-container">
        <h2>Users</h2>
        <div id="user-list"></div>
        <button id="add-user-btn" class="btn btn-primary">Add User</button>
    </div>

    <!-- Add User Modal -->
    <div id="add-user-modal" class="modal">
        <div class="modal-content">
            <h2>Add New User</h2>
            <form id="add-user-form">
                <div class="form-group">
                    <label for="email">Email (Anderson Email Only)</label>
                    <input type="email" id="email" required pattern=".*@anderson\.ucla\.edu$">
                </div>
                <div class="form-group">
                    <label for="username">Username</label>
                    <input type="text" id="username" required>
                </div>
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" required>
                </div>
                <div class="form-group">
                    <label for="role">Role</label>
                    <select id="role" required>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <div class="modal-buttons">
                    <button type="submit" class="btn btn-primary">Add User</button>
                    <button type="button" class="btn btn-secondary" onclick="closeModal('add-user-modal')">Cancel</button>
                </div>
            </form>
        </div>
    </div>
</div>

<style>
.admin-container {
    padding: 20px;
}

.user-list-container {
    margin-top: 20px;
}

.user-card {
    border: 1px solid #ddd;
    padding: 15px;
    margin-bottom: 10px;
    border-radius: 4px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.user-info {
    flex-grow: 1;
}

.user-actions {
    display: flex;
    gap: 10px;
}

.modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.5);
    z-index: 1000;
}

.modal-content {
    background-color: white;
    margin: 15% auto;
    padding: 20px;
    border-radius: 5px;
    width: 80%;
    max-width: 500px;
}

.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
}

.form-group input,
.form-group select {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.modal-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
}
</style>

<script>
document.addEventListener('DOMContentLoaded', () => {
    loadUsers();
    setupEventListeners();
});

async function loadUsers() {
    try {
        const response = await fetch('http://34.82.192.6:8000/api/users/', {
            credentials: 'include'
        });
        const users = await response.json();
        displayUsers(users);
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

function displayUsers(users) {
    const userList = document.getElementById('user-list');
    userList.innerHTML = users.map(user => `
        <div class="user-card">
            <div class="user-info">
                <strong>${user.username}</strong> (${user.email})
                <br>
                Role: ${user.role}
                <br>
                Status: ${user.is_verified ? 'Verified' : 'Pending Verification'}
            </div>
            <div class="user-actions">
                <button onclick="deleteUser('${user.id}')" class="btn btn-danger">Delete</button>
            </div>
        </div>
    `).join('');
}

function setupEventListeners() {
    const addUserBtn = document.getElementById('add-user-btn');
    const addUserForm = document.getElementById('add-user-form');
    
    addUserBtn.addEventListener('click', () => {
        document.getElementById('add-user-modal').style.display = 'block';
    });
    
    addUserForm.addEventListener('submit', handleAddUser);
}

async function handleAddUser(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    
    if (!email.endsWith('@anderson.ucla.edu')) {
        alert('Only Anderson email addresses are allowed.');
        return;
    }
    
    try {
        const response = await fetch('http://34.82.192.6:8000/api/users/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                username,
                password,
                role
            }),
            credentials: 'include'
        });
        
        if (response.ok) {
            closeModal('add-user-modal');
            loadUsers();
            document.getElementById('add-user-form').reset();
        } else {
            const error = await response.text();
            alert('Failed to add user: ' + error);
        }
    } catch (error) {
        console.error('Error adding user:', error);
        alert('Failed to add user: Network error');
    }
}

async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) {
        return;
    }
    
    try {
        const response = await fetch(`http://34.82.192.6:8000/api/users/${userId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        if (response.ok) {
            loadUsers();
        } else {
            const error = await response.text();
            alert('Failed to delete user: ' + error);
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user: Network error');
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}
</script> 