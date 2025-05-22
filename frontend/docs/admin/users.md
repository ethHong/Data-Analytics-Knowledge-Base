---
title: User Management
---
category_specifier : "admin"
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
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.replace('/auth/login.html');
            return;
        }

        const response = await fetch(`${API_BASE_URL}/api/users`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        if (response.status === 401) {
            window.location.replace('/auth/login.html');
            return;
        }

        if (response.status === 403) {
            window.location.replace('/index.html');
            return;
        }

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const users = await response.json();
        displayUsers(users);
    } catch (error) {
        console.error('Error loading users:', error);
        displayError('Failed to load users. Please try again later.');
    }
}

function showAddUserModal() {
    document.getElementById('addUserModal').style.display = 'flex';
}

function hideAddUserModal() {
    document.getElementById('addUserModal').style.display = 'none';
    document.getElementById('addUserForm').reset();
}

function showEditUserModal(user) {
    const form = document.getElementById('editUserForm');
    form.dataset.userId = user.id;
    form.querySelector('[name="email"]').value = user.email;
    form.querySelector('[name="role"]').value = user.role;
    
    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('editUserModal'));
    modal.show();
}

function hideEditUserModal() {
    document.getElementById('editUserModal').style.display = 'none';
    document.getElementById('editUserForm').reset();
}

function displayUsers(data) {
    const userList = document.getElementById('userList');
    userList.innerHTML = '';

    // The API returns an object with a users array
    data.users.forEach(user => {
        const userItem = document.createElement('div');
        userItem.className = 'user-item';
        
        const userInfo = document.createElement('div');
        userInfo.className = 'user-info';
        userInfo.innerHTML = `
            <strong>${user.email}</strong>
            <span>(${user.role})</span>
        `;
        
        const userActions = document.createElement('div');
        userActions.className = 'user-actions';
        
        const editButton = document.createElement('button');
        editButton.className = 'btn btn-secondary';
        editButton.textContent = 'Edit';
        editButton.onclick = () => showEditUserModal(user);
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn btn-danger';
        deleteButton.textContent = 'Delete';
        
        // Prevent self-deletion
        if (user.email === currentUser.email) {
            deleteButton.disabled = true;
            deleteButton.title = 'Cannot delete your own account';
            deleteButton.style.opacity = '0.5';
        } else {
            deleteButton.onclick = () => deleteUser(user.id);
        }
        
        userActions.appendChild(editButton);
        userActions.appendChild(deleteButton);
        
        userItem.appendChild(userInfo);
        userItem.appendChild(userActions);
        userList.appendChild(userItem);
    });
}

function displayError(message) {
    const userList = document.getElementById('userList');
    userList.innerHTML = `<div class="alert alert-danger">${message}</div>`;
}

async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) {
        return;
    }

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.replace('/auth/login.html');
            return;
        }

        const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 401) {
            window.location.replace('/auth/login.html');
            return;
        }

        if (response.status === 403) {
            window.location.replace('/index.html');
            return;
        }

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        // Reload the user list
        await loadUsers();
    } catch (error) {
        console.error('Error deleting user:', error);
        displayError('Failed to delete user. Please try again later.');
    }
}

async function updateUser(userId, userData) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.replace('/auth/login.html');
            return;
        }

        const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (response.status === 401) {
            window.location.replace('/auth/login.html');
            return;
        }

        if (response.status === 403) {
            window.location.replace('/index.html');
            return;
        }

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        // Reload the user list
        await loadUsers();
    } catch (error) {
        console.error('Error updating user:', error);
        displayError('Failed to update user. Please try again later.');
    }
}

async function createUser(userData) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.replace('/auth/login.html');
            return;
        }

        const response = await fetch(`${API_BASE_URL}/api/users`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (response.status === 401) {
            window.location.replace('/auth/login.html');
            return;
        }

        if (response.status === 403) {
            window.location.replace('/index.html');
            return;
        }

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || `Server error: ${response.status}`);
        }

        // Close the modal and reload users
        const modal = bootstrap.Modal.getInstance(document.getElementById('addUserModal'));
        modal.hide();
        document.getElementById('addUserForm').reset();
        await loadUsers();
    } catch (error) {
        console.error('Error creating user:', error);
        const errorElement = document.getElementById('addUserError');
        errorElement.textContent = error.message || 'Failed to create user. Please try again later.';
        errorElement.style.display = 'block';
    }
}

// Event listeners for forms
document.getElementById('addUserForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const userData = {
        email: form.querySelector('[name="email"]').value,
        password: form.querySelector('[name="password"]').value,
        role: form.querySelector('[name="role"]').value
    };
    await createUser(userData);
});

document.getElementById('editUserForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const userId = form.dataset.userId;
    const userData = {
        email: form.querySelector('[name="email"]').value,
        role: form.querySelector('[name="role"]').value
    };
    
    // If password field exists and has a value, include it
    const passwordField = form.querySelector('[name="password"]');
    if (passwordField && passwordField.value.trim()) {
        userData.password = passwordField.value;
    }
    
    await updateUser(userId, userData);
    
    // Close the modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('editUserModal'));
    modal.hide();
});

// Clear error messages when modals are hidden
document.getElementById('addUserModal').addEventListener('hidden.bs.modal', () => {
    document.getElementById('addUserError').style.display = 'none';
    document.getElementById('addUserForm').reset();
});

document.getElementById('editUserModal').addEventListener('hidden.bs.modal', () => {
    document.getElementById('editUserError').style.display = 'none';
    document.getElementById('editUserForm').reset();
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

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    loadUsers();
});
</script> 