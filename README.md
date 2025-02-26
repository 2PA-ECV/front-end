Ip para acceder a la web:
http://20.90.161.106/

# Manual de Usuario

## 1. Acceso a la Máquina Virtual (VM)

- **Potencia de la VM:** Standard B1s (1 vCPU, 1 GiB de RAM)

- **Nombre de la VM:** `ecv-vm`
- **Sistema Operativo:** Ubuntu 24.04
- **Dirección IP Pública:** `20.90.161.106`
- **Conexión SSH:**
  ```bash
  ssh -i "key.pem" azureuser@20.90.161.106
  ```

## 2. Conexión a la Base de Datos

- **Tipo de Base de Datos:** MySQL
- **Host/IP:** `20.90.161.106`
- **Puerto:** `3306`
- **Nombre de la Base de Datos:** `2pa-app`

## 3. Fetch de ejemplo a la API desde el Frontend

### Registro de usuario
```javascript
fetch("http://20.90.161.106:3000/auth/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "Nombre Apellido",
    username: "usuario123",
    email: "usuario@example.com",
    password: "********",
    dob: "1990-01-01",
    gender: "male",
    city: "Ciudad"
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

### Inicio de sesión
```javascript
fetch("http://20.90.161.106:3000/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    emailorusername: "usuario@example.com",
    password: "********"
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

### Obtener fotos
```javascript
fetch("http://20.90.161.106:3000/photos", {
  method: "GET",
  headers: {
    "Authorization": "Bearer TU_TOKEN"
  }
})
.then(response => response.json())
.then(data => console.log(data));
```

### Obtener perfil del usuario
```javascript
fetch("http://20.90.161.106:3000/profile", {
  method: "GET",
  headers: {
    "Authorization": "Bearer TU_TOKEN"
  }
})
.then(response => response.json())
.then(data => console.log(data));
```

### Actualizar perfil
```javascript
fetch("http://20.90.161.106:3000/profile", {
  method: "POST",
  headers: {
    "Authorization": "Bearer TU_TOKEN",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    bio: "Descripción del usuario.",
    interests: "Intereses",
    min_age_preference: 25,
    max_age_preference: 40,
    preferred_city: "Ciudad"
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

## 4. Despliegue del Frontend

- Instalación de Apache y configuración

Si no tienes Apache instalado, puedes hacerlo con los siguientes comandos:
 ```bash
sudo apt update
sudo apt install apache2 -y
sudo systemctl enable apache2
sudo systemctl start apache2
 ```
1. Clona el repositorio:
   - Instala las dependencias:
   ```bash
   npm install
   ```
   - El repositorio clonado en la carpeta var/www/html
   ```bash
   git clone https://github.com/2PA-ECV/front-end.git
   ```

2. Inicia el servidor de desarrollo:
   ```bash
   npm start
   ```
