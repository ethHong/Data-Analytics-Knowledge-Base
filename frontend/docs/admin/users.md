---
title: User Management
---

<!-- User Management -->
<div class="admin-container">
    <h1>User Management</h1>
    
    <!-- User List -->
    <div class="card">
        <div class="card-header">
            <h2>Users</h2>
            <button class="btn btn-primary" onclick="showAddUserModal()">Add User</button>
        </div>
        <div class="user-list" id="userList">
            Loading users...
        </div>
    </div>
</div>

<!-- Add User Modal -->
<div class="modal" id="addUserModal">
    <div class="modal-content">
        <h2>Add User</h2>
        <form id="addUserForm">
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" required>
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
            <div class="button-group">
                <button type="submit" class="btn btn-primary">Add User</button>
                <button type="button" class="btn btn-secondary" onclick="hideAddUserModal()">Cancel</button>
            </div>
        </form>
    </div>
</div>

<!-- Edit User Modal -->
<div class="modal" id="editUserModal">
    <div class="modal-content">
        <h2>Edit User</h2>
        <form id="editUserForm">
            <input type="hidden" id="editUserId">
            <div class="form-group">
                <label for="editEmail">Email</label>
                <input type="email" id="editEmail" required>
            </div>
            <div class="form-group">
                <label for="editRole">Role</label>
                <select id="editRole" required>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>
            </div>
            <div class="button-group">
                <button type="submit" class="btn btn-primary">Save Changes</button>
                <button type="button" class="btn btn-secondary" onclick="hideEditUserModal()">Cancel</button>
            </div>
        </form>
    </div>
</div>

<style>
.admin-container {
    padding: 20px;
}

.card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    margin-bottom: 20px;
}

.card-header {
    padding: 20px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.user-list {
    padding: 20px;
}

.user-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    border-bottom: 1px solid #eee;
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
    background: rgba(0,0,0,0.5);
    align-items: center;
    justify-content: center;
}

.modal-content {
    background: white;
    padding: 20px;
    border-radius: 8px;
    width: 100%;
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

.button-group {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    margin-top: 20px;
}

.btn {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.btn-primary {
    background: #1a73e8;
    color: white;
}

.btn-secondary {
    background: #f1f3f4;
    color: #1a73e8;
}

.btn-danger {
    background: #dc3545;
    color: white;
}
</style>

<script>
let currentUser = null;

async function loadUsers() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '../auth/login.html';
        return;
    }

    try {
        const response = await fetch('http://34.82.192.6:8000/api/users', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load users');
        }

        const data = await response.json();
        const userList = document.getElementById('userList');
        userList.innerHTML = '';

        data.users.forEach(user => {
            const userItem = document.createElement('div');
            userItem.className = 'user-item';
            userItem.innerHTML = `
                <div class="user-info">
                    <div>${user.email}</div>
                    <div><small>Role: ${user.role}</small></div>
                </div>
                <div class="user-actions">
                    <button class="btn btn-secondary" onclick="editUser('${user.id}', '${user.email}', '${user.role}')">Edit</button>
                    <button class="btn btn-danger" onclick="deleteUser('${user.id}')">Delete</button>
                </div>
            `;
            userList.appendChild(userItem);
        });
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('userList').innerHTML = 'Failed to load users';
    }
}

function showAddUserModal() {
    document.getElementById('addUserModal').style.display = 'flex';
}

function hideAddUserModal() {
    document.getElementById('addUserModal').style.display = 'none';
    document.getElementById('addUserForm').reset();
}

function showEditUserModal() {
    document.getElementById('editUserModal').style.display = 'flex';
}

function hideEditUserModal() {
    document.getElementById('editUserModal').style.display = 'none';
    document.getElementById('editUserForm').reset();
}

function editUser(id, email, role) {
    document.getElementById('editUserId').value = id;
    document.getElementById('editEmail').value = email;
    document.getElementById('editRole').value = role;
    showEditUserModal();
}

async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) {
        return;
    }

    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`http://34.82.192.6:8000/api/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete user');
        }

        loadUsers();
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to delete user');
    }
}

document.getElementById('addUserForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch('http://34.82.192.6:8000/api/users', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
                role: document.getElementById('role').value
            })
        });

        if (!response.ok) {
            throw new Error('Failed to add user');
        }

        hideAddUserModal();
        loadUsers();
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to add user');
    }
});

document.getElementById('editUserForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const userId = document.getElementById('editUserId').value;
    
    try {
        const response = await fetch(`http://34.82.192.6:8000/api/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: document.getElementById('editEmail').value,
                role: document.getElementById('editRole').value
            })
        });

        if (!response.ok) {
            throw new Error('Failed to update user');
        }

        hideEditUserModal();
        loadUsers();
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to update user');
    }
});

// Check if user is admin and load users
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '../auth/login.html';
        return;
    }

    try {
        const response = await fetch('http://34.82.192.6:8000/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to get user info');
        }

        const user = await response.json();
        currentUser = user;

        if (user.role !== 'admin') {
            window.location.href = '../';
            return;
        }

        loadUsers();
    } catch (error) {
        console.error('Error:', error);
        window.location.href = '../auth/login.html';
    }
});
</script> 